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
    created_by_name: string;
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
    project_detail_devision_id?: string;
    page?: number;
    limit?: number;
    search?: string;
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
