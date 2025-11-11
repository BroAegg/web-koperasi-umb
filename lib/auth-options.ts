/**
 * NextAuth Configuration Options
 * Extracted to separate file to avoid Next.js type errors
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      mustChangePassword: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role
    mustChangePassword: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    role: Role
    mustChangePassword: boolean
  }
}

export const authOptions: NextAuthOptions = {
  // Providers
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Username dan password harus diisi')
        }

        try {
          // Find user by email (field name is 'email' but contains username)
          const user = await prisma.users.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            throw new Error('Username atau password salah')
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Akun tidak aktif. Hubungi administrator.')
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isValidPassword) {
            throw new Error('Username atau password salah')
          }

          // Create audit log for successful login
          await prisma.audit_logs.create({
            data: {
              id: randomUUID(),
              userId: user.id,
              action: 'LOGIN',
              entity: 'USER',
              entityId: user.id,
              newData: JSON.stringify({
                email: user.email,
                role: user.role,
                timestamp: new Date().toISOString()
              })
            }
          })

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            mustChangePassword: user.mustChangePassword
          }
        } catch (error) {
          if (error instanceof Error) {
            throw error
          }
          throw new Error('Terjadi kesalahan saat login')
        }
      }
    })
  ],

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // Pages
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.mustChangePassword = user.mustChangePassword
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
        session.user.mustChangePassword = token.mustChangePassword
      }
      return session
    },
  },

  // Events for audit logging
  events: {
    async signOut({ token }) {
      if (token?.id) {
        try {
          await prisma.audit_logs.create({
            data: {
              id: randomUUID(),
              userId: token.id,
              action: 'LOGOUT',
              entity: 'USER',
              entityId: token.id,
              newData: JSON.stringify({
                email: token.email,
                role: token.role,
                timestamp: new Date().toISOString()
              })
            }
          })
        } catch (error) {
          console.error('Failed to create logout audit log:', error)
        }
      }
    }
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
}
