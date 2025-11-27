export interface RorEntity {
   id: string;
   user_id: string;
   commodity: string;
   tonnage_per_ritase: string;
   selling_price_per_ton: string;
   haul_distance: string;
   status: string;

   ritase_per_shift: string;
   shift_per_hari: string;
   hari_kerja_per_bulan: string;
   utilization_percent: string;
   downtime_percent: string;

   fuel_consumption_type: string;
   fuel_consumption: string;
   fuel_price: string;

   tyre_expense_monthly: string;
   sparepart_expense_monthly: string;
   salary_operator_monthly: string;
   depreciation_monthly: string;
   interest_monthly: string;
   overhead_monthly: string;

   equity: string;
   liability: string;
   assets: string;

   revenue_monthly: string | null;
   total_expense_monthly: string | null;
   net_profit_monthly: string | null;
   profit_margin: string | null;
   roa_aggregate_percentage: string | null;
   roe_aggregate_percentage: string | null;

   ritase_per_hari: string | null;
   ritase_per_bulan: string | null;
   tonnage_per_bulan: string | null;
   fuel_per_ritase: string | null;
   fuel_cost_per_ritase: string | null;
   efficiency: string | null;

   created_at: string;
   updated_at: string;
   deleted_at: string | null;
   created_by: string;
   updated_by: string;
   deleted_by: string | null;

   is_delete: boolean;

   customer_id: string;
   customer_name: string;

   roa_individual_percentage: string | null;
   roa_individual_nominal: string | null;
   roe_individual_percentage: string | null;
   roe_individual_nominal: string | null;
   roa_aggregate_nominal: string | null;
   roe_aggregate_nominal: string | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CreateRorRequest {
    customer_id: string;
    commodity: string;
    tonnage_per_ritase: number;
    selling_price_per_ton: number;
    haul_distance: number;
    status: "draft" | "published" | string;
}

export interface RorListResponse {
    success: boolean;
    message: string;
    data: {
        data: RorEntity[];
        pagination: Pagination;
    };
    timestamp: string;
}

export interface RorDetailResponse {
    success: boolean;
    message: string;
    data: RorEntity;
    timestamp: string;
}

export interface RorListRequest {
  page: number;
  limit: number;
  search?: string;
  sort_order?: "asc" | "desc";
  status?: string; // contoh: "draft", "published"
  commodity?: string | 'batu bara' | 'nikel'; 
}
