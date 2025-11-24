import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
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

    // Generate random test data with different payment scenarios
    const testTypes = [
      { 
        method: "CASH", 
        name: "Toko Tunai", 
        category: "Makanan & Minuman",
        scenario: "no-payment", // Belum bayar
        status: "PENDING",
        paymentStatus: "UNPAID"
      },
      { 
        method: "TRANSFER", 
        name: "Warung Transfer", 
        category: "Kebutuhan Rumah Tangga",
        scenario: "pending-proof", // Sudah upload bukti, pending approval
        status: "PENDING",
        paymentStatus: "PAID_PENDING_APPROVAL"
      },
      { 
        method: "CASH", 
        name: "Depot Cash", 
        category: "Fashion & Aksesoris",
        scenario: "approved", // Sudah approved
        status: "APPROVED",
        paymentStatus: "PAID_APPROVED"
      },
      { 
        method: "TRANSFER", 
        name: "Usaha Bank", 
        category: "Sembako",
        scenario: "pending-proof", // Butuh verifikasi bukti transfer
        status: "PENDING",
        paymentStatus: "PAID_PENDING_APPROVAL"
      },
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
      description: `Supplier simulasi untuk testing - ${randomTest.method} payment method - Scenario: ${randomTest.scenario}`,
      paymentMethod: randomTest.method,
      scenario: randomTest.scenario,
      status: randomTest.status,
      paymentStatus: randomTest.paymentStatus,
    };

    // Hash password
    const hashedPassword = await hashPassword(testSupplier.password);

    // Generate supplier code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const supplierCode = `SIM-${dateStr}-${randomSuffix}`;

    // Create test supplier with scenario-based data
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
        preferredPaymentMethod: testSupplier.paymentMethod === "CASH" ? "CASH" : "TRANSFER",
        status: testSupplier.scenario === "no-payment" ? "PENDING_REVIEW" : 
                testSupplier.scenario === "pending-proof" ? "PENDING_REVIEW" : 
                "APPROVED_PENDING_PAYMENT",
        paymentStatus: testSupplier.paymentStatus as "UNPAID" | "PAID_PENDING_APPROVAL" | "PAID_APPROVED" | "PAID_REJECTED",
        isActive: testSupplier.status === "APPROVED",
        isPaymentActive: testSupplier.paymentStatus === "PAID_APPROVED",
        monthlyFee: 50000, // Default fee Rp 50.000
        approvedById: testSupplier.status === "APPROVED" ? session.user.id : null,
        approvedAt: testSupplier.status === "APPROVED" ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create sample products (1-2 products)
    const sampleProductsData = [
      {
        productName: `${testSupplier.category === "Makanan & Minuman" ? "Keripik" : "Produk"} Sample 1`,
        productCategory: testSupplier.category,
        price: Math.floor(Math.random() * 50000) + 10000, // Rp 10.000 - 60.000
        description: `Produk sample untuk testing supplier ${testSupplier.businessName}`,
        images: JSON.stringify([
          "/images/placeholder-product-1.jpg",
          "/images/placeholder-product-2.jpg",
          "/images/placeholder-product-3.jpg"
        ]),
        displayOrder: 1
      }
    ];

    // 50% chance untuk tambah produk ke-2
    if (Math.random() > 0.5) {
      sampleProductsData.push({
        productName: `${testSupplier.category === "Makanan & Minuman" ? "Sambal" : "Produk"} Sample 2`,
        productCategory: testSupplier.category,
        price: Math.floor(Math.random() * 50000) + 10000,
        description: `Produk sample tambahan untuk testing supplier ${testSupplier.businessName}`,
        images: JSON.stringify([
          "/images/placeholder-product-1.jpg",
          "/images/placeholder-product-2.jpg",
          "/images/placeholder-product-3.jpg"
        ]),
        displayOrder: 2
      });
    }

    // Create sample products
    await prisma.supplier_sample_products.createMany({
      data: sampleProductsData.map(product => ({
        id: randomUUID(),
        supplierId: supplier.id,
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    });

    // Create payment record if scenario needs it
    if (testSupplier.scenario === "pending-proof" || testSupplier.scenario === "approved") {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

      await prisma.supplier_payments.create({
        data: {
          id: randomUUID(),
          supplierId: supplier.id,
          amount: 50000,
          paymentMethod: testSupplier.paymentMethod === "CASH" ? "CASH" : "TRANSFER",
          paymentProof: testSupplier.paymentMethod === "TRANSFER" 
            ? `/uploads/bukti-transfer-${supplier.code}.jpg` 
            : null,
          paymentDate: now,
          periodStart: periodStart,
          periodEnd: periodEnd,
          status: testSupplier.scenario === "approved" ? "VERIFIED" : "PENDING",
          note: `Payment simulasi untuk testing - ${testSupplier.scenario}`,
          verifiedBy: testSupplier.scenario === "approved" ? session.user.id : null,
          verifiedAt: testSupplier.scenario === "approved" ? now : null,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    // Scenario descriptions for response
    const scenarioDesc = {
      "no-payment": "Belum melakukan pembayaran",
      "pending-proof": "Menunggu verifikasi bukti transfer",
      "approved": "Sudah disetujui dan aktif"
    };

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
        paymentStatus: supplier.paymentStatus,
        scenario: testSupplier.scenario,
        scenarioDescription: scenarioDesc[testSupplier.scenario as keyof typeof scenarioDesc],
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
