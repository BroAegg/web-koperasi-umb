/**
 * Pagination Component
 * Consistent pagination for all supplier tables/lists
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationRange } from '@/lib/supplier-constants';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = getPaginationRange(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-white border-t">
      {/* Info */}
      <div className="text-sm text-gray-600">
        Menampilkan <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span> dari{' '}
        <span className="font-medium">{totalItems}</span> data
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((pageNum, idx) => {
            if (pageNum === -1) {
              return (
                <span key={`dots-${idx}`} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={currentPage === pageNum ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Mobile: Current Page Only */}
        <div className="sm:hidden text-sm text-gray-600">
          Halaman {currentPage} dari {totalPages}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
