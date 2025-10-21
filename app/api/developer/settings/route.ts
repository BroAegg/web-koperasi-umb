import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { withActivityLog } from '@/lib/with-activity-log';

// PUT /api/developer/settings - Update developer profile
async function handleUpdateProfile(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'DEVELOPER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Developer only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists (excluding current user)
    if (email !== user.email) {
      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email sudah digunakan' },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        name,
        email,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating developer profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = withActivityLog({
  module: 'AUTH',
  action: 'UPDATE_PROFILE',
  getDescription: (req, result) => {
    const data = result?.data;
    return data
      ? `Updated profile: ${data.name} (${data.email})`
      : 'Updated profile';
  },
  getMetadata: (req, result) => ({
    name: result?.data?.name,
    email: result?.data?.email,
  }),
})(handleUpdateProfile);
