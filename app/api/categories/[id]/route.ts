import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const category = await prisma.categories.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            sellPrice: true,
            stock: true,
            isActive: true
          },
          take: 10 // Show first 10 products
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, icon, order, isActive } = body;

    // Check if category exists
    const existingCategory = await prisma.categories.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Validation
    if (name && name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Category name cannot be empty' },
        { status: 400 }
      );
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== existingCategory.name) {
      const duplicateName = await prisma.categories.findUnique({
        where: { name: name.trim() }
      });

      if (duplicateName) {
        return NextResponse.json(
          { success: false, error: 'Category name already exists' },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (icon !== undefined) updateData.icon = icon;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await prisma.categories.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only SUPER_ADMIN can delete categories.' },
        { status: 401 }
      );
    }

    // Check if category exists
    const category = await prisma.categories.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category with ${category._count.products} products. Please move or delete products first.` 
        },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.categories.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
