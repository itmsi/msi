export interface ROECalculatorFormData {
    // Step 1 - Basic Info
    customer_id: string;
    komoditas: 'batu_bara' | 'nikel' | '';
    tonase_per_ritase: string;
    jarak_haul: string;
    harga_jual_per_ton: string;
    status: 'draft' | 'presented' | 'won' | 'lost' | '';
    
    // Step 2 - Unit Purchase Data  
    harga_per_unit: string;
    jumlah_unit: string;
    down_payment_pct: number | string;
    tenor_pembiayaan: number | string;
    interest_rate: string;
    periode_depresiasi: number | string;
    
    // Step 3 - Operational
    ritase_per_shift: string;
    shift_per_hari: string;
    hari_kerja_per_bulan: number;
    utilization_percent: number;
    downtime_percent: number;
    fuel_consumption_type: string;
    fuel_consumption: number;
    fuel_price: number;
    
    // Step 4 - Monthly Costs
    tyre_expense_monthly: string;
    sparepart_expense_monthly: string;
    salary_operator_monthly: string;
    depreciation_monthly: string;
    interest_monthly: string;
    overhead_monthly: string;
    expense_notes: string;
    
    // Step 5 - Financial Data (readonly)
    equity_modal: string;
    liability_hutang: string;

    step: number;

    financial_structure?: FinancialStructure;
    monthly_summary?: MonthlySummary;
    expense_impact?: ExpenseImpact;
    operation_data?: RorOperationalStructure;
    calculation_data?: CalculationResponse;
    cost_data?: RorConstStructure;
    financial_data?: FinancialStructureSetting;
    quote_defaults?: QuoteDefaults;
}

export interface ROECalculatorValidationErrors {
    customer_id?: string;
    komoditas?: string;
    tonase_per_ritase?: string;
    jarak_haul?: string;
    harga_jual_per_ton?: string;
    status?: string;
    harga_per_unit?: string;
    jumlah_unit?: string;
    interest_rate?: string;
    harga_per_ton?: string;
    tonnage_per_trip?: string;
    trip_per_bulan?: string;
    fuel_expense?: string;
    maintenance_expense?: string;
    operator_salary?: string;
    insurance_expense?: string;
    interest_monthly?: string;
    overhead_monthly?: string;
    ritase_per_shift?: string;
    shift_per_hari?: string;
    hari_kerja_per_bulan?: string;
    fuel_consumption_type?: string;
    tyre_expense_monthly?: string;
    depreciation_monthly?: string;
    salary_operator_monthly?: string;
    sparepart_expense_monthly?: string;
}

// Financial Structure Response
export interface FinancialStructure {
    asset: number;
    equity: number;
    liability: number;
    roe_percentage: number | string;
    roa_percentage: number | string;
}
export interface FinancialStructureSetting {
    equity: number;
    liability: number;
}

// Monthly Payment Summary  
export interface MonthlySummary {
    cicilan_pokok: number;
    bunga_per_bulan: number;
    total_cicilan_bulan: number;
}

// Expense Impact
export interface ExpenseImpact {
    depreciation_bulan: number;
    interest_expense_bulan: number;
    total_fixed_cost_unit: number;
}

// API Response for calculations
export interface CalculationResponse {
    financial_structure: FinancialStructure;
    monthly_summary: MonthlySummary;
    expense_impact: ExpenseImpact;
    total_asset: number;
    debt_to_equity_ratio: number;
}

// Quote defaults response
export interface QuoteDefaults {
    harga_per_ton: number;
    tonnage_per_trip: number;
    trip_per_bulan: number;
    utilization_rate: number;
    working_days_per_month: number;
    capacity_factor: number;
}

export interface ROECalculatorData extends ROECalculatorFormData {
    roe_calculator_id: string;
    current_step: number;
    customer_name?: string;
}

