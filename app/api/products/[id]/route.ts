import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { id } = params;

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

    const product = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
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
  { params }: { params: { id: string } }
) {
  // Role based access
  const check = await requireRole('SUPER_ADMIN', 'ADMIN')(request);
  if (check && (check as any).status !== 200) {
    const res = (check as any).body || { success: false, error: 'Unauthorized' };
    return NextResponse.json(res, { status: (check as any).status || 401 });
  }
  try {
    const { id } = params;

    // Check if product has stock movements
    const stockMovements = await prisma.stockMovement.count({
      where: { productId: id },
    });

    if (stockMovements > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak dapat menghapus produk yang memiliki riwayat stock movement. Hapus riwayat terlebih dahulu.',
        },
        { status: 400 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus',
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
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