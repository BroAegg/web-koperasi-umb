import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

interface ImportRow {
  name: string;
  sku?: string;
  category: string;
  supplier?: string;
  buyPrice: number;
  sellPrice: number;
  stock?: number;
  threshold?: number;
  unit?: string;
  description?: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
  warnings: Array<{ row: number; warning: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission (only SUPER_ADMIN can import)
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can import products' },
        { status: 403 }
      );
    }

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload .xlsx, .xls, or .csv file' },
        { status: 400 }
      );
    }

    // Read file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty or invalid format' },
        { status: 400 }
      );
    }

    // Initialize result
    const result: ImportResult = {
      success: true,
      totalRows: data.length,
      imported: 0,
      skipped: 0,
      errors: [],
      warnings: [],
    };

    // Get existing categories (case-insensitive map)
    const categories = await prisma.categories.findMany({
      select: { id: true, name: true },
    });
    const categoryMap = new Map<string, string>(
      categories.map((c) => [c.name.toLowerCase(), c.id])
    );

    // Get existing suppliers (use businessName field)
    const suppliers = await prisma.suppliers.findMany({
      select: { id: true, businessName: true },
    });
    const supplierMap = new Map<string, string>(
      suppliers.map((s) => [s.businessName.toLowerCase(), s.id])
    );

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const rowNum = i + 2; // Excel row number (1-indexed + header)
      const row = data[i];

      try {
        // Validate required fields
        if (!row.name || row.name.toString().trim() === '') {
          result.errors.push({
            row: rowNum,
            error: 'Name is required',
          });
          result.skipped++;
          continue;
        }

        if (!row.category || row.category.toString().trim() === '') {
          result.errors.push({
            row: rowNum,
            error: 'Category is required',
          });
          result.skipped++;
          continue;
        }

        // buyPrice is optional in schema
        const buyPrice = row.buyPrice ? Number(row.buyPrice) : null;
        if (buyPrice !== null && (isNaN(buyPrice) || buyPrice < 0)) {
          result.errors.push({
            row: rowNum,
            error: 'Buy price must be a valid positive number',
          });
          result.skipped++;
          continue;
        }

        if (!row.sellPrice || isNaN(Number(row.sellPrice)) || Number(row.sellPrice) <= 0) {
          result.errors.push({
            row: rowNum,
            error: 'Valid sell price is required (must be > 0)',
          });
          result.skipped++;
          continue;
        }

        const sellPrice = Number(row.sellPrice);

        // Find category ID
        const categoryName = row.category.toString().trim().toLowerCase();
        const categoryId = categoryMap.get(categoryName);

        if (!categoryId) {
          result.errors.push({
            row: rowNum,
            error: `Category "${row.category}" not found. Please create category first.`,
          });
          result.skipped++;
          continue;
        }

        // TypeScript: categoryId is guaranteed to be string here

        // Check sell price vs buy price (only if buyPrice provided)
        if (buyPrice !== null) {
          if (sellPrice < buyPrice) {
            result.warnings.push({
              row: rowNum,
              warning: `Sell price (${sellPrice}) is less than buy price (${buyPrice})`,
            });
          }

          // Calculate margin percentage
          const margin = ((sellPrice - buyPrice) / buyPrice) * 100;
          if (margin < 10) {
            result.warnings.push({
              row: rowNum,
              warning: `Low profit margin: ${margin.toFixed(1)}% (recommended: >10%)`,
            });
          }
        }

        // Handle supplier
        let supplierId: string | null = null;
        if (row.supplier && row.supplier.toString().trim() !== '') {
          const supplierName = row.supplier.toString().trim().toLowerCase();
          supplierId = supplierMap.get(supplierName) || null;

          // Create supplier if doesn't exist
          if (!supplierId) {
            const supplierCode = `SUP-${Date.now()}`;
            const newSupplier = await prisma.suppliers.create({
              data: {
                id: `sup-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                code: supplierCode,
                businessName: row.supplier.toString().trim(),
                ownerName: row.supplier.toString().trim(), // Same as business for auto-created
                phone: '-',
                email: `${supplierCode.toLowerCase()}@generated.supplier`,
                address: '-',
                password: 'changeme123', // Default password
                status: 'APPROVED', // Auto-approve imported suppliers
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                approvedAt: new Date(),
                approvedById: session.user.id,
              },
            });
            supplierId = newSupplier.id;
            supplierMap.set(supplierName, supplierId);
          }
        }

        // Check for duplicate product name
        const existingProduct = await prisma.products.findFirst({
          where: { name: row.name.toString().trim() },
        });

        if (existingProduct) {
          result.warnings.push({
            row: rowNum,
            warning: `Product "${row.name}" already exists. Skipping.`,
          });
          result.skipped++;
          continue;
        }

        // Check for duplicate SKU
        if (row.sku && row.sku.toString().trim() !== '') {
          const existingSKU = await prisma.products.findFirst({
            where: { sku: row.sku.toString().trim() },
          });

          if (existingSKU) {
            result.errors.push({
              row: rowNum,
              error: `SKU "${row.sku}" already exists`,
            });
            result.skipped++;
            continue;
          }
        }

        // Create product with existing schema fields
        await prisma.products.create({
          data: {
            id: `prod-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            name: row.name.toString().trim(),
            sku: row.sku ? String(row.sku).trim() : null,
            categoryId: categoryId,
            supplierId: supplierId || null,
            buyPrice: buyPrice,
            sellPrice: sellPrice,
            stock: row.stock ? Math.max(0, parseInt(row.stock.toString())) : 0,
            threshold: row.threshold ? Math.max(0, parseInt(row.threshold.toString())) : 5,
            unit: row.unit ? row.unit.toString().trim() : 'pcs',
            description: row.description ? row.description.toString().trim() : null,
            isActive: true,
            status: 'ACTIVE',
            ownershipType: 'TOKO',
            stockCycle: 'MINGGUAN',
            isConsignment: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        result.imported++;
      } catch (error: any) {
        console.error(`Error processing row ${rowNum}:`, error);
        result.errors.push({
          row: rowNum,
          error: error.message || 'Unknown error',
        });
        result.skipped++;
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import products' },
      { status: 500 }
    );
  }
}

// GET endpoint to download template
export async function GET() {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sample data
    const data = [
      {
        name: 'Indomie Goreng',
        barcode: '8993333501010',
        category: 'Makanan',
        supplier: 'PT Indofood',
        buyPrice: 2500,
        sellPrice: 3000,
        stock: 100,
        minStock: 10,
        unit: 'pcs',
        description: 'Mie instan rasa original goreng',
      },
      {
        name: 'Aqua 600ml',
        barcode: '8993333601011',
        category: 'Minuman',
        supplier: 'PT Aqua',
        buyPrice: 2000,
        sellPrice: 3000,
        stock: 50,
        minStock: 20,
        unit: 'botol',
        description: 'Air mineral kemasan 600ml',
      },
      {
        name: 'Buku Tulis 38',
        barcode: '',
        category: 'Alat Tulis',
        supplier: 'Supplier ATK',
        buyPrice: 3000,
        sellPrice: 5000,
        stock: 30,
        minStock: 10,
        unit: 'pcs',
        description: 'Buku tulis 38 lembar',
      },
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // name
      { wch: 15 }, // barcode
      { wch: 15 }, // category
      { wch: 20 }, // supplier
      { wch: 12 }, // buyPrice
      { wch: 12 }, // sellPrice
      { wch: 10 }, // stock
      { wch: 10 }, // minStock
      { wch: 10 }, // unit
      { wch: 40 }, // description
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="import-template.xlsx"',
      },
    });
  } catch (error: any) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
