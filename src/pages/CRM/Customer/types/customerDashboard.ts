export interface Brand {
    brand_id: string;
    brand_name_en: string;
}

export interface CustomerRequest {
    page: number;
    limit: number;
    search: string;
    customer_id?: string;
    sort_order: "asc" | "desc";
}

export interface BrandFilters {
    search: string;
    sort_order: 'asc' | 'desc' | '';
}

export interface BrandValidationErrors {
    brand_name_en?: string;
}
export interface BrandPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface BrandListResponse {
    success: boolean;
    message: string;
    data: Brand[];
    pagination: BrandPagination;
}

export interface BrandPayload {
    brand_name_en: string;
}

export interface BrandDetailResponse {
    success: boolean;
    message: string;
    data: Brand;
}

export interface BrandItem {
    brand_id: string;
    brand_name_en: string;
}

// DASHBOARD
export interface DashboardApiResponse {
    success: boolean;
    data: CustomerData[];
    pagination: BrandPagination;
}

export interface TerritoryInformation {
    island_name: string;
    group_name: string;
    area_name: string;
    iup_zone_name: string;
    iup_segmentation_name: string;
    iup_name: string;
}

export interface Unit {
    brand_id: string;
    brand_name: string;
    type: string;
    specification: string;
    physical_availability: string | null;
    quantity: number;
    engine: string | null;
}

export interface CustomerData {
    data_customer: CustomerInformation;

    data_iup_per_segmentasi: Segmentasi;
    data_unit_per_segmentasi_iup_aktif: Segmentasi;
    data_unit_per_segmentasi_iup_non_aktif: Segmentasi;

    data_unit_per_brand_iup_aktif: BrandUnit;
    data_unit_per_brand_iup_non_aktif: BrandUnit;

    data_rkab: RKAB[];

    total_rkab_iup_aktif: number;
    total_rkab_iup_non_aktif: number;

    data_quotations: Quotation[];
    data_sales_order: SalesOrder[];

    units: Unit[];

    data_teritory: TerritoryInformation[];
}

export interface CustomerInformation {
    customer_name: string;
    customer_id: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_state: string;
    customer_zip: string;
    customer_country: string;
    contact_person: string;
    customer_code: string;
    job_title: string;
    contact_persons: ContactPerson[];
}
export interface ContactPerson {
    contact_person_name: string;
    contact_person_email: string;
    contact_person_phone: string;
}

export interface Segmentasi {
    [key: string]: number;
}

export interface BrandUnit {
    [key: string]: number;
}

export interface RKAB {
    nama_iup: string;
    tahun: number;
    rkab: number;
    target_production: number;
    current_production: number;
}

export interface Quotation {
    customer_id: string;
    componen_product_name: string;
    manage_quotation_no: string;
    msi_product: string;
    msi_model: string;
    code_unique: string;
    quantity: number;
    min_price: number;
    max_price: number;
}

export interface SalesOrder {
    customer_id: string;
    componen_product_name: string;
    manage_sales_order_no: string;
    manage_sales_order_date: string;
    manage_sales_order_valid_date: string;
    msi_product: string;
    msi_model: string;
    code_unique: string;
    quantity: number;
    min_price: number;
    max_price: number;
}