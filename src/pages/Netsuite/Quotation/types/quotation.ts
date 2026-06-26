export interface QuotationRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    search?: string;
    is_deleted?: boolean;
    customer_id?: number | string;
    subsidiary?: number | string;
    approvalstatus?: number | string;
    tran_date_from?: string;
    tran_date_to?: string;
}

export interface QuotationItem {
    line: number;
    rate: number;
    unit: string;
    class: string;
    amount: string;
    item_id: string;
    line_id: string;
    taxcode: string;
    taxrate: number;
    grossamt: number;
    location: string;
    quantity: number;
    item_name: string;
    item_type: string;
    taxamount: number;
    class_name: string;
    department: string;
    pricelevel: string;
    description: string;
    taxcode_name: string;
    location_name: string;
    quantityonhand: string | null;
    department_name: string;
    pricelevel_name: string;
    item_displayname: string;
    quantityavailable: string | null;
}

export interface Quotation {
    id: string;
    netsuite_id: number;
    tranid: string;
    tran_date: string;
    duedate: string;
    entitystatus: string;
    entitystatus_name: string;
    probability: number;
    expectedclosedate: string;
    custbody_me_approval_status: string;
    custbody_me_approval_status_name: string;
    custbody_me_wf_created_by: string;
    custbody_me_wf_created_by_name: string;
    salesrep: string;
    salesrep_name: string;
    opportunity: string;
    opportunity_name: string;
    forecasttype: string;
    forecasttype_name: string;
    partner: string;
    partner_name: string;
    status_code: string;
    status_name: string;
    customer_id: string;
    customer_name: string;
    memo: string;
    approvalstatus: string;
    otherrefnum: string;
    department: string;
    department_name: string;
    class_id: string;
    class_name: string;
    location: string;
    location_name: string;
    subsidiary: string;
    subsidiary_name: string;
    currency: string;
    currency_name: string;
    custbody_msi_bank_payment_so: string;
    custbody_msi_bank_payment_so_name: string;
    custbody_cseg_cn_cfi: string;
    custbody_cseg_cn_cfi_name: string;
    total_amount: number;
    last_modified_netsuite: string;
    datecreated: string;
    items?: QuotationItem[];
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    updated_by_name: string | null;
}

export interface QuotationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface QuotationListData {
    items: Quotation[];
    pagination: QuotationPagination;
}

export interface SyncInfo {
    sync_status: boolean;
    created_at: string;
    created_by_name: string;
}

export interface QuotationListResponse {
    success: boolean;
    message: string;
    data: QuotationListData;
    sync_info?: SyncInfo;
}

export interface QuotationDetailResponse {
    success: boolean;
    message: string;
    data: Quotation;
}

// Create/Update request item
export interface QuotationItemRequest {
    itemId: number;
    qty: number;
    rate: number;
    amount: number;
    description?: string | null;
    department?: number | null;
    class?: number | null;
    location?: number | null;
    taxcode?: number | null;
    pricelevel?: number | null;
    unit?: string | null;
}

// Create request body
export interface QuotationCreateRequest {
    customform: number;
    title?: string;
    subsidiary: number;
    entity: number;           // customer ID
    trandate: string;         // format: YYYY-MM-DD
    duedate?: string | null;
    expectedclosedate?: string | null;
    orderstatus: string;      // entity status
    otherrefnum?: string;
    memo?: string;
    currency: number;
    terms?: number | null;
    department?: number | null;
    class?: number | null;
    location?: number | null;
    probability?: number | null;
    forecasttype?: number | null;
    salesrep?: string | number | null;
    opportunity?: string | number | null;
    partner?: string | number | null;
    custbody_msi_bank_payment_so?: number[] | null;
    custbody_cseg_cn_cfi?: number | null;
    custbody_me_approval_status?: number | null;
    custbody_msi_createdby_api?: string;
    custbody_msi_quotation_no_iec?: string;
    items: QuotationItemRequest[];
}

// Update request body (same as create + id)
export interface QuotationUpdateRequest extends QuotationCreateRequest {
    id: number;
}

// Form data (internal state)
export interface QuotationFormData {
    customform: number;
    title?: string;
    customer_name?: string;
    subsidiary: number | null;
    subsidiary_name?: string;
    entity: number | null;
    entity_name: string;
    trandate: string;
    duedate?: string | null;
    expectedclosedate: string | null;
    orderstatus: string;
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
    probability: number | null;
    forecasttype?: number | null;
    salesrep?: string | number | null;
    salesrep_name?: string;
    opportunity?: string | number | null;
    opportunity_name?: string;
    partner?: string | number | null;
    partner_name?: string;
    custbody_msi_bank_payment_so: number[] | null;
    custbody_msi_bank_payment_so_name: string[];
    custbody_cseg_cn_cfi: number | null;
    custbody_me_approval_status?: number | null;
    custbody_me_approval_status_name?: string;
    custbody_msi_createdby_api: string;
    items: QuotationFormItem[];
    total_amount: number;
    nextapprover?: string | null;
    files?: any[];
    user_notes?: any[];
    custbody_msi_quotation_no_iec: string;
}

export interface QuotationFormItem {
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
    pricelevel?: number | null;
    pricelevel_name?: string;
    unit?: string | null;
    tax_rate?: string;
    gross_amount?: number;
    tax_amount?: number;
}

export interface FormFieldItemsResponse {
    success: boolean;
    data: MasterDataFormFieldItems;
}

export interface MasterDataFormFieldItems {
    customforms: BaseOption[];
    subsidiarys: BaseOption[];
    currencys: BaseOption[];
    terms: BaseOption[];
    custbody_me_project_locations: BaseOption[];
    custbody_me_saving_types: BaseOption[];
    custbody_me_pr_types: BaseOption[];
    class: BaseOption[];
    departments: BaseOption[];
    taxcodes: BaseOption[];
    forecasttypes: BaseOption[]
    cfis: BaseOption[]
}

export interface BaseOption {
    id: number;
    name: string;
}

// ATTACH FILE LIST
export interface AttachFileItem {
    id?: string;
    poId?: string;
    po_id?: string;
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
export interface POAttachment {
    po_id: string;
    file_name: string;
    file: File;
}

export interface POAttachmentUpdate {
    file?: File;
    poId?: string;
    file_name: string;
    fileUrl: string;
    file_id?: string;
}

export interface POAttachmentDelete {
    fileUrl: string;
}

export interface POAttachmentResponse {
    success: boolean;
    id: string;
    poId: string;
    fileUrl: string;
    storagePath: string;
    fileName: string;
    message?: string;
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