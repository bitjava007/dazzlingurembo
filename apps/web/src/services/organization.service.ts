import api from '@/lib/api';
import type { Country, Branch, Warehouse, Workshop } from '@/types';

export interface CreateCountryDto {
  name: string;
  isoCode2: string;
  isoCode3: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  dialCode?: string;
  locale?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface UpdateCountryDto extends Partial<CreateCountryDto> {}

export interface CreateBranchDto {
  name: string;
  code: string;
  type: string;
  countryId: string;
  address?: string;
  city?: string;
  stateRegion?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  isHeadOffice?: boolean;
  openingDate?: string;
  managerId?: string;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {}

export interface CreateWarehouseDto {
  name: string;
  code: string;
  branchId: string;
  address?: string;
  totalCapacity?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {}

export interface CreateWorkshopDto {
  name: string;
  code: string;
  branchId: string;
  address?: string;
  capacity?: number;
  isActive?: boolean;
  specialties?: string[];
}

export interface UpdateWorkshopDto extends Partial<CreateWorkshopDto> {}

// Backend wraps all responses in { data: ... }
type WrappedList<T> = { data: T[] };
type WrappedItem<T> = { data: T };

export const organizationService = {
  // Countries
  async getCountries(isActive?: boolean): Promise<Country[]> {
    const params = isActive !== undefined ? { isActive } : {};
    const response = await api.get<WrappedList<Country>>('/organization/countries', { params });
    return response.data.data;
  },

  async createCountry(dto: CreateCountryDto): Promise<Country> {
    const response = await api.post<WrappedItem<Country>>('/organization/countries', dto);
    return response.data.data;
  },

  async updateCountry(id: string, dto: UpdateCountryDto): Promise<Country> {
    const response = await api.patch<WrappedItem<Country>>(`/organization/countries/${id}`, dto);
    return response.data.data;
  },

  async deleteCountry(id: string): Promise<void> {
    await api.delete(`/organization/countries/${id}`);
  },

  // Branches
  async getBranches(params?: { countryId?: string; isActive?: boolean }): Promise<Branch[]> {
    const response = await api.get<WrappedList<Branch>>('/organization/branches', { params });
    return response.data.data;
  },

  async createBranch(dto: CreateBranchDto): Promise<Branch> {
    const response = await api.post<WrappedItem<Branch>>('/organization/branches', dto);
    return response.data.data;
  },

  async updateBranch(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const response = await api.patch<WrappedItem<Branch>>(`/organization/branches/${id}`, dto);
    return response.data.data;
  },

  async deleteBranch(id: string): Promise<void> {
    await api.delete(`/organization/branches/${id}`);
  },

  // Warehouses
  async getWarehouses(params?: { branchId?: string; isActive?: boolean }): Promise<Warehouse[]> {
    const response = await api.get<WrappedList<Warehouse>>('/organization/warehouses', { params });
    return response.data.data;
  },

  async createWarehouse(dto: CreateWarehouseDto): Promise<Warehouse> {
    const response = await api.post<WrappedItem<Warehouse>>('/organization/warehouses', dto);
    return response.data.data;
  },

  async updateWarehouse(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const response = await api.patch<WrappedItem<Warehouse>>(`/organization/warehouses/${id}`, dto);
    return response.data.data;
  },

  async deleteWarehouse(id: string): Promise<void> {
    await api.delete(`/organization/warehouses/${id}`);
  },

  // Workshops
  async getWorkshops(params?: { branchId?: string; isActive?: boolean }): Promise<Workshop[]> {
    const response = await api.get<WrappedList<Workshop>>('/organization/workshops', { params });
    return response.data.data;
  },

  async createWorkshop(dto: CreateWorkshopDto): Promise<Workshop> {
    const response = await api.post<WrappedItem<Workshop>>('/organization/workshops', dto);
    return response.data.data;
  },

  async updateWorkshop(id: string, dto: UpdateWorkshopDto): Promise<Workshop> {
    const response = await api.patch<WrappedItem<Workshop>>(`/organization/workshops/${id}`, dto);
    return response.data.data;
  },

  async deleteWorkshop(id: string): Promise<void> {
    await api.delete(`/organization/workshops/${id}`);
  },
};
