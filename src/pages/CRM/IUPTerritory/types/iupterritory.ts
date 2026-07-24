export interface IupRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc' | '';
    iup_id?: string;
}

export interface AuditFields {
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    is_delete: boolean;
}
export interface IupItem extends AuditFields {
    iup_selection_id: string;
    iup_id: string;
    company_name: string;
    iup_code: string;
    iup_longitude: string;
    iup_latitude: string;
    iup_address: string | null;
}
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface IupData {
    items: IupItem[];
    pagination: Pagination;
}
export interface IupResponse {
    success: boolean;
    data: IupData;
}
export interface IupFormData {
    company_name?: string;
    iup_id: string;
    // iup_address?: string | null;
    iup_latitude: string | null;
    iup_longitude: string | null;
}

export interface GeoData {
    pin: { lat: number; lng: number } | null;
}

export interface IupDetail {
    iup_id: string;
    company_name: string;
    iup_code: string;
    // iup_address?: string | null;
    iup_latitude: string | null;
    iup_longitude: string | null;
}