import { apiDelete, apiGet, apiPost, apiPut } from '@/helpers/apiHelper';
import { EmployeeTerritoryRequest, EmployeeTerritoryResponse, GetUserAccessByIdResponse } from '../types/usermanagement';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_IS_ADMIN = import.meta.env.VITE_PARAM_IS_ADMIN;
export interface TerritoryAccess {
    access_level: string;
    ref_id: string;
    name?: string;
    type?: string;
    ui_only?: boolean; // Flag to indicate this territory is for UI display only
}

export interface CreateUserAccessRequest {
    employee_id: string;
    data_territory: TerritoryAccess[];
}

export interface UpdateUserAccessRequest {
    employee_id: string;
    data_territory: {
        access_level: string;
        ref_id: string;
    }[];
}

export class UsermanagementServices {
    static async getUserManagement(params: Partial<EmployeeTerritoryRequest> = {}): Promise<EmployeeTerritoryResponse> {
        const requestData: EmployeeTerritoryRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            is_admin: API_IS_ADMIN,
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/employee-data-access/get`, requestData as Record<string, any>);
        return response.data as EmployeeTerritoryResponse;
    }

    // Create new user access
    static async createUserAccess(data: CreateUserAccessRequest): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/employee-data-access/create`, data as Record<string, any>);
        return response.data;
    }
    
    // Get existing user access by ID
    static async getUserAccessById(id: string): Promise<GetUserAccessByIdResponse> {
        const response = await apiGet<GetUserAccessByIdResponse>(`${API_BASE_URL}/crm/employee-data-access/${id}`);
        return response.data;
    }

    // Update user access
    static async updateUserAccess(id: string, data: UpdateUserAccessRequest): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/employee-data-access/${id}`, data as Record<string, any>);
        return response.data;
    }
    
    static async deleteUserAccess(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/employee-data-access/${id}`);
    }
    
}