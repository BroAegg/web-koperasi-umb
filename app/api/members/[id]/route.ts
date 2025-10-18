import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/members/[id] - Get member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const member = await prisma.members.findUnique({
      where: { id },
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
        savings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        loans: {
          where: { status: 'ACTIVE' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            transaction_items: {
              include: {
                products: true,
              },
            },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...member,
        totalSimpanan: Number(member.simpananPokok.add(member.simpananWajib).add(member.simpananSukarela)),
        simpananPokok: Number(member.simpananPokok),
        simpananWajib: Number(member.simpananWajib),
        simpananSukarela: Number(member.simpananSukarela),
      },
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/members/[id] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const member = await prisma.members.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check email uniqueness if email is being updated
    if (body.email && body.email !== member.email) {
      const existingMember = await prisma.members.findUnique({
        where: { email: body.email },
      });

      if (existingMember) {
        return NextResponse.json(
          { success: false, error: 'Email sudah terdaftar' },
          { status: 409 }
        );
      }
    }

    const updatedMember = await prisma.members.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
        ...(body.address && { address: body.address }),
        ...(body.gender && { gender: body.gender }),
        ...(body.unitKerja && { unitKerja: body.unitKerja }),
        ...(body.simpananPokok && { simpananPokok: new Decimal(body.simpananPokok) }),
        ...(body.simpananWajib && { simpananWajib: new Decimal(body.simpananWajib) }),
        ...(body.simpananSukarela && { simpananSukarela: new Decimal(body.simpananSukarela) }),
        ...(body.status && { status: body.status }),
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
        ...updatedMember,
        totalSimpanan: Number(updatedMember.simpananPokok.add(updatedMember.simpananWajib).add(updatedMember.simpananSukarela)),
        simpananPokok: Number(updatedMember.simpananPokok),
        simpananWajib: Number(updatedMember.simpananWajib),
        simpananSukarela: Number(updatedMember.simpananSukarela),
      },
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - Delete member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const member = await prisma.members.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Anggota tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete member (will cascade delete user due to onDelete: Cascade)
    await prisma.members.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Anggota berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}