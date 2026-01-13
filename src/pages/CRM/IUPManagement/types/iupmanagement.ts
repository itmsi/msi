
export interface IupRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc' | '';
    sort_by?: 'updated_at' | 'created_at' | '';
    search?: string;
    status?: string;
    is_admin?: boolean;
}
export interface IupFilters {
    search: string;
    sort_order: 'asc' | 'desc' | '';
}
export interface IupSummary {
    total_iup: number;
    total_iup_aktif: number;
    total_contractor: number;
    total_iup_no_contractor: number;
    total_iup_have_contractor: number;
}

export interface CustomerInfo {
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    contact_person: string;
    segmentation_name_en: string;
    number_of_fleet: string;
    status: string;
}

export interface IupItemDetails {
    iup_id: string;
    iup_name: string;
    iup_status: string;
    iup_zone_id: string;
    business_type: string;
    permit_type: string;
    segmentation_id: string;
    segmentation_name_en: string;
    province_name: string;
    pic: string;
    mine_location: string;
    area_size_ha: string;
    regency_name: string;
    sk_number: string;
    authorized_officer: string;
    activity_stage: string;
    sk_end_date: string;
    sk_effective_date: string;
    company_full_name: string;
    rkab: string | null;
    iup_zone_name: string;
    area_id: string;
    area_name: string;
    group_id: string;
    group_name: string;
    island_id: string;
    island_name: string;
    customer_count: string;
    customers: CustomerInfo[];
}

export interface IupItem {
    iup_id: string;
    iup_name: string;
    iup_status: string;
    iup_zone_name: string;
    area_name: string;
    group_name: string;
    island_name: string;
    contractor_count: string;
    updated_at: string;
    updated_by_name: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface IupListResponse {
    success: boolean;
    Summary: IupSummary;
    data: IupItem[];
    pagination: Pagination;
}

export interface IupFilters {
    status?: string;
    search: string;
    sort_order: 'asc' | 'desc' | '';
}

export interface IupManagementFormData {
    company_name: string;
    iup_zone_id: string;
    business_type: string;
    permit_type: string;
    segmentation_id: string;
    segmentation_name_en: string;
    province_name: string;
    pic: string;
    mine_location: string;
    area_size_ha: number | string;
    regency_name: string;
    sk_number: string;
    authorized_officer: string;
    activity_stage: string;
    sk_end_date: string;
    sk_effective_date: string;
    company_full_name: string;
    rkab: string;
    status: string;
    // Territory selection fields
    island_id?: string;
    island_name?: string;
    group_id?: string;
    group_name?: string;
    area_id?: string;
    area_name?: string;
    iup_zone_name?: string;
}