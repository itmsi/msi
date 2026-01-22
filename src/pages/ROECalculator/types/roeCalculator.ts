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
    charts_data?: ChartsData;
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
    tenor_pembiayaan?: string;
    periode_depresiasi?: string;
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
    utilization_percent?: string;
    hari_kerja_per_bulan?: string;
    fuel_consumption_type?: string;
    fuel_consumption?: string;
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
    charts_data?: ChartsData;
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
    financial: {
        assets: string;
        equity: string;
        liability: string;
    };
    unit_purchases: {
        principal_installment: string;
        interest_monthly: string;
        total_installment_per_month: string;
        depreciation_per_month: string;
        interest_expense_per_month: string;
        total_fixed_cost_from_unit: string;
    };
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


// ========================================
export interface ManageROEPDFResponse {
    success: boolean;
    message: string;
    data: ManageROEDataPDF;
    timestamp: string;
}

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
    tyre_expense_monthly: number;
    sparepart_expense_monthly: number;
    salary_operator_monthly: number;
    depreciation_monthly: number;
    interest_monthly: number;
    overhead_monthly: number;
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

    pdf_data: PDFData;
}

/* ---------------------------- CHILD INTERFACES ---------------------------- */

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

/* ----------------------------- PDF DATA BARU ----------------------------- */

export interface PDFData {
    key_financial_metrics: PDFKeyFinancialMetrics;
    revenue: PDFRevenue;
    expenses: PDFExpenses;
    asset_liability: PDFAsetLiability;
}

/* ✔ Key Financial Metrics */
export interface PDFKeyFinancialMetrics {
    roe_percentage: number;
    roa_percentage: number;
    revenue_per_bulan: number;
    expenses_per_bulan: number;
    net_profit_per_bulan: number;
}

/* ✔ Revenue Section */
export interface PDFRevenue {
    data_operasional: PDFDataOperasional;
    hasil_produksi: PDFHasilProduksi;
    total_revenue_per_bulan: number;
    formula_revenue: string;
}

export interface PDFDataOperasional {
    tonnage_per_ritase: number;
    haul_distance: number;
    selling_price_per_ton: number;
    ritase_per_shift: number;
    shift_per_hari: number;
    hari_kerja_per_bulan: number;
    utilization_percent: number;
}

export interface PDFHasilProduksi {
    ritase_per_hari: number;
    ritase_per_bulan: number;
    tonnage_per_bulan: number;
}

/* ✔ Expenses Section */
export interface PDFExpenses {
    detail: PDFExpensesDetail;
    total_expense: number;
}

export interface PDFExpensesDetail {
    bbm: PDFExpenseItem;
    ban: PDFExpenseItem;
    sparepart: PDFExpenseItem;
    gaji_operator: PDFExpenseItem;
    depresiasi: PDFExpenseItem;
    bunga: PDFExpenseItem;
    overhead: PDFExpenseItem;
}

export interface PDFExpenseItem {
    nominal: number;
    persentase: number;
}

/* ✔ Asset Liability Section */
export interface PDFAsetLiability {
    unit_purchase: PDFUnitPurchase;
    cicilan_bulanan: PDFInstallment;
    equity: number;
    liability: number;
    total_aset: number;
    formula_equity: string;
    formula_liability: string;
}

export interface PDFUnitPurchase {
    harga_per_unit: number;
    qty_unit: number;
    down_payment_percent: number;
    tenor_pembiayaan: number;
    interest_rate_flat: number;
    total_aset: number;
    formula_total_aset: string;
}

export interface PDFInstallment {
    cicilan_pokok: number;
    bunga: number;
    total_per_bulan: number;
    rasio_keuangan: {
        cicilan_pokok: number;
        bunga: number;
    };
}


export interface ManageROEBreakdownResponse {
    success: boolean;
    message: string;
    data: ManageROEBreakdownData;
}

/* ========================= MAIN DATA ========================= */

export interface ManageROEBreakdownData {
    key_financial_metrics: KeyFinancialMetrics;
    roe_roa_metrics: ROEROAMetrics;
    charts_data: ChartsData;
    metrik_operasional: MetrikOperasional;
    revenue_multiple_unit: RevenueMultipleUnit;
    metrik_bbm: MetrikBBM;
    detail_biaya_bulanan: DetailBiayaBulanan;
    total_expense: number;
}

/* ========================= KEY FINANCIAL METRICS ========================= */

export interface KeyFinancialMetrics {
    revenue_per_bulan: number;
    total_expense_per_bulan: number;
    net_profit_per_bulan: number;
    profit_margin: number;
}

/* ========================= ROE ROA METRICS ========================= */

export interface ROEROAMetrics {
    roe: ROEMetric;
    roa: ROAMetric;
}

export interface ROEMetric {
    percentage: number;
    calculation: ROECalculation;
    description: string;
}

export interface ROAMetric {
    percentage: number;
    calculation: ROACalculation;
    description: string;
}

export interface ROECalculation {
    net_profit: number;
    equity: number;
    formula: string;
}

export interface ROACalculation {
    net_profit: number;
    total_assets: number;
    formula: string;
}

/* ========================= CHARTS DATA ========================= */

export interface ChartsData {
    revenue_expense_profit: RevenueExpenseProfit[];
    breakdown_biaya: BreakdownBiayaChart[];
}

export interface RevenueExpenseProfit {
    category: string;
    revenue: number;
    expense: number;
    profit: number;
}

export interface BreakdownBiayaChart {
    title: string;
    nominal: number;
    persentase: number;
}

/* ========================= METRIK ========================= */

export interface MetrikOperasional {
    ritase_per_hari: number;
    ritase_per_bulan: number;
    tonnage_per_bulan: number;
}

export interface RevenueMultipleUnit {
    jumlah_unit: number;
    revenue_per_unit: number;
    total_revenue: number;
    formula: string;
}

export interface MetrikBBM {
    bbm_per_ritase: number;
    biaya_bbm_per_ritase: number;
    efisiensi_l_km_ton: number;
}

/* ========================= BIAYA ========================= */

export interface DetailBiayaBulanan {
    bbm: BiayaItem;
    ban: BiayaItem;
    sparepart: BiayaItem;
    gaji_operator: BiayaItem;
    depresiasi: BiayaItem;
    bunga: BiayaItem;
    overhead: BiayaItem;
}

export interface BiayaItem {
    nominal: number;
    persentase: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ManageROECompareResponse {
    success: boolean;
    message: string;
    data: {
        data: ManageROECompareData[];
        pagination: Pagination;
    };
}
export interface ManageROECompareData {
  brand: string;
  tonase: number;
  ritase: number;
  qty: number;
  price: number;
  fuel: number;
  revenue: number;
  expenses: number;
  asset: number;
  equity: number;
  liability: number;
  roe_percentage: number;
  roe_nominal: number;
  roa_percentage: number;
  roa_nominal: number;
  roe_percentage_diff: number;
  roe_nominal_diff: number;
  roa_percentage_diff: number;
  roa_nominal_diff: number;
}

export interface CompareListRequest {
    quote_id: string;
    page: number;
    limit: number;
    search?: string;
    sort_order?: "asc" | "desc";
}
export interface ComparePayload {
    quote_id: string;
    brand: string;
    tonase: number;
    ritase: number;
    qty: number;
    price_per_unit: number;
}