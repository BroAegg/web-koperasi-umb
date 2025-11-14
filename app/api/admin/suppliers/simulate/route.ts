import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only SUPER_ADMIN can simulate
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "DEVELOPER") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only SUPER_ADMIN can simulate" },
        { status: 403 }
      );
    }

    // Generate random test data
    const testTypes = [
      { method: "CASH", name: "Toko Tunai", category: "Makanan & Minuman" },
      { method: "TRANSFER", name: "Warung Transfer", category: "Kebutuhan Rumah Tangga" },
      { method: "CASH", name: "Depot Cash", category: "Fashion & Aksesoris" },
      { method: "TRANSFER", name: "Usaha Bank", category: "Elektronik" },
    ];

    const randomTest = testTypes[Math.floor(Math.random() * testTypes.length)];
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);

    const testSupplier = {
      businessName: `${randomTest.name} ${randomNum}`,
      ownerName: `Pemilik Test ${randomNum}`,
      email: `test.supplier.${timestamp}@example.com`,
      password: "Test123!",
      phone: `0812${String(randomNum).padStart(8, "0")}`,
      category: randomTest.category,
      address: `Jl. Test Simulasi No. ${randomNum}, Bandung`,
      description: `Supplier simulasi untuk testing - ${randomTest.method} payment method`,
      paymentMethod: randomTest.method,
    };

    // Hash password
    const hashedPassword = await hashPassword(testSupplier.password);

    // Generate supplier code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const supplierCode = `SIM-${dateStr}-${randomSuffix}`;

    // Create test supplier
    const supplier = await prisma.suppliers.create({
      data: {
        id: randomUUID(),
        code: supplierCode,
        businessName: testSupplier.businessName,
        ownerName: testSupplier.ownerName,
        email: testSupplier.email,
        password: hashedPassword,
        phone: testSupplier.phone,
        productCategory: testSupplier.category,
        address: testSupplier.address,
        description: testSupplier.description,
        preferredPaymentMethod: testSupplier.paymentMethod as any,
        status: "PENDING",
        paymentStatus: "UNPAID",
        isActive: false,
        isPaymentActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `✅ Test supplier berhasil dibuat! Login: ${testSupplier.email} / ${testSupplier.password}`,
      data: {
        id: supplier.id,
        code: supplier.code,
        businessName: supplier.businessName,
        email: testSupplier.email,
        password: testSupplier.password, // Only for testing
        paymentMethod: supplier.preferredPaymentMethod,
        status: supplier.status,
      },
    });
  } catch (error) {
    console.error("Simulate supplier error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test supplier",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
