export interface Brand {
    brand_id: string;
    brand_name_en: string;
}

export interface BrandRequest {
    page: number;
    limit: number;
    search: string;
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
    timestamp: string;
}

export interface BrandPayload {
    brand_name_en: string;
}

export interface BrandDetailResponse {
    success: boolean;
    message: string;
    data: Brand;
    timestamp: string;
}

export interface BrandItem {
    brand_id: string;
    brand_name_en: string;
}