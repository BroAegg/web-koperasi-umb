import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "");
    const user = await getUserFromToken(token);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access only" },
        { status: 403 }
      );
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's Transactions
    const todayTransactions = await prisma.transactions.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
        },
        status: "COMPLETED",
      },
      _count: true,
      _sum: {
        totalAmount: true,
      },
    });

    const pendingTransactions = await prisma.transactions.count({
      where: {
        status: "PENDING",
      },
    });

    // Monthly Transactions
    const monthlyTransactions = await prisma.transactions.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        status: "COMPLETED",
      },
      _count: true,
      _sum: {
        totalAmount: true,
      },
    });

    // Stock Movements Today
    const todayStockMovements = await prisma.stock_movements.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    // Low Stock Products
    const lowStockProducts = await prisma.products.findMany({
      where: {
        stock: {
          lt: 10,
        },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        threshold: true,
        sellPrice: true,
      },
      orderBy: {
        stock: "asc",
      },
    });

    const lowStockCount = await prisma.products.count({
      where: {
        stock: {
          lt: 10,
        },
      },
    });

    // Recent Transactions
    const recentTransactions = await prisma.transactions.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        memberId: true,
        type: true,
      },
    });

    // Recent Stock Movements
    const recentStockMovements = await prisma.stock_movements.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    });

    // Top Selling Products (this month)
    const topProducts = await prisma.transaction_items.groupBy({
      by: ['productId'],
      where: {
        transactions: {
          createdAt: {
            gte: startOfMonth,
          },
          status: "COMPLETED",
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.products.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            sku: true,
            sellPrice: true,
          },
        });
        return {
          productId: item.productId,
          name: product?.name || 'Unknown',
          sku: product?.sku || '-',
          quantitySold: item._sum?.quantity || 0,
          revenue: item._sum?.totalPrice || 0,
        };
      })
    );

    // Active Members
    const activeMembers = await prisma.users.count({
      where: {
        role: "USER",
      },
    });

    // Daily sales for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = await prisma.transactions.aggregate({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
          status: "COMPLETED",
        },
        _sum: {
          totalAmount: true,
        },
      });

      last7Days.push({
        date: dayStart.toLocaleDateString('id-ID', { weekday: 'short' }),
        sales: daySales._sum.totalAmount || 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        today: {
          transactions: todayTransactions._count || 0,
          revenue: todayTransactions._sum.totalAmount || 0,
          stockMovements: todayStockMovements,
          pending: pendingTransactions,
        },
        monthly: {
          transactions: monthlyTransactions._count || 0,
          revenue: monthlyTransactions._sum.totalAmount || 0,
        },
        inventory: {
          lowStockCount: lowStockCount,
          lowStockProducts: lowStockProducts,
        },
        members: {
          active: activeMembers,
        },
        recentActivities: {
          transactions: recentTransactions,
          stockMovements: recentStockMovements,
        },
        topProducts: topProductsWithDetails,
        trends: {
          daily: last7Days,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
