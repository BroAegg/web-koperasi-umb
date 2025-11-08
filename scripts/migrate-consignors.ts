/**
 * Migrate TITIPAN suppliers to consignors table
 * Then create consignment_batches for those products
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function migrateConsignors() {
  try {
    console.log('🔍 Finding TITIPAN products and their suppliers...\n');

    // Find all TITIPAN products with suppliers
    const titipanProducts = await prisma.products.findMany({
      where: {
        ownershipType: 'TITIPAN',
        supplierId: { not: null }
      },
      include: {
        suppliers: true
      }
    });

    console.log(`Found ${titipanProducts.length} TITIPAN products with suppliers\n`);

    // Get unique suppliers
    const uniqueSuppliers = new Map();
    titipanProducts.forEach(p => {
      if (p.suppliers && !uniqueSuppliers.has(p.supplierId)) {
        uniqueSuppliers.set(p.supplierId, p.suppliers);
      }
    });

    console.log(`Found ${uniqueSuppliers.size} unique suppliers to migrate\n`);

    let migrated = 0;
    let batchesCreated = 0;
    let errors = 0;

    for (const [supplierId, supplier] of uniqueSuppliers.entries()) {
      try {
        // Check if consignor already exists
        const existing = await prisma.consignors.findFirst({
          where: { code: supplier.code }
        });

        let consignorId: string;

        if (existing) {
          console.log(`⏭️  Skip: ${supplier.businessName || supplier.ownerName} (already exists as consignor)`);
          consignorId = existing.id;
        } else {
          // Create consignor from supplier data
          const consignor = await prisma.consignors.create({
            data: {
              id: randomUUID(),
              code: supplier.code,
              name: supplier.businessName || supplier.ownerName,
              contact: supplier.ownerName,
              phone: supplier.phone,
              email: supplier.email,
              address: supplier.address,
              feeType: 'PERCENTAGE',
              defaultFeePercent: 10, // 10% default fee
              defaultFeeFlat: null,
              isActive: supplier.isActive,
              note: `Migrated from suppliers table - ${supplier.description || ''}`,
              createdAt: supplier.createdAt,
              updatedAt: new Date()
            }
          });

          consignorId = consignor.id;
          console.log(`✅ Migrated: ${supplier.businessName || supplier.ownerName} → consignors`);
          migrated++;
        }

        // Now create batches for this consignor's products
        const consignorProducts = titipanProducts.filter(p => p.supplierId === supplierId);
        
        for (const product of consignorProducts) {
          try {
            const currentStock = Number(product.stock);
            
            if (currentStock <= 0) {
              continue;
            }

            // Check if batch already exists
            const existingBatch = await prisma.consignment_batches.findFirst({
              where: {
                productId: product.id,
                status: 'ACTIVE'
              }
            });

            if (existingBatch) {
              continue;
            }

            // Create batch
            await prisma.consignment_batches.create({
              data: {
                id: randomUUID(),
                consignorId: consignorId, // Use the consignor ID
                productId: product.id,
                code: `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                qtyIn: currentStock,
                qtyRemaining: currentStock,
                qtySold: 0,
                qtyReturned: 0,
                qtyExpired: 0,
                feeType: 'PERCENTAGE',
                feePercent: 10,
                feeFlat: null,
                status: 'ACTIVE',
                receivedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });

            batchesCreated++;
          } catch (batchErr) {
            console.error(`  ❌ Error creating batch for ${product.name}:`, batchErr instanceof Error ? batchErr.message : 'Unknown');
          }
        }

      } catch (err) {
        console.error(`❌ Error migrating supplier ${supplier.businessName || supplier.ownerName}:`, err instanceof Error ? err.message : 'Unknown error');
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Migrated suppliers → consignors: ${migrated}`);
    console.log(`✅ Created consignment batches: ${batchesCreated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('\n✨ Done! TITIPAN suppliers migrated and batches created.');

  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
migrateConsignors();
