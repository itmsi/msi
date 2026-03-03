import { apiPost, apiGet, apiPostMultipart, apiPutMultipart, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { ProjectItemDetails, ProjectListResponse, ProjectRequest } from '../types/project';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ProjectService {
    static async getProjects(params: Partial<ProjectRequest> = {}): Promise<ProjectListResponse> {
        const requestData: ProjectRequest = {
            page: 1,
            limit: 10,
            sort_by: 'updated_at',
            sort_order: 'desc',
            search: '',
            status: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/crm/projects/get`, requestData as Record<string, any>);
        return response.data as ProjectListResponse;
    }

    static async getProjectById(id: string): Promise<ApiResponse<{ success: boolean; message: string; data: ProjectItemDetails }>> {
        return await apiGet<{ success: boolean; message: string; data: ProjectItemDetails }>(
            `${API_BASE_URL}/crm/projects/${id}`
        );
    }

    static async createProject(formData: FormData): Promise<any> {
        const response = await apiPostMultipart(`${API_BASE_URL}/crm/projects/create`, formData);
        return response.data;
    }

    static async updateProject(id: string, formData: FormData): Promise<any> {
        const response = await apiPutMultipart(`${API_BASE_URL}/crm/projects/${id}`, formData);
        return response.data;
    }

    static async deleteProject(id: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/crm/projects/${id}`);
        return response.data;
    }
}
