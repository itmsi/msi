export interface Segementation {
    segmentation_id: string;
    segmentation_name_en: string;
}

export interface SegementationRequest {
    page: number;
    limit: number;
    search: string;
    sort_order: "asc" | "desc";
    is_admin?: boolean;
}

export interface SegementationFilters {
    search: string;
    sort_order: 'asc' | 'desc' | '';
}

export interface SegementationValidationErrors {
    segmentation_name_en?: string;
}
export interface SegementationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SegementationListResponse {
    success: boolean;
    message: string;
        data: Segementation[];
        pagination: SegementationPagination;
    timestamp: string;
}

export interface SegementationPayload {
    segmentation_name_en: string;
}

export interface SegementationDetailResponse {
    success: boolean;
    message: string;
    data: Segementation;
    timestamp: string;
}

export interface SegementationItem {
    segmentation_id: string;
    segmentation_name_en: string;
}