'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Building2, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApproveSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: {
    id: string;
    code: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    productCategory?: string | null;
    preferredPaymentMethod: string;
    monthlyFee: number;
  };
  onSuccess: () => void;
}

export function ApproveSupplierModal({
  isOpen,
  onClose,
  supplier,
  onSuccess
}: ApproveSupplierModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    if (!confirm(`Yakin approve supplier "${supplier.businessName}"?`)) return;

    setIsApproving(true);
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}/approve`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Supplier berhasil diapprove! Supplier akan diminta untuk bayar.');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Gagal approve supplier');
      }
    } catch (error) {
      console.error('Error approving supplier:', error);
      toast.error('Terjadi kesalahan saat approve supplier');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }

    if (!confirm(`Yakin tolak supplier "${supplier.businessName}"?`)) return;

    setIsRejecting(true);
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: rejectReason.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Supplier ditolak.');
        onSuccess();
        onClose();
        setShowRejectForm(false);
        setRejectReason('');
      } else {
        toast.error(data.error || 'Gagal tolak supplier');
      }
    } catch (error) {
      console.error('Error rejecting supplier:', error);
      toast.error('Terjadi kesalahan saat tolak supplier');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle className="text-xl font-bold">
            {showRejectForm ? 'Tolak Pendaftaran Supplier' : 'Approve Pendaftaran Supplier'}
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-4">
          {/* Supplier Details */}
          <div className="bg-blue-50 p-6 rounded-lg space-y-4 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {supplier.businessName}
                </h3>
                <p className="text-sm text-gray-600">
                  Kode: {supplier.code}
                </p>
                {supplier.productCategory && (
                  <p className="text-sm text-gray-600 mt-1">
                    Kategori: {supplier.productCategory}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-blue-200">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Pemilik</p>
                  <p className="text-sm font-semibold">{supplier.ownerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-semibold">{supplier.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Telepon</p>
                  <p className="text-sm font-semibold">{supplier.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Alamat</p>
                  <p className="text-sm font-semibold">{supplier.address}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Metode Pembayaran</p>
                  <p className="text-sm font-bold text-blue-600">
                    {supplier.preferredPaymentMethod === 'CASH' ? 'CASH' : 'TRANSFER'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Biaya Bulanan</p>
                  <p className="text-lg font-bold text-green-600">
                    Rp {supplier.monthlyFee.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          {!showRejectForm && (
            <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Setelah supplier diapprove, supplier akan diminta untuk melakukan pembayaran biaya aktivasi sebesar{' '}
                <strong>Rp {supplier.monthlyFee.toLocaleString('id-ID')}</strong>.
                {supplier.preferredPaymentMethod === 'CASH' 
                  ? ' Admin bisa input pembayaran cash langsung dari halaman ini.'
                  : ' Supplier akan upload bukti transfer dan admin harus verifikasi.'}
              </p>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="border border-red-300 bg-red-50 p-4 rounded-lg space-y-3">
              <p className="font-semibold text-red-700">
                Alasan Penolakan:
              </p>
              <Textarea
                placeholder="Contoh: Data tidak lengkap, kategori usaha tidak sesuai, dll."
                value={rejectReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {showRejectForm ? (
              <>
                <Button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectReason.trim()}
                  variant="danger"
                  className="flex-1"
                  size="lg"
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Menolak...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      Konfirmasi Tolak
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  variant="outline"
                  size="lg"
                  disabled={isRejecting}
                >
                  Batal
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Supplier
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  variant="danger"
                  size="lg"
                  disabled={isApproving}
                  className="flex-1"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Tolak
                </Button>
              </>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
