import { apiPost, apiPostMultipart, apiPutMultipart, apiDelete } from '@/helpers/apiHelper';
import { ProjectRequest, DivisionOverviewResponse } from '../types/divisionOverview';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ProjectDivisionOverviewService {
    static async getDivisionOverview(projectId: string, params: Partial<ProjectRequest> = {}): Promise<DivisionOverviewResponse> {
        const requestData: ProjectRequest = {
            page: 1,
            limit: 10,
            sort_by: 'updated_at',
            sort_order: 'desc',
            search: '',
            project_id: projectId,
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/crm/project_detail_divisions/get`, requestData as Record<string, any>);
        return response.data as DivisionOverviewResponse;
    }

    static async createDivisionOverview(formData: FormData): Promise<any> {
        const response = await apiPostMultipart(`${API_BASE_URL}/crm/project_detail_divisions/create`, formData);
        return response.data;
    }

    static async updateDivisionOverview(projectDetailDivisionId: string, formData: FormData): Promise<any> {
        const response = await apiPutMultipart(`${API_BASE_URL}/crm/project_detail_divisions/${projectDetailDivisionId}`, formData);
        return response.data;
    }

    static async deleteDivisionOverview(projectId: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/crm/project_detail_divisions/${projectId}`);
        return response.data;
    }
}