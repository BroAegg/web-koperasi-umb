import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Parse date range for the selected day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get stock movements for the day
    const movements = await prisma.stock_movements.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        movementType: true,
        quantity: true,
      },
    });

    // Calculate summary
    const summary = movements.reduce(
      (acc, movement) => {
        // Quantity is positive for IN movements, negative for OUT movements
        if (movement.quantity > 0) {
          acc.totalIn += movement.quantity;
        } else {
          acc.totalOut += Math.abs(movement.quantity);
        }
        acc.totalMovements++;
        return acc;
      },
      { totalIn: 0, totalOut: 0, totalMovements: 0 }
    );

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil ringkasan stock movement',
      },
      { status: 500 }
    );
  }
}