import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { SegementationPayload, SegementationRequest, SegementationListResponse, Segementation } from '../types/segementasi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_IS_ADMIN = import.meta.env.VITE_PARAM_IS_ADMIN;
export class SegementationService {
    static async getSegementations(params: Partial<SegementationRequest> = {}): Promise<SegementationListResponse> {
        const requestData: SegementationRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            is_admin: API_IS_ADMIN,
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/segmentation/get`, requestData as Record<string, any>);
        return response.data as SegementationListResponse;
    }

    static async getSegementationById(segementationId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Segementation }>> {
        return await apiGet<{ success: boolean; message: string; data: Segementation }>(`${API_BASE_URL}/crm/segmentation/${segementationId}`, { segmentation_id: segementationId });
    }

    static async createSegementation(data: SegementationPayload): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/crm/segmentation/create`, data as unknown as Record<string, unknown>);
    }


    static async updateSegementation(segementationId: string, data: SegementationPayload): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/crm/segmentation/${segementationId}`, data as unknown as Record<string, unknown>);
    }

    static async deleteSegementation(segementationId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/segmentation/${segementationId}`);
    }
    
}