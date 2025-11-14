"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  AlertCircle,
  Loader2,
  Info,
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

interface Limits {
  maxActiveProducts: number;
  currentActiveProducts: number;
  remaining: number;
}

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(""); // Clear previous error
      const res = await fetch("/api/supplier/products/submit");
      
      // Check if response is ok before parsing JSON
      if (!res.ok) {
        const text = await res.text();
        console.error("API Response Error:", res.status, text);
        setError(`Error ${res.status}: ${text.substring(0, 100)}`);
        return;
      }
      
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal memuat data");
        return;
      }

      setSubmissions(data.data.submissions);
      setSummary(data.data.summary);
      setLimits(data.data.limits);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
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
      case "RESUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            <RefreshCcw className="w-3 h-3" />
            Diajukan Ulang
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Pengajuan Produk
              </h1>
              <p className="text-slate-600 mt-2">
                Daftar produk yang telah Anda ajukan ke koperasi
              </p>
            </div>

            <Button
              onClick={() => router.push("/koperasi/supplier/products/submit")}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={limits ? limits.remaining <= 0 : false}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajukan Produk Baru
            </Button>
          </div>

          {/* Summary Cards */}
          {summary && limits && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
                    <div className="text-xs text-slate-600">Total Pengajuan</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-amber-700">{summary.pending}</div>
                    <div className="text-xs text-slate-600">Menunggu Review</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">{summary.approved}</div>
                    <div className="text-xs text-slate-600">Disetujui</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-700">{summary.rejected}</div>
                    <div className="text-xs text-slate-600">Ditolak</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Info className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">
                      {limits.remaining}/{limits.maxActiveProducts}
                    </div>
                    <div className="text-xs text-blue-600">Slot Tersisa</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Limit Warning */}
          {limits && limits.remaining <= 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Batas Produk Tercapai</p>
                <p>
                  Anda telah mencapai batas maksimal {limits.maxActiveProducts} produk aktif.
                  Hubungi admin untuk peningkatan limit.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Belum Ada Pengajuan
              </h3>
              <p className="text-slate-500 mb-6">
                Mulai ajukan produk pertama Anda untuk dijual di koperasi
              </p>
              <Button
                onClick={() => router.push("/koperasi/supplier/products/submit")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajukan Produk Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {submission.name}
                        </h3>
                        {getStatusBadge(submission.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
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
                        <p className="text-sm text-slate-600 mb-3">
                          {submission.description}
                        </p>
                      )}

                      {/* Rejection Reason */}
                      {submission.status === "REJECTED" && submission.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-semibold text-red-800 mb-1">
                            Alasan Penolakan:
                          </p>
                          <p className="text-sm text-red-700">{submission.rejectionReason}</p>
                        </div>
                      )}

                      {/* Approved Product Info */}
                      {submission.status === "APPROVED" && submission.approvedProduct && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-green-800 mb-1">
                            Produk Aktif:
                          </p>
                          <p className="text-sm text-green-700">
                            Stok saat ini: {submission.approvedProduct.stock} {submission.unit} •{" "}
                            Status:{" "}
                            {submission.approvedProduct.isActive ? "Aktif" : "Tidak Aktif"}
                          </p>
                        </div>
                      )}

                      {/* Reviewer Info */}
                      {submission.reviewer && submission.reviewedAt && (
                        <p className="text-xs text-slate-500 mt-2">
                          Direview oleh {submission.reviewer.name} pada{" "}
                          {formatDate(submission.reviewedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
