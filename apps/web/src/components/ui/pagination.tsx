'use client';

import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#1A1A1A] disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onPageChange(p)}
          className={
            p === page
              ? 'h-8 w-8 bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-bold'
              : 'h-8 w-8 text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
          }
        >
          {p}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#1A1A1A] disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
