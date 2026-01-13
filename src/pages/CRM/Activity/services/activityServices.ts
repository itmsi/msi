import { apiPost } from '@/helpers/apiHelper';
import { ActivityListRequest, ActivityListResponse } from '../types/activity';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ActivityServices {
    // Fetch activities with search and pagination
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
}