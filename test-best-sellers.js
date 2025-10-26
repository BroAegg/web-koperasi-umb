const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBestSellers() {
  console.log('🔍 TESTING BEST SELLERS ANALYTICS\n');
  console.log('=' .repeat(60));
  
  try {
    // Get date range for last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    console.log(`\n📅 Period: ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}\n`);
    
    // Get sales data
    const salesData = await prisma.transaction_items.groupBy({
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
    
    console.log(`✅ Found ${salesData.length} products with sales\n`);
    
    // Get product details
    const productIds = salesData.map(item => item.productId);
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
    
    // Combine and sort
    const combinedData = salesData.map(item => {
      const product = productsMap.get(item.productId);
      return {
        productName: product?.name || 'Unknown',
        productCode: product?.code || '-',
        category: product?.category || 'Uncategorized',
        quantitySold: item._sum.quantity || 0,
        revenue: Number(item._sum.totalPrice || 0),
        profit: Number(item._sum.grossProfit || 0),
        transactions: item._count.transactionId,
        lastSold: item._max.createdAt,
      };
    });
    
    // Sort by quantity
    combinedData.sort((a, b) => b.quantitySold - a.quantitySold);
    
    // Display top 10
    console.log('🏆 TOP 10 BEST SELLING PRODUCTS:\n');
    console.log('-'.repeat(60));
    
    combinedData.slice(0, 10).forEach((item, index) => {
      const rank = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      console.log(`${rank} ${item.productName}`);
      console.log(`   Code: ${item.productCode} | Category: ${item.category}`);
      console.log(`   Terjual: ${item.quantitySold} unit | Revenue: Rp ${item.revenue.toLocaleString()}`);
      console.log(`   Profit: Rp ${item.profit.toLocaleString()} | Transaksi: ${item.transactions}x`);
      console.log('');
    });
    
    // Calculate totals
    const totalQuantity = combinedData.reduce((sum, item) => sum + item.quantitySold, 0);
    const totalRevenue = combinedData.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = combinedData.reduce((sum, item) => sum + item.profit, 0);
    
    console.log('📊 SUMMARY STATISTICS:');
    console.log('='.repeat(60));
    console.log(`Total Products: ${combinedData.length}`);
    console.log(`Total Quantity Sold: ${totalQuantity} units`);
    console.log(`Total Revenue: Rp ${totalRevenue.toLocaleString()}`);
    console.log(`Total Profit: Rp ${totalProfit.toLocaleString()}`);
    console.log(`Average Revenue per Product: Rp ${Math.round(totalRevenue / combinedData.length).toLocaleString()}`);
    
    console.log('\n✅ Best Sellers Analytics Test Complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBestSellers();
