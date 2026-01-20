export interface ItemProductResponse {
    status: boolean;
    message: string;
    data: ItemProductData;
}

export interface ItemProductData {
    items: ItemProduct[];
    pagination: ApiPagination;
}

export interface ItemProduct {
    componen_product_id: string;
    code_unique: string;
    segment: string;
    msi_model: string;
    msi_product: string;
    wheel_no: string;
    engine: string;
    horse_power: string;
    market_price: string;
    selling_price_star_1: string;
    selling_price_star_2: string;
    selling_price_star_3: string;
    selling_price_star_4: string;
    selling_price_star_5: string;
    image: string | null;
    componen_product_description: string | null;
    is_delete: boolean;
    componen_type: number;
    product_type: string;
    company_name?: string | null;
    componen_product_name: string;
    volume: string;
    componen_product_unit_model: string;
    componen_product_specifications: ProductSpecification[];
    updated_at?: string;
    updated_by_name?: string;
    // Additional fields for quotation integration
    specifications?: any[]; // For form editing
    accessories?: any[]; // For form editing (create mode)
    manage_quotation_item_accessories?: any[]; // For form editing (edit mode)
}

export interface ProductSpecification {
    // componen_product_specification_id: string;
    componen_product_specification_label?: string;
    componen_product_specification_value?: string;
    componen_product_specification_description?: string | null;
    specification_label_name?: string;
    specification_value_name?: string;
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

export interface ItemProductRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc';
    search: string;
    company_name?: string;
}

export interface ItemProductFormData {
    code_unique: string;
    segment: string;
    msi_model: string;
    wheel_no: string;
    engine: string;
    horse_power: string;
    product_type: string;
    market_price: string;
    selling_price_star_1: string;
    selling_price_star_2: string;
    selling_price_star_3: string;
    selling_price_star_4: string;
    selling_price_star_5: string;
    componen_product_description: string;
    image?: File | string | null;
    componen_type: number;
    product_dimensi_id: string;
}
export interface ItemProductValidationErrors {
    code_unique?: string;
    segment?: string;
    msi_model?: string;
    msi_product?: string;
    wheel_no?: string;
    engine?: string;
    horse_power?: string;
    market_price?: string;
    selling_price_star_1?: string;
    selling_price_star_2?: string;
    selling_price_star_3?: string;
    selling_price_star_4?: string;
    selling_price_star_5?: string;
    componen_product_description?: string;
    image?: string;
    componen_type?: string;
    product_dimensi_id?: string;
}

export interface EditProductFormData {
    code_unique: string;
    segment: string;
    msi_model: string;
    wheel_no: string;
    engine: string;
    horse_power: string;
    market_price: string;
    selling_price_star_1: string;
    selling_price_star_2: string;
    selling_price_star_3: string;
    selling_price_star_4: string;
    selling_price_star_5: string;
    componen_product_description: string;
    componen_type: number;
    volume: string;
    componen_product_unit_model: string;
}