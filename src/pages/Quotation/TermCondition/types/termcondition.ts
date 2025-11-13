export interface TermConditionResponse {
    status: boolean;
    message: string;
    data: TermConditionData;
}

export interface TermConditionData {
    items: TermCondition[];
    pagination: ApiPagination;
}

export interface TermCondition {
    term_content_id: string;
    term_content_title: string;
    term_content_directory: string;
    term_content_payload?: string; // Rich text content for the editor
    created_by: string | null;
    updated_by: string | null;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_delete: boolean;
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
}

export interface ApiPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface TermConditionRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc';
    search: string;
}

export interface TermConditionFormData {
    term_content_title: string;
    term_content_directory: string;
}

export interface TermConditionValidationErrors {
    term_content_title?: string;
    term_content_directory?: string;
}
