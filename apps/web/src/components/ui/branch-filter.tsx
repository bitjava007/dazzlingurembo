'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Branch } from '@/types';

interface BranchFilterProps {
  value: string;
  onChange: (branchId: string) => void;
  className?: string;
}

export function BranchFilter({ value, onChange, className }: BranchFilterProps) {
  const { data } = useQuery<{ data: Branch[] }>({
    queryKey: ['branches-filter'],
    queryFn: () => api.get('/organization/branches', { params: { limit: 100 } }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const branches = data?.data ?? [];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-[#111111] border border-[#2A2A2A] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors ${className ?? ''}`}
    >
      <option value="">All Branches</option>
      {branches.map((b) => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  );
}
