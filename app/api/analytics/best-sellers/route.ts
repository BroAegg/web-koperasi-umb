// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

interface ProductSalesData {
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  transactionCount: number;
  averagePrice: number;
  lastSoldAt: Date;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

// GET /api/analytics/best-sellers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7days'; // 7days, 30days, 90days, all
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'quantity'; // quantity, revenue, profit

    // Calculate date range
    let startDate: Date;
    const endDate = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
      default:
        startDate = new Date(2020, 0, 1); // Start from 2020
        break;
    }

    // Get current period sales data
    const currentPeriodSales = await prisma.transaction_items.groupBy({
      by: ['productId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
        grossProfit: true,
      },
      _count: {
        transactionId: true,
      },
      _max: {
        createdAt: true,
      },
    });

    // Get previous period for trend calculation
    const periodDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    
    const previousPeriodSales = await prisma.transaction_items.groupBy({
      by: ['productId'],
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // Create a map for previous period data
    const previousSalesMap = new Map(
      previousPeriodSales.map(item => [
        item.productId,
        item._sum.quantity || 0
      ])
    );

    // Get product details
    const productIds = currentPeriodSales.map(item => item.productId);
    const products = await prisma.products.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        categories: {
          select: {
            name: true,
          },
        },
      },
    });

    const productsMap = new Map(
      products.map(p => [
        p.id,
        {
          name: p.name,
          code: p.sku || '-',
          category: p.categories?.name || 'Uncategorized',
        }
      ])
    );

    // Combine data and calculate trends
    const salesData: ProductSalesData[] = currentPeriodSales.map(item => {
      const product = productsMap.get(item.productId);
      const currentQty = item._sum.quantity || 0;
      const previousQty = previousSalesMap.get(item.productId) || 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let trendPercentage = 0;
      
      if (previousQty > 0) {
        trendPercentage = ((currentQty - previousQty) / previousQty) * 100;
        if (trendPercentage > 5) trend = 'up';
        else if (trendPercentage < -5) trend = 'down';
      } else if (currentQty > 0) {
        trend = 'up';
        trendPercentage = 100;
      }

      return {
        productId: item.productId,
        productName: product?.name || 'Unknown Product',
        productCode: product?.code || '-',
        category: product?.category || 'Uncategorized',
        totalQuantitySold: currentQty,
        totalRevenue: Number(item._sum.totalPrice || 0),
        totalProfit: Number(item._sum.grossProfit || 0),
        transactionCount: item._count.transactionId,
        averagePrice: currentQty > 0 ? Number(item._sum.totalPrice || 0) / currentQty : 0,
        lastSoldAt: item._max.createdAt || new Date(),
        trend,
        trendPercentage: Math.round(trendPercentage),
      };
    });

    // Sort by selected criteria
    let sortedData = [...salesData];
    switch (sortBy) {
      case 'revenue':
        sortedData.sort((a, b) => b.totalRevenue - a.totalRevenue);
        break;
      case 'profit':
        sortedData.sort((a, b) => b.totalProfit - a.totalProfit);
        break;
      case 'quantity':
      default:
        sortedData.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
        break;
    }

    // Limit results
    const topProducts = sortedData.slice(0, limit);

    // Calculate summary statistics
    const totalProducts = salesData.length;
    const totalQuantity = salesData.reduce((sum, item) => sum + item.totalQuantitySold, 0);
    const totalRevenue = salesData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalProfit = salesData.reduce((sum, item) => sum + item.totalProfit, 0);

    return NextResponse.json({
      success: true,
      data: {
        products: topProducts,
        summary: {
          totalProducts,
          totalQuantitySold: totalQuantity,
          totalRevenue,
          totalProfit,
          period,
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch best sellers data' },
      { status: 500 }
    );
  }
}
