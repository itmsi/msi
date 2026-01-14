// Quotation Types
export interface QuotationItemSpecification {
    manage_quotation_item_specification_label: string;
    manage_quotation_item_specification_value: string;
}

export interface QuotationItemAccessory {
    accessory_id: string;
    quantity: number;
    description: string;
    accessory_part_number: string;
    accessory_part_name: string;
    accessory_specification: string;
    accessory_brand: string;
    accessory_remark: string;
    accessory_region: string;
    accessory_description: string;
}

export interface QuotationItem {
    componen_product_id: string;
    componen_product_name: string;
    code_unique?: string;
    segment: string;
    msi_model: string;
    msi_product: string;
    wheel_no: string;
    engine?: string;
    volume?: string;
    horse_power?: string;
    market_price?: string;
    quantity: number;
    price: string;
    product_type?: string;
    componen_product_unit_model?: string;
    selling_price_star_1?: string;
    selling_price_star_2?: string;
    selling_price_star_3?: string;
    selling_price_star_4?: string;
    selling_price_star_5?: string;
    total: string;
    description: string;
    image: string;
    manage_quotation_item_accessories?: QuotationItemAccessory[]; // Nested accessories
    manage_quotation_item_specifications?: QuotationItemSpecification[]; // Nested specifications
}

export interface QuotationAccessory {
    accessory_id: string;
    accessory_part_name: string;
    accessory_part_number: string;
    accessory_brand: string;
    accessory_specification: string;
    quantity: number;
    description: string;
}

export interface QuotationFormData {
    customer_id: string;
    employee_id: string;
    island_id: string;
    bank_account_id?: string;
    bank_account_name?: string;
    bank_account_number?: string;
    bank_account_type?: string;
    bank_account_bank_name?: string; // Added for API payload
    manage_quotation_date: string;
    manage_quotation_valid_date: string;
    manage_quotation_grand_total?: string;
    manage_quotation_grand_total_before?: string; // Stores grand total before mutation
    manage_quotation_mutation_type?: 'plus' | 'minus' | ''; // Type of mutation (add or subtract)
    manage_quotation_mutation_nominal?: string; // Amount to add/subtract
    manage_quotation_ppn?: string;
    manage_quotation_delivery_fee?: string;
    manage_quotation_other?: string;
    manage_quotation_payment_presentase?: string;
    manage_quotation_payment_nominal?: string;
    manage_quotation_description?: string;
    manage_quotation_shipping_term?: string;
    manage_quotation_franco?: string;
    manage_quotation_lead_time?: string;
    quotation_for?: 'customer' | 'leasing';  // New field: quotation type
    star?: string;                            // New field: star rating/input
    term_content_id?: string;
    term_content_directory?: string;
    include_aftersales_page?: boolean; // Added for API payload
    include_msf_page?: boolean;        // Added for API payload
    status: 'submit' | 'draft';
    manage_quotation_items: QuotationItem[];
    manage_quotation_item_accessories: QuotationAccessory[];
}

// Select option interfaces
export interface CustomerOption {
    value: string;
    label: string;
    email?: string;
    phone?: string;
}

export interface EmployeeOption {
    value: string;
    label: string;
    email?: string;
    department?: string;
}

export interface ProductOption {
    value: string;
    label: string;
    code: string;
    price?: string;
    description?: string;
}

export interface AccessoryOption {
    value: string;
    label: string;
    code: string;
    price?: string;
    description?: string;
}

export interface BankOption {
    value: string;
    label: string;
    bank_account_name: string;
    bank_account_number: string;
    bank_account_type: string;
}

// API Response types
export interface CustomerResponse {
    success: boolean;
    data: {
        data: Array<{
            customer_id: string;
            customer_name: string;
            customer_email: string;
            customer_phone: string;
        }>;
        pagination: {
            current_page: number;
            per_page: number;
            total: number;
        };
    };
}

export interface EmployeeResponse {
    success: boolean;
    data: {
        data: Array<{
            employee_id: string;
            employee_name: string;
            employee_email: string;
            department_name?: string;
        }>;
        pagination: {
            current_page: number;
            per_page: number;
            total: number;
        };
    };
}

