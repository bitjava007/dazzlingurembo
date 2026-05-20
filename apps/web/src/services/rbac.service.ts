import api from '@/lib/api';
import type { Role, Permission, ListParams } from '@/types';

export interface CreateRoleDto {
  name: string;
  description?: string;
  isSystem?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

// Backend wraps all responses in { data: ... }
type WrappedList<T> = { data: T[] };
type WrappedItem<T> = { data: T };
// Permissions endpoint returns grouped by module: { data: Record<string, Permission[]> }
type WrappedGrouped = { data: Record<string, Permission[]> };

export const rbacService = {
  async getRoles(params?: ListParams): Promise<Role[]> {
    const response = await api.get<WrappedList<Role>>('/rbac/roles', { params });
    return response.data.data;
  },

  async getRole(id: string): Promise<Role> {
    const response = await api.get<WrappedItem<Role>>(`/rbac/roles/${id}`);
    return response.data.data;
  },

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const response = await api.post<WrappedItem<Role>>('/rbac/roles', dto);
    return response.data.data;
  },

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const response = await api.patch<WrappedItem<Role>>(`/rbac/roles/${id}`, dto);
    return response.data.data;
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

  async getPermissions(): Promise<Record<string, Permission[]>> {
    const response = await api.get<WrappedGrouped>('/rbac/permissions');
    return response.data.data;
  },
};
