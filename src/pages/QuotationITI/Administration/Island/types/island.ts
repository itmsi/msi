export interface Island {
    island_id: string;
    island_name: string;
    updated_at?: string;
    updated_by_name?: string;
}

export interface IslandRequest {
    page: number;
    limit: number;
    search: string;
    sort_order: "asc" | "desc";
}

export interface IslandFilters {
    search: string;
    sort_order: 'asc' | 'desc' | '';
}

export interface IslandValidationErrors {
    island_name?: string;
}
export interface IslandPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface IslandListResponse {
    success: boolean;
    message: string;
    data: {
        data: Island[];
        pagination: IslandPagination;
    };
    timestamp: string;
}

export interface IslandPayload {
    island_name: string;
}

export interface IslandDetailResponse {
    success: boolean;
    message: string;
    data: Island;
    timestamp: string;
}
