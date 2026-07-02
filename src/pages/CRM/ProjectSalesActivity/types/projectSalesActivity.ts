// Activity/Transaction main types
export interface ProjectSalesActivityItem {
    project_sales_activity_id: string;
    project_id: string;
    employee_id: string;
    status: string | null;

    latitude: string;
    longitude: string;

    created_at: string;
    created_by: string;
    created_by_name: string;

    updated_at: string | null;
    updated_by: string | null;
    updated_by_name: string | null;

    deleted_at: string | null;
    deleted_by: string | null;

    is_delete: boolean;

    employee_name: string;
    project_name: string;
    customer_name: string;
    iup_name: string;
}
export interface ProjectSalesActivitySummaryItem {
    project_id: string;
    employee_id: string;

    image: string | null;
    image_path: string | null;

    description: string;

    latitude: string;
    longitude: string;

    created_at: string;

    project_name: string;
    status: string;

    employee_name: string;
    customer_name: string;
    iup_name: string;
}
// export interface ProjectSalesActivityDetailItem {
//     project_sales_activity_id: string;
//     project_id: string;
//     employee_id: string;
//     status: string | null;

//     image: string | null;
//     image_path: string | null;

//     description: string;

//     latitude: string;
//     longitude: string;

//     created_at: string;
//     created_by: string;
//     created_by_name: string;

//     updated_at: string | null;
//     updated_by: string | null;
//     updated_by_name: string | null;

//     deleted_at: string | null;
//     deleted_by: string | null;

//     is_delete: boolean;

//     employee_name: string;
//     project_name: string;
//     customer_name: string;
//     iup_name: string;
// }

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface ProjectSalesActivityRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    project_id?: string;
    iup_id?: string;
    iup_customer_id?: string;
    project_status?: string;
    start_date?: string;
    end_date?: string;
}

export interface ProjectSalesActivityResponse {
    success: boolean;
    data: ProjectSalesActivityItem[];
    pagination: Pagination;
}

// Create/Update response
export interface ProjectSalesActivityCreateResponse {
    success: boolean;
    data: ProjectSalesActivityItem;
    message: string;
}

