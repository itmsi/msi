
export interface IupRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc' | '';
    sort_by?: 'updated_at' | 'created_at' | '';
    search?: string;
    status?: string;
    segmentation_id?: string;
    island_id?: string;
    group_id?: string;
    area_id?: string;
    iup_zone_id?: string;
    iup_segment_id?: string;
    is_contractor_count?: string | null;
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
    iup_customer_id: string;
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
    iup_segment_id?: string;
    customer_count: string;
    customers: CustomerInfo[];
}

export interface IupItem {
    iup_id: string;
    iup_name: string;
    iup_status: string;
    iup_zone_name: string;
    segmentation_name: string;
    iup_segmentation_name: string;
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
    iup_segment_id?: string;
    iup_id?: string;
}
export interface Contractor {
    iup_customer_id: string;
    customer_iup_name: string;
    customer_name?: string;
}

// ================================
// ZONE AREA
// Reusable audit fields
export interface AuditFields {
    created_at?: string;
    created_by?: string | null;
    updated_at?: string;
    updated_by?: string | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    is_delete?: boolean;
}

// File item
export interface IupZonaSiteFile {
    file_link: string;
}

// Main item
// export interface IupZonaSiteItem extends AuditFields {
export interface IupZonaSiteItem {
    iup_zona_site_id: string;
    iup_id: string;
    iup_zona_site_name: string;
    iup_zona_site_date_last_survey: string;
    iup_zona_site_description: string;
    iup_zona_site_file: IupZonaSiteFile[] | [];
}

// Final response
export interface IupZonaSiteResponse {
    success: boolean;
    data: IupZonaSiteItem[];
    pagination: Pagination;
}

// ==================
// GET ZONE
export interface ZonaSiteFile {
    file_link: string;
}
export interface ZonaSite extends AuditFields {
    iup_zona_site_id: string;
    iup_id: string;
    iup_zona_site_name: string;
    iup_zona_site_date_last_survey: string; // ISO string
    iup_zona_site_file: ZonaSiteFile[];
}
export interface ZonaSiteListResponse {
    success: boolean;
    data: ZonaSite[];
    pagination: Pagination;
}
export interface ZonaSiteView {
    id: string;
    iupId: string;
    name: string;
    lastSurveyDate: Date;
    files: string[];
}
export interface Evidence {
    iup_zona_site_date_last_survey: string;
    iup_zona_site_description: string;
    iup_zona_site_name?: string;
    fileLinks: { file_link: string }[];
}

export interface Zone {
    id: string;
    iup_zona_site_id?: string;
    name: string;
    evidence: Evidence;
}

// ==================
// payload Create GET ZONE
export interface ZonaSiteFilePayload {
    file_link: string;
}

export interface ZonaSitePayload {
    iup_zona_site_id?: string;
    iup_id: string;
    iup_zona_site_name: string;
    iup_zona_site_description: string;
    iup_zona_site_date_last_survey: string; // format: YYYY-MM-DD
    iup_zona_site_file: ZonaSiteFilePayload[];
}
export interface ZoneValidationErrors {
    iup_zona_site_date_last_survey?: string;
}
// ============================================
// Types untuk modul IUP RKAB
// ============================================

export interface IupRkab {
    iup_rkab_id: string;
    iup_id: string;
    iup_rkab_year: string;
    iup_rkab_current_production: string;
    iup_rkab_target_production: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
    updated_by?: string;
    deleted_at?: string | null;
    deleted_by?: string | null;
    is_delete?: boolean;
}


// ---------- GET (list) ----------
export interface payloadRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc' | '';
    sort_by?: 'updated_at' | 'created_at' | '';
    search?: string;
    iup_id?: string;
}

export interface GetIupRkabResponse {
    success: boolean;
    data: IupRkab[];
    pagination: Pagination;
}

// ---------- CREATE ----------
export interface CreateIupRkabPayload {
    iup_id: string;
    iup_rkab_year: string;
    iup_rkab_current_production: string;
    iup_rkab_target_production: string;
}

// ---------- UPDATE ----------
// Struktur body sama dengan create, dibuat alias agar jelas maksudnya
export type UpdateIupRkabPayload = CreateIupRkabPayload;

// Form state type — new entries belum punya iup_rkab_id
export interface IupRkabFormItem {
    iup_rkab_id?: string;
    iup_rkab_year: string;
    iup_rkab_current_production: string;
    iup_rkab_target_production: string;
}

// ---------- Response generik untuk create/update/delete ----------
export interface IupRkabResponse {
    success: boolean;
    message?: string;
    data?: IupRkab;
}
// ============================================
// Types untuk modul IUP RKAB UNIT
// ============================================
export interface IupBrandUnit {
    iup_brand_unit_id: string;
    iup_id: string;
    company_name: string | null;
    iup_brand_unit_name: string;
    iup_brand_unit_qty: string;
}

export interface IupRkab {
    iup_rkab_id: string;
    iup_id: string;
    iup_rkab_year: string;
    iup_rkab_current_production: string;
    iup_rkab_target_production: string;
}

export interface IupContractor {
    iup_contractor_id: string;
    iup_id: string;
    iup_contractor_name: string;
}

export interface IupRkabUnitResponse {
    success: boolean;
    iup_brand_units: IupBrandUnit[];
    iup_rkabs: IupRkab[];
    iup_contractors: IupContractor[];
}
export interface BrandUnitForm {
    name: string;
    qty: number;
}
export interface ContractorForm {
    id?: string;
    name: string;
}

export interface RkabForm {
    year: number;
    currentProduction: number;
    targetProduction: number;
}

export interface BrandUnitFormPayload {
    iup_brand_unit_name: string;
    iup_brand_unit_qty: number;
}
export interface RkabFormPayload {
    iup_rkab_year: number;
    iup_rkab_current_production: number;
    iup_rkab_target_production: number;
}
export interface ContractorFormPayload {
    iup_contractor_id?: string;
    iup_contractor_name: string;
}
export interface IupRkabUnitForm {
    iup_id: string;
    iup_brand_units: BrandUnitFormPayload[];
    iup_rkabs: RkabFormPayload[];
    iup_contractors: ContractorFormPayload[];
}
export interface BrandUnitErrors {
    name?: string;
    qty?: string;
}

export interface RkabErrors {
    year?: string;
    currentProduction?: string;
    targetProduction?: string;
}
export interface ContractorErrors {
    name?: string;
}

// ============================
// HISTORY VISIT

export interface VisitImage {
    file_link: string;
}
 
export interface VisitHistoryItem {
    iup_visit_history_id: string;
    iup_id: string;
    employee_id: string | null;
    employee_name: string;
    date: string;
    title: string;
    phone_number: string;
    image: VisitImage[];
    description: string;
    latitude: string | null;
    longitude: string | null;
}
 
export interface VisitPayload {
    iup_visit_history_id?: string;
    iup_id: string;
    title: string;
    date: string;
    employee_id: string;
    phone_number: string;
    latitude: string;
    longitude: string;
    image: VisitImage[];
    description: string;
}
 
export interface VisitHistoryResponse {
    success: boolean;
    data: VisitHistoryItem[];
    pagination: Pagination;
}




