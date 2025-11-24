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
    
    const {
      productQualityScore,
      productPriceScore,
      productPackagingScore,
      evaluationNotes
    } = body;

    // Validate scores
    if (
      !productQualityScore || !productPriceScore || !productPackagingScore ||
      productQualityScore < 1 || productQualityScore > 5 ||
      productPriceScore < 1 || productPriceScore > 5 ||
      productPackagingScore < 1 || productPackagingScore > 5
    ) {
      return NextResponse.json(
        { error: 'Invalid scores. All scores must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Calculate average score
    const averageScore = (productQualityScore + productPriceScore + productPackagingScore) / 3;

    // Check if supplier exists
    const supplier = await prisma.suppliers.findUnique({
      where: { id }
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Update supplier with evaluation
    const updatedSupplier = await prisma.suppliers.update({
      where: { id },
      data: {
        productQualityScore,
        productPriceScore,
        productPackagingScore,
        productAverageScore: averageScore,
        evaluationNotes: evaluationNotes || null,
        evaluatedBy: session.user.id,
        evaluatedAt: new Date()
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
        action: 'SUPPLIER_EVALUATED',
        module: 'SUPPLIER',
        description: `Evaluated supplier ${supplier.businessName}`,
        metadata: {
          supplierId: id,
          businessName: supplier.businessName,
          scores: {
            quality: productQualityScore,
            price: productPriceScore,
            packaging: productPackagingScore,
            average: averageScore.toFixed(2)
          },
          notes: evaluationNotes
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Supplier evaluation saved successfully',
      data: {
        ...updatedSupplier,
        sample_products: updatedSupplier.sample_products.map((p: any) => ({
          ...p,
          images: JSON.parse(p.images || '[]')
        }))
      }
    });

  } catch (error) {
    console.error('Error evaluating supplier:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
