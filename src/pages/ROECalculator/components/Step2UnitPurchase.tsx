import { useState } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { MdCalculate } from 'react-icons/md';
import { ROECalculatorFormData, ROECalculatorValidationErrors, CalculationResponse } from '../types/roeCalculator';
import { formatCurrency, formatNumberInput, handleKeyPress, allowOnlyNumeric } from '@/helpers/generalHelper';
import LoadingSpinner from '@/components/common/Loading';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

interface Step2Props {
    formData: ROECalculatorFormData;
    validationErrors: ROECalculatorValidationErrors;
    handleInputChange: (field: keyof ROECalculatorFormData, value: any) => void;
    calculationResults: CalculationResponse | null;
    calculateStep2: () => Promise<boolean>;
    loading?: boolean;
    calculatorId?: string;
}

export default function Step2UnitPurchase({ 
    formData, 
    validationErrors, 
    handleInputChange, 
    calculationResults,
    calculateStep2,
    loading,
    calculatorId
}: Step2Props) {
    const navigate = useNavigate();
    const [calculating, setCalculating] = useState(false);
    
    useEffect(() => {
        if (calculatorId && formData.step && formData.step < 2) {
            navigate(`/roe-roa-calculator/manage/edit/${calculatorId}?step=${formData.step}`, { replace: true });
        }
    }, [formData.step, calculatorId, navigate]);

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            await calculateStep2();
        } finally {
            setCalculating(false);
        }
    };

    useEffect(() => {
        if (calculationResults) {
            if (calculationResults.financial_structure) {
                handleInputChange('financial_structure', calculationResults.financial_structure);
            }
            if (calculationResults.monthly_summary) {
                handleInputChange('monthly_summary', calculationResults.monthly_summary);
            }
            if (calculationResults.expense_impact) {
                handleInputChange('expense_impact', calculationResults.expense_impact);
            }
        }
    }, [calculationResults, handleInputChange]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="text-gray-600">Please wait while we fetch your purchase data...</p>
                </div>
            </div>
        );
    }
    return (
        
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Pembelian Unit</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Input data pembelian unit dan struktur pembiayaan
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {/* Harga Per Unit */}
                <div className="md:col-span-3">
                    <Label htmlFor="harga_per_unit">Harga Per Unit (Rp)</Label>
                    <Input
                        id="harga_per_unit"
                        type="text"
                        value={formatNumberInput(formData.harga_per_unit)}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('harga_per_unit', value);
                        }}
                        error={!!validationErrors.harga_per_unit}
                    />
                    {validationErrors.harga_per_unit && (
                        <span className="text-sm text-red-500">{validationErrors.harga_per_unit}</span>
                    )}
                </div>

                {/* Jumlah Unit */}
                <div className="md:col-span-3">
                    <Label htmlFor="jumlah_unit">Jumlah Unit (Qty)</Label>
                    <Input
                        id="jumlah_unit"
                        value={formData.jumlah_unit}
                        onChange={(e) => handleInputChange('jumlah_unit', e.target.value)}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.jumlah_unit}
                    />
                    {validationErrors.jumlah_unit && (
                        <span className="text-sm text-red-500">{validationErrors.jumlah_unit}</span>
                    )}
                </div>

                {/* Total Asset Display */}
                {(formData.financial_structure?.asset || (calculationResults?.financial_structure?.asset != null && calculationResults.financial_structure.asset !== 0)) && (
                    <div className="md:col-span-6 p-4 bg-blue-50 rounded-lg">
                        <Label>Total Asset</Label>
                        <p className="text-xl font-bold text-blue-900">
                            {formatCurrency(formData.financial_structure?.asset ?? calculationResults?.financial_structure?.asset ?? 0)}
                        </p>
                    </div>
                )}

                {/* Down Payment Slider */}
                <div className='md:col-span-6'>
                    <Label htmlFor="down_payment_pct">Down Payment (%)</Label>
                    <div className="space-y-2">
                        <input
                            id="down_payment_pct"
                            type="range"
                            min={0}
                            max={100}
                            value={formData.down_payment_pct}
                            onChange={(e) => handleInputChange('down_payment_pct', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>0%</span>
                            <span className="font-medium">{formData.down_payment_pct}%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* Tenor Pembiayaan */}
                <div className="md:col-span-2">
                    <Label htmlFor="tenor_pembiayaan">Tenor Pembiayaan (Bulan)</Label>
                    <Input
                        id="tenor_pembiayaan"
                        value={formData.tenor_pembiayaan}
                        maxLength={3}
                        onKeyPress={handleKeyPress}
                        onChange={(e) => handleInputChange('tenor_pembiayaan', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {Math.round((parseFloat(String(formData.tenor_pembiayaan || '0')) / 12) * 10) / 10} tahun
                    </p>
                </div>

                {/* Interest Rate */}
                <div className="md:col-span-2">
                    <Label htmlFor="interest_rate">Interest Rate Flat per Tahun (%)</Label>
                    <Input
                        id="interest_rate"
                        onKeyPress={allowOnlyNumeric}
                        value={formData.interest_rate}
                        maxLength={5}
                        onChange={(e) => {
                            handleInputChange('interest_rate', e.target.value);
                        }}
                        error={!!validationErrors.interest_rate}
                    />
                    {validationErrors.interest_rate && (
                        <span className="text-sm text-red-500">{validationErrors.interest_rate}</span>
                    )}
                </div>

                {/* Periode Depresiasi */}
                <div className="md:col-span-2">
                    <Label htmlFor="periode_depresiasi">Periode Depresiasi (Bulan)</Label>
                    <Input
                        id="periode_depresiasi"
                        onKeyPress={allowOnlyNumeric}
                        value={formData.periode_depresiasi}
                        onChange={(e) => handleInputChange('periode_depresiasi', e.target.value)}
                    />
                </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center mt-6">
                <Button
                    type="button"
                    onClick={handleCalculate}
                    disabled={calculating || !formData.harga_per_unit || !formData.jumlah_unit}
                    className="flex items-center gap-2"
                >
                <MdCalculate size={16} />
                    {calculating ? 'Calculating...' : 'Simpan & Hitung'}
                </Button>
            </div>
                
                {/* Calculation Results */}
                <div className="mt-8 space-y-6">
                    {/* Financial Structure */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">Struktur Financial</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <Label>ASSET</Label>
                                <p className="text-lg font-bold text-green-900">
                                    {formatCurrency(formData.financial_structure?.asset ?? calculationResults?.financial_structure?.asset ?? 0)}
                                </p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <Label>EQUITY</Label>
                                <p className="text-lg font-bold text-blue-900">
                                    {formatCurrency(formData.financial_structure?.equity ?? calculationResults?.financial_structure?.equity ?? 0)}
                                </p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <Label>LIABILITY</Label>
                                <p className="text-lg font-bold text-orange-900">
                                    {formatCurrency(formData.financial_structure?.liability ?? calculationResults?.financial_structure?.liability ?? 0)}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                            Catatan: ROE dihitung dari Profit/Equity dihitung dari Profit/Asset
                        </p>
                    </div>

                    {/* Monthly Summary */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">Ringkasan Cicilan Bulanan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <Label>Cicilan Pokok</Label>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(formData.monthly_summary?.cicilan_pokok ?? calculationResults?.monthly_summary?.cicilan_pokok ?? 0)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <Label>Bunga per Bulan</Label>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(formData.monthly_summary?.bunga_per_bulan ?? calculationResults?.monthly_summary?.bunga_per_bulan ?? 0)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <Label>Total Cicilan/Bulan</Label>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(formData.monthly_summary?.total_cicilan_bulan ?? calculationResults?.monthly_summary?.total_cicilan_bulan ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Expense Impact */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-4">Impact ke Total Expense</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-red-50 p-4 rounded-lg">
                                <Label>Depreciation/Bulan</Label>
                                <p className="text-lg font-bold text-red-900">
                                    {formatCurrency(formData.expense_impact?.depreciation_bulan ?? calculationResults?.expense_impact?.depreciation_bulan ?? 0)}
                                </p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <Label>Interest Expense/Bulan</Label>
                                <p className="text-lg font-bold text-red-900">
                                    {formatCurrency(formData.expense_impact?.interest_expense_bulan ?? calculationResults?.expense_impact?.interest_expense_bulan ?? 0)}
                                </p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <Label>Total Fixed Cost dari Unit</Label>
                                <p className="text-lg font-bold text-red-900">
                                    {formatCurrency(calculationResults?.expense_impact?.total_fixed_cost_unit ?? formData.expense_impact?.total_fixed_cost_unit ?? 0)}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                            Nilai ini otomatis masuk ke Total Expense dan mempengaruhi Net Profit, ROE, dan ROA
                        </p>
                    </div>
                </div>
        </div>
    );
}