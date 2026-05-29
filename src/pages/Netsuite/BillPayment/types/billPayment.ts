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

export interface BillPayment {
    id: string;
    netsuite_id: number;
    transactionnumber: string;
    tranid: string;
    entity_display: string;
    account_display: string;
    currency_display: string;
    postingperiod_display: string;
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
}

export interface BillPaymentDetailResponse {
    success: boolean;
    message: string;
    data: BillPayment;
}
