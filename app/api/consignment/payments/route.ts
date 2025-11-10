import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { nanoid } from 'nanoid';
import { randomUUID } from 'crypto';

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
    // 1. Authentication validation - support both token and NextAuth session
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    
    // Try token first (only if not empty or 'null' string)
    let user = (token && token !== 'null' && token !== 'undefined') 
      ? await getUserFromToken(token) 
      : null;
    
    // If no valid token, try to get from NextAuth session (for browser requests with cookies)
    if (!user) {
      const session = await getServerSession(authOptions);
      user = session?.user;
    }
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required. Please login.' 
      }, { status: 401 });
    }

    // 2. Authorization validation
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'];
    
    if (!allowedRoles.includes(user.role as string)) {
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
    const { supplierIds, amounts, period, paymentMethod, note, returnRemaining } = body;
    
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
        
        console.log(`[Payment] Processing payment for supplier: ${supplierId}, amount: Rp ${amount.toLocaleString('id-ID')}`);
        
        // Get consignor information (TITIPAN suppliers are in consignors table)
        const consignor = await prisma.consignors.findUnique({
          where: { id: supplierId },
          select: { name: true, contact: true, code: true }
        });
        
        if (!consignor) {
          console.error(`[Payment] Consignor not found: ${supplierId}`);
          errors.push({ supplierId, error: 'Consignor not found in database' });
          continue;
        }
        
        console.log(`[Payment] Found consignor: ${consignor.name} (${consignor.code})`);
        
        // Generate unique IDs
        const transactionId = `TXN-${nanoid(10)}`;
        const paymentId = `CPAY-${nanoid(10)}`;

        // Create the transaction
        console.log(`[Payment] Creating transaction...`);
        await prisma.transactions.create({
          data: {
            id: transactionId,
            totalAmount: -amount, // Negative because it's a payment (cash out)
            type: 'EXPENSE', // EXPENSE for cash out
            paymentMethod: paymentMethod as any,
            note: `Bayar Titipan: ${consignor.name} (${periodValue})${note ? ` - ${note}` : ''}`,
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            isProduction: user.developerSession?.isProduction ?? true,
          }
        });
        console.log(`[Payment] Transaction created: ${transactionId}`);

        // 📦 RETURN REMAINING GOODS FIRST (if requested) - before creating payment record
        let returnedBatches: any[] = [];
        if (returnRemaining) {
          console.log(`[Payment] 📦 Processing return of remaining goods for consignor ${supplierId}...`);
          
          // Find all batches with remaining quantity
          const batchesToReturn = await prisma.consignment_batches.findMany({
            where: {
              consignorId: supplierId,
              qtyRemaining: { gt: 0 },
              status: 'ACTIVE'
            },
            include: {
              products: {
                select: { id: true, name: true, stock: true }
              }
            }
          });

          console.log(`[Payment] Found ${batchesToReturn.length} batches with remaining goods`);

          // Process each batch
          for (const batch of batchesToReturn) {
            const qtyToReturn = batch.qtyRemaining;
            
            // Update batch: move qtyRemaining to qtyReturned
            await prisma.consignment_batches.update({
              where: { id: batch.id },
              data: {
                qtyReturned: batch.qtyReturned + qtyToReturn,
                qtyRemaining: 0,
                status: 'RETURNED' // Mark as returned
              }
            });

            // Reset product stock to 0 (goods returned to supplier)
            await prisma.products.update({
              where: { id: batch.productId },
              data: {
                stock: 0 // Reset to 0, ready for next day restock
              }
            });

            // Create stock movement record for the return
            await prisma.stock_movements.create({
              data: {
                id: randomUUID(),
                productId: batch.productId,
                movementType: 'RETURN_OUT', // Use existing enum value for consignment returns
                quantity: -qtyToReturn, // Negative for return/outgoing
                note: `Pengembalian barang titipan ke konsinyasi - Batch ${batch.code}`
              }
            });

            returnedBatches.push({
              batchId: batch.id,
              batchCode: batch.code,
              productId: batch.productId,
              productName: batch.products.name,
              qty: qtyToReturn
            });

            console.log(`[Payment] ✅ Returned ${qtyToReturn} pcs of ${batch.products.name} (batch: ${batch.code})`);
          }

          console.log(`[Payment] ✅ Total returned: ${returnedBatches.length} batches, ${returnedBatches.reduce((sum, r) => sum + r.qty, 0)} pcs`);
        }

        // Create consignment payment record
        console.log(`[Payment] Creating payment record...`);
        await prisma.consignment_payments.create({
          data: {
            id: paymentId,
            supplierName: consignor.name,
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
              hasReturn: returnRemaining,
              returnedBatches: returnRemaining ? returnedBatches : undefined,
              totalReturnedQty: returnRemaining ? returnedBatches.reduce((sum: number, r: any) => sum + r.qty, 0) : 0,
              totalReturnedProducts: returnRemaining ? returnedBatches.length : 0
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log(`[Payment] Payment record created: ${paymentId}`);

      // ✅ UPDATE existing consignment_sales to mark as settled (reduce hutang konsinyasi)
      // Find all unpaid sales for this supplier (not limited by period - pay ALL unsettled)
      const salesToSettle = await prisma.consignment_sales.findMany({
        where: {
          consignment_batches: {
            consignorId: supplierId
          },
          isSettled: false // Only unsettled sales (regardless of date)
        },
        select: { id: true, netToConsignor: true, saleDate: true }
      });

      // Verify total matches payment amount (optional - for validation)
      const totalUnsettled = salesToSettle.reduce((sum, s) => sum + Number(s.netToConsignor), 0);
      
      console.log(`[Payment] Supplier ${supplierId}: Found ${salesToSettle.length} unsettled sales, Total: Rp ${totalUnsettled.toLocaleString('id-ID')}, Payment: Rp ${amount.toLocaleString('id-ID')}`);

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
        
        console.log(`[Payment] ✅ Settled ${salesToSettle.length} sales for supplier ${supplierId}`);
      } else {
        console.warn(`[Payment] ⚠️ No unsettled sales found for supplier ${supplierId} - Payment will be recorded as advance/prepayment`);
      }

      // Log return activity (if any returns were processed)
      if (returnRemaining && returnedBatches.length > 0) {
        const returnLogId = `ALOG-${nanoid(10)}`;
        const returnSummary = returnedBatches.map(r => `${r.qty} pcs ${r.productName}`).join(', ');
        
        await prisma.activity_logs.create({
          data: {
            id: returnLogId,
            userId: (user as any).id,
            userRole: (user as any).role as any,
            action: 'CONSIGNMENT_RETURN',
            module: 'INVENTORY',
            description: `Return Barang Titipan ke ${consignor.name}: ${returnSummary}`,
            metadata: { 
              supplierId, 
              consignorName: consignor.name,
              returnedBatches,
              totalQty: returnedBatches.reduce((sum, r) => sum + r.qty, 0),
              paymentId 
            },
            isProduction: user.developerSession?.isProduction ?? true,
          },
        });
        
        console.log(`[Payment] ✅ Logged return activity: ${returnedBatches.length} batches returned`);
      }

      // Create activity log for payment
        console.log(`[Payment] Creating activity log...`);
        const activityLogId = `ALOG-${nanoid(10)}`;
        const paymentDescription = returnRemaining 
          ? `Bayar Titipan: ${consignor.name} - Rp ${amount.toLocaleString('id-ID')} (${paymentMethodValue}) + Return ${returnedBatches.length} batch`
          : `Bayar Titipan: ${consignor.name} - Rp ${amount.toLocaleString('id-ID')} (${paymentMethodValue})`;
        
        await prisma.activity_logs.create({
          data: {
            id: activityLogId,
            userId: (user as any).id,
            userRole: (user as any).role as any,
            action: 'CONSIGNMENT_PAYMENT',
            module: 'INVENTORY',
            description: paymentDescription,
            metadata: { 
              supplierId, 
              amount, 
              transactionId, 
              paymentId, 
              paymentMethod: paymentMethodValue, 
              settledCount: salesToSettle.length,
              returnedBatches: returnRemaining ? returnedBatches : undefined
            },
            isProduction: user.developerSession?.isProduction ?? true,
          },
        });
        console.log(`[Payment] Activity log created: ${activityLogId}`);

        created.push({ supplierId, amount, transactionId, paymentId });
        
      } catch (supplierError) {
        console.error(`[Payment] ❌ Error processing payment for supplier ${supplierId}:`, supplierError);
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
        error: 'Semua pembayaran gagal diproses',
        details: errors
      }, { status: 400 });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: true, 
        created, 
        errors,
        message: `${created.length} berhasil, ${errors.length} gagal`,
        warning: 'Some payments failed'
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: created,
      message: `${created.length} pembayaran berhasil`,
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

// GET endpoint for payment history
export async function GET(req: NextRequest) {
  try {
    // Authentication validation - support both token and NextAuth session
    const auth = req.headers.get('authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    
    // Try token first (only if not empty or 'null' string)
    let user = (token && token !== 'null' && token !== 'undefined') 
      ? await getUserFromToken(token) 
      : null;
    
    // If no valid token, try to get from NextAuth session (for browser requests with cookies)
    if (!user) {
      const session = await getServerSession(authOptions);
      user = session?.user;
    }
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required. Please login.' 
      }, { status: 401 });
    }

    // Authorization validation
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'];
    
    if (!allowedRoles.includes(user.role as string)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions. Admin access required.' 
      }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch payment history
    const payments = await prisma.consignment_payments.findMany({
      where: {
        status: 'PAID'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            totalAmount: true,
            note: true
          }
        }
      }
    });

    // Get total count
    const totalCount = await prisma.consignment_payments.count({
      where: {
        status: 'PAID'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        payments: payments.map(p => ({
          id: p.id,
          supplierName: p.supplierName,
          amount: p.amount,
          period: p.period,
          periodStart: p.periodStart,
          periodEnd: p.periodEnd,
          paymentMethod: p.paymentMethod,
          transactionId: p.transactionId,
          note: p.note,
          createdAt: p.createdAt,
          metadata: p.metadata
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
