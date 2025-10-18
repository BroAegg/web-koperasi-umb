import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';

// GET /api/members - Get all members with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const unitKerja = searchParams.get('unitKerja');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { nomorAnggota: { contains: search, mode: 'insensitive' } },
        { unitKerja: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (unitKerja) {
      where.unitKerja = unitKerja;
    }

    const members = await prisma.members.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate total savings for each member
    const membersWithTotals = members.map(member => ({
      ...member,
      totalSimpanan: Number(member.simpananPokok.add(member.simpananWajib).add(member.simpananSukarela)),
      // Convert Decimal to number for JSON serialization
      simpananPokok: Number(member.simpananPokok),
      simpananWajib: Number(member.simpananWajib),
      simpananSukarela: Number(member.simpananSukarela),
    }));

    return NextResponse.json({
      success: true,
      data: membersWithTotals,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/members - Create new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      gender,
      unitKerja,
      simpananPokok = '0',
      simpananWajib = '0',
      simpananSukarela = '0',
      status = 'ACTIVE',
      joinDate,
    } = body;

    // Validate required fields
    if (!name || !email || !gender || !unitKerja) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique member number
    const lastMember = await prisma.members.findFirst({
      orderBy: { nomorAnggota: 'desc' },
    });

    let memberNumber = 'UMB001';
    if (lastMember) {
      const lastNumber = parseInt(lastMember.nomorAnggota.replace('UMB', ''));
      memberNumber = `UMB${String(lastNumber + 1).padStart(3, '0')}`;
    }

    // Check if email is already registered (both user and member tables)
    const [existingUser, existingMember] = await Promise.all([
      prisma.users.findUnique({ where: { email } }),
      prisma.members.findUnique({ where: { email } })
    ]);

    if (existingUser || existingMember) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar sebagai anggota atau user lain' },
        { status: 409 }
      );
    }

    // Create user first
    const user = await prisma.users.create({
      data: {
        id: randomUUID(),
        email,
        name,
        password: 'temporary', // In real app, this should be hashed
        role: 'USER',
        updatedAt: new Date(),
      },
    });

    // Validate and set default values for savings
    const simpananPokokNum = parseFloat(simpananPokok) || 50000;
    const simpananWajibNum = parseFloat(simpananWajib) || 200000;
    const simpananSukarelaNum = parseFloat(simpananSukarela) || 0;

    // Create member
    const member = await prisma.members.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        nomorAnggota: memberNumber,
        name,
        email,
        phone,
        address,
        gender,
        unitKerja,
        simpananPokok: new Decimal(simpananPokokNum),
        simpananWajib: new Decimal(simpananWajibNum),
        simpananSukarela: new Decimal(simpananSukarelaNum),
        status,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        updatedAt: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...member,
        totalSimpanan: Number(member.simpananPokok.add(member.simpananWajib).add(member.simpananSukarela)),
        simpananPokok: Number(member.simpananPokok),
        simpananWajib: Number(member.simpananWajib),
        simpananSukarela: Number(member.simpananSukarela),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