export interface SpecificationResponse {
    success: boolean;
    data: Array<{
        specification_id: string;
        specification_name: string;
        specification_code: string;
        specification_price?: string;
        specification_description?: string;
    }>;
}

export interface AccessoriesResponse {
    success: boolean;
    data: Array<{
        accessories_id: string;
        accessories_name: string;
        accessories_code: string;
        accessories_price?: string;
        accessories_description?: string;
    }>;
}

export interface BankResponse {
    success: boolean;
    data: {
        data: Array<{
            bank_account_id: string;
            bank_account_name: string;
            bank_account_number: string;
            bank_account_type: string;
        }>;
        pagination: {
            current_page: number;
            per_page: number;
            total: number;
        };
    };
}

export interface QuotationValidationErrors {
    customer_id?: string;
    employee_id?: string;
    island_id?: string;
    bank_account_id?: string;
    manage_quotation_date?: string;
    manage_quotation_valid_date?: string;
    manage_quotation_delivery_fee?: string;
    manage_quotation_other?: string;
    manage_quotation_payment_presentase?: string;
    manage_quotation_description?: string;
    manage_quotation_items?: string;
}

export interface QuotationRequest {
    page: number;
    limit: number;
    sort_order: '' | 'asc' | 'desc';
    status?: 'submit' | 'draft' | 'rejected' | '';
    search: string;
}
export interface QuotationFilters {
    search: string;
    sort_order: 'asc' | 'desc' | '';
    status: 'submit' | 'draft' | 'rejected' | '';
}
export interface QuotationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ManageQuotationListResponse {
    status: boolean;
    message: string;
    data: {
        items: ManageQuotationItem[];
        pagination: QuotationPagination;
    };
}

export interface ManageQuotationItem {
    manage_quotation_id: string;
    manage_quotation_no: string;
    customer_id: string;
    customer_name: string;
    employee_id: string;
    employee_name: string;
    manage_quotation_date: string;
    manage_quotation_valid_date: string;
    manage_quotation_grand_total: string;
    manage_quotation_ppn: string;
    manage_quotation_delivery_fee: string;
    manage_quotation_other: string;
    manage_quotation_payment_presentase: string;
    manage_quotation_payment_nominal: string;
    manage_quotation_description: string | null;
    manage_quotation_shipping_term: string | null;
    manage_quotation_franco: string | null;
    manage_quotation_lead_time: string | null;
    bank_account_name: string;
    bank_account_number: string;
    bank_account_bank_name: string;
    term_content_id: string;
    term_content_directory: string;
    include_aftersales_page: boolean;
    include_msf_page: boolean;
    status: string;
    created_by: string;
    updated_by: string | null;
    updated_by_name?: string;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_delete: boolean;
}
export interface ManageQuotationResponse {
    status: boolean;
    message: string;
    data: ManageQuotationData;
}

export interface ManageQuotationData {
    manage_quotation_id: string;
    manage_quotation_no: string;
    customer_id: string;
    island_id: string;
    contact_person: string;
    customer_phone: string;
    customer_address: string;
    employee_phone: string;
    employee_id: string;
    manage_quotation_date: string;
    manage_quotation_valid_date: string;
    manage_quotation_grand_total_before: string;
    manage_quotation_mutation_type: 'plus' | 'minus';
    manage_quotation_mutation_nominal: string;
    manage_quotation_grand_total: string;
    manage_quotation_ppn: string;
    manage_quotation_delivery_fee: string;
    manage_quotation_other: string;
    manage_quotation_payment_presentase: string;
    manage_quotation_payment_nominal: string;
    manage_quotation_description: string | null;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
    status: string;
    manage_quotation_shipping_term: string;
    manage_quotation_franco: string;
    manage_quotation_lead_time: string;
    quotation_for?: 'customer' | 'leasing'; 
    star?: string; 
    term_content_directory: string;
    term_content_payload?: string;
    term_content_id: string;
    include_aftersales_page: boolean;
    include_msf_page: boolean;
    bank_account_id: string;
    bank_account_name: string;
    bank_account_number: string;
    bank_account_bank_name: string;
    customer_name: string;
    employee_name: string;

