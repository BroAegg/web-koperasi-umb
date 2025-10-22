'use client';

import { useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ReceiptItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    receiptId: string;
    totalAmount: number;
    paymentMethod: string;
    customerName: string;
    createdAt: string;
    items: ReceiptItem[];
  } | null;
}

export default function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrint = () => {
    window.print();
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen || !transaction) return null;

  return (
    <>
      {/* Overlay - Blur everything including sidebar */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 print:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto print:max-w-none print:w-auto print:shadow-none print:rounded-none pointer-events-auto">
          {/* Header - Hide on Print */}
          <div className="flex items-center justify-between p-4 border-b print:hidden sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-900">Receipt Detail</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Print Receipt"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div ref={printRef} className="p-6 print:p-8">
            {/* Header */}
            <div className="text-center mb-6 print:mb-8">
              <h1 className="text-2xl font-bold text-gray-900 print:text-3xl">KOPERASI UMB</h1>
              <p className="text-sm text-gray-600 mt-1">Universitas Muhammadiyah Bandung</p>
              <p className="text-xs text-gray-500 mt-1">Jl. Soekarno Hatta No. 752, Bandung</p>
              <p className="text-xs text-gray-500">Telp: (022) 7800525</p>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

            {/* Transaction Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Receipt:</span>
                <span className="font-mono font-semibold">#{transaction.receiptId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-medium">{formatDateTime(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{transaction.customerName}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

            {/* Items */}
            <div className="mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-700">Item</th>
                    <th className="text-center py-2 text-gray-700">Qty</th>
                    <th className="text-right py-2 text-gray-700">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 text-gray-900">{item.productName}</td>
                      <td className="py-2 text-center text-gray-900">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(transaction.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-gray-900">TOTAL:</span>
                <span className="text-gray-900">{formatCurrency(transaction.totalAmount)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

            {/* Payment Info */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Metode Pembayaran:</span>
                <span className="font-semibold text-gray-900">{transaction.paymentMethod}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2 text-sm text-gray-600">
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900">Terima kasih atas kunjungan Anda!</p>
                <p className="mt-1">Belanja lagi ya!</p>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs">Untuk komplain atau pertanyaan:</p>
                <p className="text-xs font-medium">koperasi@umb.ac.id</p>
                <p className="text-xs">WhatsApp: 0812-3456-7890</p>
              </div>
            </div>

            {/* Print Date - Only show when printed */}
            <div className="hidden print:block text-center mt-6 text-xs text-gray-500">
              <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
