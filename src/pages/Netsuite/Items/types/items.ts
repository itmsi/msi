export interface Item {
    internalId: string;
    itemId: string;
    itemType: string;
    displayName: string;
    lastModifiedDate: string;
}

export interface ItemsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ItemsListData {
    items: Item[];
    pagination: ItemsPagination;
}

export interface ItemsListResponse {
    success: boolean;
    data: ItemsListData;
    message: string;
}

export type ItemsRequest = {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc' | '';
    item_type?: string[];
    item_type_id?: string[];
}

export interface ItemDetail {
    id: string;
    netsuite_id: string;
    item_id: string;
    display_name: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    type: string;
    type_id: string;
}

export interface ItemDetailResponse {
    success: boolean;
    data: ItemDetail;
    message: string;
}

// Request yang dipakai bersama oleh locations, serial numbers, dan tier prices
export type ItemRelationRequest = {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc' | '';
    netsuite_item_id: string;
}

export interface ItemRelationListData<T> {
    items: T[];
    pagination: ItemsPagination;
}

export interface ItemRelationListResponse<T> {
    success: boolean;
    data: ItemRelationListData<T>;
    message: string;
}

export interface ItemLocation {
    id: string;
    inventorylocationId: number;
    item_id: string;
    location_name: string;
    qtyAvailable: string;
    qtyOnHand: string;
    qtyOnOrder: string;
    qtyCommitted: string;
    qtyBackOrder: string;
    // Bentuk isi array belum tersedia pada contoh response, dipakai untuk jumlah saja
    serialNumbers: unknown[];
}

export interface ItemSerialNumber {
    id: string;
    item_id: string;
    inventorylocationId: string;
    serial_number: string;
    is_used: boolean;
    created_at?: string;
    created_by?: string | null;
    updated_at?: string;
    updated_by?: string | null;
}

export interface ItemTierPrice {
    id: string;
    item_id: string;
    price_level: string;
    price: string;
    quantity: string;
}

export type ItemLocationsResponse = ItemRelationListResponse<ItemLocation>;
export type ItemSerialNumbersResponse = ItemRelationListResponse<ItemSerialNumber>;
export type ItemTierPricesResponse = ItemRelationListResponse<ItemTierPrice>;
