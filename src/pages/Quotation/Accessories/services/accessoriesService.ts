import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { Accessories, AccessoriesFormData, AccessoriesRequest, AccessoriesResponse } from '../types/accessories';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class AccessoriesService {
    static async getAccessories(params: Partial<AccessoriesRequest> = {}): Promise<AccessoriesResponse> {
        const defaultParams: AccessoriesRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/quotation/accessory/get`, defaultParams as any);
        return response.data as AccessoriesResponse;
    }

    static async getAccessoriesById(accessoryId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Accessories }>> {
        return await apiGet<{ success: boolean; message: string; data: Accessories }>(`${API_BASE_URL}/quotation/accessory/${accessoryId}`, { accessory_id: accessoryId });
    }

    static async createAccessories(accessoryData: AccessoriesFormData): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> {
        try {
            const response = await apiPost(`${API_BASE_URL}/quotation/accessory`, accessoryData as any);
            return response.data as { success: boolean; data?: any; message?: string; errors?: any };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to create accessory',
                errors: error.errors
            };
        }
    }

    static async updateAccessories(accessoryId: string, accessoryData: Partial<Omit<Accessories, 'accessory_id'>>): Promise<Accessories> {
        const response = await apiPut<{ data: Accessories }>(`${API_BASE_URL}/quotation/accessory/${accessoryId}`, accessoryData);
        return response.data.data;
    }

    static async deleteAccessories(accessoryId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/quotation/accessory/${accessoryId}`);
    }

}