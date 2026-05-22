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
}

export interface SalesOrder {
    id: string;
    netsuite_id?: string | null;
    tranid: string;
    tran_date: string;
    status_code: string;
    status_name: string;
    customer_id: string;
    customer_name: string;
    total_amount: number;
    memo: string | null;
    last_modified: string | null;
    last_modified_by_name: string | null;
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
    subsidiary: number | null;
    entity: number | null;
    entity_name: string;
    trandate: string;
    startdate: string;
    enddate: string;
    orderstatus: string;
    otherrefnum: string;
    memo: string;
    currency: number;
    terms: number | null;
    department: number | null;
    department_name: string;
    class: number | null;
    class_name: string;
    location: number | null;
    location_name: string;
    custbody_msi_quotation_no_iec: string;
    custbody_msi_bank_payment_so: number | null;
    custbody_cseg_cn_cfi: number | null;
    custbody_msi_createdby_api: string;
    items: SalesOrderFormItem[];
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
