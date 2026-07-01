import { apiGet, apiPost, apiPut, apiDelete } from '@/helpers/apiHelper';
import {
    DailyTaskListRequest,
    DailyTaskListResponse,
    DailyTaskDetailResponse,
    DailyTaskFormData,
    DailyTaskCreateResponse,
    DailyTaskHistoryListRequest,
    DailyTaskHistoryListResponse,
} from '../types/dailyTask';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class DailyTaskServices {
    // POST /daily_task_activity/get — list task
    static async getTasks(params: DailyTaskListRequest): Promise<DailyTaskListResponse> {
        const requestData: DailyTaskListRequest = {
            page: params.page || 1,
            limit: params.limit || 50,
            sort_order: params.sort_order || 'desc',
            sort_by: params.sort_by || 'created_at',
            search: params.search || '',
            status: params.status || '',
            priority: params.priority || '',
        };

        const response = await apiPost(
            `${API_BASE_URL}/crm/daily_task_activity/get`,
            requestData as Record<string, any>
        );
        return response.data as DailyTaskListResponse;
    }

    // POST /daily_task_activity/create — create task
    static async createTask(data: DailyTaskFormData): Promise<DailyTaskCreateResponse> {
        const response = await apiPost(
            `${API_BASE_URL}/crm/daily_task_activity/create`,
            data as Record<string, any>
        );
        return response.data as DailyTaskCreateResponse;
    }

    // PUT /daily_task_activity/{id} — update task (termasuk status untuk drag-drop)
    static async updateTask(id: string, data: DailyTaskFormData): Promise<DailyTaskCreateResponse> {
        const response = await apiPut(
            `${API_BASE_URL}/crm/daily_task_activity/${id}`,
            data as Record<string, any>
        );
        return response.data as DailyTaskCreateResponse;
    }

    // GET /daily_task_activity/{id} — get task by id
    static async getTaskById(id: string): Promise<DailyTaskDetailResponse> {
        const response = await apiGet(
            `${API_BASE_URL}/crm/daily_task_activity/${id}`
        );
        return response.data as DailyTaskDetailResponse;
    }

    // DELETE /daily_task_activity/{id} — delete task
    static async deleteTask(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/daily_task_activity/${id}`);
    }

    // POST /daily_task_activity/get-histories — get history
    static async getHistory(params: DailyTaskHistoryListRequest): Promise<DailyTaskHistoryListResponse> {
        const requestData: DailyTaskHistoryListRequest = {
            page: params.page || 1,
            limit: params.limit || 50,
            sort_by: params.sort_by || 'created_at',
            sort_order: params.sort_order || 'desc',
            search: params.search || '',
            daily_task_activitity_id: params.daily_task_activitity_id || '',
        };

        const response = await apiPost(
            `${API_BASE_URL}/crm/daily_task_activity/get-histories`,
            requestData as Record<string, any>
        );
        return response.data as DailyTaskHistoryListResponse;
    }
}
