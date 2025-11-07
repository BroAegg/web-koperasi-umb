/**
 * Health Check Endpoint
 * 
 * Used by monitoring services (UptimeRobot) to check if app is alive
 * Returns: status, database connection, timestamp, version
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const startTime = Date.now()

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    const duration = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        responseTime: `${duration}ms`
      },
      environment: process.env.NODE_ENV || 'development'
    }, { status: 200 })

  } catch (error) {
    const duration = Date.now() - startTime

    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'disconnected',
        responseTime: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}
