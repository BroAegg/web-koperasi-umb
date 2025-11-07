import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// Helper function to calculate period dates
function getPeriodDates(period: string): { periodStart: Date; periodEnd: Date } {
  const now = new Date();
  const periodEnd = new Date(now);
  let periodStart = new Date(now);

  switch (period) {
    case 'today':
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    case '7days':
      periodStart.setDate(now.getDate() - 7);
      break;
    case '1month':
      periodStart.setMonth(now.getMonth() - 1);
      break;
    case '3months':
      periodStart.setMonth(now.getMonth() - 3);
      break;
    case '6months':
      periodStart.setMonth(now.getMonth() - 6);
      break;
    case '1year':
      periodStart.setFullYear(now.getFullYear() - 1);
      break;
    default:
      periodStart.setDate(now.getDate() - 7); // default to 7 days
  }

  return { periodStart, periodEnd };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication validation
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication token is required' 
      }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired token' 
      }, { status: 401 });
    }

    // 2. Authorization validation
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN'];
    const isDeveloper = user.developerSession && user.developerSession.actualRole === 'DEVELOPER';
    
    if (!allowedRoles.includes(user.role as string) && !isDeveloper) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions. Admin access required.' 
      }, { status: 403 });
    }

    // 3. Request body validation
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    // 4. Required fields validation
    const { supplierIds, amounts, period, paymentMethod, note } = body;
    
    // Validate supplierIds
    if (!supplierIds) {
      return NextResponse.json({ 
        success: false, 
        error: 'supplierIds field is required' 
      }, { status: 400 });
    }
    
    if (!Array.isArray(supplierIds)) {
      return NextResponse.json({ 
        success: false, 
        error: 'supplierIds must be an array' 
      }, { status: 400 });
    }
    
    if (supplierIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'supplierIds array cannot be empty' 
      }, { status: 400 });
    }

    // Validate supplierIds are strings
    const invalidSupplierIds = supplierIds.filter(id => typeof id !== 'string' || id.trim() === '');
    if (invalidSupplierIds.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'All supplierIds must be non-empty strings' 
      }, { status: 400 });
    }

    // 5. Validate amounts
    if (!amounts || typeof amounts !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: 'amounts field is required and must be an object' 
      }, { status: 400 });
    }

    // Check each supplier has valid amount
    for (const supplierId of supplierIds) {
      const amount = amounts[supplierId];
      
      if (amount === undefined || amount === null) {
        return NextResponse.json({ 
          success: false, 
          error: `Amount is missing for supplier: ${supplierId}` 
        }, { status: 400 });
      }
      
      if (typeof amount !== 'number' || isNaN(amount)) {
        return NextResponse.json({ 
          success: false, 
          error: `Amount for supplier ${supplierId} must be a valid number` 
        }, { status: 400 });
      }
      
      if (amount <= 0) {
        return NextResponse.json({ 
          success: false, 
          error: `Amount for supplier ${supplierId} must be greater than 0` 
        }, { status: 400 });
      }
      
      if (amount > 100000000) { // 100 million limit
        return NextResponse.json({ 
          success: false, 
          error: `Amount for supplier ${supplierId} exceeds maximum limit (100,000,000)` 
        }, { status: 400 });
      }
    }

    // 6. Validate period
    const validPeriods = ['today', '7days', '1month', '3months', '6months', '1year'];
    const periodValue = period || '7days';
    
    if (!validPeriods.includes(periodValue)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` 
      }, { status: 400 });
    }

    // 7. Validate paymentMethod
    const validPaymentMethods = ['CASH', 'TRANSFER', 'CREDIT'];
    const paymentMethodValue = paymentMethod || 'CASH';
    
    if (!validPaymentMethods.includes(paymentMethodValue)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}` 
      }, { status: 400 });
    }

    // 8. Validate note length (optional)
    if (note && typeof note === 'string' && note.length > 500) {
      return NextResponse.json({ 
        success: false, 
        error: 'Note cannot exceed 500 characters' 
      }, { status: 400 });
    }

    const { periodStart, periodEnd } = getPeriodDates(periodValue);

    // 9. Create transactions and payment records for each supplier
    const created: Array<{ supplierId: string; amount: number; transactionId: string; paymentId: string }> = [];
    const errors: Array<{ supplierId: string; error: string }> = [];

    for (const supplierId of supplierIds) {
      try {
        const amount = amounts[supplierId]; // Already validated above
        
        // Get supplier information for better note
        const supplier = await prisma.suppliers.findUnique({
          where: { id: supplierId },
          select: { businessName: true, ownerName: true }
        });
        
        if (!supplier) {
          errors.push({ supplierId, error: 'Supplier not found' });
          continue;
        }
        
        // Generate unique IDs with timestamp to avoid collisions
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const transactionId = `txn-${timestamp}-${randomSuffix}`;
        const paymentId = `cpay-${timestamp}-${randomSuffix}`;

        // Create enhanced note for transaction history
        const transactionNote = `Pembayaran Titipan ke ${supplier.businessName || supplier.ownerName} | Period: ${periodValue} | ${note || 'No additional note'}`;

        // Create EXPENSE transaction
        await prisma.transactions.create({
        data: {
          id: transactionId,
          type: 'EXPENSE',
          totalAmount: amount,
          paymentMethod: paymentMethod as any,
          note: transactionNote,
          createdAt: new Date(),
          updatedAt: new Date(),
          isProduction: user.developerSession?.isProduction ?? true,
        },
      });

      // Create consignment payment record
      await prisma.consignment_payments.create({
        data: {
          id: paymentId,
          supplierName: supplierId,
          amount: amount,
          period: period,
          periodStart: periodStart,
          periodEnd: periodEnd,
          status: 'PAID',
          paymentMethod: paymentMethod as any,
          transactionId: transactionId,
          paidBy: (user as any).id,
          note: note,
          metadata: {
            paidBy: user.name,
            paidAt: new Date().toISOString(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update consignment_sales to mark as settled (reduce hutang konsinyasi)
      // Find all unpaid sales for this supplier in the period
      const salesToSettle = await prisma.consignment_sales.findMany({
        where: {
          consignment_batches: {
            consignorId: supplierId
          },
          saleDate: { gte: periodStart, lte: periodEnd },
          isSettled: false
        },
        select: { id: true, netToConsignor: true }
      });

      // Mark these sales as settled (reducing hutang konsinyasi in balance sheet)
      if (salesToSettle.length > 0) {
        await prisma.consignment_sales.updateMany({
          where: {
            id: { in: salesToSettle.map(s => s.id) }
          },
          data: {
            isSettled: true
          }
        });
      }

      // Create activity log
        // Create activity log
        await prisma.activity_logs.create({
          data: {
            id: `alog-${timestamp}-${randomSuffix}`,
            userId: (user as any).id,
            userRole: (user as any).role as any,
            action: 'CONSIGNMENT_PAYMENT',
            module: 'INVENTORY',
            description: `Pembayaran titipan ke supplier ${supplierId} | amount: Rp ${amount.toLocaleString('id-ID')} | method: ${paymentMethodValue}`,
            metadata: { supplierId, amount, transactionId, paymentId, paymentMethod: paymentMethodValue, period: periodValue },
            isProduction: user.developerSession?.isProduction ?? true,
          },
        });

        created.push({ supplierId, amount, transactionId, paymentId });
        
      } catch (supplierError) {
        console.error(`Error processing payment for supplier ${supplierId}:`, supplierError);
        errors.push({ 
          supplierId, 
          error: supplierError instanceof Error ? supplierError.message : 'Unknown error' 
        });
      }
    }

    // 10. Return response with detailed results
    if (created.length === 0 && errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'All payments failed to process',
        details: errors
      }, { status: 400 });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: true, 
        created, 
        errors,
        message: `${created.length} pembayaran berhasil dicatat, ${errors.length} gagal`,
        warning: 'Some payments failed to process'
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: created,
      message: `${created.length} pembayaran berhasil dicatat`,
      totalAmount: created.reduce((sum, item) => sum + item.amount, 0)
    });
    
  } catch (err) {
    console.error('Consignment payment API error:', err);
    
    // Return more specific error in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: false, 
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err)
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error. Please try again later.' 
    }, { status: 500 });
  }
}
