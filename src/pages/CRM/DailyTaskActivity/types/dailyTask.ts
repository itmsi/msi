// Daily Task main types — sesuai API response aktual
export interface DailyTask {
    daily_task_activitity_id: string;
    daily_task: string;
    priority: 'high' | 'medium' | 'low';
    status: 'hold' | 'open' | 'progress' | 'done';
    daily_task_activity_date: string | null;
    daily_task_activity_done_date: string | null;
    daily_task_activity_description: string | null;
    created_at: string;
    created_by: string;
    created_by_name: string;
    updated_at: string;
    updated_by: string | null;
    updated_by_name: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}

export interface DailyTaskHistory {
    daily_task_activity_history_id: string;
    daily_task_activitity_id: string;
    status_from: string | null;
    status_to: string;
    created_at: string;
    created_by: string;
    created_by_name: string;
    updated_at: string | null;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}

export interface DailyTaskPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface DailyTaskFormData {
    daily_task: string;
    priority: string;
    status: string;
    daily_task_activity_description?: string;
}

export interface DailyTaskListRequest {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    priority?: string;
}

export interface DailyTaskListResponse {
    success: boolean;
    data: DailyTask[];
    pagination: DailyTaskPagination;
}

export interface DailyTaskCreateResponse {
    success: boolean;
    data: DailyTask;
    message: string;
}

export interface DailyTaskDetailResponse {
    success: boolean;
    data: DailyTask;
}

export interface DailyTaskHistoryListRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    daily_task_activitity_id?: string;
}

export interface DailyTaskHistoryListResponse {
    success: boolean;
    data: DailyTaskHistory[];
    pagination: DailyTaskPagination;
}

// Status column config for kanban — status "progress" sesuai API
export const TASK_STATUSES = [
    { id: 'hold', title: 'Hold', color: 'bg-gray-100 border-gray-300' },
    { id: 'open', title: 'Open', color: 'bg-[#4F46E5] border-blue-300' },
    { id: 'progress', title: 'Progress', color: 'bg-[#F59E0B] border-yellow-300' },
    { id: 'done', title: 'Done', color: 'bg-[#22C55E] border-green-300' },
] as const;

export const PRIORITY_OPTIONS = [
    { value: 'high', label: 'High', color: 'text-red-600 bg-red-50 ring-red-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50 ring-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50 ring-green-600' },
] as const;
