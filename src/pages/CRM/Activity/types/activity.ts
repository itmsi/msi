// Activity/Transaction main types
export interface Activity {
    transactions_id: string;
    transaction_type: string;
    transaction_source: string;
    iup_customers_id: string;
    segmentation_id: string;
    latitude: string;
    longitude: string;
    transcription: string;
    summary_point: string;
    summary_bim: string;
    image_url: string;
    voice_record_url: string;
    segmentation_properties: SegmentationProperties;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}

export interface SegmentationProperties {
    segmentation_id: string;
    segmentation_name_en: string;
}

export interface ActivityPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// API request/response types
export interface ActivityListRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface ActivityListResponse {
    success: boolean;
    data: Activity[];
    pagination: ActivityPagination;
}

// Error response type
export interface ActivityErrorResponse {
    status: boolean;
    message: string[];
    exception: string;
    data: any[];
}

// Filters state
export interface ActivityFilters {
    search: string;
    transaction_type: string;
    transaction_source: string;
    sort_by: string;
    sort_order: 'asc' | 'desc' | '';
}

// Legacy compatibility
export interface TransactionResponse extends ActivityListResponse {}
export interface Transaction extends Activity {}
export interface Pagination extends ActivityPagination {}
