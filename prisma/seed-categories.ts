import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding categories...');

  const categories = [
    {
      name: 'Makanan',
      description: 'Makanan ringan, berat, dan olahan',
      icon: '🍜',
      order: 1,
    },
    {
      name: 'Minuman',
      description: 'Minuman kemasan, air mineral, dan soft drink',
      icon: '🥤',
      order: 2,
    },
    {
      name: 'Snack',
      description: 'Camilan, keripik, dan makanan ringan',
      icon: '🍿',
      order: 3,
    },
    {
      name: 'Alat Tulis',
      description: 'Perlengkapan tulis menulis dan kantor',
      icon: '✏️',
      order: 4,
    },
    {
      name: 'Sembako',
      description: 'Sembilan bahan pokok dan kebutuhan dapur',
      icon: '🌾',
      order: 5,
    },
    {
      name: 'Personal Care',
      description: 'Peralatan mandi dan perawatan pribadi',
      icon: '🧴',
      order: 6,
    },
    {
      name: 'Perlengkapan Rumah',
      description: 'Peralatan dan perlengkapan rumah tangga',
      icon: '🏠',
      order: 7,
    },
    {
      name: 'Lainnya',
      description: 'Produk lain yang tidak masuk kategori di atas',
      icon: '📦',
      order: 99,
    },
  ];

  for (const category of categories) {
    const existing = await prisma.categories.findUnique({
      where: { name: category.name },
    });

    if (existing) {
      console.log(`⏭️  Category "${category.name}" already exists, skipping...`);
      continue;
    }

    const created = await prisma.categories.create({
      data: {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        ...category,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Created category: ${created.name} ${category.icon}`);
  }

  console.log('\n🎉 Category seeding completed!');
  console.log(`📊 Total categories: ${categories.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
