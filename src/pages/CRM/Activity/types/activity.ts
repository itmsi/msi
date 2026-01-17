// Activity/Transaction main types
export interface Activity {
    transactions_id: string;
    transaction_type: string;
    transaction_source: string;
    iup_customer_id: string;
    customer_iup_name: string;
    segmentation_id: string;
    transaction_date: string;
    transaction_time: string;
    latitude: string;
    longitude: string;
    transcription: string;
    summary_point: string;
    summary_bim: string;
    image_url: string;
    voice_record_url: string;
    segmentation_properties: SegmentationProperties;
    created_at?: string;
    created_by?: string;
    updated_at: string;
    updated_by: string;
    updated_by_name: string;
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

// Form data for create/update
export interface ActivityFormData {
    transaction_type: string;
    transaction_source: string;
    iup_customer_id: string;
    customer_iup_name: string;
    transaction_date: string | Date;
    transaction_time: string;
    latitude: number;
    longitude: number;
    transcription: string;
    summary_point: string;
    summary_bim: string;
    segmentation_id: string;
    segmentation_properties: SegmentationProperties;
    image_url?: string;
    voice_record_url?: string;
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

// Detail response for get by ID
export interface ActivityDetailResponse {
    success: boolean;
    data: Activity;
}

// Create/Update response
export interface ActivityCreateResponse {
    success: boolean;
    data: Activity;
    message: string;
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

// Validation errors
export interface ActivityValidationErrors {
    transaction_type?: string;
    transaction_source?: string;
    iup_customer_id?: string;
    transaction_date?: string;
    transaction_time?: string;
    latitude?: string;
    longitude?: string;
    transcription?: string;
    summary_point?: string;
    summary_bim?: string;
    segmentation_id?: string;
    image_url?: string;
    voice_record_url?: string;
    general?: string;
}

// Legacy compatibility
export interface TransactionResponse extends ActivityListResponse {}
export interface Transaction extends Activity {}
export interface Pagination extends ActivityPagination {}
