// Transaction Filters Component
// Search and filter controls for financial transactions

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  totalCount: number;
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  totalCount
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
        Transaksi Hari Ini ({totalCount})
      </h2>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Semua Tipe</option>
          <option value="SALE">Penjualan</option>
          <option value="PURCHASE">Pembelian</option>
          <option value="RETURN">Retur</option>
          <option value="INCOME">Pemasukan</option>
          <option value="EXPENSE">Pengeluaran</option>
        </select>
      </div>
    </div>
  );
}
