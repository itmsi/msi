import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { Division, DivisionListResponse, DivisionPayload, DivisionRequest } from '../types/division';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class DivisionService {
    static async getDivisions(params: Partial<DivisionRequest> = {}): Promise<DivisionListResponse> {
        const requestData: DivisionRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/devision_project/get`, requestData as Record<string, any>);
        return response.data as DivisionListResponse;
    }

    // Get existing division by ID
    static async getDivisionById(divisionId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Division }>> {
        return await apiGet<{ success: boolean; message: string; data: Division }>(`${API_BASE_URL}/crm/devision_project/${divisionId}`, { division_id: divisionId });
    }

    static async createDivision(data: DivisionPayload): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/crm/devision_project/create`, data as unknown as Record<string, unknown>);
    }

    static async updateDivision(id: string, data: DivisionPayload): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/crm/devision_project/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deleteDivision(divisionId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/devision_project/${divisionId}`);
    }
    
}