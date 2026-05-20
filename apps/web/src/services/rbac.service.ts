import api from '@/lib/api';
import type { Role, Permission, PaginatedResponse, ApiResponse, ListParams } from '@/types';

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export const rbacService = {
  async getRoles(params?: ListParams): Promise<PaginatedResponse<Role>> {
    const response = await api.get<PaginatedResponse<Role>>('/rbac/roles', { params });
    return response.data;
  },

  async createRole(dto: CreateRoleDto): Promise<ApiResponse<Role>> {
    const response = await api.post<ApiResponse<Role>>('/rbac/roles', dto);
    return response.data;
  },

  async updateRole(id: string, dto: UpdateRoleDto): Promise<ApiResponse<Role>> {
    const response = await api.patch<ApiResponse<Role>>(`/rbac/roles/${id}`, dto);
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

  async getPermissions(params?: ListParams): Promise<PaginatedResponse<Permission>> {
    const response = await api.get<PaginatedResponse<Permission>>('/rbac/permissions', { params });
    return response.data;
  },
};