// API Response Interfaces
export interface ApiQuoteResponse {
    id: string;
    user_id: string;
    customer_id: string;
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
    roa_individual_percentage: string | null;
    roa_individual_nominal: string | null;
    roe_individual_percentage: string | null;
    roe_individual_nominal: string | null;
    roa_aggregate_nominal: string | null;
    roe_aggregate_nominal: string | null;
    customer_name?: string;
    step?: number;
    unit_purchases?: {
        id: string;
        quote_id: string;
        price_per_unit: string;
        quantity: number;
        total_asset: number;
        down_payment_percent: string;
        down_payment: number;
        remaining_debt: number;
        financing_tenor_months: number;
        interest_rate_flat_per_year: string;
        depreciation_period_months: number;
        principal_installment: string;
        interest_per_month: string;
        total_installment_per_month: string;
        depreciation_per_month: string;
        interest_expense_per_month: string;
        total_fixed_cost_from_unit: string;
        roe_aggregate_percentage: string;
        roa_aggregate_percentage: string;
        customer_id: string;
    };
    const?: RorConstStructure;
    financial?: FinancialStructure;
    operational?: RorOperationalStructure;
    cost?: RorConstStructure;
    customer?: {
        name: string;
    };
}

export interface ApiQuoteListResponse {
    data: ApiQuoteResponse[];
    meta?: {
        total: number;
        per_page: number;
        current_page: number;
    };
}

export interface ApiCalculationResponse {
    assets: string;
    equity: string;
    liability: string;
    roe_aggregate_percentage: string;
    roa_aggregate_percentage: string;
    depreciation_monthly: string;
    interest_monthly: string;
    total_expense_monthly: string;
    revenue_monthly: string;
    net_profit_monthly: string;
}

export interface ApiUnitPurchaseResponse {
    id: string;
    quote_id: string;
    price_per_unit: string;
    quantity: number;
    total_asset: string;
    down_payment_percent: string;
    down_payment: string;
    remaining_debt: string;
    financing_tenor_months: number;
    interest_rate_flat_per_year: string;
    depreciation_period_months: number;
    principal_installment: string;
    interest_per_month: string;
    total_installment_per_month: string;
    depreciation_per_month: string;
    interest_expense_per_month: string;
    total_fixed_cost_from_unit: string;
    created_at: string;
    updated_at: string;
    customer_id: string;
    roe_aggregate_percentage: string;
    roa_aggregate_percentage: string;
    financial_summary: {
        individual: {
            asset: number;
            equity: number;
            liability: number;
            roa_percentage: number;
            roe_percentage: number;
            roa_nominal: number;
            roe_nominal: number;
        };
        aggregate: {
            asset: number;
            equity: number;
            liability: number;
            roa_percentage: number | null;
            roe_percentage: number | null;
        };
    };
    "Monthly Installment Summary": {
        principal_installment: number;
        interest_per_month: number;
        total_installment_per_month: number;
    };
    "Impact on Total Expense": {
        principal_installment: number;
        interest_per_month: number;
        total_fixed_cost_from_unit: number;
    };
}

export interface RorOperationalStructure {
    ritase_per_shift: string;
    shift_per_hari: string;
    hari_kerja_per_bulan: string;
    utilization_percent: string;
    downtime_percent: string;
    fuel_consumption_type: string;
    fuel_consumption: string;
    fuel_price: string;
}

export interface RorConstStructure {
    tyre_expense_monthly: string;
    sparepart_expense_monthly: string;
    salary_operator_monthly: string;
    depreciation_monthly: string;
    interest_monthly: string;
    overhead_monthly: string;
};
// ========================================
// API Response Interfaces
export interface DetailResponse {
    id: string;
    user_id: string;
    customer_id: string;
    customer_name: string | null;

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

    roa_individual_percentage: string | null;
    roa_individual_nominal: string | null;
    roe_individual_percentage: string | null;
    roe_individual_nominal: string | null;

    roa_aggregate_nominal: string | null;
    roe_aggregate_nominal: string | null;

