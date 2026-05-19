'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PaginatedResponse, ListParams } from '@/types';

export function useList<T>(key: string[], url: string, params?: ListParams) {
  return useQuery<PaginatedResponse<T>>({
    queryKey: [...key, params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<T>>(url, { params });
      return response.data;
    },
  });
}

export function useSingle<T>(key: string[], url: string, enabled = true) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get<T>(url);
      return response.data;
    },
    enabled,
  });
}

export function useMutate<TData, TVariables = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  invalidateKeys?: string[][],
) {
  const qc = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      let response;
      if (method === 'DELETE') {
        response = await api.delete<TData>(url);
      } else if (method === 'PUT') {
        response = await api.put<TData>(url, variables);
      } else if (method === 'PATCH') {
        response = await api.patch<TData>(url, variables);
      } else {
        response = await api.post<TData>(url, variables);
      }
      return response.data;
    },
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      }
    },
  });
}
