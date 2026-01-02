export interface EmployeeTerritoryRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc';
    search: string;
    is_admin?: boolean;
}
export interface Territory {
  title: string;
}
export interface Employee {
  id: string;
  employee_id: string;
  employee_name: string | null;
  employee_title: string | null;
  territories: Territory[];
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface EmployeeTerritoryResponse {
  success: boolean;
  data: Employee[];
  pagination: Pagination;
}
export interface EmployeeAccess {
  id: string;
  employee_id: string;
  employee_name: string | null;
  employee_title: string | null;
  access_level: "ISLAND" | "GROUP" | "AREA" | "ZONE" | "IUP";
  ref_id: string;
  created_at?: string;   // ISO date string
  updated_at?: string;   // ISO date string
  deleted_at?: string | null;
}

export interface UserAccessTerritory {
  access_level: "ISLAND" | "GROUP" | "AREA" | "ZONE" | "IUP";
  id_territory: string;
}

export interface UserAccessData {
  employee_id: string;
  employee_name: string;
  employee_title: string;
  territories: UserAccessTerritory[];
}

export interface GetUserAccessByIdResponse {
  success: boolean;
  data: UserAccessData;
}