import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stock/requests
 * Get all restock requests (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or super admin
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all stock requests with supplier and product details
    const requests = await prisma.stock_requests.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            businessName: true,
            ownerName: true,
            email: true,
            phone: true,
            code: true,
            status: true,
          },
        },
        product: {
          include: {
            categories: true,
          },
        },
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    const summary = {
      total: requests.length,
      pending: requests.filter((r: any) => r.status === 'PENDING').length,
      approved: requests.filter((r: any) => r.status === 'APPROVED').length,
      rejected: requests.filter((r: any) => r.status === 'REJECTED').length,
      completed: requests.filter((r: any) => r.status === 'COMPLETED').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        requests,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching restock requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restock requests' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/stock/requests
 * Approve or reject restock request
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or super admin
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action, note, qtyApproved } = body;

    // Validate required fields
    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { error: 'Action must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    if (action === 'REJECT' && !note) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Get the request
    const request = await prisma.stock_requests.findUnique({
      where: { id: requestId },
      include: {
        product: true,
        supplier: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if already processed
    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // Get admin user
    const admin = await prisma.users.findUnique({
      where: { email: session.user.email! },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      // Validate approved quantity
      const finalQty = qtyApproved || request.qtyRequested;
      
      if (finalQty <= 0) {
        return NextResponse.json(
          { error: 'Approved quantity must be greater than 0' },
          { status: 400 }
        );
      }

      // Start transaction: Update request and product stock
      const [updatedRequest, updatedProduct] = await prisma.$transaction([
        // Update request status
        prisma.stock_requests.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            note: note || null,
          },
        }),
        
        // Update product stock
        prisma.products.update({
          where: { id: request.productId },
          data: {
            stock: {
              increment: finalQty,
            },
            lastRestockAt: new Date(),
          },
        }),
        
        // Create stock movement record
        prisma.stock_movements.create({
          data: {
            id: crypto.randomUUID(),
            productId: request.productId,
            quantity: finalQty,
            movementType: 'RESTOCK',
            referenceId: requestId,
            referenceType: 'STOCK_REQUEST',
            note: `Restock approved by ${admin.name}. ${note || ''}`,
            createdAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Restock request approved. Stock increased by ${finalQty} units.`,
        data: {
          request: updatedRequest,
          product: updatedProduct,
        },
      });
    } else {
      // REJECT
      const updatedRequest = await prisma.stock_requests.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          rejectionReason: note,
          note: note,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Restock request rejected',
        data: updatedRequest,
      });
    }
  } catch (error) {
    console.error('Error processing restock request:', error);
    return NextResponse.json(
      { error: 'Failed to process restock request' },
      { status: 500 }
    );
  }
}
