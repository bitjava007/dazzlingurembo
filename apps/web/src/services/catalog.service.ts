import api from '@/lib/api';
import type { Category, Product, Variant, ProductSku, ProductMedia, PaginatedResponse, ListParams } from '@/types';

export const catalogService = {
  // Categories
  async getCategories(params?: ListParams): Promise<PaginatedResponse<Category>> {
    const response = await api.get<PaginatedResponse<Category>>('/catalog/categories', { params });
    return response.data;
  },

  async getCategory(id: string): Promise<Category> {
    const response = await api.get<Category>(`/catalog/categories/${id}`);
    return response.data;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await api.post<Category>('/catalog/categories', data);
    return response.data;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const response = await api.patch<Category>(`/catalog/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/catalog/categories/${id}`);
  },

  // Products
  async getProducts(params?: ListParams): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>('/catalog/products', { params });
    return response.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get<Product>(`/catalog/products/${id}`);
    return response.data;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await api.post<Product>('/catalog/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.patch<Product>(`/catalog/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/catalog/products/${id}`);
  },

  // Variants
  async getVariants(productId: string): Promise<Variant[]> {
    const response = await api.get<Variant[]>(`/catalog/products/${productId}/variants`);
    return response.data;
  },

  async createVariant(productId: string, data: Partial<Variant>): Promise<Variant> {
    const response = await api.post<Variant>(`/catalog/products/${productId}/variants`, data);
    return response.data;
  },

  async updateVariant(productId: string, variantId: string, data: Partial<Variant>): Promise<Variant> {
    const response = await api.patch<Variant>(`/catalog/products/${productId}/variants/${variantId}`, data);
    return response.data;
  },

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    await api.delete(`/catalog/products/${productId}/variants/${variantId}`);
  },

  // SKUs
  async getSkus(variantId: string): Promise<ProductSku[]> {
    const response = await api.get<ProductSku[]>(`/catalog/variants/${variantId}/skus`);
    return response.data;
  },

  async createSku(variantId: string, data: Partial<ProductSku>): Promise<ProductSku> {
    const response = await api.post<ProductSku>(`/catalog/variants/${variantId}/skus`, data);
    return response.data;
  },

  async deleteSku(variantId: string, skuId: string): Promise<void> {
    await api.delete(`/catalog/variants/${variantId}/skus/${skuId}`);
  },

  // Media
  async getMedia(productId: string): Promise<ProductMedia[]> {
    const response = await api.get<ProductMedia[]>(`/catalog/products/${productId}/media`);
    return response.data;
  },

  async createMedia(productId: string, data: Partial<ProductMedia>): Promise<ProductMedia> {
    const response = await api.post<ProductMedia>(`/catalog/products/${productId}/media`, data);
    return response.data;
  },

  async deleteMedia(productId: string, mediaId: string): Promise<void> {
    await api.delete(`/catalog/products/${productId}/media/${mediaId}`);
  },
};
