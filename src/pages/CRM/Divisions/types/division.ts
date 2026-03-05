export interface Division {
    devision_project_id: string;
    devision_project_name: string;
    updated_at?: string;
    updated_by_name?: string;
}

export interface DivisionRequest {
    page: number;
    limit: number;
    search: string;
    sort_order: "asc" | "desc";
}

export interface DivisionFilters {
    search: string;
    sort_order: 'asc' | 'desc' | '';
}

export interface DivisionValidationErrors {
    devision_project_name?: string;
}
export interface DivisionPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface DivisionListResponse {
    success: boolean;
    message: string;
    data: Division[];
    pagination: DivisionPagination;
}

export interface DivisionPayload {
    devision_project_name?: string;
    devision_project_id?: string;
}

export interface DivisionDetailResponse {
    success: boolean;
    message: string;
    data: Division;
    timestamp: string;
}
