import { apiDelete, apiGet, apiPost, apiPut, ApiResponse } from '@/helpers/apiHelper';
import { IupDetail, IupFormData, IupRequest, IupResponse } from '../types/iupterritory';
// import { IupResponse } from '../types/iupTeritory';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class IupService {
    static async getIUPTerritory(params: Partial<IupRequest> = {}): Promise<IupResponse> {
        const requestData: IupRequest = {
            page: 1,
            limit: 10,
            sort_by: "updated_at",
            sort_order: 'desc',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_selection/get`, requestData as Record<string, any>);
        return response.data as IupResponse;
    }

    // Get existing Iup by ID
    static async getIupById(id: string): Promise<ApiResponse<{ success: boolean; message: string; data: IupDetail }>> {
        return await apiGet<{ success: boolean; message: string; data: IupDetail }>(`${API_BASE_URL}/crm/iup_selection/${id}`, { iup_id: id });
    }

    static async updateIup(id: string, data: IupFormData): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_selection/${id}`, data as Record<string, any>);
        return response.data;
    }

    static async createIup(data: IupFormData): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_selection/create`, data as Record<string, any>);
        return response.data;
    }
    static async deleteIUPTerritory(iup_selection_id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_selection/${iup_selection_id}`);
    }
}