export interface PurchaseOrderResponse {
    status: string;
    data: {
        items: PurchaseOrderItem[];
        pagination: Pagination;
    }
    sync_info: SyncInfo;
}
export interface SyncInfo {
    sync_status: boolean;
    created_at: string;
    created_by_name: string;
}
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PurchaseOrderRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: string;
    search: string;
    subsidiary?: string;
    location?: string;
    approvalstatus?: number | null;
    status: string;
}
export interface PurchaseOrderItem {
    id: number;
    po_id: number;
    po_number: string;
    po_date: string;
    po_status: string;
    approvalstatus: string;
    approvalstatus_display?: string;
    subsidiary_display?: string;
    po_status_label: string;
    nextapprover?: string | null;
    memo: string | null;
    vendor_id: number;
    vendor_name: string;
    custbody_me_pr_number?: string;
    location_display?: string;
    currency_id: number;
    currency_symbol: string;
    pr_number: string | null;
    foreigntotal: number;
    total: number;
    lines: POLine[];
    created_at: string;
    updated_at: string;
    custbody_msi_createdby_api?: string;
    last_modified?: string ;
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

export interface PurchaseOrderForm {
    customform?: number | null;
    customform_display?: string | null;
    vendorid: number | null;
    vendor_name?: string | null;
    purchasedate: string | null;
    subsidiary: number | null;
    subsidiary_display?: string | null;
    location: number | null;
    location_name?: string | null;
    memo: string;
    currency: number | null;
    terms: number | null;
    terms_display?: string | null;
    custbody_me_pr_date: string | null;
    custbody_me_project_location: number | null;
    custbody_me_pr_type: number | null;
    custbody_me_saving_type: number | null;
    custbody_me_pr_number: string | null;
    class: number | null;
    class_name?: string | null;
    department: number | null;
    department_name?: string | null;
    custbody_msi_createdby_api?: string | null;
    custbody_me_validity_date?: string | null;
    nextapprover?: string | null;
    approvalstatus?: number | null;
    po_status_label?: string | null;
    // description: string | null;
    // note: string | null;
    items: TablePOItem[];
    grossamt?: number;
}

export interface POLineItem {
    id?: string;
    product_id?: string; 
    product_name?: string;
    itemId?: string | number;
    qty?: number;
    rate?: number;
    amount?: number;
    total?: number;
    department?: number;
    department_name?: string;
    class?: number;
    class_name?: string;
    location?: number;
    location_name?: string;
    taxcode?: number;
    taxcode_name?: string;
}
export interface POSelectOption {
    value: string;
    label: string;
}
export interface PurchaseOrderValidationErrors {
    customform?: number;
    vendorid?: number;
    purchasedate?: string;
    currency?: number;
    terms?: number;
    location?: number;
    class?: number;
    department?: number;
    description?: string;
    note?: string;
}

// FORM FIELD ITEMS PURCHASE ORDER
export interface POItemsRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: string;
    search: string;
    is_parent?: boolean;
}
export interface FormFieldItemsResponse {
    success: boolean;
    data: MasterDataFormFieldItems;
}

export  interface MasterDataFormFieldItems {
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
}

export interface BaseOption {
    id: number;
    name: string;
}

// LIST ITEMS CREATE PURCHASE ORDER
export interface POItemResponse {
    success: boolean;
    data: DataPOItems;
    message: string;
}

export interface DataPOItems {
    items: DataItems[];
    pagination: Pagination;
}

export interface DataItems {
    internalId: string;
    itemId: string;
    displayName: string;
    locations: any[];
}

export interface POItemsRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: string;
    search: string;
}

export interface TablePOItem {
    id?: string;
    product_id: string;
    product_name: string;
    itemId: string | number;
    qty: number;
    rate: number;
    amount: number;
    total: number;
    department: number | string;
    department_name?: string;
    class: number | string;
    class_name?: string;
    location: number | string;
    location_name?: string;
    taxcode: number;
    taxcode_name?: string;
    tax_rate?: string;
    taxcode_display?: string;
    gross_amount?: number;
    tax_amount?: number;
    custcol_msi_fob?: number;
    custcol_me_landed_cost?: number;
    description?: string;
}


// LOCATION SELECT
export interface LocationDataResponse {
    success: boolean;
    data: DataLocation;
    message: string;
}

