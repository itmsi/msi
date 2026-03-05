export interface TaskProjectDevision {
    task_project_devision_id: string;
    project_detail_devision_id: string;
    title: string;
    description: string;
    employee_id: string;
    employee_name: string;
    date_transaction: string;
    created_at: string;
    created_by: string;
    updated_at: string | null;
    updated_by: string | null;
    updated_by_name: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}

export interface TaskProjectDevisionRequest {
    project_detail_devision_id: string;
    title: string;
    description: string;
    employee_id: string;
    date_transaction: string;
}

export interface TaskProjectDevisionQuery {
    project_id?: string | null;
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface TaskProjectDevisionResponse {
    success: boolean;
    data: TaskProjectDevision[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
