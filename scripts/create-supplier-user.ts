/**
 * Quick Script: Create Supplier User
 * 
 * Creates a supplier user account:
 * - Email: supplier
 * - Password: password
 * - Role: SUPPLIER
 * 
 * Usage: npx tsx scripts/create-supplier-user.ts
 */

import bcrypt from 'bcryptjs'

const SUPPLIER_DATA = {
  id: 'supplier-001',
  email: 'supplier',
  password: 'password',
  name: 'Supplier',
  role: 'SUPPLIER',
  isActive: true,
  mustChangePassword: false
}

async function generateHash() {
  console.log('🔐 Generating bcrypt hash for supplier password...\n')
  
  const hashedPassword = await bcrypt.hash(SUPPLIER_DATA.password, 10)
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 Supplier User Details')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`ID: ${SUPPLIER_DATA.id}`)
  console.log(`Email: ${SUPPLIER_DATA.email}`)
  console.log(`Password (plain): ${SUPPLIER_DATA.password}`)
  console.log(`Password (hash): ${hashedPassword}`)
  console.log(`Name: ${SUPPLIER_DATA.name}`)
  console.log(`Role: ${SUPPLIER_DATA.role}`)
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 SQL Insert Statement:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log(`INSERT INTO users (id, email, password, name, role, isActive, mustChangePassword, createdAt, updatedAt)`)
  console.log(`VALUES (`)
  console.log(`  '${SUPPLIER_DATA.id}',`)
  console.log(`  '${SUPPLIER_DATA.email}',`)
  console.log(`  '${hashedPassword}',`)
  console.log(`  '${SUPPLIER_DATA.name}',`)
  console.log(`  '${SUPPLIER_DATA.role}',`)
  console.log(`  ${SUPPLIER_DATA.isActive ? 1 : 0},`)
  console.log(`  ${SUPPLIER_DATA.mustChangePassword ? 1 : 0},`)
  console.log(`  NOW(),`)
  console.log(`  NOW()`)
  console.log(`)`)
  console.log(`ON DUPLICATE KEY UPDATE`)
  console.log(`  password = VALUES(password),`)
  console.log(`  updatedAt = NOW();`)
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Copy the SQL above and run it in your MySQL database!')
  console.log('')
}

generateHash().catch(console.error)
