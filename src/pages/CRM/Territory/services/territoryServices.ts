import { apiDelete, apiPost, apiPut } from '@/helpers/apiHelper';
import { ApiResponse, Island, TerritoryRequest, CreateTerritoryRequest, UpdateTerritoryRequest, DeleteTerritoryRequest } from '../types/territory';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_IS_ADMIN = import.meta.env.VITE_PARAM_IS_ADMIN;
export class TerritoryServices {
    static async getTerritory(params: Partial<TerritoryRequest> = {}): Promise<ApiResponse<Island[]>> {
        const requestData: TerritoryRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            is_admin: API_IS_ADMIN,
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/territory/get`, requestData as Record<string, any>);
        return response.data as ApiResponse<Island[]>;
    }
    
    static async createTerritory(data: CreateTerritoryRequest): Promise<ApiResponse<any>> {
        const response = await apiPost(`${API_BASE_URL}/crm/territory/create`, data as Record<string, any>);
        return response.data as ApiResponse<any>;
    }

    static async updateTerritory(id: string, data: UpdateTerritoryRequest): Promise<ApiResponse<any>> {
        const response = await apiPut(`${API_BASE_URL}/crm/territory/${id}`, data as Record<string, any>);
        return response.data as ApiResponse<any>;
    }

    static async deleteTerritory(params: DeleteTerritoryRequest): Promise<ApiResponse<boolean>> {
        const response = await apiDelete(`${API_BASE_URL}/crm/territory/${params.id}?type=${params.type}`);
        return response.data as ApiResponse<boolean>;
    }
}