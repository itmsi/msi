import { apiGet, apiPost, apiDelete } from '@/helpers/apiHelper';
import { 
    ProjectSalesActivityRequest, 
    ProjectSalesActivityResponse, 
    ProjectSalesActivityCreateResponse, 
} from '../types/projectSalesActivity';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ActivityServices {
    // Fetch activities with search and pagination
    static async getPSA(params: Partial<ProjectSalesActivityRequest>): Promise<ProjectSalesActivityResponse> {
        const requestData: ProjectSalesActivityRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            sort_by: 'updated_at',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/project_sales_activity/get`, requestData as Record<string, any>);
        return response.data as ProjectSalesActivityResponse;
    }

    // Get activity by ID for editing
    static async getActivityById(id: string): Promise<ProjectSalesActivityCreateResponse> {
        const response = await apiGet(`${API_BASE_URL}/crm/project_sales_activity/${id}`);
        return response.data as ProjectSalesActivityCreateResponse;
    }
    
    // Delete activity
    static async deleteActivity(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/project_sales_activity/${id}`);
    }
}