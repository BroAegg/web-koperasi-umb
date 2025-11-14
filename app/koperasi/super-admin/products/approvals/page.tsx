"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Mail,
  Phone,
  Filter,
} from "lucide-react";

interface Submission {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockInitial: number;
  unit: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "RESUBMITTED";
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  image: string | null;
  supplier: {
    id: string;
    code: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    status: string;
    currentActiveProducts: number;
    maxActiveProducts: number;
  };
  category: {
    id: string;
    name: string;
    icon: string;
  };
  reviewer: {
    name: string;
    email: string;
  } | null;
  approvedProduct: {
    id: string;
    name: string;
    stock: number;
    sellPrice: number;
    isActive: boolean;
  } | null;
}

interface Summary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  resubmitted: number;
}

export default function ProductApprovalsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSubmission, setRejectingSubmission] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Filter submissions based on selected status
    if (selectedStatus === "ALL") {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(
        submissions.filter((s) => s.status === selectedStatus)
      );
    }
  }, [selectedStatus, submissions]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/products/approvals");
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal memuat data");
        return;
      }

      setSubmissions(data.data.submissions);
      setFilteredSubmissions(data.data.submissions);
      setSummary(data.data.summary);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    if (!confirm("Apakah Anda yakin ingin menyetujui produk ini?")) {
      return;
    }

    setProcessingId(submissionId);

    try {
      const res = await fetch("/api/admin/products/approvals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId,
          action: "APPROVE",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Error: " + (data.error || "Gagal menyetujui produk"));
        return;
      }

      alert("✅ Produk berhasil disetujui!");
      fetchSubmissions(); // Refresh data
    } catch (error) {
      console.error("Approve error:", error);
      alert("Terjadi kesalahan saat menyetujui produk");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingSubmission) return;

    if (!rejectionReason.trim()) {
      alert("Harap isi alasan penolakan");
      return;
    }

    setProcessingId(rejectingSubmission.id);

    try {
      const res = await fetch("/api/admin/products/approvals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId: rejectingSubmission.id,
          action: "REJECT",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Error: " + (data.error || "Gagal menolak produk"));
        return;
      }

      alert("✅ Produk berhasil ditolak");
      setShowRejectModal(false);
      setRejectingSubmission(null);
      setRejectionReason("");
      fetchSubmissions(); // Refresh data
    } catch (error) {
      console.error("Reject error:", error);
      alert("Terjadi kesalahan saat menolak produk");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (submission: Submission) => {
    setRejectingSubmission(submission);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Menunggu Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Disetujui
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            Ditolak
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
      hour: "2-digit",
      minute: "2-digit",
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
            <Package className="w-8 h-8 text-blue-600" />
            Persetujuan Produk Supplier
          </h1>
          <p className="text-slate-600">
            Review dan setujui produk yang diajukan oleh supplier
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card
              className={`cursor-pointer transition-all ${
                selectedStatus === "ALL" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedStatus("ALL")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
                  <div className="text-xs text-slate-600">Semua</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedStatus === "PENDING_REVIEW" ? "ring-2 ring-amber-500" : ""
              }`}
              onClick={() => setSelectedStatus("PENDING_REVIEW")}
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
                selectedStatus === "RESUBMITTED" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedStatus("RESUBMITTED")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Filter className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{summary.resubmitted}</div>
                  <div className="text-xs text-slate-600">Resubmitted</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                selectedStatus === "APPROVED" ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => setSelectedStatus("APPROVED")}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{summary.approved}</div>
                  <div className="text-xs text-slate-600">Disetujui</div>
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
                  <div className="text-xs text-slate-600">Ditolak</div>
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

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Tidak Ada Data
              </h3>
              <p className="text-slate-500">
                Tidak ada pengajuan produk untuk status ini
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Left: Product Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {submission.name}
                          </h3>
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-3">
                        <div>
                          <span className="font-medium">Kategori:</span>{" "}
                          {submission.category.icon} {submission.category.name}
                        </div>
                        <div>
                          <span className="font-medium">Harga:</span>{" "}
                          {formatCurrency(submission.price)}
                        </div>
                        <div>
                          <span className="font-medium">Stok Awal:</span>{" "}
                          {submission.stockInitial} {submission.unit}
                        </div>
                        <div>
                          <span className="font-medium">Diajukan:</span>{" "}
                          {formatDate(submission.submittedAt)}
                        </div>
                      </div>

                      {submission.description && (
                        <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded-lg">
                          {submission.description}
                        </p>
                      )}

                      {/* Rejection Reason */}
                      {submission.status === "REJECTED" && submission.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-red-800 mb-1">
                            Alasan Penolakan:
                          </p>
                          <p className="text-sm text-red-700">{submission.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Supplier Info & Actions */}
                    <div className="space-y-4">
                      {/* Supplier Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Informasi Supplier
                        </h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          <div className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium">{submission.supplier.businessName}</div>
                              <div className="text-xs text-blue-600">{submission.supplier.code}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{submission.supplier.ownerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="text-xs">{submission.supplier.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{submission.supplier.phone}</span>
                          </div>
                          <div className="pt-2 border-t border-blue-300 text-xs">
                            <div>
                              Produk Aktif: {submission.supplier.currentActiveProducts}/
                              {submission.supplier.maxActiveProducts}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {(submission.status === "PENDING_REVIEW" ||
                        submission.status === "RESUBMITTED") && (
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleApprove(submission.id)}
                            disabled={processingId === submission.id}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {processingId === submission.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Setujui
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => openRejectModal(submission)}
                            disabled={processingId === submission.id}
                            variant="outline"
                            className="w-full border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Tolak
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && rejectingSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full">
              <CardHeader>
                <CardTitle className="text-red-700">Tolak Pengajuan Produk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    Produk: <span className="font-semibold">{rejectingSubmission.name}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Supplier: <span className="font-semibold">{rejectingSubmission.supplier.businessName}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Jelaskan alasan penolakan produk ini..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectingSubmission(null);
                      setRejectionReason("");
                    }}
                    className="flex-1"
                    disabled={processingId === rejectingSubmission.id}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={processingId === rejectingSubmission.id || !rejectionReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {processingId === rejectingSubmission.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Tolak Produk
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
