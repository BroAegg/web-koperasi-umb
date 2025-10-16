import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category, OwnershipFilter, StockCycleFilter } from '@/types/inventory';

interface FilterModalProps {
  isOpen: boolean;
  categories: Category[];
  selectedCategory: string;
  selectedOwnership: OwnershipFilter;
  selectedCycle: StockCycleFilter;
  onCategoryChange: (category: string) => void;
  onOwnershipChange: (ownership: OwnershipFilter) => void;
  onCycleChange: (cycle: StockCycleFilter) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function FilterModal({
  isOpen,
  categories,
  selectedCategory,
  selectedOwnership,
  selectedCycle,
  onCategoryChange,
  onOwnershipChange,
  onCycleChange,
  onReset,
  onClose
}: FilterModalProps) {
  if (!isOpen) return null;

  // Generate category options
  const categoryOptions = ['semua', ...categories.map(c => c.name)];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Filter Produk</h3>
              <p className="text-blue-100 text-sm mt-1">Atur filter untuk pencarian produk</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Produk
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "semua" ? "Semua Kategori" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Ownership Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kepemilikan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onOwnershipChange('semua')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedOwnership === 'semua'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => onOwnershipChange('TOKO')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedOwnership === 'TOKO'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                Toko
              </button>
              <button
                type="button"
                onClick={() => onOwnershipChange('TITIPAN')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedOwnership === 'TITIPAN'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                Titipan
              </button>
            </div>
          </div>

          {/* Stock Cycle Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Siklus Stok
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onCycleChange('semua')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCycle === 'semua'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => onCycleChange('HARIAN')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCycle === 'HARIAN'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                }`}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => onCycleChange('MINGGUAN')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCycle === 'MINGGUAN'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                }`}
              >
                Mingguan
              </button>
              <button
                type="button"
                onClick={() => onCycleChange('DUA_MINGGUAN')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCycle === 'DUA_MINGGUAN'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                Dua Mingguan
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="flex-1"
            >
              Reset Filter
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex-1"
            >
              Terapkan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
