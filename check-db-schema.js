// Quick database schema check
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');
    
    // Check supplier_profiles table structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'supplier_profiles'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 supplier_profiles columns:');
    console.table(result);
    
    // Check if email column exists
    const hasEmail = result.some(col => col.column_name === 'email');
    const hasPassword = result.some(col => col.column_name === 'password');
    const hasPaymentStatus = result.some(col => col.column_name === 'paymentStatus');
    
    console.log('\n✅ Column Check:');
    console.log('  - email:', hasEmail ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - password:', hasPassword ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - paymentStatus:', hasPaymentStatus ? '✅ EXISTS' : '❌ MISSING');
    
    if (!hasEmail || !hasPassword || !hasPaymentStatus) {
      console.log('\n⚠️  DATABASE SCHEMA MISMATCH!');
      console.log('   Run: npx prisma db push --accept-data-loss');
    } else {
      console.log('\n✅ Database schema is correct!');
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
