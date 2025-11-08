/**
 * Create consignment_batches for existing TITIPAN products
 * Run this script to fix products imported from CSV that don't have batches
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createConsignmentBatches() {
  try {
    console.log('🔍 Finding TITIPAN products without consignment batches...\n');

    // Find all TITIPAN products
    const titipanProducts = await prisma.products.findMany({
      where: {
        ownershipType: 'TITIPAN'
      },
      include: {
        suppliers: true,
        consignment_batches: true // Check existing batches
      }
    });

    console.log(`Found ${titipanProducts.length} TITIPAN products\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of titipanProducts) {
      try {
        // Skip if already has active batch
        const hasActiveBatch = product.consignment_batches.some(
          (batch: any) => batch.status === 'ACTIVE' && batch.qtyRemaining > 0
        );

        if (hasActiveBatch) {
          console.log(`⏭️  Skip: ${product.name} (already has active batch)`);
          skipped++;
          continue;
        }

        // Skip if no supplier
        if (!product.supplierId) {
          console.log(`⚠️  Skip: ${product.name} (no supplier)`);
          skipped++;
          continue;
        }

        // Create batch for current stock
        const currentStock = Number(product.stock);
        
        if (currentStock <= 0) {
          console.log(`⏭️  Skip: ${product.name} (no stock)`);
          skipped++;
          continue;
        }

        const batch = await prisma.consignment_batches.create({
          data: {
            id: randomUUID(),
            consignorId: product.supplierId,
            productId: product.id,
            code: `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            qtyIn: currentStock,
            qtyRemaining: currentStock,
            qtySold: 0,
            qtyReturned: 0,
            qtyExpired: 0,
            feeType: 'PERCENTAGE',
            feePercent: 10, // Default 10% fee to koperasi
            feeFlat: null,
            status: 'ACTIVE',
            receivedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`✅ Created batch for: ${product.name} (${currentStock} units, supplier: ${product.suppliers?.businessName || product.suppliers?.ownerName})`);
        created++;

      } catch (err) {
        console.error(`❌ Error creating batch for ${product.name}:`, err instanceof Error ? err.message : 'Unknown error');
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${created} batches`);
    console.log(`⏭️  Skipped: ${skipped} products`);
    console.log(`❌ Errors: ${errors} products`);
    console.log('\n✨ Done! TITIPAN products now have consignment batches.');

  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createConsignmentBatches();
