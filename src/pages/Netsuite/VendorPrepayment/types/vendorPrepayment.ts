// Request body POST /vendor-prepayment/get
export interface VendorPrepaymentRequest {
    page: number;
    page_size: number;
    sort_by: string;
    sort_order: 'ASC' | 'DESC';
    search?: string;
    is_deleted?: boolean;
    entity_id?: string;
    purchaseorder_id?: string;
    subsidiary_id?: string;
    approval_status?: string;
    department_id?: string;
    location_id?: string;
    currency_id?: string;
    class_id?: string;
    next_approver_blank?: string; // filter Next Approver (employee_id_netsuite dari select)
    tran_date_from?: string;
    tran_date_to?: string;
}

// Satu baris Applied To (disimpan jsonb di backend)
export interface AppliedToItem {
    applied_id: string;
    application_id: string;
    date_applied: string | null;
    type: string;
    number: string;
    date: string | null;
    original_amount: number | string;
    applied_amount: number | string;
}

export interface VendorPrepayment {
    id: string;
    netsuite_id: string;
    customform_id: string | null;
    customform_name: string | null;
    transactionnumber: string;
    tranid: string | null;
    tran_date: string | null;
    entity_id: string | null;
    entity_name: string | null;
    purchaseorder_id: string | null;
    purchaseorder_name: string | null;
    account_id: string | null;
    account_name: string | null;
    payment: number | string | null;
    currency_id: string | null;
    currency_name: string | null;
    exchangerate: number | string | null;
    postingperiod_id: string | null;
    postingperiod_name: string | null;
    prepaymentaccount_id: string | null;
    prepaymentaccount_name: string | null;
    tobeprinted: boolean | null;
    printvoucher: boolean | null;
    memo?: string | null;
    approval_status: string | null;
    approval_status_name: string | null;
    wf_created_by_id: string | null;
    wf_created_by_name: string | null;
    create_by_netsuite_id: string | null;
    create_by_netsuite_name: string | null;
    delegate_approver_id: string | null;
    delegate_approver_name: string | null;
    in_delegation: boolean | null;
    next_approver_blank: string | null;      // id employee next approver
    next_approver_blank_name: string | null; // nama next approver
    subsidiary_id: string | null;
    subsidiary_name: string | null;
    department_id: string | null;
    department_name: string | null;
    class_id: string | null;
    class_name: string | null;
    location_id: string | null;
    location_name: string | null;
    cseg_cn_cfi_id: string | null;
    cseg_cn_cfi_name: string | null;
    applied_total: number | string | null;
    last_modified_netsuite: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    created_by_name: string | null;
    update_by_name: string | null;
    // hanya ada di detail
    address?: string | null;
    applied_to?: AppliedToItem[] | null;
    data?: any;
}

export interface VendorPrepaymentApprovalRequest {
    id: number;
    recordType: string;
    actionId: 'approve' | 'reject';
    note: string;
    noteTitle: string | null;
    custbody_me_wf_next_approver_blank: number;
}

export interface VendorPrepaymentApprovalResponse {
    success: boolean;
    message: string;
    data: any;
}

export interface VendorPrepaymentPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface VendorPrepaymentData {
    items: VendorPrepayment[];
    pagination: VendorPrepaymentPagination;
}

export interface VendorPrepaymentResponse {
    success: boolean;
    message: string;
    data: VendorPrepaymentData;
    sync_info: SyncInfo;
}

export interface VendorPrepaymentDetailResponse {
    success: boolean;
    message: string;
    data: VendorPrepayment;
}

export interface SyncInfo {
    sync_status: boolean;
    created_at: string;
    created_by_name: string;
}
