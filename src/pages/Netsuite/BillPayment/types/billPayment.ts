export interface BillPaymentRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    search?: string;
    is_deleted?: boolean;
    entity?: number;
    currency?: number;
    subsidiary?: number | string;
    approvalstatus?: number | string;
    department?: number;
    location?: number;
    trandate_from?: string;
    trandate_to?: string;
    trandate_start?: string; // for compatibility
    trandate_end?: string;   // for compatibility
    current_approver_id?: number | string;
}

export interface AppliedToItem {
    type: string;
    ref_no: string;
    amt_due: number;
    payment: number;
    apply_id: string;
    currency: string;
    date_due: string;
    orig_amt: number;
    disc_date: string | null;
    disc_avail: string;
    disc_taken: string;
}

export interface CreditAppliedItem {
    date: string;
    type: string;
    ref_no: string;
    payment: number;
    currency: string;
    credit_id: string;
    applied_to: string;
}

export interface WorkflowHistoryItem {
    workflow?: string;
    date_entered?: string;
    date_exited?: string;
    options_obj?: string;
    notes?: string;
}

export interface UserNoteItem {
    date?: string;
    author?: string;
    author_display?: string;
    title?: string;
    memo?: string;
    direction?: string;
    direction_display?: string | null;
    type?: string;
    type_display?: string | null;
    [key: string]: any;
}

export interface AttachmentFile {
    id: string;
    bill_payment_netsuite_id: string;
    tran_id: string;
    status: string;
    file_netsuite_id: string;
    file_name: string;
    file_type: string;
    file_size: string;
    file_is_text: boolean;
    file_skipped: boolean;
    file_link: string | null;
    created_at: string;
    updated_at: string;
}

export interface AttachmentDownloadResponse {
    success: boolean;
    message?: string;
    data?: {
        file_netsuite_id: string;
        bill_payment_netsuite_id: string;
        file_name: string;
        file_type: string;
        file_size: string;
        url: string;
        expires_at: string | null;
    };
}

export interface AttachmentFilesResponse {
    success: boolean;
    message?: string;
    data: {
        items: AttachmentFile[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    };
}

export interface AttachmentSyncResponse {
    success: boolean;
    message?: string;
    data?: {
        id: string;
        tranId: string;
        count: number;
        skippedCount: number;
        files: AttachmentFile[];
    };
}

export interface BillPayment {
    id: string;
    netsuite_id: number;
    transactionnumber: string;
    tranid: string;
    entity_display: string;
    account_display: string;
    currency_display: string;
    postingperiod_display: string;
    memo?: string;
    custbody_me_wf_created_by_display: string;
    approvalstatus_display: string;
    subsidiary_display: string;
    class_display: string;
    department_display: string;
    location_display: string;
    custbody_cseg_cn_cfi_display: string;
    entity: number;
    account: number;
    currency: number;
    postingperiod: number;
    custbody_me_wf_created_by: number;
    approvalstatus: number;
    subsidiary: number;
    class: number;
    department: number;
    location: number;
    custbody_cseg_cn_cfi: number | null;
    total: number;
    balance?: number | string | null;
    exchangerate: number;
    trandate: string;
    next_approver: string | null;
    delegate_approver: string | null;
    in_delegation: boolean | null;
    next_approver_blank: string | null;
    last_modified_netsuite: string;
    applied_to: AppliedToItem[] | null;
    credit_applied: CreditAppliedItem[] | null;
    workflow_history: WorkflowHistoryItem[] | null;
    user_notes: UserNoteItem[] | null;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

export interface BillPaymentApprovalRequest {
    id: number;
    recordType: string;
    actionId: 'approve' | 'reject';
    note: string;
    noteTitle: string | null;
    custbody_me_wf_next_approver_blank: number;
}

export interface BillPaymentApprovalResponse {
    success: boolean;
    message: string;
    data: any;
}

export interface BillPaymentPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface BillPaymentData {
    items: BillPayment[];
    pagination: BillPaymentPagination;
}

export interface BillPaymentResponse {
    success: boolean;
    message: string;
    data: BillPaymentData;
    sync_info: SyncInfo;
}

export interface BillPaymentDetailResponse {
    success: boolean;
    message: string;
    data: BillPayment;
}

export interface SyncInfo {
    sync_status: boolean;
    created_at: string;
    created_by_name: string;
}