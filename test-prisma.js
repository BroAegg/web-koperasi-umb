// Test Prisma models
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testModels() {
  console.log('🔍 Testing Prisma Models...\n');
  
  // Test 1: Check users model
  try {
    const userCount = await prisma.users.count();
    console.log('✅ prisma.users works! Count:', userCount);
  } catch (error) {
    console.log('❌ prisma.users failed:', error.message);
  }
  
  // Test 2: Check supplier_profiles model
  try {
    const supplierCount = await prisma.supplier_profiles.count();
    console.log('✅ prisma.supplier_profiles works! Count:', supplierCount);
  } catch (error) {
    console.log('❌ prisma.supplier_profiles failed:', error.message);
  }
  
  // Test 3: List all available models
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$') && k !== 'constructor');
  console.log('\n📋 Available models:');
  models.forEach(m => console.log('  -', m));
  
  await prisma.$disconnect();
}

testModels();
