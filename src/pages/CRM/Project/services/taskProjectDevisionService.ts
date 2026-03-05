import { apiPost, apiGet, apiPut, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { TaskProjectDevision, TaskProjectDevisionQuery, TaskProjectDevisionRequest, TaskProjectDevisionResponse } from '../types/taskProjectDevision';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class TaskProjectDevisionService {
    static async getTasks(params: TaskProjectDevisionQuery = {}): Promise<TaskProjectDevisionResponse> {
        const { devision_project_id, ...restParams } = params;
        const requestData: Record<string, any> = {
            page: 1,
            limit: 10,
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
            project_id: null,
            ...restParams
        };
        // hanya tambahkan devision_project_id jika ada nilainya
        if (devision_project_id) {
            requestData.devision_project_id = devision_project_id;
        }

        const response = await apiPost(`${API_BASE_URL}/crm/task_project_devision/get`, requestData);
        return response.data as TaskProjectDevisionResponse;
    }

    static async getTaskById(id: string): Promise<ApiResponse<{ success: boolean; data: TaskProjectDevision }>> {
        return await apiGet<{ success: boolean; data: TaskProjectDevision }>(
            `${API_BASE_URL}/crm/task_project_devision/${id}`
        );
    }

    static async createTask(data: TaskProjectDevisionRequest): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/task_project_devision/create`, data as any);
        return response.data;
    }

    static async updateTask(id: string, data: TaskProjectDevisionRequest): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/task_project_devision/${id}`, data as any);
        return response.data;
    }

    static async deleteTask(id: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/crm/task_project_devision/${id}`);
        return response.data;
    }
}
