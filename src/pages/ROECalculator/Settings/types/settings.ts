export interface RorSettingsListResponse {
    success: boolean;
    message: string;
    data: {
        data: RorSettingsRecord[];
        pagination: Pagination;
    };
}

export interface RorSettingsRecord {
    id: string;
    user_id: string;
    customer_id: string;

    ritase_per_shift: number;
    shift_per_hari: number;
    hari_kerja_per_bulan: number;

    utilization_percent: number;
    downtime_percent: number;

    fuel_consumption_type: string;
    fuel_consumption: number;
    fuel_price: number;

    tyre_expense_monthly: number;
    sparepart_expense_monthly: number;
    salary_operator_monthly: number;
    depreciation_monthly: number;
    interest_monthly: number;
    overhead_monthly: number;

    equity: number;
    liability: number;

    created_at: string;
    updated_at: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface RorSettingsRequest {
  page: number;
  limit: number;
  sort_by: string;
  search?: string;
  sort_order?: "asc" | "desc";
}
