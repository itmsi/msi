export interface WorkOrderRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc' | '';
    sort_by?: 'updated_at' | 'created_at' | '';
    search?: string;
}

export interface AuditFields {
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}

export type WorkOrderStatus =
    | 'open'
    | 'review'
    | 'waiting_sparepart'
    | 'onprogress'
    | 'repair_process'
    | 'quality_check'
    | 'ready_pickup'
    | 'complete'
    | 'cancelled';

// Work Order Item
export interface WorkOrderItem extends AuditFields {
    work_order_id: string;
    work_order_no: string;
    work_order_date: string;
    work_order_status: WorkOrderStatus | string;
    body_no: string;
    category: string;
    customer_name: string;
    total_duration: string;
    phone_number: string;
    problem: string;
    image: string[];
    status: string;
    repair_start_date: string | null;
    repair_end_date: string | null;
    repair_diff_days: string | null;
}

// Pagination
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Data wrapper
export interface WorkOrderData {
    items: WorkOrderItem[];
    pagination: Pagination;
}

// Final API Response
export interface WorkOrderResponse {
    success: boolean;
    data: WorkOrderData;
}