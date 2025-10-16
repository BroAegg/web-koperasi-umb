// Reusable Pagination Component

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
}: PaginationProps) {
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(page => {
        // Show first page, last page, current page, and pages around current
        return page === 1 || 
               page === totalPages || 
               (page >= currentPage - 1 && page <= currentPage + 1);
      });
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-6 pb-4">
      <div className="text-sm text-gray-600">
        Halaman {currentPage} dari {totalPages} • 
        Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} produk
      </div>
      
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3"
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {/* Page Numbers */}
        <div className="flex gap-1">
          {pageNumbers.map((page, idx, arr) => {
            // Add ellipsis if there's a gap
            const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
            
            return (
              <div key={page} className="flex items-center gap-1">
                {showEllipsisBefore && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                <Button
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={`px-3 min-w-[2.5rem] ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-blue-50'
                  }`}
                >
                  {page}
                </Button>
              </div>
            );
          })}
        </div>
        
        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3"
          title="Halaman selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
