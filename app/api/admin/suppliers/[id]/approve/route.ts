import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { createId } from '@paralleldrive/cuid2';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    
    const { decision, notes } = body;

    // Validate decision
    if (!decision || !['APPROVE', 'REJECT'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    // Check if supplier exists and has been evaluated
    const supplier = await prisma.suppliers.findUnique({
      where: { id },
      include: {
        sample_products: true
      }
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check if supplier has been evaluated
    if (!supplier.productAverageScore) {
      return NextResponse.json(
        { error: 'Supplier must be evaluated before approval/rejection' },
        { status: 400 }
      );
    }

    let updatedSupplier;

    if (decision === 'APPROVE') {
      // Update supplier status to APPROVED_PENDING_PAYMENT
      updatedSupplier = await prisma.suppliers.update({
        where: { id },
        data: {
          status: 'APPROVED_PENDING_PAYMENT',
          approvedById: session.user.id,
          approvedAt: new Date()
        },
        include: {
          sample_products: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      });

      // Log activity
      await prisma.activity_logs.create({
        data: {
          id: createId(),
          userId: session.user.id,
          userRole: session.user.role,
          action: 'SUPPLIER_APPROVED',
          module: 'SUPPLIER',
          description: `Approved supplier ${supplier.businessName}`,
          metadata: {
            supplierId: id,
            businessName: supplier.businessName,
            averageScore: supplier.productAverageScore?.toString(),
            notes: notes || 'No notes provided'
          },
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Supplier approved successfully. Waiting for payment.',
        data: {
          ...updatedSupplier,
          sample_products: updatedSupplier.sample_products.map(p => ({
            ...p,
            images: JSON.parse(p.images || '[]')
          }))
        }
      });

    } else {
      // Reject supplier
      updatedSupplier = await prisma.suppliers.update({
        where: { id },
        data: {
          status: 'REJECTED',
          // Store rejection reason in evaluation notes if not already set
          evaluationNotes: supplier.evaluationNotes
            ? `${supplier.evaluationNotes}\n\nREJECTION: ${notes || 'No reason provided'}`
            : `REJECTED: ${notes || 'No reason provided'}`
        },
        include: {
          sample_products: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      });

      // Log activity
      await prisma.activity_logs.create({
        data: {
          id: createId(),
          userId: session.user.id,
          userRole: session.user.role,
          action: 'SUPPLIER_REJECTED',
          module: 'SUPPLIER',
          description: `Rejected supplier ${supplier.businessName}`,
          metadata: {
            supplierId: id,
            businessName: supplier.businessName,
            averageScore: supplier.productAverageScore?.toString(),
            reason: notes || 'No reason provided'
          },
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Supplier rejected',
        data: {
          ...updatedSupplier,
          sample_products: updatedSupplier.sample_products.map(p => ({
            ...p,
            images: JSON.parse(p.images || '[]')
          }))
        }
      });
    }

  } catch (error) {
    console.error('Error approving/rejecting supplier:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
