import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only SUPER_ADMIN or DEVELOPER can cleanup
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "DEVELOPER") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only SUPER_ADMIN can cleanup" },
        { status: 403 }
      );
    }

    // Find all simulation suppliers (with SIM- prefix)
    const simulationSuppliers = await prisma.suppliers.findMany({
      where: {
        code: {
          startsWith: "SIM-"
        }
      },
      select: {
        id: true,
        code: true,
        businessName: true
      }
    });

    if (simulationSuppliers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada supplier simulasi yang perlu dihapus",
        deletedCount: 0
      });
    }

    const supplierIds = simulationSuppliers.map(s => s.id);

    // Delete related records first (to avoid foreign key constraints)
    await prisma.$transaction([
      // Delete consignment sales
      prisma.consignment_sales.deleteMany({
        where: { supplierId: { in: supplierIds } }
      }),
      // Delete stock requests
      prisma.stock_requests.deleteMany({
        where: { supplierId: { in: supplierIds } }
      }),
      // Delete product submissions
      prisma.product_submissions.deleteMany({
        where: { supplierId: { in: supplierIds } }
      }),
      // Delete supplier payments
      prisma.supplier_payments.deleteMany({
        where: { supplierId: { in: supplierIds } }
      }),
      // Delete consignment payments
      prisma.consignment_payments.deleteMany({
        where: { supplierId: { in: supplierIds } }
      }),
      // Delete purchases
      prisma.purchases.deleteMany({
        where: { supplierId: { in: supplierIds } }
      }),
      // Delete products
      prisma.products.deleteMany({
        where: { supplierId: { in: supplierIds } }
      }),
      // Finally delete suppliers
      prisma.suppliers.deleteMany({
        where: { id: { in: supplierIds } }
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `✅ Berhasil menghapus ${simulationSuppliers.length} supplier simulasi`,
      deletedCount: simulationSuppliers.length,
      deletedSuppliers: simulationSuppliers.map(s => ({
        code: s.code,
        name: s.businessName
      }))
    });
  } catch (error) {
    console.error("Cleanup simulation suppliers error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup simulation suppliers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
