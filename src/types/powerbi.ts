// PowerBI Dashboard Types

export interface PowerBIDashboard {
    powerbi_id: string;
    category_id: string;
    title: string;
    link: string;
    status: 'active' | 'inactive';
    file: string;
    description: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    is_delete: boolean;
    created_by: string | null;
    updated_by: string | null;
    deleted_by: string | null;
    category_name: string;
    employeeHasPowerBi?: EmployeeHasPowerBi[];
}

export interface EmployeeHasPowerBi {
    employee_id: string;
}

export interface PowerBICategory {
    category_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    is_delete: boolean;
    created_by: string | null;
    updated_by: string | null;
    deleted_by: string | null;
}

export interface PowerBIPagination {
    page: number;
    limit: number;
    totalPages: number | null;
    total?: number; // Total number of records
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
}

export interface PowerBIListRequest {
    page: number;
    limit: number;
    search?: string;
    category_id?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface DashboardViewRequest {
    page: number;
    limit: number;
    search?: string;
    category_id?: string;
    status: 'active';
}

export interface PowerBIListResponse {
    success: boolean;
    message: string;
    data: PowerBIDashboard[];
    pagination: PowerBIPagination;
}

export interface PowerBICategoryResponse {
    success: boolean;
    message: string;
    data: PowerBICategory[];
    pagination: PowerBIPagination;
}

export interface PowerBIFilters {
    search: string;
    category_id: string;
    sort_by: string;
    sort_order: 'asc' | 'desc' | '';
}

// Type for category select options
export interface CategoryOption {
    value: string;
    label: string;
}

// Category Management Types
export interface CategoryListRequest {
    page: number;
    limit: number;
    search?: string;
}

export interface CategoryListResponse {
    success: boolean;
    message: string;
    data: PowerBICategory[];
    pagination: PowerBIPagination;
}

export interface CategoryFilters {
    search: string;
}

// MANAGE POWER BI