export interface DataLocation {
    items: LocationItem[];
    pagination: Pagination;
}

export interface LocationItem {
    id: string;
    name: string;
    isInactive: boolean;
    parentId: string;
    parentName: string;
    subsidiaryId: string;
    subsidiaryName: string;
    locationType: string;
    locationTypeName: string;
    timezone: string;
    makeInventoryAvailable: boolean;
    lastModified: string;
}

// VENDOR SELECT
export interface VendorResponse {
    success: boolean;
    data: VendorData;
    message: string;
}

export interface VendorData {
    items: VendorItem[];
    pagination: Pagination;
}

export interface VendorItem {
    internalId: string;
    entityId: string;
    companyName: string;
    email: string;
    phone: string;
    lastModifiedDate: string;
    lastModifiedDateRaw: string;
}

// APPROVAL
export interface POApprovalRequest {
    id: number;
    recordType: string;
    custbody_msi_submit_app_api: boolean;
    custbody_msi_reopen_api: boolean;
    custbody_msi_resubmit_api: boolean;
    note: string;
}

export interface POApprovalResponse {
    success: boolean;
    message: string;
    data: any;
}

// PURCHASE ORDER DETAILS
export interface PODetailData {
    po_id: string;
    po_number: string;
    po_date: string;
    po_status: string;
    po_status_label: string;
    location: number | string;
    location_display: string;
    subsidiary: number;
    subsidiary_display: string;
    memo: string;
    vendor_id: number;
    vendor_name: string;
    currency_id: number;
    currency_symbol: string;
    terms?: number | string;
    terms_display?: string | null;
    foreigntotal: number;
    total: number;
    last_modified: string;
    approvalstatus_label: string;
    approvalstatus: number;
    nextapprover?: string | null;
    custbody_me_wf_created_by: number;
    custbody_me_wf_in_delegation: string;
    custbody_me_delegate_approver: number | null;
    custbody_msi_createdby_api: string;
    custbody_me_validity_date: string | null;
    custbody_me_pr_date: string;
    custbody_me_project_location: number;
    custbody_me_pr_type: number;
    custbody_me_saving_type: number;
    custbody_me_pr_number: string;
    custbody_me_description: string | null;
    intercotransaction: any | null;
    customform?: number | null;
    customform_display?: string | null;
    class?: number | string;
    class_display?: string;
    department?: number | string;
    department_display?: string;
    lines: PODetailLine[];
    user_notes: UserNotesItem[];
}

export interface PODetailLine {
    line_id: number;
    item: number;
    memo?: string | null;
    rate?: number;
    class?: number;
    units?: number | null;
    tax1amt?: number | null;
    taxcode?: number;
    grossamt?: number;
    isclosed?: string;
    itemtype?: string;
    location?: number;
    quantity?: number;
    quantitypending?: number;
    quantityreceived?: number;
    has_inbound?: boolean;
    on_hand?: number;
    taxrate1?: number | null;
    netamount?: number;
    department?: number;
    isbillable?: string;
    transaction?: number;
    item_display?: string;
    class_display?: string;
    units_display?: string | null;
    quantitybilled?: number;
    taxcode_display?: string;
    location_display?: string;
    department_display?: string;
    linesequencenumber?: number;
    matchbilltoreceipt?: string;
    expectedreceiptdate?: string | null;
    custcol_4601_witaxapplies?: string | null;
    custcol_me_landed_cost?: number | null;
    custcol_msi_fob?: number | null;
    description?: string | null;
}

export interface PODetailResponse {
    success: boolean;
    data: PODetailData[];
    message: string;
}

// CLASS SELECT
export interface ComponentsItem {
    id: string;
    name: string;
    is_inactive: boolean;
    parent_id: string;
    parent_name: string;
    subsidiary_id: string;
    subsidiary_name: string;
    last_modified: string;
}

export interface ComponentsDataResponse {
    success: boolean;
    data: {
        items: ComponentsItem[];
        pagination: Pagination;
    };
    message: string;
}

