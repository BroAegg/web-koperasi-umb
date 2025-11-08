/**
 * Import BSM Mart Products from CSV
 * 
 * This script imports products from BSM Mart CSV file to the database
 * Handles: Categories, Suppliers, Products with proper ownership type
 * 
 * Usage: npx tsx scripts/import-bsm-products.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

interface CSVRow {
  nama_produk: string;
  deskripsi: string;
  kategori: string;
  sku: string;
  harga_beli: string;
  harga_jual: string;
  stok_awal: string;
  minimum_stok: string;
  satuan: string;
  jenis_kepemilikan: string;
  siklus_stok: string;
  kontak_supplier: string;
  keterangan: string;
}

// Helper to generate UUID
function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

// Helper to parse price (handle format like "4000/8000" -> take first)
function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr === '-') return 0;
  
  // If multiple prices (e.g., "4000/8000"), take the first one
  const firstPrice = priceStr.split('/')[0].trim();
  const parsed = parseInt(firstPrice.replace(/\D/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

// Helper to parse stock
function parseStock(stockStr: string): number {
  if (!stockStr) return 0;
  const parsed = parseInt(stockStr);
  return isNaN(parsed) ? 0 : parsed;
}

async function main() {
  console.log('🚀 Starting BSM Mart Products Import...\n');

  const csvPath = path.join(process.cwd(), 'data-barang-bsm.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ File not found:', csvPath);
    process.exit(1);
  }

  const rows: CSVRow[] = [];
  
  // Read CSV file
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📁 Found ${rows.length} products in CSV\n`);

  // Track created entities
  const categoryMap = new Map<string, string>(); // category name -> id
  const supplierMap = new Map<string, string>(); // phone -> id
  let createdProducts = 0;
  let skippedProducts = 0;
  let errors: string[] = [];

  // Process each row
  for (const row of rows) {
    try {
      const productName = row.nama_produk?.trim();
      
      // Skip if no product name
      if (!productName) {
        skippedProducts++;
        continue;
      }

      // === 1. HANDLE CATEGORY ===
      const categoryName = row.kategori?.trim() || 'Makanan Ringan';
      let categoryId = categoryMap.get(categoryName);
      
      if (!categoryId) {
        // Check if category exists
        const existingCategory = await prisma.categories.findFirst({
          where: { name: categoryName }
        });
        
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
          categoryId = generateId('cat');
          await prisma.categories.create({
            data: {
              id: categoryId,
              name: categoryName,
              description: `Kategori ${categoryName}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          });
          console.log(`  ✅ Created category: ${categoryName}`);
        }
        
        categoryMap.set(categoryName, categoryId);
      }

      // === 2. HANDLE OWNERSHIP & SUPPLIER ===
      const ownershipType = row.jenis_kepemilikan?.trim();
      const isTitipan = ownershipType?.toLowerCase().includes('titipan');
      const supplierPhone = row.kontak_supplier?.trim();
      
      let supplierId: string | null = null;
      
      if (isTitipan && supplierPhone && supplierPhone !== '-') {
        // Get or create supplier
        let existingSupplier = await prisma.suppliers.findFirst({
          where: { phone: supplierPhone }
        });
        
        if (!existingSupplier) {
          // Create supplier
          supplierId = generateId('sup');
          const supplierCode = `SUP-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          await prisma.suppliers.create({
            data: {
              id: supplierId,
              code: supplierCode,
              businessName: `Supplier ${productName}`,
              ownerName: 'Supplier BSM',
              phone: supplierPhone,
              email: `${supplierCode}@supplier.bsm`,
              address: 'Bandung',
              password: 'supplier123', // Default password
              status: 'ACTIVE',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          });
          supplierMap.set(supplierPhone, supplierId);
          console.log(`  ✅ Created supplier: ${supplierPhone}`);
        } else {
          supplierId = existingSupplier.id;
          if (!supplierMap.has(supplierPhone)) {
            supplierMap.set(supplierPhone, supplierId);
          }
        }
      }

      // === 3. PARSE PRODUCT DATA ===
      const buyPrice = parsePrice(row.harga_beli);
      const sellPrice = parsePrice(row.harga_jual);
      const initialStock = parseStock(row.stok_awal);
      const minStock = parseStock(row.minimum_stok);
      
      // Skip if no valid prices
      if (sellPrice === 0) {
        skippedProducts++;
        console.log(`  ⚠️  Skipped ${productName} - no sell price`);
        continue;
      }

      // === 4. CREATE PRODUCT ===
      const productId = generateId('prod');
      const sku = row.sku?.trim() || `SKU-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      await prisma.products.create({
        data: {
          id: productId,
          name: productName,
          description: row.deskripsi?.trim() || `Produk ${productName}`,
          categoryId: categoryId!,
          sku: sku,
          buyPrice: buyPrice,
          sellPrice: sellPrice,
          stock: initialStock,
          threshold: minStock, // Changed from minimumStock to threshold
          unit: row.satuan?.trim() || 'pcs',
          ownershipType: isTitipan ? 'TITIPAN' : 'TOKO',
          supplierId: supplierId,
          supplierContact: supplierPhone || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      createdProducts++;
      console.log(`  ✅ Created: ${productName} (${isTitipan ? 'TITIPAN' : 'TOKO'})`);
      
    } catch (error) {
      const errorMsg = `Failed to process ${row.nama_produk}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }

  // === SUMMARY ===
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 IMPORT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Total products created: ${createdProducts}`);
  console.log(`⚠️  Total products skipped: ${skippedProducts}`);
  console.log(`📦 Total categories: ${categoryMap.size}`);
  console.log(`🏪 Total suppliers: ${supplierMap.size}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  console.log('\n🎉 Import completed successfully!\n');
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