    manage_quotation_items: ManageQuotationItem[];
}
export interface ManageQuotationItem {
    manage_quotation_item_id: string;
    manage_quotation_id: string;
    componen_product_id: string;
    code_unique: string;
    segment: string;
    msi_model: string;
    wheel_no: string;
    engine: string;
    volume: string;
    horse_power: string;
    market_price: string;
    componen_product_name: string;
    quantity: number;
    price: string;
    total: string;
    description: string;
    created_by: string;
    updated_by: string | null;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_delete: boolean;

    cp_code_unique: string;
    cp_segment: string;
    cp_msi_model: string;
    cp_wheel_no: string;
    cp_engine: string;
    cp_volume: string;
    cp_horse_power: string;
    cp_market_price: string;
    cp_componen_product_name: string;
    cp_image: string;

    manage_quotation_item_accessories: QuotationItemAccessory[];
    manage_quotation_item_specifications: QuotationItemSpecification[];
}

export interface ManageQuotationListResponsePDF {
    status: boolean;
    message: string;
    data: {
        items: ManageQuotationDataPDF[];
        pagination: QuotationPagination;
    };
}
export interface ManageQuotationDataPDF {
    // manage_quotation_id: string;
    manage_quotation_no: string;
    customer_id: string;
    island_id: string;
    island_name: string;
    contact_person: string;
    customer_phone: string;
    customer_address: string;
    employee_phone: string;
    employee_id: string;
    manage_quotation_date: string;
    manage_quotation_valid_date: string;
    manage_quotation_grand_total: string;
    manage_quotation_ppn: string;
    manage_quotation_delivery_fee: string;
    manage_quotation_other: string;
    manage_quotation_payment_presentase: string;
    manage_quotation_payment_nominal: string;
    manage_quotation_description: string | null;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
    status: string;
    manage_quotation_shipping_term: string;
    manage_quotation_franco: string;
    manage_quotation_lead_time: string;
    term_content_directory: string;
    term_content_payload?: string;
    // term_content_payload: {
    //     content: string;
    // };
    term_content_id: string;
    include_aftersales_page: boolean;
    include_msf_page: boolean;
    bank_account_name: string;
    bank_account_number: string;
    bank_account_bank_name: string;
    customer_name: string;
    employee_name: string;

    manage_quotation_items: ManageQuotationItemPDF[];
}

export interface ManageQuotationItemPDF {
    manage_quotation_id: string;
    manage_quotation_no: string;
    customer_id: string;
    island_id: string;
    customer_name: string;
    employee_id: string;
    employee_name: string;
    manage_quotation_date: string;
    manage_quotation_valid_date: string;
    manage_quotation_grand_total: string;
    manage_quotation_ppn: string;
    manage_quotation_delivery_fee: string;
    manage_quotation_other: string;
    manage_quotation_payment_presentase: string;
    manage_quotation_payment_nominal: string;
    manage_quotation_description: string | null;
    manage_quotation_shipping_term: string | null;
    manage_quotation_franco: string | null;
    manage_quotation_lead_time: string | null;
    componen_product_unit_model: string;
    componen_product_name: string;
    product_type: string;
    quantity: number;
    price: string;
    total: string;
    bank_account_name: string;
    bank_account_number: string;
    bank_account_bank_name: string;
    term_content_id: string;
    term_content_directory: string;
    include_aftersales_page: boolean;
    include_msf_page: boolean;
    status: string;
    created_by: string;
    updated_by: string | null;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_delete: boolean;
}

export interface AccessoryByIslandResponse {
  status: boolean;
  message: string;
  data: AccessoryByIslandCombined[];
}

export interface AccessoryItem {
  accessory_id: string;
  accessory_part_number: string;
  accessory_part_name: string;
  accessory_specification: string | null;
  accessory_brand: string | null;
  accessory_remark: string;
  accessory_region: string | null;
  accessory_description: string | null;

  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  is_delete: boolean;
}

export interface AccessoryIslandDetail {
  accessories_island_detail_id: string;
  island_id: string;
  accessories_island_detail_quantity: number;
  accessories_island_detail_description: string | null;

  island_detail_created_at: string;
  island_detail_created_by: string | null;
  island_detail_updated_at: string;
  island_detail_updated_by: string | null;
}
export interface AccessoryByIslandCombined
  extends AccessoryItem,
    AccessoryIslandDetail {}