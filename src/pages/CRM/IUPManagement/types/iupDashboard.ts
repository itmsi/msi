
export interface IupSalesPic {
    id: string;
    name: string;
}

export interface IupCustomerRkab {
    year: number;
    target_production: number;
    current_production: number;
}

export interface IupCustomer {
    iup_customer_id: string;
    customer_id: string;
    customer_name: string;
    customer_phone: string | null;
    customer_code: string | null;
    contact_person: string | null;
    segmentation_name_en: string;
    number_of_fleet: string;
    status: string;
    rkab: IupCustomerRkab | string;
}

export interface IupBrandUnit {
    iup_brand_unit_id: string;
    iup_id: string;
    iup_brand_unit_name: string;
    iup_brand_unit_qty: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_delete: boolean;
}

export interface IupRkabYear {
    iup_rkab_id: string;
    iup_id: string;
    iup_rkab_year: string;
    iup_rkab_current_production: string;
    iup_rkab_target_production: string;
    created_at: string;
    updated_at: string;
    is_delete: boolean;
}

export interface IupZonaSite {
    iup_zona_site_id: string;
    iup_id: string;
    iup_zona_site_name: string;
    iup_zona_site_date_last_survey: string | null;
    iup_zona_site_file: unknown[] | null;
    iup_zona_site_description: string | null;
    summary_prompt_ai: string | null;
    summary_response_ai: string | null;
    session_id: string | null;
    guide: string | null;
    master_iup_zone_site_id: string | null;
}

export interface IupVisitHistory {
    iup_visit_history_id: string;
    iup_id: string;
    iup_visit_history_date: string;
    iup_visit_history_title: string;
    iup_visit_history_phone_number: string | null;
    iup_visit_history_file: unknown[] | null;
    iup_visit_history_description: string | null;
    iup_visit_history_latitude: string | null;
    iup_visit_history_longitude: string | null;
    employee_id: string | null;
    employee_name: string | null;
}

export interface IupSurveyLog {
    iup_survey_id: string;
    user_phone: string;
    user_name: string;
    chat_date: string;
    source_type: string;
    source_link: string | null;
    file_name: string | null;
    description: string | null;
    summary_prompt_ai: string | null;
    summary_response_ai: string | null;
    session_id: string | null;
}

export interface IupDetail {
    iup_id: string;
    iup_code: string;
    iup_name: string;
    iup_name_code: string;
    iup_status: string;
    business_type: string;
    permit_type: string;
    iup_segmentation_name: string;
    segmentation_name_en: string;
    province_name: string;
    pic: string | null;
    mine_location: string;
    area_size_ha: string;
    regency_name: string;
    sk_number: string;
    authorized_officer: string;
    activity_stage: string;
    sk_end_date: string;
    sk_effective_date: string;
    company_full_name: string;
    rkab: string;
    sales_pic: IupSalesPic[];
    iup_zone_name: string;
    area_name: string;
    group_name: string;
    island_name: string;
    customer_count: string;
    customers: IupCustomer[];
    iup_brand_unit: IupBrandUnit[];
    iup_rkab: IupRkabYear[];
    iup_zona_site: IupZonaSite[];
    iup_visit_history: IupVisitHistory[];
    iup_survey: IupSurveyLog[];
}

export interface GetIupDetailResponse {
    success: boolean;
    data: IupDetail;
}
