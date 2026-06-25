import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type { ApiResponse, PaginatedData } from '../types';

function useEntityApi<T>(baseKey: string, endpoint: string) {
  const queryClient = useQueryClient();

  const useList = (params?: Record<string, any>) => useQuery<PaginatedData<T>>({
    queryKey: [baseKey, params],
    queryFn: async () => {
      const res = await api.get(endpoint, { params }) as ApiResponse<PaginatedData<T>>;
      return res.data;
    },
  });

  const useCreate = () => useMutation({
    mutationFn: async (data: Partial<T>) => {
      const res = await api.post(endpoint, data) as unknown as ApiResponse<T>;
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [baseKey] }),
  });

  const useUpdate = () => useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const res = await api.put(`${endpoint}/${id}`, data) as unknown as ApiResponse<T>;
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [baseKey] }),
  });

  const useDelete = () => useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [baseKey] }),
  });

  return { useList, useCreate, useUpdate, useDelete };
}

export const useCustomersApi = () => useEntityApi('customers', '/customers');
export const useLeadsApi = () => useEntityApi('leads', '/leads');
export const useTasksApi = () => useEntityApi('tasks', '/tasks');
