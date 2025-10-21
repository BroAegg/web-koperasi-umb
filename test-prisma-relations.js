const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRelations() {
  try {
    // Test what relations are available on Transaction
    const transaction = await prisma.transaction.findFirst({
      include: {
        // Try different variations to see which one works
        // Uncomment one at a time:
        
        // transaction_items: true,  // snake_case (schema name)
        // transactionItems: true,   // camelCase
        // transactionItem: true,    // singular camelCase
        // TransactionItems: true,   // PascalCase
      }
    });
    
    console.log('Transaction keys:', transaction ? Object.keys(transaction) : 'No transaction found');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRelations();
