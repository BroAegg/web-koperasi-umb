"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CreditCard,
  User,
  Building2,
  Phone,
  Mail,
  CheckCircle,
  Loader2,
  AlertCircle,
  DollarSign,
  Receipt,
} from "lucide-react";

interface Supplier {
  id: string;
  code: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: string;
  paymentStatus: string;
  monthlyFee: number;
  nextPaymentDue: string | null;
}

export default function CashPaymentPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search suppliers
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Masukkan nama atau kode supplier");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const res = await fetch(
        `/api/admin/suppliers?search=${encodeURIComponent(searchTerm)}&status=APPROVED`
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal mencari supplier");
        return;
      }

      setSuppliers(data.data || []);
      setFilteredSuppliers(data.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Terjadi kesalahan saat mencari supplier");
    } finally {
      setIsSearching(false);
    }
  };

  // Select supplier
  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setAmount(supplier.monthlyFee.toString());
    setSuppliers([]);
    setSearchTerm("");
  };

  // Submit cash payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSupplier) {
      setError("Pilih supplier terlebih dahulu");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Masukkan jumlah pembayaran yang valid");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/kasir/payments/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          amount: parseFloat(amount),
          note: note.trim() || null,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Gagal menyimpan pembayaran");
        return;
      }

      setSuccess(
        `✅ Pembayaran cash dari ${selectedSupplier.businessName} berhasil disimpan! Menunggu verifikasi admin.`
      );

      // Automatically open receipt in new tab
      window.open(`/api/kasir/payments/receipt/${data.data.paymentId}`, "_blank");
      
      // Optional: Allow download
      setTimeout(() => {
        if (confirm("Struk pembayaran telah dibuka. Download struk untuk arsip?")) {
          const link = document.createElement('a');
          link.href = `/api/kasir/payments/receipt/${data.data.paymentId}`;
          link.download = `struk-${selectedSupplier.code}-${new Date().toISOString().slice(0,10)}.pdf`;
          link.click();
        }
      }, 500);

      // Reset form
      setSelectedSupplier(null);
      setAmount("");
      setNote("");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Terjadi kesalahan saat menyimpan pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Input Pembayaran Cash</h1>
            <p className="text-gray-600 mt-1">Terima pembayaran tunai dari supplier</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Search Supplier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Cari Supplier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan nama atau kode supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Cari
                  </>
                )}
              </Button>
            </div>

            {/* Search Results */}
            {filteredSuppliers.length > 0 && (
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    onClick={() => handleSelectSupplier(supplier)}
                    className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {supplier.businessName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 ml-6">
                          <p>
                            <User className="w-3 h-3 inline mr-1" />
                            {supplier.ownerName}
                          </p>
                          <p>
                            <Phone className="w-3 h-3 inline mr-1" />
                            {supplier.phone}
                          </p>
                          <p className="text-xs text-gray-500">{supplier.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {formatCurrency(supplier.monthlyFee)}
                        </p>
                        <p className="text-xs text-gray-500">Fee Bulanan</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Form */}
        {selectedSupplier && (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Form Pembayaran Cash
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Supplier Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Informasi Supplier
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Nama Bisnis</p>
                      <p className="font-medium">{selectedSupplier.businessName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Pemilik</p>
                      <p className="font-medium">{selectedSupplier.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Kode</p>
                      <p className="font-medium">{selectedSupplier.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Status</p>
                      <p className="font-medium">{selectedSupplier.status}</p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                      placeholder="Masukkan jumlah..."
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Fee bulanan: {formatCurrency(selectedSupplier.monthlyFee)}
                  </p>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Tambahkan catatan jika diperlukan..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedSupplier(null);
                      setAmount("");
                      setNote("");
                    }}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4 mr-2" />
                        Simpan Pembayaran
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
