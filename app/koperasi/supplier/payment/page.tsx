"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';

interface PaymentInfo {
  monthlyFee: number;
  paymentStatus: string;
  lastPaymentDate: string | null;
  nextPaymentDue: string | null;
  isPaymentActive: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  paymentProof: string;
  verificationStatus: string;
  note: string | null;
  createdAt: string;
  verifiedAt: string | null;
}

export default function SupplierPaymentPage() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchPaymentInfo();
    fetchPaymentHistory();
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      const res = await fetch('/api/supplier/payment-info');
      const data = await res.json();
      if (data.success) {
        setPaymentInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const res = await fetch('/api/supplier/payment-history');
      const data = await res.json();
      if (data.success) {
        setPaymentHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File terlalu besar! Maksimal 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPayment = async () => {
    if (!selectedFile) {
      alert('Pilih file bukti pembayaran terlebih dahulu');
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const res = await fetch('/api/supplier/upload-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentProof: base64,
            amount: paymentInfo?.monthlyFee || 25000,
          }),
        });

        const data = await res.json();
        if (data.success) {
          alert('Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.');
          setSelectedFile(null);
          setPreviewUrl('');
          fetchPaymentInfo();
          fetchPaymentHistory();
        } else {
          alert(data.error || 'Gagal upload bukti pembayaran');
        }
      };
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; label: string }> = {
      UNPAID: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Belum Bayar' },
      PAID_PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Menunggu Verifikasi' },
      PAID_APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Terverifikasi' },
      PAID_REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Ditolak' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      VERIFIED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Verified' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
    };
    const badge = badges[status] || badges.UNPAID;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const needsPayment = paymentInfo?.paymentStatus === 'UNPAID' || paymentInfo?.paymentStatus === 'PAID_REJECTED';
  const pendingVerification = paymentInfo?.paymentStatus === 'PAID_PENDING_APPROVAL';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pembayaran Supplier</h1>
        <p className="text-gray-600 mt-2">Kelola pembayaran fee bulanan Anda</p>
      </div>

      {/* Payment Info Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Fee Bulanan Supplier</h2>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-600">
                  Rp {paymentInfo?.monthlyFee.toLocaleString('id-ID')}
                </span>
                <span className="text-gray-600">/bulan</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Status:</span>
                  {paymentInfo && getStatusBadge(paymentInfo.paymentStatus)}
                </div>
                {paymentInfo?.lastPaymentDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Pembayaran Terakhir: {new Date(paymentInfo.lastPaymentDate).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}
                {paymentInfo?.nextPaymentDue && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Jatuh Tempo Berikutnya: {new Date(paymentInfo.nextPaymentDue).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Payment Section */}
      {needsPayment && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📢 Pembayaran Diperlukan</h3>
              <p className="text-sm text-gray-700">
                Untuk mengaktifkan akun supplier Anda, mohon lakukan pembayaran sebesar <strong>Rp 25.000</strong> dan upload bukti pembayaran.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Informasi Transfer:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">BCA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No. Rekening:</span>
                  <span className="font-medium">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Atas Nama:</span>
                  <span className="font-medium">Koperasi UMB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah:</span>
                  <span className="font-medium text-blue-600">Rp 25.000</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Bukti Pembayaran
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="payment-proof"
                />
                <label
                  htmlFor="payment-proof"
                  className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Klik untuk pilih gambar'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG maksimal 5MB</p>
                  </div>
                </label>
              </div>

              {previewUrl && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded border"
                  />
                </div>
              )}

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleUploadPayment}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Bukti Pembayaran
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Verification */}
      {pendingVerification && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Menunggu Verifikasi</h3>
                <p className="text-sm text-gray-700">
                  Bukti pembayaran Anda sedang dalam proses verifikasi oleh admin. 
                  Anda akan menerima notifikasi setelah pembayaran diverifikasi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Pembayaran</h3>
          
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>Belum ada riwayat pembayaran</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-900">
                          Rp {payment.amount.toLocaleString('id-ID')}
                        </span>
                        {getStatusBadge(payment.verificationStatus)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {payment.note && (
                        <p className="text-sm text-gray-600 italic">
                          Note: {payment.note}
                        </p>
                      )}
                      {payment.verifiedAt && (
                        <p className="text-xs text-gray-500">
                          Diverifikasi: {new Date(payment.verifiedAt).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                    <a
                      href={payment.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Bukti
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
