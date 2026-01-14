import { apiDelete, apiGet, apiPost, apiPut } from '@/helpers/apiHelper';
import { ActivityListRequest, ActivityListResponse } from '../types/activity';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ActivityServices {
    static async getActivities(params: ActivityListRequest): Promise<ActivityListResponse> {
        const requestData: ActivityListRequest = {
            page: params.page || 1,
            limit: params.limit || 10,
            sort_order: params.sort_order || 'desc',
            sort_by: params.sort_by || "updated_at",
            search: params.search || '',
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm//transactions/get`, requestData as Record<string, any>);
        return response.data as ActivityListResponse;
    }

    // static async getActivityById(id: string): Promise<ActivityDetailResponse> {
    //     const response = await apiGet<ActivityDetailResponse>(`${API_BASE_URL}/crm/transactions/${id}`);
    //     return response.data;
    // }
    
    // static async createActivity(data: ActivityFormData): Promise<any> {
    //     const response = await apiPost(`${API_BASE_URL}/crm/transactions/create`, data as Record<string, any>);
    //     return response.data;
    // }
    
    // static async updateActivity(id: string, data: ActivityFormData): Promise<any> {
    //     const response = await apiPut(`${API_BASE_URL}/crm/transactions/${id}`, data as Record<string, any>);
    //     return response.data;
    // }
    
    static async deleteActivity(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/transactions/${id}`);
    }
    
}