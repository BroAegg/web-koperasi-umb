import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

// Simple in-memory config (you can move to database later)
// For now, use environment variable or hardcode
const DEFAULT_MAX_PRODUCTS = 3;

// GET /api/settings/supplier-config
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get max products from env or use default
    const maxProducts = parseInt(process.env.SUPPLIER_MAX_PRODUCTS || '3');

    return NextResponse.json({
      success: true,
      data: {
        maxProducts,
        allowImageUpload: true,
        requireImageUpload: false,
        maxImageSize: 2 * 1024 * 1024, // 2MB in bytes
      },
    });
  } catch (error: any) {
    console.error('Error fetching supplier config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/supplier-config (Super Admin only)
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Super Admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { maxProducts } = body;

    // Validation
    if (!maxProducts || maxProducts < 1 || maxProducts > 10) {
      return NextResponse.json(
        { success: false, error: 'Max products must be between 1 and 10' },
        { status: 400 }
      );
    }

    // TODO: In production, save to database
    // For now, this will just validate but not persist
    // You need to update .env file manually or implement database storage

    return NextResponse.json({
      success: true,
      message: `Max products updated to ${maxProducts}. Note: This requires .env update for persistence.`,
      data: {
        maxProducts,
      },
    });
  } catch (error: any) {
    console.error('Error updating supplier config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update config' },
      { status: 500 }
    );
  }
}
