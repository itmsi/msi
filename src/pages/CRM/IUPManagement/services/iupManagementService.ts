import { apiGet, apiPost, apiPut, ApiResponse } from '@/helpers/apiHelper';
import { IupItemDetails, IupRequest, IupListResponse, IupManagementFormData } from '../types/iupmanagement';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_IS_ADMIN = import.meta.env.VITE_PARAM_IS_ADMIN;
export class IupService {
    static async getIUPManagement(params: Partial<IupRequest> = {}): Promise<IupListResponse> {
        const requestData: IupRequest = {
            page: 1,
            limit: 10,
            sort_by: "updated_at",
            sort_order: 'desc',
            search: '',
            status: '',
            is_admin: API_IS_ADMIN,
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_management/get`, requestData as Record<string, any>);
        return response.data as IupListResponse;
    }

    // Get existing Iup by ID
    static async getIupById(id: string): Promise<ApiResponse<{ success: boolean; message: string; data: IupItemDetails }>> {
        return await apiGet<{ success: boolean; message: string; data: IupItemDetails }>(`${API_BASE_URL}/crm/iup_management/${id}`, { iup_id: id });
    }

    static async updateIup(id: string, data: IupManagementFormData): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_management/${id}`, data as Record<string, any>);
        return response.data;
    }

    static async createIup(data: IupManagementFormData): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_management/create`, data as Record<string, any>);
        return response.data;
    }
}