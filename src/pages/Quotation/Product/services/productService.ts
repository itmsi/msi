import { apiGet, apiPost, apiPut, apiDelete, apiPutMultipart, ApiResponse } from '@/helpers/apiHelper';
import { ItemProduct, ItemProductFormData, ItemProductRequest, ItemProductResponse } from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Product component types
export const COMPONENT_TYPES = {
    ENGINE: 1,
    TRANSMISSION: 2,
    CHASSIS: 3,
    BODY: 4,
    ELECTRICAL: 5
} as const;

// Star level constants for pricing
export const STAR_LEVELS = [1, 2, 3, 4, 5] as const;
export type StarLevel = typeof STAR_LEVELS[number];

export class ItemProductService {
    static async getItemProduct(params: Partial<ItemProductRequest> = {}): Promise<ItemProductResponse> {
        const defaultParams: ItemProductRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/quotation/componen_product/get`, defaultParams as unknown as Record<string, unknown>);
        return response.data as ItemProductResponse;
    }

    static async getItemProductById(productId: string): Promise<ApiResponse<{ status: boolean; message: string; data: ItemProduct }>> {
        return await apiGet<{ status: boolean; message: string; data: ItemProduct }>(`${API_BASE_URL}/quotation/componen_product/${productId}`, { componen_product_id: productId });
    }

    static async createItemProduct(productData: ItemProductFormData | FormData): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> {
        try {
            // Check if productData is FormData (for multipart uploads)
            if (productData instanceof FormData) {
                const response = await apiPost(`${API_BASE_URL}/quotation/componen_product`, productData);
                return response.data as { success: boolean; data?: any; message?: string; errors?: any };
            }
            
            // Regular JSON create
            const response = await apiPost(`${API_BASE_URL}/quotation/componen_product/create`, productData as unknown as Record<string, unknown>);
            return response.data as { success: boolean; data?: any; message?: string; errors?: any };
        } catch (error: any) {
            // Handle error gracefully
            return {
                success: false,
                message: error.message || 'Failed to create component product',
                errors: error.errors
            };
        }
    }

    static async updateItemProduct(productId: string, productData: Partial<Omit<ItemProduct, 'componen_product_id'>> | FormData): Promise<ItemProduct> {
        // Check if productData is FormData (for multipart uploads)
        if (productData instanceof FormData) {
            const response = await apiPutMultipart<{ data: ItemProduct }>(`${API_BASE_URL}/quotation/componen_product/${productId}`, productData);
            return response.data.data;
        }
        
        // Regular JSON update
        const response = await apiPut<{ data: ItemProduct }>(`${API_BASE_URL}/quotation/componen_product/${productId}`, productData);
        return response.data.data;
    }

    static async deleteItemProduct(productId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/quotation/componen_product/${productId}`);
    }

    static async searchItemProducts(searchQuery: string, filters?: Record<string, any>): Promise<ItemProductResponse> {
        const searchParams = {
            search: searchQuery,
            page: 1,
            limit: 10,
            sort_order: 'desc' as const,
            ...filters
        };

        return await this.getItemProduct(searchParams);
    }

    static formatProductOptions(products: ItemProduct[]) {
        return products.map(product => ({
            value: product.componen_product_id,
            label: `${product.code_unique} - ${product.msi_model}`,
            data: product
        }));
    }

    static getSellingPriceByStar(product: ItemProduct, starLevel: 1 | 2 | 3 | 4 | 5): string {
        const priceMap = {
            1: product.selling_price_star_1,
            2: product.selling_price_star_2,
            3: product.selling_price_star_3,
            4: product.selling_price_star_4,
            5: product.selling_price_star_5
        };
        return priceMap[starLevel];
    }

    static formatPrice(price: string | number): string {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(numPrice);
    }
}