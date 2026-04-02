export interface PurchaseOrderResponse {
    status: string;
    data: {
        items: PurchaseOrderItem[];
        pagination: Pagination;
    }
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
    status: string;
}
export interface PurchaseOrderItem {
    id: number;
    po_id: number;
    po_number: string;
    po_date: string;
    po_status: string;
    approvalstatus: string;
    po_status_label: string;
    custbody_me_wf_next_approver_blank_display: string | null;
    memo: string | null;
    vendor_id: number;
    vendor_name: string;
    currency_id: number;
    currency_symbol: string;
    pr_number: string | null;
    foreigntotal: number;
    total: number;
    lines: POLine[];
    created_at: string;
    updated_at: string;
    last_modified: string;
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
    purchasedate: string | null;
    subsidiary: number | null;
    subsidiary_display?: string | null;
    location: number | null;
    location_name?: string | null;
    memo: string;
    currency: number | null;
    terms: number | null;
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
    custbody_me_wf_next_approver_blank_display?: string | null;
    approvalstatus?: number | null;
    // description: string | null;
    // note: string | null;
    items: TablePOItem[];
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
    gross_amount?: number;
    tax_amount?: number;
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
    foreigntotal: number;
    total: number;
    last_modified: string;
    approvalstatus_label: string;
    approvalstatus: number;
    custbody_me_wf_created_by: number;
    custbody_me_wf_in_delegation: string;
    custbody_me_delegate_approver: number | null;
    custbody_msi_createdby_api: string;
    custbody_me_pr_date: string;
    custbody_me_project_location: number;
    custbody_me_pr_type: number;
    custbody_me_saving_type: number;
    custbody_me_pr_number: string;
    custbody_me_description: string | null;
    intercotransaction: any | null;
    customform?: number | null;
    customform_display?: string | null;
    lines: PODetailLine[];
}

export interface PODetailLine {
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
}

export interface PODetailResponse {
    success: boolean;
    data: PODetailData[];
    message: string;
}
