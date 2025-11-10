/**
 * Script to migrate all suppliers with TITIPAN products to consignors table
 * This ensures proper tracking of consignment payments
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateTitipanSuppliersToConsignors() {
  console.log('🔄 Starting migration of TITIPAN suppliers to consignors...\n');

  try {
    // Find all suppliers that have TITIPAN products
    const suppliersWithTitipan = await prisma.suppliers.findMany({
      where: {
        products: {
          some: {
            ownershipType: 'TITIPAN',
            isActive: true
          }
        }
      },
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        phone: true,
        address: true,
        code: true,
        products: {
          where: {
            ownershipType: 'TITIPAN',
            isActive: true
          },
          select: {
            id: true,
            name: true,
            stock: true
          }
        }
      }
    });

    console.log(`📦 Found ${suppliersWithTitipan.length} suppliers with TITIPAN products\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const supplier of suppliersWithTitipan) {
      console.log(`\n--- Processing: ${supplier.businessName} ---`);
      console.log(`Supplier ID: ${supplier.id}`);
      console.log(`TITIPAN Products: ${supplier.products.length}`);

      try {
        // Check if already exists in consignors
        const existingConsignor = await prisma.consignors.findUnique({
          where: { id: supplier.id }
        });

        if (existingConsignor) {
          console.log('✅ Already exists in consignors table, skipping...');
          skippedCount++;
          continue;
        }

        // Create consignor from supplier
        const consignor = await prisma.consignors.create({
          data: {
            id: supplier.id, // Use same ID for easy linking
            code: `CSG-${supplier.id.slice(-8)}`, // Unique code from supplier ID
            name: supplier.businessName,
            contact: supplier.ownerName,
            phone: supplier.phone,
            address: supplier.address,
            feeType: 'PERCENTAGE',
            defaultFeePercent: 10, // Default 10% fee
            isActive: true,
            updatedAt: new Date(),
          }
        });

        console.log(`✅ Created consignor: ${consignor.name}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error processing ${supplier.businessName}:`, error);
        errorCount++;
      }
    }

    console.log('\n\n=== MIGRATION SUMMARY ===');
    console.log(`✅ Migrated: ${migratedCount} suppliers → consignors`);
    console.log(`⏭️ Skipped: ${skippedCount} (already exist)`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total: ${suppliersWithTitipan.length} suppliers with TITIPAN products\n`);

  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
migrateTitipanSuppliersToConsignors()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
