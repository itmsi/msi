import { apiGet, apiPost, apiPut, apiDelete } from '@/helpers/apiHelper';
import { 
    ActivityListRequest, 
    ActivityListResponse, 
    ActivityDetailResponse, 
    ActivityFormData, 
    ActivityCreateResponse 
} from '../types/activity';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_IS_ADMIN = import.meta.env.VITE_PARAM_IS_ADMIN;

export class ActivityServices {
    // Fetch activities with search and pagination
    static async getActivities(params: ActivityListRequest): Promise<ActivityListResponse> {
        const requestData: ActivityListRequest = {
            page: params.page || 1,
            limit: params.limit || 10,
            sort_order: params.sort_order || 'desc',
            sort_by: params.sort_by || "updated_at",
            search: params.search || '',
            transaction_type: params.transaction_type || '',
            is_admin: API_IS_ADMIN,
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm//transactions/get`, requestData as Record<string, any>);
        return response.data as ActivityListResponse;
    }

    // Get activity by ID for editing
    static async getActivityById(id: string): Promise<ActivityDetailResponse> {
        const response = await apiGet(`${API_BASE_URL}/crm/transactions/${id}`);
        return response.data as ActivityDetailResponse;
    }
    
    // Create new activity
    static async createActivity(data: ActivityFormData): Promise<ActivityCreateResponse> {
        const response = await apiPost(`${API_BASE_URL}/crm/transactions/create`, data as Record<string, any>);
        return response.data as ActivityCreateResponse;
    }
    
    // Update existing activity
    static async updateActivity(id: string, data: ActivityFormData): Promise<ActivityCreateResponse> {
        const response = await apiPut(`${API_BASE_URL}/crm/transactions/${id}`, data as Record<string, any>);
        return response.data as ActivityCreateResponse;
    }
    
    // Delete activity
    static async deleteActivity(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/transactions/${id}`);
    }
}