/**
 * API: Admin Product Approval
 * GET /api/admin/products/approvals - Get all pending submissions
 * PATCH /api/admin/products/approvals/:id - Approve/Reject submission
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all submissions with supplier info
    const submissions = await prisma.product_submissions.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            businessName: true,
            ownerName: true,
            email: true,
            phone: true,
            status: true,
            currentActiveProducts: true,
            maxActiveProducts: true,
          },
        },
        category: true,
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
        approvedProduct: {
          select: {
            id: true,
            name: true,
            stock: true,
            sellPrice: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    const summary = {
      total: submissions.length,
      pending: submissions.filter((s: any) => s.status === 'PENDING_REVIEW').length,
      approved: submissions.filter((s: any) => s.status === 'APPROVED').length,
      rejected: submissions.filter((s: any) => s.status === 'REJECTED').length,
      resubmitted: submissions.filter((s: any) => s.status === 'RESUBMITTED').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        submissions,
        summary,
      },
    });
  } catch (error) {
    console.error('Get approvals error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { submissionId, action, rejectionReason } = body;

    if (!submissionId || !action) {
      return NextResponse.json(
        { success: false, error: 'submissionId and action required' },
        { status: 400 }
      );
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { success: false, error: 'action must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    if (action === 'REJECT' && !rejectionReason) {
      return NextResponse.json(
        { success: false, error: 'rejectionReason required for REJECT action' },
        { status: 400 }
      );
    }

    // Get submission
    const submission = await prisma.product_submissions.findUnique({
      where: { id: submissionId },
      include: {
        supplier: true,
        category: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'PENDING_REVIEW' && submission.status !== 'RESUBMITTED') {
      return NextResponse.json(
        { success: false, error: 'Submission already reviewed' },
        { status: 400 }
      );
    }

    // Get reviewer (current user)
    const reviewer = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!reviewer) {
      return NextResponse.json(
        { success: false, error: 'Reviewer not found' },
        { status: 404 }
      );
    }

    if (action === 'APPROVE') {
      // Create product in inventory
      const productId = randomUUID();
      const now = new Date();
      
      const product = await prisma.products.create({
        data: {
          id: productId,
          name: submission.name,
          description: submission.description,
          categoryId: submission.categoryId,
          sellPrice: submission.price,
          buyPrice: Number(submission.price) * 0.8, // Default 80% of sell price
          stock: submission.stockInitial,
          unit: submission.unit,
          supplierId: submission.supplierId,
          isActive: true,
          status: 'ACTIVE',
          ownershipType: 'SUPPLIER',
          profitShareRate: 90.00, // Default 90% for supplier
          isConsignment: false,
          createdAt: now,
          updatedAt: now,
        },
      });

      // Update submission
      await prisma.product_submissions.update({
        where: { id: submissionId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: reviewer.id,
          approvedProductId: productId,
        },
      });

      // Increment supplier's active products count
      await prisma.suppliers.update({
        where: { id: submission.supplierId },
        data: {
          currentActiveProducts: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Produk berhasil disetujui dan ditambahkan ke inventory',
        data: {
          submission,
          product,
        },
      });
    } else {
      // REJECT
      await prisma.product_submissions.update({
        where: { id: submissionId },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: reviewer.id,
          rejectionReason,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Produk ditolak',
        data: { submission },
      });
    }
  } catch (error) {
    console.error('Approval action error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
