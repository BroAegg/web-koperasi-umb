
import React from 'react';

// Temporary minimal component for build fix
interface SupplierCardProps {
  supplier: any;
  onApprove?: (supplierId: string) => Promise<void>;
  onReject?: (supplierId: string) => void;
  onVerifyPayment?: (supplierId: string, approve: boolean) => Promise<void>;
  onView?: (supplier: any) => void;
  actionLoading?: boolean;
}

export default function SupplierCard({ 
  supplier, 
  onApprove, 
  onReject, 
  onVerifyPayment, 
  onView,
  actionLoading 
}: SupplierCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-semibold">{supplier?.businessName || 'Supplier'}</h3>
      <p className="text-sm text-gray-600">{supplier?.ownerName}</p>
      <p className="text-sm text-gray-500">Status: {supplier?.status}</p>
      <div className="mt-2 space-x-2">
        {onApprove && (
          <button 
            onClick={() => onApprove(supplier.id)}
            disabled={actionLoading}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Approve
          </button>
        )}
        {onReject && (
          <button 
            onClick={() => onReject(supplier.id)}
            disabled={actionLoading}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Reject
          </button>
        )}
        {onView && (
          <button 
            onClick={() => onView(supplier)}
            disabled={actionLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
}
