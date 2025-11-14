"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, InfoBanner } from "@/components/ui/tooltip";
import { OnboardingModal } from "@/components/supplier/OnboardingModal";
import { Package, CreditCard, CheckCircle, Clock, AlertCircle, Upload, Receipt, X, Eye, XCircle, Building, Info } from "lucide-react";

export default function SupplierDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
  
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if onboarding should be shown
    const hasSeenOnboarding = localStorage.getItem('supplier_onboarding_completed');
    if (!hasSeenOnboarding && supplierProfile?.status === 'ACTIVE') {
      setShowOnboarding(true);
    }
  }, [supplierProfile]);

  useEffect(() => {
    console.log('[Supplier Dashboard] Component mounted');
    console.log('[Supplier Dashboard] Session status:', status);
    console.log('[Supplier Dashboard] Session:', session);
    
    if (status === 'loading') {
      console.log('[Supplier Dashboard] Session loading...');
      return;
    }

    if (status === 'unauthenticated') {
      console.log('[Supplier Dashboard] Not authenticated, redirecting to login');
      router.push("/login");
      return;
    }

    if (!session?.user) {
      console.log('[Supplier Dashboard] No session user');
      return;
    }

    const currentUser = session.user;
    console.log('[Supplier Dashboard] Current user:', currentUser);

    // Check if user is supplier
    if (currentUser.role !== "SUPPLIER" && currentUser.role !== "DEVELOPER") {
      console.log('[Supplier Dashboard] Not a supplier, redirecting to admin dashboard');
      router.push("/koperasi/dashboard");
      return;
    }

    setUser(currentUser);

    // Fetch supplier profile using NextAuth token
    console.log('[Supplier Dashboard] Fetching supplier profile...');
    fetch("/api/supplier/profile")
      .then((r) => {
        console.log('[Supplier Dashboard] Profile response status:', r.status);
        return r.json();
      })
      .then((d) => {
        console.log('[Supplier Dashboard] Profile response data:', d);
        if (d?.success) {
          const profile = d.data?.profile || d.data;
          setSupplierProfile(profile);
          console.log('[Supplier Dashboard] Profile loaded:', profile);
        } else {
          console.log('[Supplier Dashboard] Profile fetch failed:', d?.error);
        }
      })
      .catch((error) => {
        console.error('[Supplier Dashboard] Unexpected error:', error);
      });

    // Fetch payment requests history
    fetch('/api/supplier/payment-requests')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPaymentRequests(d.data || []);
        }
      })
      .catch(console.error);
  }, [session, status, router]);

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
    // This is for monthly payment submission (for ACTIVE but UNPAID status)
    if (!proofImage) {
      alert('Upload bukti pembayaran terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Upload image
      const formData = new FormData();
      formData.append('file', proofImage);

      const uploadRes = await fetch('/api/upload/payment-proof', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Upload gagal');
      }

      // Step 2: Submit monthly payment confirmation
      const paymentRes = await fetch('/api/supplier/monthly-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proofImageUrl: uploadData.url,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok || !paymentData.success) {
        throw new Error(paymentData.error || 'Konfirmasi pembayaran gagal');
      }

      alert('✅ Bukti pembayaran berhasil dikirim! Admin akan memverifikasi dalam 1x24 jam.');
      
      // Reset form
      setProofImage(null);
      setProofImagePreview(null);

      // Refresh supplier profile
      const refreshRes = await fetch('/api/supplier/profile');
      const refreshData = await refreshRes.json();
      if (refreshData.success) {
        setSupplierProfile(refreshData.data);
      }
    } catch (err: any) {
      console.error('Submit monthly payment error:', err);
      alert('❌ ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Legacy function for consignment payment requests (kept for compatibility)
  const handleSubmitConsignmentPaymentRequest = async () => {
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

      // Step 1: Upload image
      const formData = new FormData();
      formData.append('file', proofImage);

      const uploadRes = await fetch('/api/upload/payment-proof', {
        method: 'POST',
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
      const refreshRes = await fetch('/api/supplier/payment-requests');
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

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !user) {
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Penitip</h1>
            <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
          </div>
        </div>

        <InfoBanner
          type="info"
          title="🎉 Selamat Bergabung!"
          message="Lengkapi profil Anda untuk mulai berjualan di BSM Mart. Proses pendaftaran hanya membutuhkan beberapa menit."
        />

        <Card>
          <CardContent className="p-6 md:p-8 text-center">
            <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Lengkapi Profil Penitip Anda
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Untuk mulai menerima pesanan, silakan lengkapi profil penitip Anda terlebih dahulu.
            </p>
            <Button onClick={() => router.push("/koperasi/supplier/register")} className="w-full md:w-auto">
              Daftar Sebagai Penitip
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending approval status (waiting for admin review)
  if (supplierProfile.status === "PENDING") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Penitip</h1>
            <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ⏳ Menunggu Persetujuan Admin
            </h3>
            <p className="text-gray-600 mb-6">
              Pendaftaran Anda sedang ditinjau oleh admin koperasi. Kami akan menghubungi Anda segera setelah disetujui.
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mt-4 text-left">
              <p className="text-sm font-semibold text-gray-900 mb-3">Informasi Pendaftaran:</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span><span className="font-medium">Nama Bisnis:</span> {supplierProfile.businessName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span><span className="font-medium">Kategori:</span> {supplierProfile.productCategory || 'Tidak disebutkan'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span><span className="font-medium">Status:</span> <span className="text-yellow-600 font-semibold">Menunggu Persetujuan</span></span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Butuh bantuan? Hubungi admin@koperasi-umb.com
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show approved status - waiting for payment (APPROVED but not ACTIVE)
  if (supplierProfile.status === "APPROVED") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Penitip</h1>
            <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
          </div>
        </div>

        <Card className="border-2 border-green-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Selamat! Akun Anda Disetujui
              </h3>
              <p className="text-gray-600">
                Lakukan pembayaran biaya aktivasi untuk mengaktifkan akun supplier Anda
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-6 text-center">
              <p className="text-blue-100 text-sm mb-2">Biaya Aktivasi Bulanan</p>
              <p className="text-5xl font-bold mb-2">Rp 25.000</p>
              <p className="text-blue-100 text-sm">per bulan</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">📋 Informasi Pembayaran:</p>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Bank BRI:</strong> 1234-5678-9012-3456</p>
                <p><strong>Atas Nama:</strong> Koperasi UMB</p>
                <p><strong>Jumlah:</strong> Rp 25.000</p>
              </div>
            </div>

            <Button
              onClick={() => router.push('/koperasi/supplier/payment')}
              className="w-full py-6 text-lg font-semibold"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Bukti Pembayaran
            </Button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Setelah pembayaran diverifikasi, Anda dapat langsung mengakses dashboard dan mengelola produk.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show payment required status (ACTIVE but UNPAID)
  if (supplierProfile.status === "ACTIVE" && supplierProfile.paymentStatus !== "PAID") {
    const monthlyFee = supplierProfile.monthlyFee ? parseFloat(supplierProfile.monthlyFee.toString()) : 50000;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Penitip</h1>
            <p className="text-gray-600 mt-1">Selamat datang, {user.name}</p>
          </div>
        </div>

        <Card className="border-2 border-blue-200">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Selamat! Akun Disetujui
              </h3>
              <p className="text-gray-600">
                Silakan lakukan pembayaran untuk mengaktifkan layanan
              </p>
            </div>

            {/* Monthly Fee Display */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8 text-center">
              <p className="text-blue-100 text-sm mb-2">Biaya Bulanan</p>
              <p className="text-5xl font-bold mb-2">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(monthlyFee)}
              </p>
              <p className="text-blue-100 text-sm">
                Pembayaran bulanan untuk layanan koperasi
              </p>
            </div>

            {/* Bank Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Informasi Rekening Koperasi
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Bank</span>
                  <span className="font-semibold">BCA</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">No. Rekening</span>
                  <span className="font-semibold font-mono">1234567890</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Atas Nama</span>
                  <span className="font-semibold">Koperasi UM Bandung</span>
                </div>
              </div>
            </div>

            {/* Upload Payment Proof */}
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">
                Upload Bukti Transfer
              </h4>
              
              {proofImagePreview ? (
                <div className="relative">
                  <img 
                    src={proofImagePreview} 
                    alt="Preview" 
                    className="max-w-full max-h-64 mx-auto rounded-lg border-2 border-blue-200"
                  />
                  <button
                    onClick={() => {
                      setProofImage(null);
                      setProofImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                  <Upload className="w-12 h-12 text-blue-400 mb-3" />
                  <span className="text-sm text-gray-600 mb-2">
                    Klik untuk upload bukti transfer
                  </span>
                  <span className="text-xs text-gray-400">
                    Format: JPG, PNG, WEBP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitPaymentRequest}
              disabled={!proofImage || submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Mengirim...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Kirim Bukti Pembayaran
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Admin akan memverifikasi pembayaran Anda dalam 1x24 jam
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Penitip</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">{supplierProfile.businessName}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            stats.paymentStatus === "active" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {stats.paymentStatus === "active" ? "Pembayaran Aktif" : "Pembayaran Jatuh Tempo"}
          </div>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                  <Tooltip content="Jumlah total pesanan produk Anda yang terjual" position="top" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pesanan Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                  <Tooltip content="Pendapatan bersih 90% dari penjualan produk Anda" position="top" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-2 truncate">
                  Rp {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">Biaya Bulanan</p>
                  <Tooltip content="Biaya administrasi dan maintenance sistem per bulan" position="top" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-2">Rp 25,000</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pembayaran</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pembayaran Berikutnya:</span>
                <span className="font-medium text-gray-900">
                  {supplierProfile.nextPaymentDue 
                    ? new Date(supplierProfile.nextPaymentDue).toLocaleDateString('id-ID')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pembayaran Terakhir:</span>
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
              Bayar Sekarang
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/orders")}
              >
                <Package className="h-4 w-4 mr-2" />
                Lihat Pesanan
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/products")}
              >
                <Package className="h-4 w-4 mr-2" />
                Produk Saya
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/koperasi/supplier/profile")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Ubah Profil
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
    </>
  );
}
