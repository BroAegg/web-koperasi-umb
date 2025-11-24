'use client';

import React from 'react';
import { Building2, Mail, Phone, MapPin, Package, CheckCircle, XCircle, Eye, DollarSign, AlertCircle, FileText, CheckSquare, Square, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SupplierCardProps {
  supplier: any;
  onApproveClick?: (supplier: any) => void;
  onViewPaymentProof?: (supplier: any) => void;
  onInputCashPayment?: (supplier: any) => void;
  onViewDetails?: (supplier: any) => void;
  onEvaluate?: (supplier: any) => void;
  isSelected?: boolean;
  onToggleSelect?: (supplierId: string) => void;
  showCheckbox?: boolean;
}

export default function SupplierCard({ 
  supplier,
  onApproveClick,
  onViewPaymentProof,
  onInputCashPayment,
  onViewDetails,
  onEvaluate,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
}: SupplierCardProps) {
  
  // Helper function untuk payment method badge
  const getPaymentMethodBadge = () => {
    if (!supplier.preferredPaymentMethod) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 font-medium">
          Not Set
        </Badge>
      );
    }

    if (supplier.preferredPaymentMethod === 'CASH') {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
          Cash
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
        Transfer
      </Badge>
    );
  };

  // Helper function untuk status badge
  const getStatusBadge = () => {
    const status = supplier.status;
    
    if (status === 'PENDING_REVIEW') {
      return (
        <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
          📝 Pending Review
        </Badge>
      );
    }
    if (status === 'APPROVED_PENDING_PAYMENT') {
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
          💳 Waiting Payment
        </Badge>
      );
    }
    if (status === 'PENDING') {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
          Pending Approval
        </Badge>
      );
    }
    if (status === 'APPROVED') {
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
          Approved
        </Badge>
      );
    }
    if (status === 'ACTIVE') {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
          Active
        </Badge>
      );
    }
    if (status === 'REJECTED') {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-base px-4 py-1">
        {status}
      </Badge>
    );
  };

  // Helper function untuk payment status badge
  const getPaymentStatusBadge = () => {
    const paymentStatus = supplier.paymentStatus;
    
    if (paymentStatus === 'UNPAID') {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 font-medium">
          Unpaid
        </Badge>
      );
    }
    if (paymentStatus === 'PAID_PENDING_APPROVAL') {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-300 font-medium">
          Pending Verification
        </Badge>
      );
    }
    if (paymentStatus === 'PAID_APPROVED' || paymentStatus === 'VERIFIED') {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-300 font-medium">
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        {paymentStatus}
      </Badge>
    );
  };

  // Border color based on status
  const getBorderColor = () => {
    if (supplier.status === 'PENDING') return 'border-l-yellow-500';
    if (supplier.status === 'APPROVED') return 'border-l-blue-500';
    if (supplier.status === 'ACTIVE') return 'border-l-green-500';
    if (supplier.status === 'REJECTED') return 'border-l-red-500';
    return 'border-l-gray-300';
  };

  // Check if has pending payment proof
  const hasPendingPaymentProof = supplier.supplier_payments?.some(
    (p: any) => p.status === 'PENDING' && p.paymentProof
  );
  
  // Get the latest payment with proof
  const latestPaymentWithProof = supplier.supplier_payments?.find(
    (p: any) => p.paymentProof
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        
        {/* LEFT COLUMN: Supplier Info (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* ✅ Checkbox */}
            {showCheckbox && onToggleSelect && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(supplier.id);
                }}
                className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
              >
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            )}
            
            {/* Avatar/Logo */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            
            {/* Business Name & Code */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {supplier.businessName}
              </h3>
              <p className="text-sm text-gray-500">
                {supplier.code}
              </p>
              {supplier.productCategory && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    {supplier.productCategory}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{supplier.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{supplier.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{supplier.address}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">Pemilik</p>
            <p className="font-semibold text-gray-900">{supplier.ownerName}</p>
          </div>
        </div>

        {/* CENTER COLUMN: Status Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-3">
            {/* Main Status */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Status Supplier</p>
              {getStatusBadge()}
            </div>

            {/* Payment Status */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Status Pembayaran</p>
              {getPaymentStatusBadge()}
            </div>

            {/* Payment Method */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
              {getPaymentMethodBadge()}
            </div>

            {/* Monthly Fee */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Biaya Bulanan</p>
              <p className="text-lg font-bold text-green-600">
                Rp {Number(supplier.monthlyFee || 25000).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Contextual Hints */}
          {supplier.status === 'APPROVED' && supplier.paymentStatus === 'UNPAID' && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Waiting for activation payment
              </p>
            </div>
          )}

          {supplier.status === 'REJECTED' && supplier.rejectedReason && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 p-3 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-800">Alasan Ditolak:</p>
                <p className="text-xs text-red-700 mt-1">{supplier.rejectedReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Action Buttons (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          
          {/* PENDING_REVIEW - Show Evaluate Button */}
          {supplier.status === 'PENDING_REVIEW' && onEvaluate && (
            <>
              {/* Sample Products Info */}
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Sample Products: {supplier.sample_products?.length || 0}
                  </span>
                </div>
                {supplier.productAverageScore && (
                  <div className="text-xs text-purple-600">
                    Avg Score: {supplier.productAverageScore}/5.0
                  </div>
                )}
              </div>

              <Button
                onClick={() => onEvaluate(supplier)}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Review & Evaluate
              </Button>
            </>
          )}
          
          {/* PENDING STATUS - Show Approve Button */}
          {supplier.status === 'PENDING' && onApproveClick && (
            <>
              <Button
                onClick={() => onApproveClick(supplier)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve
              </Button>
            </>
          )}

          {/* APPROVED + CASH - Show Input Cash Payment */}
          {supplier.status === 'APPROVED' && 
           supplier.paymentStatus === 'UNPAID' && 
           supplier.preferredPaymentMethod === 'CASH' && 
           onInputCashPayment && (
            <Button
              onClick={() => onInputCashPayment(supplier)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Input Cash Payment
            </Button>
          )}

          {/* APPROVED + TRANSFER - Show Waiting Message */}
          {supplier.status === 'APPROVED' && 
           supplier.paymentStatus === 'UNPAID' && 
           supplier.preferredPaymentMethod === 'TRANSFER' && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Menunggu supplier upload bukti transfer
              </p>
            </div>
          )}

          {/* PAID_PENDING - Show View Payment Proof */}
          {supplier.paymentStatus === 'PAID_PENDING_APPROVAL' && hasPendingPaymentProof && onViewPaymentProof && latestPaymentWithProof && (
            <Button
              onClick={() => onViewPaymentProof(supplier)}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Payment Proof
            </Button>
          )}

          {/* ACTIVE - Show View Details */}
          {supplier.status === 'ACTIVE' && onViewDetails && (
            <>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">
                  Active Supplier
                </p>
              </div>
              <Button
                onClick={() => onViewDetails(supplier)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Lihat Detail
              </Button>
            </>
          )}

          {/* REJECTED - Show Reason */}
          {supplier.status === 'REJECTED' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-300 p-3 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-semibold text-red-800">
                Ditolak
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