    ritase_per_hari: string | null;
    ritase_per_bulan: string | null;
    tonnage_per_bulan: string | null;
    fuel_per_ritase: string | null;
    fuel_cost_per_ritase: string | null;
    efficiency: string | null;

    unit_purchases: UnitPurchase | null;
}
export interface UnitPurchase {
    id: string;
    quote_id: string;

    price_per_unit: string;
    quantity: number;
    total_asset: string;

    down_payment_percent: string;
    down_payment: string;
    remaining_debt: string;

    financing_tenor_months: number;
    interest_rate_flat_per_year: string;

    depreciation_period_months: number;

    principal_installment: string;
    interest_per_month: string;
    total_installment_per_month: string;

    depreciation_per_month: string;
    interest_expense_per_month: string;

    total_fixed_cost_from_unit: string;

    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    created_by: string | null;
    updated_by: string | null;
    deleted_by: string | null;

    is_delete: boolean;
    customer_id: string;
}

// Types for PDF/Download Response
export interface ManageROEDataPDF {
    id: string;
    user_id: string;
    commodity: string;
    tonnage_per_ritase: number;
    selling_price_per_ton: number;
    haul_distance: number;
    status: string;
    ritase_per_shift: number;
    shift_per_hari: number;
    hari_kerja_per_bulan: number;
    utilization_percent: string;
    downtime_percent: string;
    fuel_consumption_type: string;
    fuel_consumption: string;
    fuel_price: number;
    tyre_expense_monthly: string;
    sparepart_expense_monthly: string;
    salary_operator_monthly: string;
    depreciation_monthly: string;
    interest_monthly: string;
    overhead_monthly: string;
    equity: number;
    liability: number;
    assets: number;
    revenue_monthly: number;
    total_expense_monthly: number;
    net_profit_monthly: number | null;
    profit_margin: number | null;
    roa_aggregate_percentage: number;
    roe_aggregate_percentage: number;
    ritase_per_hari: number | null;
    ritase_per_bulan: number | null;
    tonnage_per_bulan: number | null;
    fuel_per_ritase: number | null;
    fuel_cost_per_ritase: number | null;
    efficiency: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    created_by: string;
    updated_by: string;
    deleted_by: string | null;
    is_delete: boolean;
    customer_id: string;
    roa_individual_percentage: number;
    roa_individual_nominal: number;
    roe_individual_percentage: number;
    roe_individual_nominal: number;
    roa_aggregate_nominal: number;
    roe_aggregate_nominal: number;
    step: number;
    customer_name: string;
    roa_percentage: number | null;
    roe_percentage: number | null;
    fuel_cost_monthly: number | null;
    unit_purchases: UnitPurchasePDF;
    operational: OperationalPDF;
    cost: CostPDF;
    financial: FinancialPDF;
}

export interface UnitPurchasePDF {
    id: string;
    quote_id: string;
    customer_id: string;
    price_per_unit: number;
    quantity: number;
    total_asset: number;
    down_payment_percent: number;
    down_payment: number;
    remaining_debt: number;
    financing_tenor_months: number;
    interest_rate_flat_per_year: number;
    depreciation_period_months: number;
    principal_installment: number;
    interest_per_month: number;
    total_installment_per_month: number;
    depreciation_per_month: number;
    interest_expense_per_month: number;
    total_fixed_cost_from_unit: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface OperationalPDF {
    ritase_per_shift: number;
    shift_per_hari: number;
    hari_kerja_per_bulan: number;
    utilization_percent: number;
    downtime_percent: number;
    fuel_consumption_type: string;
    fuel_consumption: number;
    fuel_price: number;
}

export interface CostPDF {
    tyre_expense_monthly: number;
    sparepart_expense_monthly: number;
    salary_operator_monthly: number;
    depreciation_monthly: number;
    interest_monthly: number;
    overhead_monthly: number;
}

export interface FinancialPDF {
    equity: number;
    liability: number;
    assets: number;
}

export interface ManageROEPDFResponse {
    success: boolean;
    message: string;
    data: ManageROEDataPDF;
    timestamp: string;
}
