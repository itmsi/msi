export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SyncInfo {
    sync_status: string;
    created_at: string;
    created_by_name: string;
}

// ─── LIST ──────────────────────────────────────────────────────────
export interface TransferOrderRequest {
    page: number;
    limit: number;
    sort_by?: string;
    sort_order?: string;
    search?: string;
    location?: number | string;
    transferlocation?: number | string;
    status_name?: string;
    status_code?: string;
    start_date?: string;
    end_date?: string;
    classes?: number;
}

export interface TransferOrderListItem {
    id: string;
    netsuite_id: string | null;
    tranid: string;
    status_code: string;
    status_name: string;
    from_location_id: number;
    from_location_name: string;
    to_location_id: number;
    to_location_name: string;
    memo: string | null;
    tran_date: string;
    datecreated: string;
    last_modified_netsuite: string;
    custbody_msi_createdby_api?: string | null;
    created_by_name?: string | null;
    updated_by_name?: string | null;
    status_proccess?: string | null;
    status_proccess_message?: string | null;
    created_at: string;
    updated_at: string;
}

export interface TransferOrderData {
    items: TransferOrderListItem[];
    pagination: Pagination;
}

export interface TransferOrderResponse {
    success: boolean;
    message: string;
    data: TransferOrderData;
    sync_info?: SyncInfo;
}

// ─── DETAIL (GET by id) ──────────────────────────────────────────────
export interface TransferOrderDetailLine {
    packed: number;
    picked: number;
    item_id: number;
    shipped: number;
    quantity: number;
    received: number;
    backorder: number;
    committed: number;
    fulfilled: number;
    item_name: string;
    item_displayname?: string | null;
    description: string | null;
    line_number: number;
    from_location_id: number;
    from_location_name: string;
    transfer_price?: number | null;
    amount?: number | null;
    units?: string | null;
    expected_receipt_date?: string | null;
    order_priority?: string | null;
    commitment_confirmed?: boolean | null;
    closed?: boolean | null;
}

export interface AttachFileItem {
    id?: string;
    fileUrl: string;
    fileName: string;
    to_id?: string;
    created_by_api?: string;
}

export interface TransferOrderDetail {
    id: string;
    netsuite_id: string | null;
    tranid: string;
    status_code: string;
    status_name: string;
    from_location_id: number;
    from_location_name: string;
    to_location_id: number;
    to_location_name: string;
    memo: string | null;
    tran_date: string;
    datecreated: string;
    last_modified_netsuite: string;
    item_receipt_id?: string | null;
    created_from_to?: string | null;
    type_proccess?: string | null;
    status_proccess?: string | null;
    status_proccess_message?: string | null;
    custbody_msi_createdby_api?: string | null;
    created_by_name?: string | null;
    updated_by_name?: string | null;
    created_at: string;
    updated_at: string;
    // Sesuai tampilan record Transfer Order asli di NetSuite (Primary Information / Classification / Summary)
    customform?: number | null;
    customform_display?: string | null;
    subsidiary_id?: number | null;
    subsidiary_name?: string | null;
    firmed?: boolean | null;
    incoterm_id?: number | null;
    incoterm_name?: string | null;
    logistic_vendor_id?: number | null;
    logistic_vendor_name?: string | null;
    employee_id?: number | null;
    employee_name?: string | null;
    department_id?: number | null;
    department_name?: string | null;
    class_id?: number | null;
    class_name?: string | null;
    customer_id?: number | null;
    customer_name?: string | null;
    use_item_cost_as_transfer_cost?: boolean | null;
    total?: number | null;
    items: TransferOrderDetailLine[];
    files: AttachFileItem[];
}

export interface TransferOrderDetailResponse {
    success: boolean;
    message: string;
    data: TransferOrderDetail[];
    timestamp?: string;
}

// ─── CREATE / UPDATE ──────────────────────────────────────────────
export interface TransferOrderItemRequest {
    item: number;
    quantity: number;
    description?: string;
    expectedreceiptdate?: string;
    rate?: number;
    amount?: number;
}

export interface TransferOrderFileRequest {
    fileName: string;
    fileUrl: string;
}

export interface TransferOrderCreateRequest {
    customform: number;
    subsidiary: number;
    location: number;
    transferlocation: number;
    trandate: string;
    memo?: string;
    department?: number;
    class?: number;
    incoterm?: number;
    employee?: number;
    firmed?: boolean;
    useitemcostastransfercost?: boolean;
    custbody_me_logistic_vendor?: number;
    custbody_me_inv_customer?: number;
    custbody_msi_createdby_api?: string;
    items: TransferOrderItemRequest[];
    files?: TransferOrderFileRequest[];
}

export interface TransferOrderUpdateRequest extends TransferOrderCreateRequest {
    id: number;
}

// ─── FORM STATE (internal UI) ──────────────────────────────────────
export interface TransferOrderFormItem {
    id: string; // internal UI key
    itemId: number;
    item_name: string;
    item_displayname?: string;
    quantity: number;
    description: string;
    expectedreceiptdate: string | null;
    rate?: number | null;
    // true hanya utk item yang baru ditambahkan di sesi form ini (bukan item lama hasil load dari NetSuite)
    isNew?: boolean;
    // read-only fulfillment info (populated when editing an existing TO)
    packed?: number;
    picked?: number;
    shipped?: number;
    received?: number;
    backorder?: number;
    committed?: number;
    fulfilled?: number;
    units?: string | null;
    amount?: number | null;
    order_priority?: string | null;
    commitment_confirmed?: boolean | null;
    closed?: boolean | null;
}

export interface TransferOrderFormData {
    customform: number | null;
    subsidiary: number | null;
    subsidiary_name: string;
    location: number | null;
    location_name: string;
    transferlocation: number | null;
    transferlocation_name: string;
    trandate: string;
    memo: string;
    department: number | null;
    department_name: string;
    class: number | null;
    class_name: string;
    status: string;
    status_name?: string;
    incoterm: number | null;
    employee: number | null;
    employee_name: string;
    firmed: boolean;
    use_item_cost_as_transfer_cost: boolean;
    logistic_vendor: number | null;
    logistic_vendor_name: string;
    customer: number | null;
    customer_name: string;
    total: number;
    custbody_msi_createdby_api: string;
    items: TransferOrderFormItem[];
    files: AttachFileItem[];
}

export interface BaseOption {
    id: number;
    name: string;
}
