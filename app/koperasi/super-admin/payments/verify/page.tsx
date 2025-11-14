"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  periodStart: string;
  periodEnd: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  paymentProof: string | null;
  note: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  suppliers: {
    id: string;
    code: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    status: string;
    paymentStatus: string;
    isSuspendedForPayment: boolean;
    nextPaymentDue: string | null;
  };
}

interface Summary {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export default function PaymentVerificationPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [modalAction, setModalAction] = useState<"VERIFY" | "REJECT">("VERIFY");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (selectedStatus === "ALL") {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter((p) => p.status === selectedStatus));
    }
  }, [selectedStatus, payments]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/payments/verify");
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal memuat data");
        return;
      }

      setPayments(data.data.payments);
      setFilteredPayments(
        data.data.payments.filter((p: Payment) => p.status === "PENDING")
      );
      setSummary(data.data.summary);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedPayment) return;

    setProcessingId(selectedPayment.id);

    try {
      const res = await fetch("/api/admin/payments/verify", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: modalAction,
          note: note.trim() || null,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Error: " + (data.error || "Gagal memproses pembayaran"));
        return;
      }

      alert(
        modalAction === "VERIFY"
          ? "✅ Pembayaran berhasil diverifikasi!"
          : "✅ Pembayaran ditolak"
      );
      setShowNoteModal(false);
      setSelectedPayment(null);
      setNote("");
      fetchPayments(); // Refresh data
    } catch (error) {
      console.error("Action error:", error);
      alert("Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setProcessingId(null);
    }
  };

  const openModal = (payment: Payment, action: "VERIFY" | "REJECT") => {
    setSelectedPayment(payment);
    setModalAction(action);
    setNote("");
    setShowNoteModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            Verifikasi Pembayaran Supplier
          </h1>
          <p className="text-slate-600">
            Review dan verifikasi pembayaran fee bulanan supplier
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card
              className={`cursor-pointer transition-all ${
                selectedStatus === "ALL" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedStatus("ALL")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
                  <div className="text-xs text-slate-600">Total</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedStatus === "PENDING" ? "ring-2 ring-amber-500" : ""
              }`}
              onClick={() => setSelectedStatus("PENDING")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-700">{summary.pending}</div>
                  <div className="text-xs text-slate-600">Pending</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedStatus === "VERIFIED" ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => setSelectedStatus("VERIFIED")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{summary.verified}</div>
                  <div className="text-xs text-slate-600">Verified</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedStatus === "REJECTED" ? "ring-2 ring-red-500" : ""
              }`}
              onClick={() => setSelectedStatus("REJECTED")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">{summary.rejected}</div>
                  <div className="text-xs text-slate-600">Rejected</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Tidak Ada Data</h3>
              <p className="text-slate-500">Tidak ada pembayaran untuk status ini</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Left: Payment Info */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-slate-800">
                          {formatCurrency(payment.amount)}
                        </h3>
                        {getStatusBadge(payment.status)}
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Dibayar: {formatDate(payment.paymentDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Periode: {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Metode: </span>
                          {payment.paymentMethod === 'CASH' ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              💵 CASH
                            </span>
                          ) : payment.paymentMethod === 'TRANSFER' ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              🏦 TRANSFER
                            </span>
                          ) : (
                            <span>{payment.paymentMethod}</span>
                          )}
                        </div>
                      </div>

                      {payment.note && (
                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded p-2">
                          <p className="text-xs font-medium text-slate-700">Catatan:</p>
                          <p className="text-xs text-slate-600">{payment.note}</p>
                        </div>
                      )}
                    </div>

                    {/* Middle: Supplier Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Informasi Supplier
                      </h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">{payment.suppliers.businessName}</div>
                            <div className="text-xs text-blue-600">{payment.suppliers.code}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{payment.suppliers.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">{payment.suppliers.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{payment.suppliers.phone}</span>
                        </div>
                        
                        {payment.suppliers.isSuspendedForPayment && (
                          <div className="pt-2 mt-2 border-t border-blue-300">
                            <span className="text-xs font-semibold text-red-600">⚠️ SUSPENDED</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="space-y-3">
                      {payment.paymentMethod === 'CASH' ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <p className="font-semibold text-green-800">Pembayaran Tunai</p>
                          </div>
                          <p className="text-xs text-green-700 mb-3">
                            Tidak ada bukti transfer untuk pembayaran tunai. Payment diinput langsung oleh kasir di kantor.
                          </p>
                          {payment.note && payment.note.includes('Diinput oleh') && (
                            <div className="text-xs text-green-600 bg-green-100 rounded p-2">
                              {payment.note.split('|').find(n => n.includes('Diinput oleh'))?.trim()}
                            </div>
                          )}
                        </div>
                      ) : payment.paymentProof ? (
                        <div>
                          <p className="text-xs text-slate-600 mb-2">Bukti Pembayaran:</p>
                          <div className="bg-slate-100 rounded-lg p-2 mb-2">
                            <img 
                              src={payment.paymentProof.startsWith('data:') ? payment.paymentProof : `/uploads/payments/${payment.paymentProof}`} 
                              alt="Bukti Pembayaran" 
                              className="w-full h-32 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                if (payment.paymentProof) {
                                  const imgSrc = payment.paymentProof.startsWith('data:') ? payment.paymentProof : `/uploads/payments/${payment.paymentProof}`;
                                  window.open(imgSrc, "_blank");
                                }
                              }}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              if (payment.paymentProof) {
                                const imgSrc = payment.paymentProof.startsWith('data:') ? payment.paymentProof : `/uploads/payments/${payment.paymentProof}`;
                                window.open(imgSrc, "_blank");
                              }
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Buka Bukti di Tab Baru
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-xs text-amber-700">
                            Tidak ada bukti pembayaran
                          </p>
                        </div>
                      )}

                      {payment.status === "PENDING" && (
                        <>
                          <Button
                            onClick={() => openModal(payment, "VERIFY")}
                            disabled={processingId === payment.id}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verifikasi
                          </Button>
                          <Button
                            onClick={() => openModal(payment, "REJECT")}
                            disabled={processingId === payment.id}
                            variant="outline"
                            className="w-full border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Tolak
                          </Button>
                        </>
                      )}

                      {payment.verifiedAt && (
                        <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
                          Diproses: {formatDate(payment.verifiedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Note Modal */}
        {showNoteModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full">
              <CardHeader>
                <CardTitle className={modalAction === "VERIFY" ? "text-green-700" : "text-red-700"}>
                  {modalAction === "VERIFY" ? "Verifikasi" : "Tolak"} Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    Supplier: <span className="font-semibold">{selectedPayment.suppliers.businessName}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Jumlah: <span className="font-semibold">{formatCurrency(selectedPayment.amount)}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tambahkan catatan jika diperlukan..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNoteModal(false);
                      setSelectedPayment(null);
                      setNote("");
                    }}
                    className="flex-1"
                    disabled={processingId === selectedPayment.id}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleAction}
                    disabled={processingId === selectedPayment.id}
                    className={`flex-1 ${
                      modalAction === "VERIFY"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {processingId === selectedPayment.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {modalAction === "VERIFY" ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verifikasi
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Tolak
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
