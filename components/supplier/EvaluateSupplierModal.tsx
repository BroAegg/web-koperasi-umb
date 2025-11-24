'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle, XCircle, Loader2, Package, DollarSign, Box } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface SampleProduct {
  id: string;
  productName: string;
  productCategory: string;
  price: number;
  description: string;
  images: string[];
}

interface Supplier {
  id: string;
  code: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  productCategory: string;
  preferredPaymentMethod: string;
  sample_products?: SampleProduct[];
}

interface EvaluateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
  onSuccess: () => void;
}

export function EvaluateSupplierModal({
  isOpen,
  onClose,
  supplier,
  onSuccess
}: EvaluateSupplierModalProps) {
  const [qualityScore, setQualityScore] = useState(0);
  const [priceScore, setPriceScore] = useState(0);
  const [packagingScore, setPackagingScore] = useState(0);
  const [notes, setNotes] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const averageScore = (qualityScore + priceScore + packagingScore) / 3;
  const canApprove = averageScore >= 3.5;
  const isConditional = averageScore >= 3.0 && averageScore < 3.5;

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-700">
          {value > 0 ? `${value}/5` : '-'}
        </span>
      </div>
    </div>
  );

  const handleEvaluate = async () => {
    if (!qualityScore || !priceScore || !packagingScore) {
      toast.error('Semua kriteria harus diberi score!');
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplier.id}/evaluate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productQualityScore: qualityScore,
          productPriceScore: priceScore,
          productPackagingScore: packagingScore,
          evaluationNotes: notes
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Evaluasi berhasil disimpan!');
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to evaluate');
      }
    } catch (error) {
      console.error('Evaluate error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan evaluasi');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleApprove = async () => {
    if (!qualityScore || !priceScore || !packagingScore) {
      toast.error('Harap evaluasi terlebih dahulu!');
      return;
    }

    if (!confirm(`Approve supplier ${supplier.businessName}?\n\nSupplier akan diminta membayar activation fee.`)) {
      return;
    }

    setIsApproving(true);
    try {
      // Save evaluation first
      await handleEvaluate();

      // Then approve
      const res = await fetch(`/api/admin/suppliers/${supplier.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'APPROVE',
          notes: notes
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`✅ Supplier ${supplier.businessName} disetujui!`);
        onClose();
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal approve supplier');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!notes) {
      toast.error('Harap isi alasan penolakan!');
      return;
    }

    if (!confirm(`Reject supplier ${supplier.businessName}?\n\nAlasan: ${notes}`)) {
      return;
    }

    setIsRejecting(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplier.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'REJECT',
          notes: notes
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Supplier ${supplier.businessName} ditolak`);
        onClose();
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal reject supplier');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>Review & Evaluate Supplier</ModalTitle>
        </ModalHeader>

        <div className="space-y-6 p-6">
          {/* Supplier Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg text-gray-900">{supplier.businessName}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-600">Code:</span> <span className="font-medium">{supplier.code}</span></div>
              <div><span className="text-gray-600">Owner:</span> <span className="font-medium">{supplier.ownerName}</span></div>
              <div><span className="text-gray-600">Email:</span> <span className="font-medium">{supplier.email}</span></div>
              <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{supplier.phone}</span></div>
              <div className="col-span-2"><span className="text-gray-600">Address:</span> <span className="font-medium">{supplier.address}</span></div>
              <div><span className="text-gray-600">Category:</span> <span className="font-medium">{supplier.productCategory}</span></div>
              <div><span className="text-gray-600">Payment:</span> <span className="font-medium">{supplier.preferredPaymentMethod}</span></div>
            </div>
          </div>

          {/* Sample Products */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Sample Products ({supplier.sample_products?.length || 0})
            </h3>
            
            {supplier.sample_products && supplier.sample_products.length > 0 ? (
              <div className="space-y-4">
                {supplier.sample_products.map((product, idx) => (
                  <div key={product.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex gap-4">
                      {/* Product Images */}
                      <div className="flex gap-2 flex-shrink-0">
                        {product.images.slice(0, 3).map((img, imgIdx) => (
                          <div key={imgIdx} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        ))}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{idx + 1}. {product.productName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-600">Category: <span className="font-medium">{product.productCategory}</span></span>
                          <span className="text-gray-600">Price: <span className="font-medium text-green-600">Rp {product.price.toLocaleString()}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No sample products submitted</p>
              </div>
            )}
          </div>

          {/* Evaluation Form */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Product Evaluation</h3>
            
            <div className="space-y-6">
              <StarRating
                value={qualityScore}
                onChange={setQualityScore}
                label="🎯 Product Quality (Kualitas Produk)"
              />
              
              <StarRating
                value={priceScore}
                onChange={setPriceScore}
                label="💰 Price Competitiveness (Harga Kompetitif)"
              />
              
              <StarRating
                value={packagingScore}
                onChange={setPackagingScore}
                label="📦 Packaging (Kemasan)"
              />

              {/* Average Score */}
              {qualityScore > 0 && priceScore > 0 && packagingScore > 0 && (
                <div className={`p-4 rounded-lg ${
                  canApprove ? 'bg-green-50 border border-green-200' :
                  isConditional ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Average Score:</span>
                    <span className={`text-2xl font-bold ${
                      canApprove ? 'text-green-600' :
                      isConditional ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {averageScore.toFixed(2)}/5.0
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${
                    canApprove ? 'text-green-700' :
                    isConditional ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {canApprove ? '✅ PASS - Produk lolos evaluasi' :
                     isConditional ? '⚠️ CONDITIONAL - Lolos dengan catatan' :
                     '❌ FAIL - Produk tidak lolos (< 3.0)'}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Catatan Evaluasi {!canApprove && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={canApprove ? 
                    "Catatan tambahan (opsional)..." : 
                    "Alasan penolakan atau catatan untuk perbaikan (wajib)..."
                  }
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isEvaluating || isApproving || isRejecting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleEvaluate}
              variant="secondary"
              disabled={!qualityScore || !priceScore || !packagingScore || isEvaluating || isApproving || isRejecting}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Save Evaluation'
              )}
            </Button>

            <Button
              onClick={handleReject}
              variant="danger"
              disabled={!notes || isEvaluating || isApproving || isRejecting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </Button>

            <Button
              onClick={handleApprove}
              variant="primary"
              disabled={!canApprove || !qualityScore || !priceScore || !packagingScore || isEvaluating || isApproving || isRejecting}
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Supplier
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
