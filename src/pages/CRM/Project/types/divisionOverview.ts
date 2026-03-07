export interface ProjectRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc' | '';
    sort_by?: 'updated_at' | 'created_at' | '';
    search?: string;
    project_id?: string;
}

export interface ProjectAttachment {
    file_id: string;
    file_url: string;
}

// Division Overview Types
export interface DivisionOverviewItem {
    project_detail_id: string;
    project_id: string;
    project_detail_division_id: string;
    division_project_id: string;
    devision_project_name: string;
    remarks: string;
    property_attachment: ProjectAttachment[] | null;
}

export interface DivisionOverviewResponse {
    status: boolean;
    message: string;
    data: DivisionOverviewItem[];
    pagination: Pagination;
}

export interface DivisionOverviewFormData {
    remarks: string;
    property_attachment_files?: File[];
    property_attachment_delete?: ProjectAttachment[];
    existing_attachments?: ProjectAttachment[];
}

export interface Pagination {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
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
    property_attachment: ProjectAttachment[] | null;
    created_at: string;
    updated_at: string;
}

export interface ProjectItemDetails extends ProjectItem {
    iup_id: string;
    iup_name: string;
    customer_id: string;
}