// Product Filters Component

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, BarChart3, X } from 'lucide-react';
import { Category, OwnershipFilter, StockCycleFilter } from '@/types/inventory';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  hideOutOfStock: boolean;
  onToggleOutOfStock: () => void;
  selectedCategory: string;
  selectedOwnership: OwnershipFilter;
  selectedCycle: StockCycleFilter;
  onCategoryChange: (category: string) => void;
  onOwnershipChange: (ownership: OwnershipFilter) => void;
  onCycleChange: (cycle: StockCycleFilter) => void;
  onShowFilterModal: () => void;
  totalProducts: number;
  filteredCount: number;
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  hideOutOfStock,
  onToggleOutOfStock,
  selectedCategory,
  selectedOwnership,
  selectedCycle,
  onCategoryChange,
  onOwnershipChange,
  onCycleChange,
  onShowFilterModal,
  totalProducts,
  filteredCount,
}: ProductFiltersProps) {
  
  const activeFilterCount = [
    selectedCategory !== 'semua',
    selectedOwnership !== 'semua',
    selectedCycle !== 'semua'
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const clearAllFilters = () => {
    onCategoryChange('semua');
    onOwnershipChange('semua');
    onCycleChange('semua');
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          {/* Toggle Out of Stock */}
          <Button
            variant="outline"
            onClick={onToggleOutOfStock}
            className={hideOutOfStock ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Eye className="w-4 h-4 mr-2" />
            {hideOutOfStock ? 'Tampilkan Semua' : 'Sembunyikan Habis'}
          </Button>
          
          {/* Filter Modal Button */}
          <Button
            variant="outline"
            onClick={onShowFilterModal}
            className="relative"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs text-gray-500 font-medium">Filter Aktif:</span>
          
          {/* Category Chip */}
          {selectedCategory !== 'semua' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
              <span>Kategori: {selectedCategory}</span>
              <button
                onClick={() => onCategoryChange('semua')}
                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                aria-label="Hapus filter kategori"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Ownership Chip */}
          {selectedOwnership !== 'semua' && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              selectedOwnership === 'TOKO'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              <span>Jenis: {selectedOwnership === 'TOKO' ? 'Toko' : 'Titipan'}</span>
              <button
                onClick={() => onOwnershipChange('semua')}
                className={`rounded-full p-0.5 transition-colors ${
                  selectedOwnership === 'TOKO' ? 'hover:bg-blue-100' : 'hover:bg-purple-100'
                }`}
                aria-label="Hapus filter jenis"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Cycle Chip */}
          {selectedCycle !== 'semua' && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              selectedCycle === 'HARIAN' ? 'bg-orange-50 text-orange-700 border-orange-200' :
              selectedCycle === 'MINGGUAN' ? 'bg-green-50 text-green-700 border-green-200' :
              'bg-teal-50 text-teal-700 border-teal-200'
            }`}>
              <span>Siklus: {
                selectedCycle === 'HARIAN' ? 'Harian' :
                selectedCycle === 'MINGGUAN' ? 'Mingguan' : 'Dua Mingguan'
              }</span>
              <button
                onClick={() => onCycleChange('semua')}
                className={`rounded-full p-0.5 transition-colors ${
                  selectedCycle === 'HARIAN' ? 'hover:bg-orange-100' :
                  selectedCycle === 'MINGGUAN' ? 'hover:bg-green-100' :
                  'hover:bg-teal-100'
                }`}
                aria-label="Hapus filter siklus"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Clear All Button */}
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium hover:underline transition-colors"
          >
            Hapus Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}
