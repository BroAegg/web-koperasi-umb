// Seed dummy supplier for testing
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSupplier() {
  console.log('🌱 Seeding dummy supplier...\n');
  
  try {
    // Check if supplier already exists
    const existing = await prisma.supplier_profiles.findUnique({
      where: { email: 'supplier@test.com' }
    });
    
    if (existing) {
      console.log('✅ Supplier already exists:', existing.businessName);
      console.log('📧 Email:', existing.email);
      console.log('🔑 Password: password123');
      return;
    }
    
    // Create new supplier
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const supplier = await prisma.supplier_profiles.create({
      data: {
        id: `SUP-${Date.now()}`,
        businessName: 'Warung Makan Barokah',
        ownerName: 'Budi Santoso',
        email: 'supplier@test.com',
        password: hashedPassword,
        phone: '081234567890',
        address: 'Jl. Merdeka No. 123, Jakarta Pusat',
        productCategory: 'Makanan & Minuman',
        description: 'Supplier makanan dan minuman berkualitas',
        status: 'ACTIVE',
        paymentStatus: 'PAID_APPROVED',
        isPaymentActive: true,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Supplier created successfully!');
    console.log('📧 Email:', supplier.email);
    console.log('🔑 Password: password123');
    console.log('🏢 Business:', supplier.businessName);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedSupplier();
