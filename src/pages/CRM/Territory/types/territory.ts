export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: Pagination;
}
export interface TerritoryRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc';
    search: string;
    status?: 'aktif' | 'inactive' | 'non aktif' | '';
    is_admin?: boolean;
}
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface BaseEntity {
    id: string;
    name: string;
    code: string;
    status: 'aktif' | 'inactive' | 'non aktif';
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}
export interface IUP extends BaseEntity {
    type: 'iup';
    iup_segment_id: string;
    children: null;
}
export interface IUPSegmentation extends BaseEntity {
    type: 'iup_segmentation';
    iup_zone_id: string;
    children: IUP[];
}
export interface IUPZone extends BaseEntity {
    type: 'iup_zone';
    area_id: string;
    children: IUPSegmentation[];
}
export interface Area extends BaseEntity {
    type: 'area';
    group_id: string;
    children: IUPZone[];
}
export interface Group extends BaseEntity {
    type: 'group';
    island_id: string;
    children: Area[];
}
export interface Island extends BaseEntity {
    type: 'island';
    children: Group[];
}

export interface CreateTerritoryRequest {
    type: 'island' | 'group' | 'area' | 'iup_zone' | 'iup_segmentation' | 'iup';
    name: string;
    code: string;
    status: 'aktif' | 'inactive' | 'non aktif';
    island_id?: string;
    group_id?: string;
    area_id?: string;
    iup_zone_id?: string;
    iup_segment_id?: string;
}

export interface UpdateTerritoryRequest {
    type: 'island' | 'group' | 'area' | 'iup_zone' | 'iup_segmentation' | 'iup';
    name: string;
    code: string;
    status: 'aktif' | 'inactive' | 'non aktif';
}
export interface DeleteTerritoryRequest {
    id: string;
    type: 'island' | 'group' | 'area' | 'iup_zone' | 'iup_segmentation' | 'iup';
}