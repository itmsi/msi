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

// GET FULFILLMENTS REQUEST PARAMS
export interface FulfillmentRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: string;
    search: string;
    status?: string;
    entity_id?: string;
    location?: string;
    classes?: number;
}

export interface FulfillmentLineItem {
    item: string;
    item_display: string;
    memo: string;
    class: string;
    class_display: string;
    units: string | null;
    units_display: string | null;
    line_id: string;
    itemtype: string;
    location: string;
    location_display: string;
    quantity: string | number;
    department: string;
    department_display: string;
    transaction: string;
    inventory_detail: any[];
    linesequencenumber: number;
}

export interface FulfillmentUserNote {
    date: string;
    note: string;
    type: string | null;
    title: string;
    author: string;
    direction: string;
}

// GET FULFILLMENTS RESPONSE ITEM
export interface FulfillmentItem {
    id: string;
    netsuite_id: string;
    number: string;
    date: string;
    status: string;
    status_label: string;
    memo: string;
    entity_id: string;
    entity_name: string;
    createdfrom_id: string;
    createdfrom_number: string;
    source_type?: string | null;
    source_type_display?: string | null;
    postingperiod: string;
    last_modified: string;
    created_by_netsuite: string;
    custbody_me_wf_created_by?: string;
    custbody_me_approval_status?: string;
    custbody_me_approval_status_display?: string;
    custbody_me_delegate_approver?: string;
    custbody_me_wf_in_delegation?: boolean;
    custbody_me_wf_next_approver_blank?: string;
    nextapprover?: string;
    custbody_cseg_cn_cfi?: string;
    custbody_cseg_cn_cfi_display?: string;
    custbody_me_logistic_vendor?: string;
    custbody_me_logistic_vendor_display?: string;
    custbody_me_gross_weight?: string;
    custbody_me_related_invoice?: string;
    custbody_me_rate_id?: string;
    custbody_me_rate_id_display?: string | null;
    custbody_me_packages?: string;
    custbody_me_total_packages?: string;
    subsidiary: string;
    subsidiary_display: string;
    location: string;
    location_display: string;
    transferlocation: string;
    transferlocation_display: string;
    department: string;
    department_display: string;
    class: string;
    class_display: string;
    datecreated: string;
    lines?: FulfillmentLineItem[];
    user_notes?: FulfillmentUserNote[];
    files?: any[];
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    is_delete?: boolean;
}
export interface AttachFileItem {
    id?: string;
    fileUrl: string;
    fileName: string;
    created_by_api?: string;
}
export interface FulfillmentResponse {
    success: boolean;
    data: {
        items: FulfillmentItem[];
        pagination: Pagination;
    };
    sync_info?: SyncInfo;
    message: string;
}

export interface FulfillmentDetailResponse {
    success: boolean;
    data: FulfillmentItem;
    message: string;
}
