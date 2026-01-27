export interface ContractorListRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc';
    search: string;
    mine_type?: 'batu bara' | 'nikel' | 'lainnya' | '';
    status?: 'active' | 'inactive' | '';
    is_admin?: boolean;
    employee_id?: string;
    iup_id?: string;
    type?: string;
}

export interface Contractor {
    iup_customer_id: string;
    customer_iup_name: string;
    iup_id: string;
    customer_id: string;
    customer_code?: string;
    rkab: string;
    armada: number;
    segmentation_name_en: string;
    business_project_bim: string;
    status: 'active' | 'inactive';
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    island_name: string;
    group_name: string;
    area_name: string;
    iup_zone_name: string;
    iup_name: string;
    updated_by_name: string;
    updated_at: string;
    activity_status: string;
    bim_persen?: string | number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ContractorListResponse {
    success: boolean;
    data: Contractor[];
    pagination: Pagination;
}

export interface ContractorUnit {
    id?: number;
    volume?: string;
    unit?: string;
    price?: string;
    amount?: string;
    description?: string;
    brand_id?: string | null;
    brand_name?: string | null;
    brand?: any;
    type?: string;
    specification?: string;
    engine?: string;
    quantity?: number;
    physical_availability?: string;
}

export interface ContractorDetailResponse {
    success: boolean;
    data: {
        customer_data: {
            customer_id: string;
            customer_code?: string | null;
            customer_name: string;
            customer_email: string | null;
            customer_phone: string | null;
            job_title: string | null;
            contact_person: string | null;
            customer_address: string | null;
            customer_city: string | null;
            customer_state: string | null;
            customer_zip: string | null;
            customer_country: string | null;
            contact_persons: contactPerson[];
        };
        iup_customers: {
            iup_customer_id: string;
            iup_id: string;
            iup_name?: string;
            parent_contractor_id?: string;
            parent_contractor_name?: string;
            segmentation_id: string;
            rkab: string;
            achievement_production_bim: string | null;
            business_project_bim: string;
            unit_brand_bim: string;
            unit_quantity_bim: string;
            unit_type_bim: string;
            unit_specification_bim: string;
            physical_availability_bim: string | null;
            ritase: string;
            hauling_distance: string;
            barging_distance: string;
            tonase: string | null;
            working_days: string;
            price_per_ton: string | null;
            fuel_consumption: string | null;
            tire_cost: string | null;
            sparepart_cost: string | null;
            manpower_cost: string | null;
            activity_status: string[];
            status: string;
            type: string;
            units: Array<{
                brand_id: string;
                brand_name: string;
                type: string;
                specification: string;
                physical_availability: string | null;
                quantity: number;
                engine: string | null;
            }>;
            properties?: any;
        };
    };
}

export interface ContractorFormData {
    customer_data: {
        customer_id?: string;
        customer_code?: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
        job_title: string;
        contact_person: string;
        customer_address: string;
        customer_city: string;
        customer_state: string;
        customer_zip: string;
        customer_country: string;
        contact_persons: contactPerson[]
    };
    iup_customers: {
        iup_id: string;
        iup_name?: string;
        segmentation_id: string;
        segmentation_name?: string;
        properties: any; // Added dynamic entries
        achievement_production_bim: string;
        business_project_bim: string;
        unit_brand_bim: string;
        unit_quantity_bim: string;
        unit_type_bim: string;
        unit_specification_bim: string;
        physical_availability_bim: string;
        ritase: string;
        hauling_distance: string;
        barging_distance: string;
        tonase: string;
        working_days: string;
        price_per_ton: string;
        fuel_consumption: string;
        tire_cost: string;
        sparepart_cost: string;
        manpower_cost: string;
        status: 'active' | 'inactive';
        type: 'contractor' | 'sub_contractor' | '';
        activity_status: string[];
        contact_persons: contactPerson[];
        units: ContractorUnit[];
        parent_contractor_id?: string;
        parent_contractor_name?: string;
    };
}
export interface RkabEntry {
    year: number;
    current_production: number;
    target_production: number;
}

export interface contactPerson {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
}