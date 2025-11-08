import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

/**
 * GET /api/consignment/batches/remaining
 * Get count of remaining (unsold) consignment goods for a specific consignor
 * Used to show checkbox info in payment modal
 */
export async function GET(request: NextRequest) {
  try {
    // Dual authentication: Check both Bearer token and NextAuth session
    const auth = request.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    
    // Try token first (only if not empty or 'null' string)
    let user = (token && token !== 'null' && token !== 'undefined') 
      ? await getUserFromToken(token) 
      : null;
    
    if (!user) {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        user = session.user as any;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get consignorId from query params
    const { searchParams } = new URL(request.url);
    const consignorId = searchParams.get('consignorId');

    if (!consignorId) {
      return NextResponse.json({ error: 'consignorId is required' }, { status: 400 });
    }

    // Query all active batches with remaining goods
    const batches = await prisma.consignment_batches.findMany({
      where: {
        consignorId: consignorId,
        qtyRemaining: {
          gt: 0
        },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        qtyRemaining: true,
        productId: true
      }
    });

    // Calculate totals
    const totalQty = batches.reduce((sum, batch) => sum + batch.qtyRemaining, 0);
    const productCount = new Set(batches.map(b => b.productId)).size;

    console.log(`[Remaining Batches] Consignor ${consignorId}: ${totalQty} pcs from ${productCount} products`);

    return NextResponse.json({
      totalQty,
      productCount,
      batches: batches.length
    });

  } catch (error) {
    console.error('[Remaining Batches] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remaining batches' },
      { status: 500 }
    );
  }
}
