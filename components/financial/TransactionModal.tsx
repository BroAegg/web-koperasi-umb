// Transaction Modal Component
// Add/Edit form for manual transactions (INCOME and EXPENSE only)

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { X, Plus, Edit, FileText, Tag, Hash, Calendar } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils';
import type { NewTransaction } from '@/types/financial';

interface TransactionModalProps {
  isOpen: boolean;
  transaction?: { type: string; amount: number; description: string; category: string; paymentMethod: string; reference?: string; date: string } | null;
  onClose: () => void;
  onSubmit: (data: NewTransaction) => Promise<void>;
  isSubmitting: boolean;
}

export function TransactionModal({
  isOpen,
  transaction,
  onClose,
  onSubmit,
  isSubmitting
}: TransactionModalProps) {
  const [formData, setFormData] = useState<NewTransaction>({
    type: 'INCOME',
    amount: '',
    description: '',
    category: '',
    paymentMethod: 'CASH',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [formattedAmount, setFormattedAmount] = useState('');

  // Initialize form when modal opens or transaction changes
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        // Edit mode: pre-fill with transaction data
        setFormData({
          type: transaction.type,
          amount: transaction.amount.toString(),
          description: transaction.description || '',
          category: transaction.category || '',
          paymentMethod: transaction.paymentMethod,
          reference: transaction.reference || '',
          date: new Date(transaction.date).toISOString().split('T')[0],
        });
      } else {
        // Add mode: reset to empty form with defaults
        setFormData({
          type: 'INCOME',
          amount: '',
          description: '',
          category: '',
          paymentMethod: 'CASH',
          reference: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
      setFormattedAmount(''); // Clear formatted amount display
    }
  }, [isOpen, transaction]);

  // Format amount display
  useEffect(() => {
    if (formData.amount) {
      setFormattedAmount(formatCurrencyInput(formData.amount));
    } else {
      setFormattedAmount('');
    }
  }, [formData.amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCurrencyInput(value);
    const numericValue = parseCurrencyInput(value);
    
    setFormattedAmount(formatted);
    setFormData(prev => ({ ...prev, amount: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      type: 'INCOME',
      amount: '',
      description: '',
      category: '',
      paymentMethod: 'CASH',
      reference: '',
      date: new Date().toISOString().split('T')[0],
    });
    setFormattedAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">
                {transaction ? 'Update Pemasukan/Pengeluaran' : 'Catat Pemasukan/Pengeluaran'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {transaction 
                  ? 'Perbarui data pemasukan atau pengeluaran' 
                  : 'Catat pemasukan lain (bunga, denda) atau pengeluaran (gaji, listrik, ATK)'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Message */}
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Info:</strong> Transaksi <strong>Penjualan & Pembelian</strong> tercatat otomatis dari halaman Inventory. 
                Di sini Anda hanya bisa mencatat <strong>Pemasukan Lain</strong> (bunga, denda, biaya admin) dan <strong>Pengeluaran</strong> (gaji, listrik, ATK).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Transaksi *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="INCOME">Pemasukan Lain</option>
                  <option value="EXPENSE">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah *
                </label>
                <Input
                  type="text"
                  value={formattedAmount}
                  onChange={handleAmountChange}
                  placeholder="Masukkan nominal"
                  leftIcon={<span className="text-sm font-medium text-gray-500">Rp</span>}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi *
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi transaksi"
                leftIcon={<FileText className="w-4 h-4 text-gray-400" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-gray-500 font-normal">(Opsional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Contoh: Alat Tulis, Makanan, ATK..."
                  leftIcon={<Tag className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CASH">Tunai</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="CREDIT">Kredit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referensi <span className="text-gray-500 font-normal">(Opsional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="No. invoice, struk, kode transaksi..."
                  leftIcon={<Hash className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loading className="w-4 h-4 mr-2" />
                    {transaction ? 'Mengupdate...' : 'Menyimpan...'}
                  </>
                ) : (
                  <>
                    {transaction ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Transaksi
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Simpan Transaksi
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
