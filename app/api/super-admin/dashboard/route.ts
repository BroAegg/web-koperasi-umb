import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.replace(/^Bearer\s+/i, "");
    const user = await getUserFromToken(token);

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Super Admin access only" },
        { status: 403 }
      );
    }

    // Supplier Statistics
    const totalSuppliers = await prisma.supplier_profiles.count();
    const pendingSuppliers = await prisma.supplier_profiles.count({
      where: { status: "PENDING" },
    });
    const activeSuppliers = await prisma.supplier_profiles.count({
      where: { status: "ACTIVE" },
    });
    const paymentPendingSuppliers = await prisma.supplier_profiles.count({
      where: { paymentStatus: "PAID_PENDING_APPROVAL" },
    });

    // Member Statistics
    const totalMembers = await prisma.users.count({
      where: { role: "USER" },
    });

    // Product Statistics
    const totalProducts = await prisma.products.count();
    const lowStockProducts = await prisma.products.count({
      where: { stock: { lt: 10 } },
    });

    // Financial Statistics - Current Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyRevenue = await prisma.transactions.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: "COMPLETED",
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Incoming Stock Verification Pending (only purchase and consignment)
    const pendingStockVerification = await prisma.stock_movements.count({
      where: {
        movementType: {
          in: ["PURCHASE_IN", "CONSIGNMENT_IN"],
        },
      },
    });

    // Recent Activities - Supplier Approvals
    const recentSuppliers = await prisma.supplier_profiles.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        businessName: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Recent Stock Movements
    const recentStockMovements = await prisma.stock_movements.findMany({
      take: 5,
      where: {
        movementType: {
          in: ["PURCHASE_IN", "CONSIGNMENT_IN"],
        },
      },
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

    // Supplier Payment Summary
    const recentPayments = await prisma.supplier_payments.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        supplier_profiles: {
          select: {
            businessName: true,
            users: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Monthly trends
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const revenue = await prisma.transactions.aggregate({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: "COMPLETED",
        },
        _sum: {
          totalAmount: true,
        },
      });

      last6Months.push({
        month: monthStart.toLocaleDateString("id-ID", { month: "short" }),
        revenue: revenue._sum.totalAmount || 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        suppliers: {
          total: totalSuppliers,
          pending: pendingSuppliers,
          active: activeSuppliers,
          paymentPending: paymentPendingSuppliers,
        },
        members: {
          total: totalMembers,
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
        },
        financial: {
          monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
        },
        pending: {
          stockVerification: pendingStockVerification,
          supplierApprovals: pendingSuppliers,
          paymentVerification: paymentPendingSuppliers,
        },
        recentActivities: {
          suppliers: recentSuppliers,
          stockMovements: recentStockMovements,
          payments: recentPayments,
        },
        trends: {
          monthly: last6Months,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching super admin dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
