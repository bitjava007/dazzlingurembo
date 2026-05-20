import api from '@/lib/api';
import type { Role, Permission, PaginatedResponse, ApiResponse, ListParams } from '@/types';

export interface CreateRoleDto {
  name: string;
  description?: string;
  isSystem?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export const rbacService = {
  async getRoles(params?: ListParams): Promise<Role[]> {
    const response = await api.get<Role[]>('/rbac/roles', { params });
    return response.data;
  },

  async getRole(id: string): Promise<Role> {
    const response = await api.get<Role>(`/rbac/roles/${id}`);
    return response.data;
  },

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const response = await api.post<Role>('/rbac/roles', dto);
    return response.data;
  },

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const response = await api.patch<Role>(`/rbac/roles/${id}`, dto);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/rbac/roles/${id}`);
  },

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await api.post(`/rbac/roles/${roleId}/permissions`, { permissionId });
  },

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await api.delete(`/rbac/roles/${roleId}/permissions/${permissionId}`);
  },

  async getPermissions(): Promise<Permission[]> {
    const response = await api.get<Permission[]>('/rbac/permissions');
    return response.data;
  },
};

// Keep legacy exports for compatibility
export type { PaginatedResponse, ApiResponse, ListParams };
