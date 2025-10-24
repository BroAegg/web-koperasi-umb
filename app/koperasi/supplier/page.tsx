"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CreditCard, CheckCircle, Clock, AlertCircle, Upload, Receipt, X, Eye, XCircle } from "lucide-react";

export default function SupplierDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [supplierProfile, setSupplierProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    paymentStatus: "active",
  });

  // Payment Request Modal States
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [showRequestHistory, setShowRequestHistory] = useState(false);
  
  // Form States
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("7days");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [note, setNote] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('[Supplier Dashboard] Component mounted');
    const token = localStorage.getItem("token");
    console.log('[Supplier Dashboard] Token exists:', !!token);
    
    if (!token) {
      console.log('[Supplier Dashboard] No token, redirecting to login');
      router.push("/login");
      return;
    }

    // Fetch user info
    console.log('[Supplier Dashboard] Fetching user info...');
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        console.log('[Supplier Dashboard] Auth response status:', r.status);
        return r.json();
      })
      .then((d) => {
        console.log('[Supplier Dashboard] Auth response data:', d);
        if (d.success && d.data) {
          if (d.data.role !== "SUPPLIER") {
            // Redirect to appropriate dashboard
            console.log('[Supplier Dashboard] Not a supplier, redirecting to admin dashboard');
            router.push("/koperasi/dashboard");
            return Promise.reject('Not a supplier'); // Break chain
          }
          console.log('[Supplier Dashboard] User is supplier:', d.data);
          setUser(d.data);
          console.log('[Supplier Dashboard] User state SET, now user is:', d.data);
          
          // Fetch supplier profile
          console.log('[Supplier Dashboard] About to fetch supplier profile...');
          return fetch("/api/supplier/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          console.log('[Supplier Dashboard] Auth failed, redirecting to login');
          router.push("/login");
          return Promise.reject('Auth failed'); // Break chain
        }
      })
      .then((r) => {
        if (!r) {
          console.log('[Supplier Dashboard] No response from profile API');
          return null;
        }
        console.log('[Supplier Dashboard] Profile response status:', r.status);
        return r.json();
      })
      .then((d) => {
        if (!d) {
          console.log('[Supplier Dashboard] No profile data');
          return;
        }
        console.log('[Supplier Dashboard] Profile response data:', d);
        if (d?.success) {
          // API returns { profile: {...}, supplier: {...} }
          const profile = d.data?.profile || d.data;
          setSupplierProfile(profile);
          console.log('[Supplier Dashboard] Profile loaded:', profile);
        } else {
          console.log('[Supplier Dashboard] Profile fetch failed:', d?.error);
        }
      })
      .catch((error) => {
        if (error !== 'Not a supplier' && error !== 'Auth failed') {
          console.error('[Supplier Dashboard] Unexpected error:', error);
        }
        // Don't redirect on profile error, show registration prompt instead
      });

    // Fetch payment requests history
    if (token) {
      fetch('/api/supplier/payment-requests', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setPaymentRequests(d.data || []);
          }
        })
        .catch(console.error);
    }
  }, [router]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Format file tidak valid. Gunakan JPG, PNG, atau WEBP');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB');
      return;
    }

    setProofImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit payment request
  const handleSubmitPaymentRequest = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      alert('Masukkan jumlah pembayaran yang valid');
      return;
    }
    if (!proofImage) {
      alert('Upload bukti pembayaran terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      // Step 1: Upload image
      const formData = new FormData();
      formData.append('file', proofImage);

      const uploadRes = await fetch('/api/upload/payment-proof', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Upload gagal');
      }

      // Step 2: Submit payment request
      const requestRes = await fetch('/api/supplier/payment-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          period,
          proofImageUrl: uploadData.url,
          bankName: bankName || undefined,
          accountNumber: accountNumber || undefined,
          note: note || undefined,
        }),
      });

      const requestData = await requestRes.json();

      if (!requestRes.ok || !requestData.success) {
        throw new Error(requestData.error || 'Pengajuan gagal');
      }

      alert('✅ Permintaan pembayaran berhasil diajukan! Admin akan segera mereview.');
      
      // Reset form
      setAmount('');
      setPeriod('7days');
      setBankName('');
      setAccountNumber('');
      setNote('');
      setProofImage(null);
      setProofImagePreview(null);
      setShowPaymentRequestModal(false);

      // Refresh payment requests
      const refreshRes = await fetch('/api/supplier/payment-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshData = await refreshRes.json();
      if (refreshData.success) {
        setPaymentRequests(refreshData.data || []);
      }
    } catch (err: any) {
      console.error('Submit payment request error:', err);
      alert('❌ ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Menunggu Review</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Disetujui</span>;
      case 'PAID':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Lunas</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Ditolak</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  // Get period label
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return 'Hari Ini';
      case '7days': return '7 Hari';
      case '1month': return '1 Bulan';
      case 'custom': return 'Custom';
      default: return period;
    }
  };

  const pendingRequestsCount = paymentRequests.filter(r => r.status === 'PENDING').length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show registration prompt if no profile
  if (!supplierProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
            <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Lengkapi Profil Supplier Anda
            </h3>
            <p className="text-gray-600 mb-6">
              Untuk mulai menerima pesanan, silakan lengkapi profil supplier Anda terlebih dahulu.
            </p>
            <Button onClick={() => router.push("/koperasi/supplier/register")}>
              Daftar Sebagai Supplier
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending approval status
  if (supplierProfile.status === "PENDING") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
            <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Menunggu Persetujuan
            </h3>
            <p className="text-gray-600 mb-6">
              Pendaftaran Anda sedang ditinjau oleh admin. Kami akan menghubungi Anda segera setelah disetujui.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4 text-left">
              <p className="text-sm text-gray-600 mb-2">Informasi Pendaftaran:</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nama Bisnis:</span> {supplierProfile.businessName}</p>
                <p><span className="font-medium">Kategori:</span> {supplierProfile.productCategory}</p>
                <p><span className="font-medium">Status:</span> <span className="text-yellow-600">Menunggu Persetujuan</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600 mt-1">{supplierProfile.businessName}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          stats.paymentStatus === "active" 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {stats.paymentStatus === "active" ? "Payment Active" : "Payment Due"}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  Rp {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Fee</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">Rp 25,000</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Payment Due:</span>
                <span className="font-medium text-gray-900">
                  {supplierProfile.nextPaymentDue 
                    ? new Date(supplierProfile.nextPaymentDue).toLocaleDateString('id-ID')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Payment:</span>
                <span className="font-medium text-gray-900">
                  {supplierProfile.lastPaymentDate 
                    ? new Date(supplierProfile.lastPaymentDate).toLocaleDateString('id-ID')
                    : 'Belum ada pembayaran'}
                </span>
              </div>
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => router.push("/koperasi/supplier/payment")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/orders")}
              >
                <Package className="h-4 w-4 mr-2" />
                View Orders
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/products")}
              >
                <Package className="h-4 w-4 mr-2" />
                My Products
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/profile")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Request Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Receipt className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Permintaan Pembayaran Titipan</h3>
                <p className="text-sm text-gray-600">Ajukan permintaan pembayaran produk titipan</p>
              </div>
            </div>
            {pendingRequestsCount > 0 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                {pendingRequestsCount} Menunggu
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowPaymentRequestModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Ajukan Pembayaran
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRequestHistory(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Riwayat Pengajuan ({paymentRequests.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Request Modal */}
      {showPaymentRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Ajukan Permintaan Pembayaran</h2>
                  <p className="text-emerald-100 text-sm">Upload bukti transfer untuk produk titipan</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentRequestModal(false);
                  setProofImage(null);
                  setProofImagePreview(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Pembayaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {amount && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formatCurrency(parseFloat(amount))}
                  </p>
                )}
              </div>

              {/* Period Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periode <span className="text-red-500">*</span>
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="7days">7 Hari Terakhir</option>
                  <option value="1month">1 Bulan Terakhir</option>
                  <option value="today">Hari Ini</option>
                </select>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Bank (Opsional)
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BCA, Mandiri, BRI..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Rekening (Opsional)
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bukti Pembayaran <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {proofImagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={proofImagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setProofImage(null);
                          setProofImagePreview(null);
                        }}
                        className="mx-auto"
                      >
                        Ganti Gambar
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload screenshot atau foto bukti transfer
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Format: JPG, PNG, WEBP (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label htmlFor="proof-upload" className="cursor-pointer">
                        <Button variant="outline" type="button">
                          Pilih File
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentRequestModal(false);
                  setProofImage(null);
                  setProofImagePreview(null);
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitPaymentRequest}
                disabled={submitting || !amount || !proofImage}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request History Modal */}
      {showRequestHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Riwayat Pengajuan Pembayaran</h2>
                  <p className="text-blue-100 text-sm">{paymentRequests.length} Total Pengajuan</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestHistory(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {paymentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada pengajuan pembayaran</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(request.amount)}
                            </p>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <p>Periode: {getPeriodLabel(request.period)}</p>
                            <p>Diajukan: {new Date(request.requestedAt).toLocaleDateString('id-ID')}</p>
                            {request.bankName && (
                              <p>Bank: {request.bankName}</p>
                            )}
                            {request.accountNumber && (
                              <p>Rekening: {request.accountNumber}</p>
                            )}
                          </div>
                          {request.note && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Catatan: {request.note}
                            </p>
                          )}
                          {request.status === 'REJECTED' && request.rejectedReason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-800">
                                <strong>Alasan Ditolak:</strong> {request.rejectedReason}
                              </p>
                            </div>
                          )}
                          {request.status === 'PAID' && request.reviewedAt && (
                            <p className="text-sm text-green-600 mt-2">
                              ✓ Disetujui pada {new Date(request.reviewedAt).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                        {request.proofImageUrl && (
                          <a
                            href={request.proofImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Lihat Bukti
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
