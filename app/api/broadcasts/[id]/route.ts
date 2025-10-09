import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/broadcasts/[id] - Get single broadcast
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const broadcast = await prisma.broadcast.findUnique({
      where: { id: params.id },
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

    if (!broadcast) {
      return NextResponse.json(
        { success: false, error: 'Broadcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: broadcast,
    });
  } catch (error) {
    console.error('Error fetching broadcast:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/broadcasts/[id] - Update broadcast
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      type,
      targetAudience,
      unitTarget,
      scheduledAt,
    } = body;

    // Check if broadcast exists
    const existingBroadcast = await prisma.broadcast.findUnique({
      where: { id: params.id },
    });

    if (!existingBroadcast) {
      return NextResponse.json(
        { success: false, error: 'Broadcast not found' },
        { status: 404 }
      );
    }

    // Don't allow editing sent broadcasts
    if (existingBroadcast.status === 'SENT') {
      return NextResponse.json(
        { success: false, error: 'Cannot edit sent broadcast' },
        { status: 400 }
      );
    }

    // Recalculate total recipients if target audience changed
    let totalRecipients = existingBroadcast.totalRecipients;
    
    if (targetAudience && targetAudience !== existingBroadcast.targetAudience) {
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
    }

    const broadcast = await prisma.broadcast.update({
      where: { id: params.id },
      data: {
        title: title || existingBroadcast.title,
        message: message || existingBroadcast.message,
        type: type ? type.toUpperCase() : existingBroadcast.type,
        targetAudience: targetAudience ? targetAudience.toUpperCase() : existingBroadcast.targetAudience,
        unitTarget: targetAudience?.toUpperCase() === 'UNIT_SPECIFIC' ? unitTarget : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existingBroadcast.scheduledAt,
        totalRecipients,
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
      message: 'Broadcast berhasil diupdate',
    });
  } catch (error) {
    console.error('Error updating broadcast:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/broadcasts/[id] - Delete broadcast
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if broadcast exists
    const existingBroadcast = await prisma.broadcast.findUnique({
      where: { id: params.id },
    });

    if (!existingBroadcast) {
      return NextResponse.json(
        { success: false, error: 'Broadcast not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting sent broadcasts
    if (existingBroadcast.status === 'SENT') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete sent broadcast' },
        { status: 400 }
      );
    }

    await prisma.broadcast.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Broadcast berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}