export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SyncInfo {
    sync_status: boolean;
    created_at: string;
    created_by_name: string;
}

// GET RECEIPTS REQUEST PARAMS
export interface ReceiptRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: string;
    search: string;
    status?: string;
    vendor_id?: string;
    location?: string;
    source_type?: string;
    classes?: number;
}

// Item line, cuma ada di response detail (GET by id) - lihat msi_get_item_receipts.js
export interface ReceiptLineItem {
    line: number;
    line_id: string;
    item: string;
    item_display: string;
    itemtype: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    memo: string;
    on_hand: number | null;
    location: string;
    location_display: string;
    department: string;
    department_display: string;
    class: string;
    class_display: string;
    restock: boolean | string | null;
    landed_cost: number | string | null;
    currency: string | null;
    currency_display: string | null;
    cseg_msi_pro_segmen: string | null;
    cseg_msi_pro_segmen_display: string | null;
    inventorydetail: string;
}

// GET RECEIPTS RESPONSE ITEMS
export interface ReceiptItem {
    id: string;
    netsuite_id: string;
    tranid: string;
    trandate: string;
    status: string;
    status_display: string;
    memo: string;
    customform?: number | null;
    customform_display?: string;
    vendor_id: string;
    vendor_name: string;
    createdfrom: string;
    createdfrom_display: string;
    inboundshipment?: string | null;
    inboundshipment_display?: string | null;
    source_type: string | null;
    source_type_display: string | null;
    subsidiary: string;
    subsidiary_display: string;
    location: string;
    location_display: string;
    transferlocation?: string | null;
    transferlocation_display?: string | null;
    postingperiod?: string | null;
    incoterm_id?: string | null;
    incoterm_name?: string | null;
    currency?: string | null;
    currency_display?: string | null;
    exchangerate?: string | number | null;
    department: string;
    department_display: string;
    class: string;
    class_display: string;
    last_modified_netsuite: string;
    datecreated_netsuite: string;
    created_at: string;
    created_by_name: string;
    updated_at: string;
    // Cuma ada di response detail (GET by id), gak ada di list - JSON-encoded string, JSON.parse dulu kalau dipakai.
    lines?: string | ReceiptLineItem[];
    files?: AttachFileItem[];
    user_notes?: ReceiveUserNote[];
}
export interface AttachFileItem {
    id?: string;
    fileUrl: string;
    fileName: string;
    created_by_api?: string;
}
export interface ReceiveUserNote {
    date: string;
    note: string;
    type: string | null;
    title: string;
    author: string;
    direction: string;
}
export interface ReceiptResponse {
    success: boolean;
    data: {
        items: ReceiptItem[];
        pagination: Pagination;
    };
    sync_info?: SyncInfo;
    message: string;
}

export interface ReceiptDetailResponse {
    success: boolean;
    data: ReceiptItem;
    sync_info?: SyncInfo;
    message: string;
}
