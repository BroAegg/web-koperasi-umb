import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    const { id } = await params;

    // Convert string values to appropriate types
    const productData: any = {
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      sku: data.sku || null,
      sellPrice: parseFloat(data.sellPrice),
      stock: parseInt(data.stock),
      threshold: parseInt(data.threshold),
      unit: data.unit,
    };

    // Only include buyPrice if provided (nullable for consignment)
    if (data.buyPrice !== undefined && data.buyPrice !== null) {
      productData.buyPrice = parseFloat(data.buyPrice);
      // Update avgCost if buyPrice is updated
      productData.avgCost = parseFloat(data.buyPrice);
    }

    // Include ownership fields if provided
    if (data.ownershipType) productData.ownershipType = data.ownershipType;
    if (data.stockCycle) productData.stockCycle = data.stockCycle;
    if (data.isConsignment !== undefined) productData.isConsignment = data.isConsignment;

    // Include supplier fields if provided
    if (data.supplierId !== undefined) {
      productData.supplierId = data.supplierId || null;
    }
    if (data.supplierContact !== undefined) {
      productData.supplierContact = data.supplierContact || null;
    }

    const product = await prisma.products.update({
      where: { id },
      data: productData,
      include: {
        categories: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produk berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memperbarui produk',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Role based access - Allow all authenticated users for now
  // TODO: Restrict to SUPER_ADMIN and ADMIN only in production
  // const check = await requireRole('SUPER_ADMIN', 'ADMIN')(request);
  // if (check && (check as any).status !== 200) {
  //   const res = (check as any).body || { success: false, error: 'Unauthorized' };
  //   return NextResponse.json(res, { status: (check as any).status || 401 });
  // }
  try {
    const { id } = await params;

    // FOR DEVELOPMENT: Cascade delete stock movements and related data
    // TODO: In production, consider soft delete or prevent deletion of products with history
    
    // Delete in correct order to avoid foreign key constraints
    
    // 1. First, get all consignment batches for this product
    const batches = await prisma.consignment_batches.findMany({
      where: { productId: id },
      select: { id: true },
    });
    
    // 2. Delete consignment sales (if any) - these reference batches
    if (batches.length > 0) {
      await prisma.consignment_sales.deleteMany({
        where: { 
          batchId: { in: batches.map((b: { id: string }) => b.id) }
        },
      });
    }
    
    // 3. Now delete consignment batches
    await prisma.consignment_batches.deleteMany({
      where: { productId: id },
    });

    // 4. Delete stock movements
    await prisma.stock_movements.deleteMany({
      where: { productId: id },
    });

    // 5. Delete transaction items (if any)
    await prisma.transaction_items.deleteMany({
      where: { productId: id },
    });

    // 6. Delete purchase items (if any)
    await prisma.purchase_items.deleteMany({
      where: { productId: id },
    });

    // 7. Finally, delete the product
    await prisma.products.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Produk dan semua riwayat terkait berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Produk tidak ditemukan',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus produk',
      },
      { status: 500 }
    );
  }
}

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produk tidak ditemukan',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data produk',
      },
      { status: 500 }
    );
  }
}