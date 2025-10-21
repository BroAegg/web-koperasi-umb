// Quick script to sync supplier_profiles to suppliers table
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncSuppliers() {
  try {
    console.log('🔄 Starting supplier sync...\n');

    // Get all APPROVED suppliers from supplier_profiles
    const supplierProfiles = await prisma.supplier_profiles.findMany({
      where: { status: 'APPROVED' }
    });

    console.log(`Found ${supplierProfiles.length} APPROVED suppliers in supplier_profiles\n`);

    let created = 0;
    let skipped = 0;

    for (const profile of supplierProfiles) {
      // Check if already exists in suppliers table
      const existing = await prisma.suppliers.findFirst({
        where: { email: profile.email }
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${profile.businessName} (${profile.email}) - already exists`);
        skipped++;
        continue;
      }

      // Generate supplier code
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const supplierCode = `SUP-${dateStr}-${randomSuffix}`;

      // Create entry in suppliers table
      await prisma.suppliers.create({
        data: {
          id: profile.id,
          code: supplierCode,
          name: profile.businessName,
          contact: profile.ownerName || profile.businessName,
          email: profile.email,
          phone: profile.phone || '',
          address: profile.address || '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      console.log(`✅ Created: ${profile.businessName} (${profile.email}) - Code: ${supplierCode}`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📝 Total: ${supplierProfiles.length}`);
    console.log('\n✨ Sync complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncSuppliers();
