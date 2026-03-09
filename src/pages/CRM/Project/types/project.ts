
export interface ProjectRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc' | '';
    sort_by?: 'updated_at' | 'created_at' | '';
    search?: string;
    status?: string;
    iup_customer_id?: string;
}

export interface ProjectAttachment {
    file_id: string;
    file_url: string;
}

export interface ProjectItem {
    project_id: string;
    iup_customer_id: string;
    customer_name: string | null;
    employee_name: string | null;
    project_name: string | null;
    propose_unit: number | null;
    propose_value: string | null;
    status: string;
    description: string;
    remark: string;
    employee_id: string;
    propose_solution: string;
    pain_point: string;
    property_attachment: any;
    updated_at: string;
    updated_by_name: string | null;
    devision_project_names: string[] | null;
    created_at: string;
    created_by: string;
    is_delete: boolean;
}

export interface ProjectItemDetails {
    project_id: string;
    iup_id: string;
    iup_name: string;
    iup_customer_id: string;
    customer_name: string | null;
    employee_name: string | null;
    project_name: string | null;
    propose_unit: number | null;
    propose_value: string | null;
    status: string;
    description: string;
    remark: string;
    employee_id: string;
    propose_solution: string;
    pain_point: string;
    property_attachment: ProjectAttachment[] | string | null;
    updated_at: string;
    updated_by: string | null;
    updated_by_name: string | null;
    created_at: string;
    created_by: string;
    is_delete: boolean;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ProjectListResponse {
    status: boolean;
    data: ProjectItem[];
    pagination: Pagination;
}

export interface ProjectFormData {
    iup_id?: string;
    iup_name?: string;
    iup_customer_id: string;
    customer_name?: string;
    project_name?: string;
    propose_unit: number | string;
    propose_value: number | string;
    status: string;
    description: string;
    remark: string;
    employee_id: string;
    employee_name?: string;
    propose_solution: string;
    pain_point: string;
    // Files untuk upload baru
    property_attachment_files?: File[];
    // File yang dihapus (existing)
    property_attachment_delete?: ProjectAttachment[];
    // Existing attachment dari server
    property_attachment?: ProjectAttachment[] | string | null;
}

export interface ProjectValidationErrors {
    iup_id?: string;
    iup_name?: string;
    iup_customer_id?: string;
    propose_unit?: string;
    propose_value?: string;
    status?: string;
    description?: string;
    remark?: string;
    employee_id?: string;
    sales_name?: string;
    propose_solution?: string;
    pain_point?: string;
    property_attachment?: string;
    general?: string;
}
