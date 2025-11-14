import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role: KASIR, ADMIN, SUPER_ADMIN, or the supplier who made the payment
    const isAuthorized =
      ["KASIR", "ADMIN", "SUPER_ADMIN"].includes(session.user.role) ||
      session.user.role === "SUPPLIER";

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    const paymentId = params.id;

    // Fetch payment with supplier details
    const payment = await prisma.supplier_payments.findUnique({
      where: { id: paymentId },
      include: {
        suppliers: {
          select: {
            code: true,
            businessName: true,
            ownerName: true,
            phone: true,
            email: true,
            address: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify supplier access (if user is supplier, they can only see their own receipt)
    if (
      session.user.role === "SUPPLIER" &&
      payment.supplierId !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Not your payment" },
        { status: 403 }
      );
    }

    // Generate PDF Receipt
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200], // Thermal printer size (80mm width)
    });

    // Set font
    doc.setFont("helvetica");

    // Header - Koperasi Info
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("KOPERASI UMB", 40, 15, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Universitas Muhammadiyah Bandung", 40, 21, { align: "center" });
    doc.text("Jl. Soekarno Hatta No. 754", 40, 26, { align: "center" });
    doc.text("Telp: (022) 7271717", 40, 31, { align: "center" });

    // Divider
    doc.setLineWidth(0.5);
    doc.line(5, 35, 75, 35);

    // Receipt Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("STRUK PEMBAYARAN", 40, 42, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("(CASH PAYMENT)", 40, 47, { align: "center" });

    // Divider
    doc.line(5, 50, 75, 50);

    // Payment Details
    let yPos = 57;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("DETAIL PEMBAYARAN", 5, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // Payment ID
    doc.text("No. Transaksi:", 5, yPos);
    doc.text(payment.id.substring(0, 12).toUpperCase(), 75, yPos, {
      align: "right",
    });
    yPos += 5;

    // Payment Date
    doc.text("Tanggal:", 5, yPos);
    doc.text(
      new Date(payment.paymentDate).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      75,
      yPos,
      { align: "right" }
    );
    yPos += 5;

    // Payment Method
    doc.text("Metode:", 5, yPos);
    doc.setFont("helvetica", "bold");
    doc.text("TUNAI (CASH)", 75, yPos, { align: "right" });
    doc.setFont("helvetica", "normal");
    yPos += 7;

    // Divider
    doc.line(5, yPos, 75, yPos);
    yPos += 5;

    // Supplier Info
    doc.setFont("helvetica", "bold");
    doc.text("SUPPLIER", 5, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.text("Kode:", 5, yPos);
    doc.text(payment.suppliers.code, 75, yPos, { align: "right" });
    yPos += 5;

    doc.text("Nama Usaha:", 5, yPos);
    const businessName = payment.suppliers.businessName;
    if (businessName.length > 25) {
      doc.setFontSize(7);
      doc.text(businessName, 75, yPos, { align: "right", maxWidth: 40 });
      doc.setFontSize(8);
      yPos += 5;
    } else {
      doc.text(businessName, 75, yPos, { align: "right" });
      yPos += 5;
    }

    doc.text("Pemilik:", 5, yPos);
    doc.text(payment.suppliers.ownerName, 75, yPos, { align: "right" });
    yPos += 5;

    doc.text("Telepon:", 5, yPos);
    doc.text(payment.suppliers.phone, 75, yPos, { align: "right" });
    yPos += 7;

    // Divider
    doc.line(5, yPos, 75, yPos);
    yPos += 5;

    // Amount Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("RINCIAN BIAYA", 5, yPos);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Biaya Bulanan:", 5, yPos);
    doc.text(
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(Number(payment.amount)),
      75,
      yPos,
      { align: "right" }
    );
    yPos += 7;

    // Total (bold and larger)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TOTAL BAYAR:", 5, yPos);
    doc.text(
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(Number(payment.amount)),
      75,
      yPos,
      { align: "right" }
    );
    yPos += 8;

    // Divider
    doc.line(5, yPos, 75, yPos);
    yPos += 5;

    // Status
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Status:", 5, yPos);
    doc.setFont("helvetica", "bold");
    const statusText =
      payment.status === "PENDING"
        ? "MENUNGGU VERIFIKASI"
        : payment.status === "VERIFIED"
        ? "TERVERIFIKASI"
        : payment.status;
    doc.text(statusText, 75, yPos, { align: "right" });
    yPos += 7;

    // Note from kasir
    if (payment.note) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      const noteLines = doc.splitTextToSize(payment.note, 65);
      doc.text("Catatan:", 5, yPos);
      yPos += 4;
      doc.text(noteLines, 5, yPos);
      yPos += noteLines.length * 3 + 5;
    }

    // Divider
    doc.line(5, yPos, 75, yPos);
    yPos += 5;

    // Footer - Signatures
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    // Kasir signature
    doc.text("Kasir,", 10, yPos);
    yPos += 15;
    doc.line(5, yPos, 35, yPos);
    yPos += 4;
    doc.setFontSize(7);
    doc.text("(Tanda Tangan & Nama)", 20, yPos, { align: "center" });

    // Supplier signature
    yPos -= 19;
    doc.setFontSize(8);
    doc.text("Supplier,", 55, yPos);
    yPos += 15;
    doc.line(45, yPos, 75, yPos);
    yPos += 4;
    doc.setFontSize(7);
    doc.text("(Tanda Tangan & Nama)", 60, yPos, { align: "center" });

    yPos += 8;

    // Footer notes
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text("Simpan struk ini sebagai bukti pembayaran sah", 40, yPos, {
      align: "center",
    });
    yPos += 4;
    doc.text("Terima kasih atas kepercayaan Anda", 40, yPos, {
      align: "center",
    });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="struk-pembayaran-${payment.suppliers.code}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Generate receipt error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate receipt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
