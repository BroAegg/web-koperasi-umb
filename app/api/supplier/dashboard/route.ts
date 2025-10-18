import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// GET /api/supplier/dashboard - Get supplier dashboard metrics
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Supplier only' },
        { status: 403 }
      );
    }

    // Get supplier from suppliers table (master data for products relation)
    const supplier = await prisma.suppliers.findFirst({
      where: { email: user.email },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Get supplier profile for payment info
    const supplierProfile = await prisma.supplier_profiles.findFirst({
      where: { email: user.email },
    });

    // Get date ranges
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Get all metrics in parallel
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      monthlyRevenue,
      recentOrders,
      productPerformance,
    ] = await Promise.all([
      // Total products from this supplier
      prisma.products.count({
        where: { supplierId: supplier.id },
      }),

      // Active products
      prisma.products.count({
        where: { 
          supplierId: supplier.id,
          isActive: true,
        },
      }),

      // Total purchases/orders (using purchases table if exists, or count from products)
      prisma.purchases.count({
        where: { supplierId: supplier.id },
      }).catch(() => 0), // Return 0 if purchases table doesn't exist yet

      // Pending orders
      prisma.purchases.count({
        where: { 
          supplierId: supplier.id,
          status: 'PENDING',
        },
      }).catch(() => 0),

      // Completed orders
      prisma.purchases.count({
        where: { 
          supplierId: supplier.id,
          status: 'RECEIVED',
        },
      }).catch(() => 0),

      // Monthly revenue (from completed purchases this month)
      prisma.purchases.aggregate({
        where: {
          supplierId: supplier.id,
          status: 'RECEIVED',
          receivedDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }).then(result => Number(result._sum.totalAmount || 0)).catch(() => 0),

      // Recent orders (last 5)
      prisma.purchases.findMany({
        where: { supplierId: supplier.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }).catch(() => []),

      // Product performance (top 5 selling products)
      prisma.products.findMany({
        where: { 
          supplierId: supplier.id,
          isActive: true,
        },
        orderBy: { stock: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          stock: true,
          sellPrice: true,
          categories: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Calculate additional metrics
    const activeOrdersRate = totalOrders > 0 
      ? ((pendingOrders / totalOrders) * 100).toFixed(1) 
      : 0;
    
    const completionRate = totalOrders > 0
      ? ((completedOrders / totalOrders) * 100).toFixed(1)
      : 0;

    // Payment status info (from supplier_profiles if exists)
    const paymentInfo = supplierProfile ? {
      status: supplierProfile.paymentStatus,
      isActive: supplierProfile.isPaymentActive,
      nextDue: supplierProfile.nextPaymentDue,
      monthlyFee: Number(supplierProfile.monthlyFee),
    } : null;

    return NextResponse.json({
      success: true,
      data: {
        supplier: {
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
        },
        metrics: {
          totalProducts,
          activeProducts,
          totalOrders,
          pendingOrders,
          completedOrders,
          monthlyRevenue,
          activeOrdersRate: Number(activeOrdersRate),
          completionRate: Number(completionRate),
        },
        payment: paymentInfo,
        recentOrders: recentOrders.map(order => ({
          ...order,
          totalAmount: Number(order.totalAmount),
        })),
        productPerformance: productPerformance.map(product => ({
          ...product,
          sellPrice: Number(product.sellPrice),
          category: product.categories?.name || 'Uncategorized',
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching supplier dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
