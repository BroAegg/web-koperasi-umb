/**
 * Seed Script: Authentication & Initial Users
 * 
 * Creates initial users for pilot deployment:
 * - 1 Super Admin (Manajer Koperasi)
 * - 2 Kasir (Admin)
 * - 1 Developer (Hidden - Emergency access)
 * 
 * Usage: npx tsx prisma/seed-auth.ts
 */

import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Password hashing configuration
const SALT_ROUNDS = 10

interface SeedUser {
  id: string
  email: string
  password: string
  name: string
  role: Role
  mustChangePassword: boolean
}

const INITIAL_USERS: SeedUser[] = [
  // Super Admin - Manajer Koperasi
  {
    id: 'super-admin-001',
    email: 'manager@umb.ac.id',
    password: 'KoperasiUMB2025', // Must change after first login
    name: 'Manajer Koperasi UMB',
    role: 'SUPER_ADMIN',
    mustChangePassword: true
  },
  
  // Kasir 1 - Admin
  {
    id: 'admin-kasir-001',
    email: 'kasir1@umb.ac.id',
    password: 'Kasir123', // Must change after first login
    name: 'Kasir Pagi',
    role: 'ADMIN',
    mustChangePassword: true
  },
  
  // Kasir 2 - Admin
  {
    id: 'admin-kasir-002',
    email: 'kasir2@umb.ac.id',
    password: 'Kasir123', // Must change after first login
    name: 'Kasir Siang',
    role: 'ADMIN',
    mustChangePassword: true
  },
  
  // Supplier
  {
    id: 'supplier-001',
    email: 'supplier',
    password: 'password',
    name: 'Supplier',
    role: 'SUPPLIER',
    mustChangePassword: false
  },
  
  // Developer - Hidden (Emergency access)
  {
    id: 'developer-aegner',
    email: 'aegner@umb.ac.id',
    password: 'Dev@Secure2025!', // Strong password for developer
    name: 'Aegner Billik (Developer)',
    role: 'DEVELOPER',
    mustChangePassword: false // Developer can keep password
  }
]

async function main() {
  console.log('🚀 Starting authentication seed...\n')

  try {
    // Check if users already exist
    const existingUsers = await prisma.users.findMany({
      where: {
        email: {
          in: INITIAL_USERS.map(u => u.email)
        }
      }
    })

    if (existingUsers.length > 0) {
      console.log('⚠️  Users already exist:')
      existingUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`)
      })
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise<string>((resolve) => {
        readline.question('\n⚠️  Delete existing users and recreate? (yes/no): ', resolve)
      })
      readline.close()
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Seed cancelled by user.')
        return
      }
      
      // Delete existing users
      await prisma.users.deleteMany({
        where: {
          email: {
            in: INITIAL_USERS.map(u => u.email)
          }
        }
      })
      console.log('🗑️  Deleted existing users\n')
    }

    // Create users
    console.log('👥 Creating users...\n')
    
    for (const userData of INITIAL_USERS) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS)
      
      // Create user
      const user = await prisma.users.create({
        data: {
          id: userData.id,
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isActive: true,
          mustChangePassword: userData.mustChangePassword,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log(`✅ Created: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Must Change Password: ${user.mustChangePassword ? 'Yes' : 'No'}`)
      console.log('')
    }

    // Print summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Seed Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Total users created: ${INITIAL_USERS.length}`)
    console.log('')
    console.log('🔐 Login Credentials:')
    console.log('')
    
    INITIAL_USERS.forEach(user => {
      console.log(`📧 ${user.email}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Role: ${user.role}`)
      if (user.mustChangePassword) {
        console.log(`   ⚠️  Must change password after first login!`)
      }
      console.log('')
    })
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💡 Next Steps:')
    console.log('   1. Start the application: npm run dev')
    console.log('   2. Navigate to: http://localhost:3000/login')
    console.log('   3. Test login with credentials above')
    console.log('   4. Change default passwords after first login')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('🎉 Authentication seed completed successfully!')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
