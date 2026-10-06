export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ActivityResponseBody {
    data?: unknown;
    success?: boolean;
    page?: number;
    page_size?: number;
    total_pages?: number;
    total_records?: number;
    [key: string]: unknown;
}

export interface ActivityItem {
    id?: string;
    client: string;
    type_data: string;
    url: string;
    function_name: string;
    module_name: string;
    payload: unknown;
    status_code: string;
    status_message: string;
    response: ActivityResponseBody | null;
    created_at: string;
    updated_at: string | null;
}

export interface ActivityRow extends ActivityItem {
    id: string;
    activityId?: string;
}

export interface ActivityDetailResponse {
    success: boolean;
    message: string;
    data?: ActivityItem;
}

export type ActivityListRequest = {
    page: number;
    limit: number;
    sort_by: 'created_at';
    sort_order: 'asc' | 'desc';
    search: string;
    type_data: string;
    client: string;
    status: string;
    module_name: string;
    aggregate_type: string;
    start_date: string;
    end_date: string;
}

export interface ActivityListResponse {
    success: boolean;
    message: string;
    data: {
        items?: ActivityItem[];
        pagination?: Pagination;
    };
}

export interface ActivityListResult {
    success: boolean;
    message: string;
    items: ActivityItem[];
    pagination: Pagination;
}
