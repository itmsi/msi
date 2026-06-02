export interface SalesOrderRequest {
    page: number;
    limit: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    status?: string;
    tran_date_start?: string;
    tran_date_end?: string;
}

export interface SalesOrderItem {
    line_number: number;
    item_id: string;
    item_name: string;
    description: string | null;
    department: string | number;
    department_name: string;
    class: string | number;
    class_name: string;
    location: string | number;
    quantity: number | null;
    shipped: number;
    rate: number;
    amount: number;
    location_id: string | number;
    location_name: string;
    taxcode: number | null;
    taxcode_name?: string;
    tax_rate?: string;
    gross_amount?: number;
    tax_amount?: number;
}

export interface SalesOrder {
    id: string;
    netsuite_id?: string | null;
    tranid: string;
    tran_date: string;
    status_code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
    status_name: string;
    custbody_me_approval_status?: string;
    custbody_me_approval_status_name?: string;
    customer_id: string;
    customer_name: string;
    location_name: string;
    memo: string | null;
    total_amount?: number;
    currency_name?: string;
    last_modified: string | null;
    last_modified_by_name: string | null;
    custbody_msi_quotation_no_iec?: string | null;
    otherrefnum?: string | null;
    nextapprover?: string | null;
    items: SalesOrderItem[];
}

export interface SalesOrderPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SalesOrderSyncInfo {
    sync_status: string;
    created_at: string;
    created_by_name: string;
}

export interface SalesOrderData {
    items: SalesOrder[];
    pagination: SalesOrderPagination;
}

export interface SalesOrderResponse {
    success: boolean;
    message: string;
    data: SalesOrderData;
    sync_info?: SalesOrderSyncInfo;
}

// Create/Update request item
export interface SalesOrderItemRequest {
    itemId: number;
    qty: number;
    rate: number;
    amount: number;
    description?: string | null;
    department?: number | null;
    class?: number | null;
    location?: number | null;
    taxcode?: number | null;
}

// Create request body
export interface SalesOrderCreateRequest {
    customform: number;
    subsidiary: number;
    entity: number;           // customer ID
    trandate: string;         // format: DD/M/YYYY
    startdate?: string;
    enddate?: string;
    orderstatus: string;      // 'A', 'B', etc.
    otherrefnum?: string;
    memo?: string;
    currency: number;
    terms?: number | null;
    department?: number | null;
    class?: number | null;
    location?: number | null;
    custbody_msi_quotation_no_iec?: string;
    custbody_msi_bank_payment_so?: number | null;
    custbody_cseg_cn_cfi?: number | null;
    custbody_msi_createdby_api?: string;
    items: SalesOrderItemRequest[];
}

// Update request body (same as create + id)
export interface SalesOrderUpdateRequest extends SalesOrderCreateRequest {
    id: number;
}

// Form data (internal state)
export interface SalesOrderFormData {
    customform: number;
    customer_name?: string;
    subsidiary: number | null;
    subsidiary_name?: string;
    entity: number | null;
    entity_name: string;
    trandate: string;
    startdate: string | null;
    enddate: string | null;
    orderstatus: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
    status_name?: string;
    otherrefnum: string;
    memo: string;
    currency: number;
    currency_name?: string;
    terms: number | null;
    terms_name?: string;
    department: number | null;
    department_name?: string;
    class: number | null;
    class_name?: string;
    location: number | null;
    location_name?: string;
    custbody_msi_quotation_no_iec: string;
    custbody_msi_bank_payment_so: number[] | null;
    custbody_msi_bank_payment_so_name: string[];
    custbody_cseg_cn_cfi: number | null;
    custbody_msi_createdby_api: string;
    items: SalesOrderFormItem[];
    files: AttachFileItem[];
    custbody_me_approval_status?: number | null;
    total_amount: number;
    nextapprover?: string | null;
    user_notes?: UserNotesItem[];
}

export interface SalesOrderFormItem {
    id: string;              // internal UI key
    itemId: number;
    item_name: string;
    qty: number;
    rate: number;
    amount: number;
    description: string;
    department: number | null;
    department_name: string;
    class: number | null;
    class_name: string;
    location: number | null;
    location_name: string;
    taxcode: number | null;
    taxcode_name?: string;
    tax_rate?: string;
    gross_amount?: number;
    tax_amount?: number;
}

export interface BaseOption {
    id: number;
    name: string;
}

// USER NOTES
export interface UserNotesItem {
    date: string;
    note: string;
    type: string | null;
    title: string;
    author: string;
    direction: string;
}

export interface CustomerItem {
    id: string;
    netsuite_id: string | null;
    entity_id: string;
    company_name: string;
    name: string;
    email?: string;
    phone?: string;
    data?: {
        internalId: string;
        entityId: string;
        companyName: string;
    };
}

export interface CustomerData {
    items: CustomerItem[];
    pagination: SalesOrderPagination;
}

export interface CustomerResponse {
    success: boolean;
    message: string;
    data: CustomerData;
}

// BANK SELECT
export interface BankItem {
    id: string;
    name: string;
    is_inactive: boolean;
}

export interface BankDataResponse {
    success: boolean;
    data: {
        items: BankItem[];
        pagination: SalesOrderPagination;
    };
    message: string;
}

// ATTACH FILE LIST
export interface AttachFileItem {
    id?: string;
    fileUrl: string;
    fileName: string;
    storagePath?: string;
    created_by_api?: string;
}
export interface ResponseAttachUpdateItem {
    success: boolean;
    data: AttachFileItem;
    message: string;
}
export interface SOAttachment {
    so_id: string;
    file_name: string;
    file: File;
}

export interface SOAttachmentUpdate {
    file?: File;
    soId?: string;
    file_name: string;
    fileUrl: string;
    file_id?: string;
}

export interface SOAttachmentDelete {
    fileUrl: string;
}

export interface SOAttachmentResponse {
    success: boolean;
    id: string;
    soId: string;
    fileUrl: string;
    storagePath: string;
    fileName: string;
    message?: string;
}

// APPROVAL
export interface SOApprovalRequest {
    id: number;
    recordType: string;
    custbody_msi_submit_app_api: boolean;
    custbody_msi_reopen_api: boolean;
    custbody_msi_resubmit_api: boolean;
    note: string;
    noteTitle: string | null;
}

export interface SOApprovalResponse {
    success: boolean;
    message: string;
    data: any;
}