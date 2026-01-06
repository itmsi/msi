import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { ROECalculatorFormData, ROECalculatorValidationErrors } from '../types/roeCalculator';
import { formatCurrency, formatNumberInput, formatNumberInputFadlan, handleKeyPress } from '@/helpers/generalHelper';
import LoadingSpinner from '@/components/common/Loading';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@/components/ui/button/Button';
import { MdCalculate } from 'react-icons/md';

interface Step4Props {
    formData: ROECalculatorFormData;
    validationErrors: ROECalculatorValidationErrors;
    handleInputChange: (field: keyof ROECalculatorFormData, value: any) => void;
    loading: boolean;
    calculatorId?: string;
    saveStep: (step: number, validate: boolean) => Promise<boolean>;
}

export default function Step4MonthlyCosts({ 
    formData, 
    validationErrors, 
    handleInputChange,
    loading,
    calculatorId,
    saveStep
}: Step4Props) {    
    
    const navigate = useNavigate();
    
    const [calculating, setCalculating] = useState(false);
    useEffect(() => {
        if (calculatorId && formData.step && formData.step < 4) {
            navigate(`/roe-roa-calculator/manage/edit/${calculatorId}?step=${formData.step}`, { replace: true });
        }
    }, [formData.step, calculatorId, navigate]);

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
    const handleCalculate = async () => {
        setCalculating(true);
        try {
            await saveStep(4, false);
        } finally {
            setCalculating(false);
        }
    };
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Costs</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Input semua biaya operasional bulanan untuk menghitung total expense
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fuel Expense */}
                <div>
                    <Label htmlFor="fuel_expense">Biaya Ban (Rp/bulan)</Label>
                    <Input
                        id="tyre_expense_monthly"
                        onKeyPress={handleKeyPress}
                        value={formData.tyre_expense_monthly === null ? '' : formatNumberInput(formData.tyre_expense_monthly || formData?.cost_data?.tyre_expense_monthly || '0')}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const value = rawValue === '' ? "0" : rawValue.replace(/[^\d.]/g, '');
                            handleInputChange('tyre_expense_monthly', value);
                        }}
                        maxLength={15}
                        error={!!validationErrors.tyre_expense_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya bahan bakar per bulan</p>
                    {validationErrors.tyre_expense_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.tyre_expense_monthly}</span>
                    )}
                </div>

                {/* Maintenance Expense */}
                <div>
                    <Label htmlFor="maintenance_expense">Biaya Perawatan (Rp)</Label>
                    <Input
                        id="sparepart_expense_monthly"
                        onKeyPress={handleKeyPress}
                        value={formData.sparepart_expense_monthly === null ? '' : formatNumberInput(formData.sparepart_expense_monthly || formData?.cost_data?.sparepart_expense_monthly || '0')}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const value = rawValue === '' ? "0" : rawValue.replace(/[^\d.]/g, '');
                            handleInputChange('sparepart_expense_monthly', value);
                        }}
                        maxLength={15}
                        error={!!validationErrors.sparepart_expense_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya perawatan dan service per bulan</p>
                    {validationErrors.sparepart_expense_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.sparepart_expense_monthly}</span>
                    )}
                </div>

                {/* Operator Salary */}
                <div>
                    <Label htmlFor="operator_salary">Gaji Operator (Rp)</Label>
                    <Input
                        id="operator_salary"
                        onKeyPress={handleKeyPress}
                        value={formData.salary_operator_monthly === null ? '' : formatNumberInput(formData.salary_operator_monthly || formData?.cost_data?.salary_operator_monthly || '0')}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const value = rawValue === '' ? "0" : rawValue.replace(/[^\d.]/g, '');
                            handleInputChange('salary_operator_monthly', value);
                        }}
                        maxLength={15}
                        error={!!validationErrors.operator_salary}
                    />
                    <p className="text-xs text-gray-500 mt-1">Gaji operator dan helper per bulan</p>
                    {validationErrors.operator_salary && (
                        <span className="text-sm text-red-500">{validationErrors.operator_salary}</span>
                    )}
                </div>

                {/* Insurance Expense */}
                <div>
                    <Label htmlFor="insurance_expense">Depresiasi (Rp)</Label>
                    <Input
                        id="insurance_expense"
                        onKeyPress={handleKeyPress}
                        value={formData.depreciation_monthly === null ? '' : formatNumberInputFadlan(formData.depreciation_monthly || formData?.cost_data?.depreciation_monthly || '')}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            if (rawValue === '') {
                                handleInputChange('depreciation_monthly', null);
                                return;
                            }
                            const cleanValue = rawValue
                                .replace(/\./g, '')
                                .replace(',', '.');
                            handleInputChange('depreciation_monthly', cleanValue);
                        }}
                        maxLength={15}
                        error={!!validationErrors.depreciation_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya asuransi per bulan</p>
                    {validationErrors.depreciation_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.depreciation_monthly}</span>
                    )}
                </div>

                {/* Admin Expense */}
                <div>
                    <Label htmlFor="interest_monthly">Bunga (Rp/bulan)</Label>
                    {/* <Input
                        id="interest_monthly"
                        value={formatNumberInputFadlan(formData.interest_monthly || formData?.cost_data?.interest_monthly || '')}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('interest_monthly', value);
                        }}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.interest_monthly}
                    /> */}
                    <Input
                        id="interest_monthly"
                        onKeyPress={handleKeyPress}
                        value={formData.interest_monthly === null ? '' : formatNumberInputFadlan(formData.interest_monthly || formData?.cost_data?.interest_monthly || '')}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            if (rawValue === '') {
                                handleInputChange('interest_monthly', null);
                                return;
                            }
                            const cleanValue = rawValue
                                .replace(/\./g, '')
                                .replace(',', '.');
                            handleInputChange('interest_monthly', cleanValue);
                        }}
                        maxLength={15}
                        error={!!validationErrors.interest_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Bunga per bulan</p>
                    {validationErrors.interest_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.interest_monthly}</span>
                    )}
                </div>

                {/* Other Expense */}
                <div>
                    <Label htmlFor="overhead_monthly">Overhead/G&A (Rp/bulan)</Label>
                    <Input
                        id="overhead_monthly"
                        onKeyPress={handleKeyPress}
                        value={formData.overhead_monthly === null ? '' : formatNumberInput(formData.overhead_monthly || formData?.cost_data?.overhead_monthly || '0')}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const value = rawValue === '' ? "0" : rawValue.replace(/[^\d.]/g, '');
                            handleInputChange('overhead_monthly', value);
                        }}
                        maxLength={15}
                        error={!!validationErrors.overhead_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya lain-lain per bulan</p>
                    {validationErrors.overhead_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.overhead_monthly}</span>
                    )}
                </div>
            </div>


            {/* Calculate Button */}
            <div className="flex justify-center mt-6">
                <Button
                    type="button"
                    onClick={handleCalculate}
                    disabled={calculating}
                    className="flex items-center gap-2"
                >
                <MdCalculate size={16} />
                    {calculating ? 'Calculating...' : 'Simpan & Hitung'}
                </Button>
            </div>

            {/* Monthly Cost Breakdown */}
            <div className="border border-red-200 rounded-lg p-4">
                <h2 className="font-medium text-red-900 mb-4">Detail Biaya Bulanan (Rp)</h2>
                <div className="space-y-4">
                    {formData?.charts_data?.breakdown_biaya.map((item) => {
                        return (
                            <div className="flex justify-between" key={item.title}>
                                <span>{item.title}</span>
                                <span className="font-medium">{formatCurrency(item.nominal)}</span>
                                
                                    {/* <span className="text-sm text-gray-600">{item.persentase}%</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(item.nominal)}</span> */}
                            </div>
                        );
                    })}
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-base">
                    <span className='font-secondary'>Total Pengeluaran Bulanan</span>
                    <span className="text-red-700">{formatCurrency(formData?.charts_data?.revenue_expense_profit?.[0]?.expense || '0')}</span>
                </div>
            </div>

            {/* Expense Categories Breakdown Chart */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 className="font-medium text-red-900 mb-4">Detail Biaya Bulanan (%)</h2>
                <div className="space-y-3">
                    {formData?.charts_data?.breakdown_biaya.map((item, index) => {
                        const colors = [
                                'bg-[#D0BE24]',      // BBM
                                'bg-orange-500',   // Ban
                                'bg-yellow-500',   // Sparepart
                                'bg-green-500',    // Gaji Operator
                                'bg-blue-500',     // Depresiasi
                                'bg-indigo-500',   // Bunga
                                'bg-purple-500'    // Overhead
                            ];
                        return (
                            <div key={item.title}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{item.title}</span>
                                    <span className="font-medium">{item.persentase.toFixed(1)}%</span>
                                </div>
                                <div className={`w-full bg-gray-200 rounded-full h-2`}>
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${colors[index % colors.length]}`}
                                        style={{ width: `${item.persentase}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


        </div>
  );
}