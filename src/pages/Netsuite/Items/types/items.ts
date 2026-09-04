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
