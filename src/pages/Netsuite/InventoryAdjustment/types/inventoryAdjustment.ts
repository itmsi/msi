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

// GET /inventory_adjustments/get REQUEST BODY
export interface InventoryAdjustmentRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: string;
    search: string;
    // Filter status approval — belum ada di kontrak API saat ini (nama field perlu dikonfirmasi).
    approval_status?: string;
    subsidiary?: number;
    adj_location?: number;
    department?: number;
    customer_id?: number;
    classes?: number;
}

// Line item - field dasar sama persis dengan payload create, ditambah field
// display (item_display/item_displayname, dst) supaya tampilan sesuai kolom
// sublist "Inventory Adjustment" di UI NetSuite. Field bertanda "belum ada di
// kontrak API saat ini" perlu ditambahkan ke msi_get_inventory_adjustments.js.
export interface InventoryAdjustmentLineItem {
    item: number | string;
    item_display?: string | null;
    item_displayname?: string | null;
    description?: string | null;
    location: number | string;
    location_display?: string | null;
    units?: string | null;
    units_display?: string | null;
    quantityonhand?: number | null; // Qty. On Hand
    currentvalue?: number | string | null; // Current Value
    department?: number | string | null;
    department_display?: string | null;
    class?: number | string | null;
    class_display?: string | null;
    quantity: number;
    adjustqtyby?: number | string | null; // Adjust Qty. By
    newquantity?: number | null; // New Quantity
    unit_cost?: number | string | null;
    custcol_me_proposed_unit_cost?: number | string | null; // Est. Unit Cost
    custcol_me_proposed_lot_qty?: number | string | null; // Proposed Lot Quantity — belum ada di kontrak API saat ini
    custcol_me_proposed_lot_num_txt?: string | null; // Proposed Lot Number (+)
    custcol_me_proposed_lot_num_neg_txt?: string | null; // Proposed Lot Number (-) — belum ada di kontrak API saat ini
    inventorydetail?: number | string | null; // Inventory Detail
    custcol_me_purchase_number_line?: string | null; // ME - Purchase Number (Line)
    custcol_me_landed_cost_ia?: number | string | null; // ME - Landed Cost (IA)
    memo?: string | null;
    serials?: string[];
}

export interface InventoryAdjustmentUserNote {
    date: string;
    note: string;
    type: string | null;
    title: string;
    author: string;
    direction: string;
}

export interface AttachFileItem {
    id?: string;
    fileUrl: string;
    fileName: string;
    created_by_api?: string;
}

// GET /inventory_adjustments/get & GET /inventory_adjustments/{id} RESPONSE ITEM
export interface InventoryAdjustmentItem {
    id: string;
    netsuite_id: string;
    tranid: string;
    subsidiary: number;
    subsidiary_display: string;
    account: number;
    account_display: string;
    adj_location: number;
    adj_location_display: string;
    department: number;
    department_display: string;
    trandate: string;
    class_id: number;
    class_display: string;
    memo: string;
    customer_id?: number | null;
    customer_display?: string | null;
    me_po_number?: string | null;
    customform?: number | null;
    lines?: InventoryAdjustmentLineItem[];
    postingperiod?: number | null;
    postingperiod_display?: string | null;
    // Estimated Total Value — muncul di UI NetSuite, belum ada di kontrak API saat ini (field key perlu dikonfirmasi).
    estimated_total_value?: number | string | null;
    custbody_me_description?: string | null;
    custbody_me_inv_customer?: number | null;
    custbody_me_purchase_order_number?: string | number | null; // "Related Document Number" di UI
    custbody_msi_cycle_count_cumber?: string | null; // "MSI - Related Cycle Count Number" di UI
    custbody_me_opening_balance?: boolean | null;
    // Created By — belum ada di kontrak API saat ini (field key perlu dikonfirmasi, kemungkinan custbody_me_wf_created_by_display).
    custbody_me_wf_created_by_display?: string | null;
    custbody_me_approval_status?: string | null;
    custbody_me_approval_status_display?: string | null;
    nextapprover?: string | null;
    // Delegate Approver / In Delegation — belum ada di kontrak API saat ini.
    custbody_me_delegate_approver_display?: string | null;
    custbody_me_wf_in_delegation?: boolean | null;
    last_modified: string;
    datecreated: string;
    user_notes?: InventoryAdjustmentUserNote[];
    files?: AttachFileItem[];
    created_at: string;
    created_by?: string | null;
    created_by_name?: string | null;
    updated_at: string;
    updated_by?: string | null;
    updated_by_name?: string | null;
}

export interface InventoryAdjustmentResponse {
    success: boolean;
    data: {
        items: InventoryAdjustmentItem[];
        pagination: Pagination;
    };
    sync_info?: SyncInfo;
    message: string;
}

export interface InventoryAdjustmentDetailResponse {
    success: boolean;
    data: InventoryAdjustmentItem;
    sync_info?: SyncInfo;
    message: string;
}

// POST /inventory_adjustments/create REQUEST BODY
export interface CreateInventoryAdjustmentLine {
    item: number;
    location: number;
    quantity: number;
    unit_cost?: number;
    department?: number;
    class?: number;
    custcol_me_purchase_number_line?: string;
    memo?: string;
    serials?: string[];
}

export interface CreateInventoryAdjustmentRequest {
    customform?: number;
    subsidiary: number;
    account: number;
    department: number;
    class: number;
    adjlocation: number;
    memo?: string;
    customer?: number;
    created_by?: string;
    custbody_me_description?: string;
    custbody_me_inv_customer?: number;
    custbody_me_purchase_order_number?: number | string;
    custbody_msi_cycle_count_cumber?: string;
    lines: CreateInventoryAdjustmentLine[];
}

export interface CreateInventoryAdjustmentResponse {
    success?: boolean;
    status?: string;
    data?: InventoryAdjustmentItem;
    inventory_adjustment_id?: string | number;
    id?: string | number;
    netsuite_id?: string | number;
    message: string;
}

// ── Form state (Create.tsx) ─────────────────────────────────────────────────
export interface InventoryAdjustmentFormLine {
    id: string; // key lokal untuk React list, bukan dikirim ke API
    item: number | null;
    item_name: string;
    item_displayname: string;
    location: number | null;
    location_name: string;
    quantity: number | string;
    unit_cost: number | string;
    department: number | null;
    department_name: string;
    class: number | null;
    class_name: string;
    custcol_me_purchase_number_line: string;
    memo: string;
    serials: string; // input mentah dipisah koma, di-split jadi array saat submit
}

export interface InventoryAdjustmentFormData {
    customform: number | null;
    subsidiary: number | null;
    subsidiary_name: string;
    account: number | null;
    adjlocation: number | null;
    adjlocation_name: string;
    department: number | null;
    department_name: string;
    class: number | null;
    class_name: string;
    memo: string;
    customer: number | null;
    customer_name: string;
    custbody_me_description: string;
    custbody_me_inv_customer: number | null;
    custbody_me_purchase_order_number: string;
    custbody_msi_cycle_count_cumber: string;
    lines: InventoryAdjustmentFormLine[];
}
