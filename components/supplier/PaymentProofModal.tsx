'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, ZoomIn, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: {
    id: string;
    amount: number;
    paymentProof: string;
    paymentDate: Date;
  };
  supplier: {
    id: string;
    code: string;
    businessName: string;
    ownerName: string;
  };
  onSuccess: () => void;
}

export function PaymentProofModal({
  isOpen,
  onClose,
  payment,
  supplier,
  onSuccess
}: PaymentProofModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  const handleVerify = async () => {
    if (!confirm('Yakin verifikasi pembayaran ini?')) return;

    setIsVerifying(true);
    try {
      const res = await fetch('/api/admin/payments/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          action: 'VERIFY',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Pembayaran berhasil diverifikasi! Supplier sekarang ACTIVE.');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Gagal verifikasi pembayaran');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Terjadi kesalahan saat verifikasi pembayaran');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }

    if (!confirm('Yakin tolak pembayaran ini?')) return;

    setIsRejecting(true);
    try {
      const res = await fetch('/api/admin/payments/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          action: 'REJECT',
          note: rejectReason.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Pembayaran ditolak. Supplier akan diminta upload bukti baru.');
        onSuccess();
        onClose();
        setShowRejectForm(false);
        setRejectReason('');
      } else {
        toast.error(data.error || 'Gagal tolak pembayaran');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Terjadi kesalahan saat tolak pembayaran');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="text-xl font-bold">
            Bukti Pembayaran - {supplier.businessName}
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-4">
          {/* Supplier Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Kode Supplier</p>
                <p className="font-semibold">{supplier.code}</p>
              </div>
              <div>
                <p className="text-gray-500">Nama Usaha</p>
                <p className="font-semibold">{supplier.businessName}</p>
              </div>
              <div>
                <p className="text-gray-500">Pemilik</p>
                <p className="font-semibold">{supplier.ownerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Jumlah Bayar</p>
                <p className="font-semibold text-green-600">
                  Rp {payment.amount.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal Upload</p>
                <p className="font-semibold">
                  {new Date(payment.paymentDate).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Proof Image */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Bukti Transfer:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                {isZoomed ? 'Zoom Out' : 'Zoom In'}
              </Button>
            </div>
            
            <div className={`relative ${isZoomed ? 'h-auto' : 'h-96'} border rounded-lg overflow-hidden bg-gray-100`}>
              <Image
                src={payment.paymentProof}
                alt="Bukti Pembayaran"
                fill={!isZoomed}
                width={isZoomed ? 1000 : undefined}
                height={isZoomed ? 1000 : undefined}
                className={`object-contain ${isZoomed ? 'w-full h-auto' : ''}`}
                unoptimized
              />
            </div>
          </div>

          {/* Reject Form */}
          {showRejectForm && (
            <div className="border border-red-300 bg-red-50 p-4 rounded-lg space-y-3">
              <p className="font-semibold text-red-700">
                Alasan Penolakan:
              </p>
              <Textarea
                placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai, dll."
                value={rejectReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectReason.trim()}
                  variant="danger"
                  className="flex-1"
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menolak...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
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
                  disabled={isRejecting}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showRejectForm && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verifikasi & Aktifkan Supplier
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowRejectForm(true)}
                variant="danger"
                size="lg"
                disabled={isVerifying}
                className="flex-1"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Tolak Pembayaran
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
