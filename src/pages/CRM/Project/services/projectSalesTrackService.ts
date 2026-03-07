import { apiPost, apiPostMultipart, apiPutMultipart, apiDelete } from '@/helpers/apiHelper';
import { ProjectRequest, SalesTrackingResponse } from '../types/salesTracking';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ProjectSalesTrackService {
    static async getSalesTracking(projectId: string, params: Partial<ProjectRequest> = {}): Promise<SalesTrackingResponse> {
        const requestData: ProjectRequest = {
            page: 1,
            limit: 10,
            sort_by: 'updated_at',
            sort_order: 'desc',
            search: '',
            project_id: projectId,
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/crm/project_details/get`, requestData as Record<string, any>);
        return response.data as SalesTrackingResponse;
    }

    static async createSalesTracking(formData: FormData): Promise<any> {
        const response = await apiPostMultipart(`${API_BASE_URL}/crm/project_details/create`, formData);
        return response.data;
    }

    static async updateSalesTracking(projectDetailId: string, formData: FormData): Promise<any> {
        const response = await apiPutMultipart(`${API_BASE_URL}/crm/project_details/${projectDetailId}`, formData);
        return response.data;
    }

    static async deleteSalesTracking(projectId: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/crm/project_details/${projectId}`);
        return response.data;
    }
}
