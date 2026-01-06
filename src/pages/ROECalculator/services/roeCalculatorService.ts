import { apiGet, apiPost, apiPut } from '@/helpers/apiHelper';
import apiClient from '@/helpers/apiHelper';
import { ROECalculatorFormData, ROECalculatorData, CalculationResponse, QuoteDefaults, ApiQuoteResponse, ApiQuoteListResponse, ApiCalculationResponse, ApiUnitPurchaseResponse } from '../types/roeCalculator';
import { parseFormatNumber } from '@/helpers/generalHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class ROECalculatorService {
    // Get calculator by ID
    static async getCalculatorById(id: string) {
        try {
            const response = await apiGet(`${API_BASE_URL}/calculations/quotes/${id}`);
            
            // Map API response to frontend format
            const apiData = (response.data as { data: ApiQuoteResponse }).data;
            const mappedData: ROECalculatorData = {
                roe_calculator_id: apiData.id,

                // Step 1 - Basic Info
                customer_id: apiData.customer_id,
                komoditas: apiData.commodity === 'Batu Bara' ? 'batu_bara' : apiData.commodity === 'Nikel' ? 'nikel' : (apiData.commodity?.toLowerCase() === 'batu_bara' || apiData.commodity?.toLowerCase() === 'nikel') ? apiData.commodity?.toLowerCase() as 'batu_bara' | 'nikel' : '',
                tonase_per_ritase: apiData.tonnage_per_ritase || '',
                jarak_haul: apiData.haul_distance || '',
                harga_jual_per_ton: apiData.selling_price_per_ton || '',
                status: (apiData.status === 'draft' || apiData.status === 'presented' || apiData.status === 'won' || apiData.status === 'lost') ? apiData.status : 'draft',
                current_step: 1, // Will be determined by data completeness

                // Step 2 - Unit Purchase Data
                harga_per_unit: apiData.unit_purchases?.price_per_unit || '',
                jumlah_unit: apiData.unit_purchases?.quantity?.toString() || '',
                down_payment_pct: parseFloat(apiData.unit_purchases?.down_payment_percent || '30') || 30,
                tenor_pembiayaan: apiData.unit_purchases?.financing_tenor_months || '',
                interest_rate: apiData.unit_purchases?.interest_rate_flat_per_year || '',
                periode_depresiasi: apiData.unit_purchases?.depreciation_period_months || '',

                // Step 3 - Operational
                ritase_per_shift: '',
                shift_per_hari: '',
                hari_kerja_per_bulan: 0,
                utilization_percent: parseFloat(apiData.utilization_percent || '') || 0,
                downtime_percent: parseInt(apiData.downtime_percent || '') || 0,
                fuel_consumption_type: apiData.fuel_consumption_type || '',
                fuel_consumption: parseFloat(apiData.fuel_consumption || '') || 0,
                fuel_price: parseFloat(apiData.fuel_price || '') || 0,

                // Step 4 - Monthly Costs
                tyre_expense_monthly: apiData.tyre_expense_monthly || '',
                sparepart_expense_monthly: apiData.sparepart_expense_monthly || '',
                salary_operator_monthly: apiData.salary_operator_monthly || '',
                depreciation_monthly: '',
                interest_monthly: apiData.interest_monthly || '',
                overhead_monthly: apiData.overhead_monthly || '',
                expense_notes: '',
                
                // Step 5 - Financial Data (readonly)
                equity_modal: apiData.equity || '',
                liability_hutang: apiData.liability || '',
                step: apiData.step || 1,

                // Initialize other fields with API data or unit_purchases data if available
                // trip_per_bulan: parseInt(apiData.ritase_per_bulan || '20') || 20,
                

                financial_structure: {
                    asset: parseInt(String(apiData?.unit_purchases?.total_asset || '0')) || 0,
                    equity: parseFloat(String(apiData.unit_purchases?.down_payment || '0')) || 0,
                    liability: parseFloat(String(apiData.unit_purchases?.remaining_debt || '0')) || 0,
                    roe_percentage: parseFloat(String(apiData.unit_purchases?.roe_aggregate_percentage || '0')) || 0,
                    roa_percentage: parseFloat(String(apiData.unit_purchases?.roa_aggregate_percentage || '0')) || 0
                },
                monthly_summary: {
                    cicilan_pokok: parseFloat(String(apiData.unit_purchases?.principal_installment || '0')) || 0,
                    bunga_per_bulan: parseFloat(String(apiData.unit_purchases?.interest_per_month || '0')) || 0,
                    total_cicilan_bulan: parseFloat(String(apiData.unit_purchases?.total_installment_per_month || '0')) || 0
                },
                expense_impact: {
                    depreciation_bulan: parseFloat(String(apiData.unit_purchases?.depreciation_per_month || '0' )) || 0,
                    interest_expense_bulan: parseFloat(String(apiData.unit_purchases?.interest_expense_per_month || '0')) || 0,
                    total_fixed_cost_unit: parseFloat(String(apiData.unit_purchases?.total_fixed_cost_from_unit || '0')) || 0
                },
                operation_data: {
                    ritase_per_shift: apiData?.operational?.ritase_per_shift || '',
                    shift_per_hari: apiData?.operational?.shift_per_hari || '',
                    hari_kerja_per_bulan: apiData?.operational?.hari_kerja_per_bulan || '',
                    utilization_percent: apiData?.operational?.utilization_percent || '',
                    downtime_percent: apiData?.operational?.downtime_percent || '0',
                    fuel_consumption_type: apiData?.operational?.fuel_consumption_type || '',
                    fuel_consumption: apiData?.operational?.fuel_consumption || '',
                    fuel_price: apiData?.operational?.fuel_price || '',
                },
                cost_data: {
                    tyre_expense_monthly: apiData?.cost?.tyre_expense_monthly || '',
                    sparepart_expense_monthly: apiData?.cost?.sparepart_expense_monthly || '',
                    salary_operator_monthly: apiData?.cost?.salary_operator_monthly || '',
                    depreciation_monthly: apiData?.unit_purchases?.depreciation_per_month || '',
                    interest_monthly: apiData?.cost?.interest_monthly || '',
                    overhead_monthly: apiData?.cost?.overhead_monthly || '',
                },
                charts_data: apiData?.charts_data || { revenue_expense_profit: [], breakdown_biaya: [] }

            };

            return {
                success: true,
                data: mappedData
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch calculator',
                data: null
            };
        }
    }

    // Create new calculator (Step 1)
    static async createCalculator(data: Partial<ROECalculatorFormData>): Promise<{ success: boolean; data?: ROECalculatorData; message?: string }> {
        try {
            // Map frontend fields to API fields
            const apiData = {
                customer_id: data.customer_id,
                commodity: data.komoditas === 'batu_bara' ? 'Batu Bara' : data.komoditas === 'nikel' ? 'Nikel' : data.komoditas,
                tonnage_per_ritase: data.tonase_per_ritase,
                selling_price_per_ton: data.harga_jual_per_ton,
                haul_distance: data.jarak_haul,
                status: data.status
            };

            const response = await apiPost(`${API_BASE_URL}/calculations/quotes/create`, apiData);
            const responseData = (response.data as { data: ApiQuoteResponse }).data;
            
            const mappedData: ROECalculatorData = {
                roe_calculator_id: responseData.id,
                customer_id: responseData.customer_id,
                komoditas: responseData.commodity === 'Batu Bara' ? 'batu_bara' : responseData.commodity === 'Nikel' ? 'nikel' : (responseData.commodity?.toLowerCase() === 'batu_bara' || responseData.commodity?.toLowerCase() === 'nikel') ? responseData.commodity?.toLowerCase() as 'batu_bara' | 'nikel' : '',
                tonase_per_ritase: responseData.tonnage_per_ritase,
                harga_jual_per_ton: responseData.selling_price_per_ton,
                jarak_haul: responseData.haul_distance,
                status: (responseData.status === 'draft' || responseData.status === 'presented' || responseData.status === 'won' || responseData.status === 'lost') ? responseData.status : '',
                current_step: 1,
                
                harga_per_unit: '',
                jumlah_unit: '',
                down_payment_pct: 30,
                tenor_pembiayaan: 36,
                interest_rate: '',
                periode_depresiasi: '',
                
                ritase_per_shift: '',
                shift_per_hari: '',
                hari_kerja_per_bulan: 0,
                utilization_percent: 0,
                downtime_percent: 0,
                fuel_consumption_type: '',
                fuel_consumption: 0,
                fuel_price: 0,

                step: 1,
                tyre_expense_monthly: '',
                sparepart_expense_monthly: '',
                salary_operator_monthly: '',
                depreciation_monthly: '',
                interest_monthly: '',
                overhead_monthly: '',
                expense_notes: '',
                equity_modal: '',
                liability_hutang: ''
            };

            return {
                success: true,
                data: mappedData,
                message: 'Calculator created successfully'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create calculator'
            };
        }
    }

    // Update calculator step
    static async updateCalculatorStep(id: string, step: number, data: Partial<ROECalculatorFormData>): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
            let apiData: any = {};
            
            switch (step) {
                case 1:
                    apiData = {
                        customer_id: data.customer_id,
                        commodity: data.komoditas === 'batu_bara' ? 'Batu Bara' : data.komoditas === 'nikel' ? 'Nikel' : data.komoditas,
                        tonnage_per_ritase: data.tonase_per_ritase,
                        selling_price_per_ton: data.harga_jual_per_ton,
                        haul_distance: data.jarak_haul,
                        status: data.status
                    };
                    const resStep1 = await apiPut(`${API_BASE_URL}/calculations/quotes/${id}`, apiData);
                    return {
                        success: true,
                        data: resStep1.data,
                        message: 'Step updated successfully'
                    };
                case 2:
                    // Step 2 only saves data, calculation is handled separately
                    apiData = {
                        quote_id: id,
                        price_per_unit: data.harga_per_unit,
                        quantity: data.jumlah_unit,
                        down_payment_percent: data.down_payment_pct,
                        financing_tenor_months: data.tenor_pembiayaan,
                        interest_rate_flat_per_year: data.interest_rate,
                        depreciation_period_months: data.periode_depresiasi
                    };
                    const response = await apiPost(`${API_BASE_URL}/calculations/unit-purchases/create`, apiData);
                    return {
                        success: true,
                        data: response.data,
                        message: 'Step 2 data saved successfully'
                    };
                case 3:
                    apiData = {
                        ritase_per_shift: data.ritase_per_shift,
                        shift_per_hari: data.shift_per_hari,
                        hari_kerja_per_bulan: data.hari_kerja_per_bulan,
                        utilization_percent: data.utilization_percent,
                        downtime_percent: data.downtime_percent,
                        fuel_consumption_type: data.fuel_consumption_type,
                        fuel_consumption: data.fuel_consumption,
                        // fuel_price: data.fuel_price,
                        fuel_price: parseFormatNumber(data.fuel_price?.toString() || '0'),
                    };
                    const resStep3 = await apiPut(`${API_BASE_URL}/calculations/quotes/${id}/operational`, apiData);
                    return {
                        success: true,
                        data: resStep3.data,
                        message: 'Step 3 data saved successfully'
                    };
                case 4:
                    apiData = {
                        tyre_expense_monthly: data.tyre_expense_monthly?.toString() || '0',
                        sparepart_expense_monthly: data.sparepart_expense_monthly?.toString() || '0',
                        salary_operator_monthly: data.salary_operator_monthly?.toString() || '0',
                        depreciation_monthly: data.depreciation_monthly?.toString() || '0',
                        interest_monthly: data.interest_monthly?.toString() || '0',
                        overhead_monthly: data.overhead_monthly?.toString() || '0'
                    };
                    const resStep4 = await apiPut(`${API_BASE_URL}/calculations/quotes/${id}/cost`, apiData);
                    return {
                        success: true,
                        data: resStep4.data,
                        message: 'Step 4 data saved successfully'
                    };
                case 5:
                    apiData = {
                        equity: data.equity_modal,
                        liability: data.liability_hutang
                    };
                    break;
            }

            // const response = await apiPut(`${API_BASE_URL}/calculations/quotes/${id}`, apiData);
            // return {
            //     success: true,
            //     data: response.data,
            //     message: 'Step updated successfully'
            // };
            
            return {
                success: true,
                message: 'Step updated successfully'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update step'
            };
        }
    }

    // Calculate Step 2 - Unit Purchase
    static async calculateStep2(id: string, data: Partial<ROECalculatorFormData>): Promise<{ success: boolean; data?: CalculationResponse; message?: string }> {
        try {
            const apiData = {
                quote_id: id,
                price_per_unit: data.harga_per_unit,
                quantity: data.jumlah_unit,
                down_payment_percent: data.down_payment_pct,
                financing_tenor_months: data.tenor_pembiayaan,
                interest_rate_flat_per_year: data.interest_rate,
                depreciation_period_months: data.periode_depresiasi
            };

            const response = await apiPost(`${API_BASE_URL}/calculations/unit-purchases/create`, apiData);
            
            // Map response to CalculationResponse format for display
            if (response.data) {
                const unitData = (response.data as { data: ApiUnitPurchaseResponse }).data;
        
                const calculationResult: CalculationResponse = {
                    financial_structure: {
                        asset: parseFloat(unitData.total_asset) || 0,
                        equity: parseFloat(unitData.down_payment) || 0,
                        liability: parseFloat(unitData.remaining_debt) || 0,
                        roe_percentage: parseFloat(unitData.roe_aggregate_percentage) || 0,
                        roa_percentage: parseFloat(unitData.roa_aggregate_percentage) || 0
                    },
                    monthly_summary: {
                        cicilan_pokok: parseFloat(unitData.principal_installment) || 0,
                        bunga_per_bulan: parseFloat(unitData.interest_per_month) || 0,
                        total_cicilan_bulan: parseFloat(unitData.total_installment_per_month) || 0
                    },
                    expense_impact: {
                        depreciation_bulan: parseFloat(unitData.depreciation_per_month) || 0,
                        interest_expense_bulan: parseFloat(unitData.interest_expense_per_month) || 0,
                        total_fixed_cost_unit: parseFloat(unitData.total_fixed_cost_from_unit) || 0
                    },
                    total_asset: parseFloat(unitData.total_asset) || 0,
                    debt_to_equity_ratio: (parseFloat(unitData.remaining_debt) || 0) / (parseFloat(unitData.down_payment) || 1)
                };
        
                return {
                    success: true,
                    data: calculationResult,
                    message: 'Unit purchase calculated successfully'
                };
            }
      
            return {
                success: false,
                message: 'No calculation data received'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to calculate unit purchase'
            };
        }
    }

    // Calculate financial data (other steps)
    static async calculateFinancials(id: string, payload: Partial<ROECalculatorFormData>): Promise<{ success: boolean; data?: CalculationResponse; message?: string }> {
        try {
            // Skip if no valid ID (during create process)
            if (!id || id === 'undefined') {
                return {
                    success: false,
                    message: 'Calculator ID is required for financial calculations'
                };
            }

            const apiData = {
                customer_id: payload.customer_id,
                commodity: payload.komoditas === 'batu_bara' ? 'Batu Bara' : payload.komoditas === 'nikel' ? 'Nikel' : payload.komoditas,
                tonnage_per_ritase: payload.tonase_per_ritase,
                selling_price_per_ton: payload.harga_jual_per_ton,
                haul_distance: payload.jarak_haul,
                status: payload.status
            };

            const response = await apiPut(`${API_BASE_URL}/calculations/quotes/${id}`, apiData);
        
            // Map API response to CalculationResponse format
            const calcData = response.data as ApiCalculationResponse;
            const mappedResponse: CalculationResponse = {
                financial_structure: {
                    asset: parseFloat(calcData.financial.assets) || 0,
                    equity: parseFloat(calcData.financial.equity) || 0,
                    liability: parseFloat(calcData.financial.liability) || 0,
                    roe_percentage: parseFloat(calcData.roe_aggregate_percentage) || 0,
                    roa_percentage: parseFloat(calcData.roa_aggregate_percentage) || 0
                },
                monthly_summary: {
                    cicilan_pokok: parseFloat(calcData.unit_purchases.principal_installment) || 0,
                    bunga_per_bulan: parseFloat(calcData.unit_purchases.interest_monthly) || 0,
                    total_cicilan_bulan: parseFloat(calcData.unit_purchases.total_installment_per_month) || 0
                },
                expense_impact: {
                    depreciation_bulan: parseFloat(calcData.unit_purchases.depreciation_per_month) || 0,
                    interest_expense_bulan: parseFloat(calcData.unit_purchases.interest_expense_per_month) || 0,
                    total_fixed_cost_unit: parseFloat(calcData.unit_purchases.total_fixed_cost_from_unit) || 0
                },
                total_asset: parseFloat(calcData.financial.assets) || 0,
                debt_to_equity_ratio: (parseFloat(calcData.financial.liability) || 0) / (parseFloat(calcData.financial.equity) || 1)
            };

            return {
                success: true,
                data: mappedResponse
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to calculate financials 1'
            };
        }
    }

    // Get quote defaults
    static async getQuoteDefaults(): Promise<{ success: boolean; data?: QuoteDefaults; message?: string }> {
        try {
            const response = await apiClient.get(`${API_BASE_URL}/calculations/quote-defaults/self`);
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch defaults'
            };
        }
    }

    // Get all calculators with pagination
    static async getAllCalculators(params: any = {}): Promise<{ success: boolean; data?: ROECalculatorData[]; message?: string }> {
        try {
            const response = await apiClient.get(`${API_BASE_URL}/calculations/quotes`, { params });
            
            // Map each calculator in the response
            const listData = response.data as ApiQuoteListResponse;
            const mappedData: ROECalculatorData[] = (listData.data || []).map((item: ApiQuoteResponse): ROECalculatorData => ({
                roe_calculator_id: item.id,
                customer_id: item.customer_id,
                customer_name: item.customer?.name || 'Unknown',
                komoditas: (() => {
                    if (item.commodity === 'Batu Bara') return 'batu_bara' as const;
                    if (item.commodity === 'Nikel') return 'nikel' as const;
                    if (item.commodity?.toLowerCase() === 'batu_bara') return 'batu_bara' as const;
                    if (item.commodity?.toLowerCase() === 'nikel') return 'nikel' as const;
                    return '' as const;
                })(),
                tonase_per_ritase: item.tonnage_per_ritase || '',
                harga_jual_per_ton: item.selling_price_per_ton || '',
                jarak_haul: item.haul_distance || '',
                status: (() => {
                    if (item.status === 'draft') return 'draft' as const;
                    if (item.status === 'presented') return 'presented' as const;
                    if (item.status === 'won') return 'won' as const;
                    if (item.status === 'lost') return 'lost' as const;
                    return '' as const;
                })(),
                current_step: item.revenue_monthly ? 5 : item.equity ? 4 : item.fuel_consumption ? 3 : item.tonnage_per_ritase ? 2 : 1,
                // Basic unit info for display
                harga_per_unit: '',
                jumlah_unit: '1',
                down_payment_pct: 30,
                tenor_pembiayaan: '',
                interest_rate: '',
                periode_depresiasi: '',

                ritase_per_shift: '',
                shift_per_hari: '',
                hari_kerja_per_bulan: 0,
                utilization_percent: 0,
                downtime_percent: 0,
                fuel_consumption_type: '',
                fuel_consumption: 0,
                fuel_price: 0,
                
                step: item.step || 1,
                tyre_expense_monthly: '',
                sparepart_expense_monthly: '',
                salary_operator_monthly: '',
                depreciation_monthly: '',
                interest_monthly: '',
                overhead_monthly: '',
                expense_notes: '',
                equity_modal: item.equity || '',
                liability_hutang: item.liability || ''
            }));

            return {
                success: true,
                data: mappedData
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch calculators'
            };
        }
    }

    // Delete calculator
    static async deleteCalculator(id: string) {
        try {
            await apiClient.delete(`${API_BASE_URL}/calculations/quotes/${id}`);
            return {
                success: true,
                message: 'Calculator deleted successfully'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete calculator'
            };
        }
    }
}