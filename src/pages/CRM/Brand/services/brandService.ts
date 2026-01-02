import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { Brand, BrandListResponse, BrandPayload, BrandRequest } from '../types/brand';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class BrandService {
    static async getBrands(params: Partial<BrandRequest> = {}): Promise<BrandListResponse> {
        const requestData: BrandRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/brand/get`, requestData as Record<string, any>);
        return response.data as BrandListResponse;
    }

    // Get existing island by ID
    static async getBrandById(brandId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Brand }>> {
        return await apiGet<{ success: boolean; message: string; data: Brand }>(`${API_BASE_URL}/crm/brand/${brandId}`, { brand_id: brandId });
    }

    static async createBrand(data: BrandPayload): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/crm/brand/create`, data as unknown as Record<string, unknown>);
    }


    static async updateBrand(id: string, data: BrandPayload): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/crm/brand/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deleteBrand(brandId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/brand/${brandId}`);
    }
    
}