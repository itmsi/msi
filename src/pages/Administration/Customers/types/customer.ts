export interface Customer {
    customer_id: string;
    customer_code?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city?: string;
    customer_state?: string;
    customer_zip?: string;
    customer_country?: string;
    contact_person?: string;
    job_title?: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string | null;
    updated_by?: string | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    is_delete?: boolean;
    contact_persons?: ContactPerson[];
}

export interface CustomerPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CustomerResponse {
    success: boolean;
    message: string;
    data: {
        data: Customer[];
        pagination: CustomerPagination;
    };
}

export interface CustomerRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc';
    search: string;
}

export interface ContactPerson {
    contact_person_name?: string;
    contact_person_email?: string;
    contact_person_phone?: string;
    contact_person_position?: string;
}

// Customer form data for create/update
export interface CustomerFormData {
    customer_code?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_state: string;
    customer_zip: string;
    customer_country: string;
    job_title?: string;
    contact_person?: string;
    contact_persons?: ContactPerson[];
}

// Customer validation errors
export interface CustomerValidationErrors {
    customer_code?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    customer_state?: string;
    customer_zip?: string;
    customer_country?: string;
    job_title?: string;
    contact_person?: string;
}