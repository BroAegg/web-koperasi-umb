import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/broadcasts - Fetch all broadcasts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const targetAudience = searchParams.get('targetAudience');

    let where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (targetAudience) {
      where.targetAudience = targetAudience.toUpperCase();
    }

    const broadcasts = await prisma.broadcast.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: broadcasts,
    });
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/broadcasts - Create new broadcast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      type,
      targetAudience,
      unitTarget,
      scheduledAt,
      createdById,
    } = body;

    // Validation
    if (!title || !message || !type || !targetAudience || !createdById) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate creator exists
    const creator = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!creator) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate total recipients based on target audience
    let totalRecipients = 0;
    
    if (targetAudience.toUpperCase() === 'ALL') {
      totalRecipients = await prisma.member.count({
        where: { status: 'ACTIVE' },
      });
    } else if (targetAudience.toUpperCase() === 'ACTIVE_MEMBERS') {
      totalRecipients = await prisma.member.count({
        where: { status: 'ACTIVE' },
      });
    } else if (targetAudience.toUpperCase() === 'UNIT_SPECIFIC' && unitTarget) {
      totalRecipients = await prisma.member.count({
        where: { 
          status: 'ACTIVE',
          unitKerja: unitTarget,
        },
      });
    }

    // Determine status and sent time
    const now = new Date();
    const isScheduled = scheduledAt && new Date(scheduledAt) > now;
    const status = isScheduled ? 'SCHEDULED' : 'SENT';
    const sentAt = !isScheduled ? now : null;

    const broadcast = await prisma.broadcast.create({
      data: {
        title,
        message,
        type: type.toUpperCase(),
        targetAudience: targetAudience.toUpperCase(),
        unitTarget: targetAudience.toUpperCase() === 'UNIT_SPECIFIC' ? unitTarget : null,
        status,
        scheduledAt: isScheduled ? new Date(scheduledAt) : null,
        sentAt,
        totalRecipients,
        successfulDeliveries: !isScheduled ? totalRecipients : 0, // Simulate immediate success for demo
        failedDeliveries: 0,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: broadcast,
      message: isScheduled ? 'Broadcast berhasil dijadwalkan' : 'Broadcast berhasil dikirim',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}