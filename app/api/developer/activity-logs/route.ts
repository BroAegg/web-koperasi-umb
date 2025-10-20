import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const role = searchParams.get('role');
    const environment = searchParams.get('environment');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const where: any = {};

    if (role && role !== 'ALL') {
      where.user = {
        role: role,
      };
    }

    if (environment && environment !== 'ALL') {
      where.environment = environment;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (dateFrom) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(dateFrom),
      };
    }

    if (dateTo) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(dateTo),
      };
    }

    // Get total count
    const total = await prisma.activity_logs.count({ where });

    // Get paginated logs
    const logs = await prisma.activity_logs.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total,
      today: await prisma.activity_logs.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      devCount: await prisma.activity_logs.count({
        where: {
          environment: 'DEV',
        },
      }),
      prodCount: await prisma.activity_logs.count({
        where: {
          environment: 'PROD',
        },
      }),
      byRole: {},
    };

    return NextResponse.json({
      logs,
      stats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
