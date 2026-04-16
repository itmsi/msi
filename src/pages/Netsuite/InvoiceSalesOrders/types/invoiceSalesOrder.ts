export interface InvoiceSalesOrderRequest {
    page: number;
    limit: number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    search?: string;
    subsidiary?: string;
    approvalstatus?: string;
    trandate_start?: string;
    trandate_end?: string;
}

export interface InvoiceSalesOrderLine {
    item: string;
    line: number;
    memo: string | null;
    rate: string | number;
    price: string;
    taxamount: string | number;
    taxcode: string;
    grossamt: string | number;
    itemtype: string;
    quantity: string | number;
    taxrate: string | number;
    netamount: string | number;
    item_display: string;
    price_display: string;
    custcol_me_tier_price: string | null;
    custitem_me_product_category: string | null;
    custitem_me_product_category_display?: string | null;
    custitem_me_unit_type: string | null;
    custitem_me_unit_type_display?: string | null;
}

export interface InvoiceSalesOrder {
    id: string;
    tranid: string;
    entity: string;
    entityid?: string | null;
    trandate: string;
    startdate: string;
    enddate: string;
    postingperiod: string;
    postingperiod_display?: string | null;
    otherrefnum: string | null;
    memo: string | null;
    custbody_me_related_fulfillment: string | null;
    terms: string | null;
    account: string;
    account_display?: string | null;
    currency: string;
    currency_display?: string | null;
    exchangerate: string;
    custbody_msi_bank_payment_so: string;
    custbody_msi_bank_payment_so_display?: string | null;
    approvalstatus: string;
    custbody_me_wf_created_by: string;
    custbody_me_wf_created_by_display?: string | null;
    custbody_me_wf_next_approver_blank: string | null;
    saleseffectivedate: string;
    createdfrom: string;
    createdfrom_display: string | null;
    subsidiary: string;
    subsidiary_display?: string | null;
    department: string;
    department_display?: string | null;
    class: string;
    class_display?: string | null;
    location: string;
    location_display?: string | null;
    custbody_cseg_cn_cfi: string;
    custbody_cseg_cn_cfi_display?: string | null;
    custbody_me_description: string | null;
    last_modified?: string | null;
    lastmodifiedby?: string | null;
    lastmodifiedby_display?: string | null;
    lines: InvoiceSalesOrderLine[];
    fakture_id: string;
    faktur_updated_at?: string | null;
    faktur_updated_by_name?: string | null;
}

export interface InvoiceSalesOrderPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface InvoiceSalesOrderData {
    items: InvoiceSalesOrder[];
    pagination: InvoiceSalesOrderPagination;
}

export interface InvoiceSalesOrderResponse {
    success: boolean;
    message: string;
    data: InvoiceSalesOrderData;
}
