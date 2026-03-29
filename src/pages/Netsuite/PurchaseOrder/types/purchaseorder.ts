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
    po_status_label: string;
    memo: string | null;
    vendor_id: number;
    vendor_name: string;
    currency_id: number;
    currency_symbol: string;
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
    customform: number | null;
    vendorid: number | null;
    purchasedate: string | null;
    subsidiary: number | null;
    location: number | null;
    memo: string;
    currency: number | null;
    terms: number | null;
    custbody_me_pr_date: string | null;
    custbody_me_project_location: number | null;
    custbody_me_pr_type: number | null;
    custbody_me_saving_type: number | null;
    custbody_me_pr_number: string | null;
    class: number | null;
    department: number | null;
    description: string | null;
    note: string | null;
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
    department: number;
    department_name?: string;
    class: number;
    class_name?: string;
    location: number;
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