import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get member data with full details
    const member = await prisma.members.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        nomorAnggota: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        gender: true,
        unitKerja: true,
        joinDate: true,
        status: true,
        points: true,
        tier: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    const data = {
      id: member.id,
      nomorAnggota: member.nomorAnggota,
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
      gender: member.gender,
      unitKerja: member.unitKerja,
      joinDate: member.joinDate.toISOString(),
      status: member.status,
      points: member.points,
      tier: member.tier,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phone, address } = body;

    // Get member
    const member = await prisma.members.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Update member data
    await prisma.members.update({
      where: {
        id: member.id,
      },
      data: {
        phone: phone || null,
        address: address || null,
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: session.user.id,
        action: 'PROFILE_UPDATE',
        entityType: 'MEMBER',
        entityId: member.id,
        description: 'Member memperbarui informasi profil',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
