export interface InvoiceSalesOrderFilter {
    tranid?: string;
    approvalstatus?: string;
    lastmodified?: string;
    [key: string]: any;
}

export interface InvoiceSalesOrderRequest {
    page: number;
    page_size: number;
    sort_by: string;
    sort_order: 'ASC' | 'DESC';
    filters?: InvoiceSalesOrderFilter;
}

export interface InvoiceSalesOrderLine {
    item: string;
    line: number;
    memo: string | null;
    rate: number;
    price: string;
    tax1amt: number;
    taxcode: string;
    grossamt: number;
    itemtype: string;
    quantity: number;
    taxrate1: number;
    netamount: number;
    item_display: string;
    price_display: string;
    custcol_me_tier_price: string | null;
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
    subsidiary: string;
    department: string;
    class: string;
    location: string;
    custbody_cseg_cn_cfi: string;
    custbody_me_description: string | null;
    lines: InvoiceSalesOrderLine[];
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
