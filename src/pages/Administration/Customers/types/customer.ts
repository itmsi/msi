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
    name_tax_buyer?: string;
    no_tax_buyer?: string;
    type_tax_buyer?: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string | null;
    updated_by?: string | null;
    updated_by_name?: string | null;
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

export interface ReferenceRequest {
    page: number;
    limit: number;
    search: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    type: string;
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
    name_tax_buyer?: string;
    no_tax_buyer?: string;
    type_tax_buyer?: string;
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
    name_tax_buyer?: string;
    no_tax_buyer?: string;
    type_tax_buyer?: string;
    contact_person?: string;
}

export interface DuplicateItem {
  requestName: string;
  matchedName: string;
  matchType: "identical" | "similar" | string;
  similarity: string;
}

export interface DuplicateData {
  hasDuplicates: boolean;
  duplicates: DuplicateItem[];
  message: string;
  requestCount: number;
}

export interface DuplicateCustomerResponse {
  success: boolean;
  message: string;
  data: DuplicateData;
}
export interface CheckDuplicateCustomerPayload {
  customer_name: string[];
}

export interface TaxBuyerTypeOption {
    code: string;
    description: string;
}