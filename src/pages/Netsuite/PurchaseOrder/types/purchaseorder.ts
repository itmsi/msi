export interface PurchaseOrderResponse {
    status: string;
    data: PurchaseOrder[];
    pagination: Pagination;
}
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PurchaseOrder {
    id: number;
    po_id: number;
    po_number: string;
    po_date: string;
    po_status: string;
    po_status_label: string;
    memo: string | null;
    vendor_id: number;
    vendor_name: string;
    currency_id: number;
    currency_symbol: string;
    lines: POLine[];
    created_at: string;
    updated_at: string;
    last_modified: string;
}

export interface POLine {
    po_id: number;
    item_id: number;
    quantity: number;
    item_name: string;
    line_memo: string | null;
    unit_price: number;
    line_number: number;
    location_id: number;
    department_id: number;
    location_name: string;
    subsidiary_id: number;
    department_name: string;
    subsidiary_name: string;
}