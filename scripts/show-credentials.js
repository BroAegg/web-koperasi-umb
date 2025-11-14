const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showCredentials() {
  console.log('\n🔐 === USER CREDENTIALS ===\n');
  
  try {
    const users = await prisma.users.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'SUPPLIER', 'KASIR']
        }
      },
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found! Need to seed database.');
      await prisma.$disconnect();
      return;
    }

    console.table(users.map(u => ({
      Role: u.role,
      Email: u.email,
      Name: u.name,
      'Created': u.createdAt.toLocaleDateString('id-ID')
    })));

    console.log('\n📝 Default Password: Password123!');
    console.log('Note: All passwords follow the same format unless changed.\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showCredentials();
