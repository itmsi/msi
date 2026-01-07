export interface AccessoriesResponse {
    status: boolean;
    message: string;
    data: AccessoriesData;
}

export interface AccessoriesData {
    items: Accessories[];
    pagination: ApiPagination;
}

export interface Accessories {
    accessory_id: string;
    accessory_part_number: string;
    accessory_part_name: string;
    accessory_specification: string;
    accessory_brand: string;
    accessory_remark: string;
    accessory_region: string;
    accessory_description: string;
    accessories_island_detail: AccessoryIslandDetail[];
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    updated_by_name?: string;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}
export interface AccessoryIslandDetail {
    accessories_island_detail_id: string;
    island_name: string;
    island_id: string;
    accessories_id: string;
    accessories_island_detail_quantity: number;
    accessories_island_detail_description: string;
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

export interface AccessoriesRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc';
    search: string;
}

export interface AccessoriesFormData {
    accessory_part_number: string;
    accessory_part_name: string;
    accessory_specification: string;
    accessory_brand: string;
    accessory_remark: string;
    accessory_region: string;
    accessory_description: string;
}

export interface AccessoriesValidationErrors {
    accessory_part_number?: string;
    accessory_part_name?: string;
    accessory_specification?: string;
    accessory_brand?: string;
    accessory_remark?: string;
    accessory_region?: string;
    accessory_description?: string;
}
