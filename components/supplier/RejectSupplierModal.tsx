import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  supplierName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting?: boolean;
}

export default function RejectSupplierModal({
  isOpen,
  supplierName,
  onClose,
  onSubmit,
  isSubmitting = false
}: RejectModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Mohon isi alasan penolakan');
      return;
    }
    onSubmit(reason);
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Tolak Supplier</h3>
              <p className="text-red-100 text-sm mt-1">Berikan alasan penolakan</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Anda akan menolak supplier: <span className="font-semibold text-gray-900">{supplierName}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Penolakan *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tuliskan alasan penolakan (minimal 10 karakter)..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              required
              minLength={10}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length} karakter
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={isSubmitting || !reason.trim() || reason.length < 10}
              className="flex-1"
            >
              {isSubmitting ? 'Menolak...' : 'Tolak Supplier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