export interface PurchaseOrderFormUpdate {
    id: number;
    customform?: number;
    vendorid?: number;
    purchasedate?: string;
    subsidiary?: number;
    location?: number;
    memo?: string;
    currency?: number;
    terms?: number;
    terms_display?: string;
    custbody_me_pr_date?: string;
    custbody_me_project_location?: number;
    custbody_me_pr_type?: number;
    custbody_me_saving_type?: number;
    custbody_me_pr_number?: string;
    custbody_msi_createdby_api?: string;
    class?: number;
    department?: number;
    grossamt?: number;
    custbody_me_validity_date?: string;
    items?: PurchaseOrderUpdateItem[];
}

export interface PurchaseOrderUpdateItem {
    itemId: number;
    qty: number;
    rate?: number;
    department?: number;
    class?: number;
    location?: number;
    taxcode?: number;
    custcol_msi_fob?: number;
    custcol_me_landed_cost?: number;
    amount?: number;
    total?: number;
    tax_amount?: number;
    gross_amount?: number;
    description?: string;
}
// TERM SELECT
export interface TermsItem {
    id: string;
    name: string;
    is_inactive: boolean;
}

export interface TermsDataResponse {
    success: boolean;
    data: {
        items: TermsItem[];
        pagination: Pagination;
    };
    message: string;
}
export interface PODownloadRequest {
    recId: number;
}

export interface PODownloadResponse {
    success: boolean;
    mimeType: string;
    fileName: string;
    fileContent: string;
}
// RECEIVE FORM FIELD POSTS
export interface ItemReceiptItem {
    linesequencenumber?: number;
    line_sequence?: number;
    line_id?: number;
    item: number;
    item_display?: string;
    on_hand?: number;
    quantity: number;
    quantitypending?: number;
    quantityreceived?: number;
    has_inbound?: boolean;
    location?: number;
    location_display?: string;
    department?: number;
    department_display?: string;
    class?: number;
    class_display?: string;
    rate?: number;
    amount?: number;
    grossamt?: number;
}

export interface ItemReceiptPayload {
    po_id: number | null;
    memo?: string;
    vendorid?: number | null;
    vendor_name?: string | null;
    customform?: number | string | null;
    customform_display?: string;
    trandate?: string;
    subsidiary?: number;
    subsidiary_display?: string;
    class?: number;
    class_display?: string;
    location?: number;
    location_display?: string;
    department?: number;
    department_display?: string;
    po_status_label?: string;
    tranid?: string;
    receipt_id?: string;
    created_by_name?: string;
    created_by?: string;
    items: ItemReceiptItem[];
}

export interface RequestFilters {
   createdfrom?: number;
}
// RECEIVE REQUEST PARAMS
export interface ReceiveRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: string;
    search: string;
    classes?: number;
    createdfrom?: number;
    filters?: RequestFilters;
}
// RECEIVE RESPONSE SUB ITEMS
export interface ReceiptLine {
    linesequencenumber?: string;
    line_id: string;
    item: string;
    line: string;
    memo: string;
    rate: string;
    class: string;
    amount: string;
    location: string;
    quantity: string;
    quantitypending: string;
    department: string;
    item_display: string;
    class_display: string;
    inventorydetail: string;
    location_display: string;
    department_display: string;
}

// RECEIVE RESPONSE ITEMS
export interface ReceiptItem {
    receipt_id: string;
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
    subsidiary: string;
    subsidiary_display: string;
    location: string;
    location_display: string;
    department: string;
    department_display: string;
    class: string;
    class_display: string;
    last_modified_netsuite: string;
    datecreated_netsuite: string;
    lines: ReceiptLine[];
}

export interface ReceiptResponse {
    success: boolean;
    data: {
        items: ReceiptItem[];
        pagination: Pagination;
    };
    sync_info: SyncInfo;
    message: string;
}

export interface ReceiptValidationErrors {
    memo?: string;
    trandate?: string;
    class?: number;
    location?: number;
    department?: number;
}

export interface GoodsReceipt {
    id: number;
    tranid: string;
    trandate: string;
    po_id: number;
    po_number: string;
}

export interface PostReceiptResponse {
    success: boolean;
    purchase_order_id: number;
    goods_receipts: GoodsReceipt[];
}

// HISTORY RECEIPT LOGS
export interface HistoryLogItem {
  id: string;
  trandate?: string;
  msg_error?: string;
  created_at?: string;
  created_by_name?: string;
}

export interface HistoryLogResponse {
  success: boolean;
  data?: HistoryLogItem[];
  message?: string;
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