import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { ROECalculatorFormData, ROECalculatorValidationErrors } from '../types/roeCalculator';
import { formatCurrency, formatNumberInput, handleKeyPress } from '@/helpers/generalHelper';
import LoadingSpinner from '@/components/common/Loading';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

interface Step4Props {
    formData: ROECalculatorFormData;
    validationErrors: ROECalculatorValidationErrors;
    handleInputChange: (field: keyof ROECalculatorFormData, value: any) => void;
    loading: boolean;
    calculatorId?: string;
}

export default function Step4MonthlyCosts({ 
    formData, 
    validationErrors, 
    handleInputChange,
    loading,
    calculatorId
}: Step4Props) {
    const navigate = useNavigate();
    useEffect(() => {
        if (calculatorId && formData.step && formData.step < 4) {
            navigate(`/roe-roa-calculator/manage/edit/${calculatorId}?step=${formData.step}`, { replace: true });
        }
    }, [formData.step, calculatorId, navigate]);
    const calculateTotalExpense = () => {
        const expenses = [
            parseFloat(formData.tyre_expense_monthly) || 0,
            parseFloat(formData.sparepart_expense_monthly) || 0,
            parseFloat(formData.salary_operator_monthly) || 0,
            parseFloat(formData.depreciation_monthly) || 0,
            parseFloat(formData.interest_monthly) || 0,
            parseFloat(formData.overhead_monthly) || 0
        ];
        return expenses.reduce((sum, expense) => sum + expense, 0);
    };

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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Costs</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Input semua biaya operasional bulanan untuk menghitung total expense
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fuel Expense */}
                <div>
                    <Label htmlFor="fuel_expense">Tyre Expense (Rp/bulan)</Label>
                    <Input
                        id="tyre_expense_monthly"
                        value={formatNumberInput(formData.tyre_expense_monthly || formData?.cost_data?.tyre_expense_monthly || '')}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('tyre_expense_monthly', value);
                        }}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.tyre_expense_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya bahan bakar per bulan</p>
                    {validationErrors.tyre_expense_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.tyre_expense_monthly}</span>
                    )}
                </div>

                {/* Maintenance Expense */}
                <div>
                    <Label htmlFor="maintenance_expense">Maintenance Expense (Rp)</Label>
                    <Input
                        id="sparepart_expense_monthly"
                        value={formatNumberInput(formData.sparepart_expense_monthly || formData?.cost_data?.sparepart_expense_monthly || '')}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('sparepart_expense_monthly', value);
                        }}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.sparepart_expense_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya perawatan dan service per bulan</p>
                    {validationErrors.sparepart_expense_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.sparepart_expense_monthly}</span>
                    )}
                </div>

                {/* Operator Salary */}
                <div>
                    <Label htmlFor="operator_salary">Operator Salary (Rp)</Label>
                    <Input
                        id="operator_salary"
                        value={formatNumberInput(formData.salary_operator_monthly || formData?.cost_data?.salary_operator_monthly || '')}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('salary_operator_monthly', value);
                        }}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.operator_salary}
                    />
                    <p className="text-xs text-gray-500 mt-1">Gaji operator dan helper per bulan</p>
                    {validationErrors.operator_salary && (
                        <span className="text-sm text-red-500">{validationErrors.operator_salary}</span>
                    )}
                </div>

                {/* Insurance Expense */}
                <div>
                    <Label htmlFor="insurance_expense">Insurance Expense (Rp)</Label>
                    <Input
                        id="insurance_expense"
                        value={formatNumberInput(formData.depreciation_monthly || formData?.cost_data?.depreciation_monthly || '')}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('depreciation_monthly', value);
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="500000"
                        error={!!validationErrors.depreciation_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya asuransi per bulan</p>
                    {validationErrors.depreciation_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.depreciation_monthly}</span>
                    )}
                </div>

                {/* Admin Expense */}
                <div>
                    <Label htmlFor="interest_monthly">Interest (Rp/bulan)</Label>
                    <Input
                        id="interest_monthly"
                        value={formatNumberInput(formData.interest_monthly || formData?.cost_data?.interest_monthly || '')}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('interest_monthly', value);
                        }}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.interest_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya administrasi dan operasional lainnya</p>
                    {validationErrors.interest_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.interest_monthly}</span>
                    )}
                </div>

                {/* Other Expense */}
                <div>
                    <Label htmlFor="overhead_monthly">Overhead/G&A (Rp/bulan)</Label>
                    <Input
                        id="overhead_monthly"
                        value={formatNumberInput(formData.overhead_monthly || formData?.cost_data?.overhead_monthly || '')}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('overhead_monthly', value);
                        }}
                        onKeyPress={handleKeyPress}
                        error={!!validationErrors.overhead_monthly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Biaya lain-lain per bulan</p>
                    {validationErrors.overhead_monthly && (
                        <span className="text-sm text-red-500">{validationErrors.overhead_monthly}</span>
                    )}
                </div>
            </div>

            {/* Total Expense Summary */}
            <div className="border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-4">Total Monthly Expense</h4>
                
                {/* Expense Breakdown */}
                <div className="space-y-2 text-sm mb-4">
                    {parseFloat(formData.tyre_expense_monthly) > 0 && (
                        <div className="flex justify-between">
                            <span>Tyre Expense</span>
                            <span className="font-medium">{formatCurrency(parseFloat(formData.tyre_expense_monthly))}</span>
                        </div>
                    )}
                    {parseFloat(formData.sparepart_expense_monthly) > 0 && (
                        <div className="flex justify-between">
                            <span>Maintenance Expense:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(formData.sparepart_expense_monthly))}</span>
                        </div>
                    )}
                    {parseFloat(formData.salary_operator_monthly) > 0 && (
                        <div className="flex justify-between">
                            <span>Operator Salary:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(formData.salary_operator_monthly))}</span>
                        </div>
                    )}
                    {parseFloat(formData.depreciation_monthly) > 0 && (
                        <div className="flex justify-between">
                            <span>Insurance Expense:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(formData.depreciation_monthly))}</span>
                        </div>
                    )}
                    {parseFloat(formData.interest_monthly) > 0 && (
                        <div className="flex justify-between">
                            <span>Interest Monthly:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(formData.interest_monthly))}</span>
                        </div>
                    )}
                    {parseFloat(formData.overhead_monthly) > 0 && (
                        <div className="flex justify-between">
                            <span>Overhead Monthly:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(formData.overhead_monthly))}</span>
                        </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                        <span>Total Variable Expense:</span>
                        <span className="text-red-700">{formatCurrency(calculateTotalExpense())}</span>
                    </div>
                </div>

                {/* Expense Analysis */}
                        {/* value={formData.ritase_per_shift || formData?.operation_data?.ritase_per_shift || ''} */}
                {/* {calculateTotalExpense() > 0 && (
                <div className="mt-4 pt-4 border-t border-red-200">
                    <h5 className="font-medium text-red-900 mb-2">Analisis Expense</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-600">Expense per Trip</p>
                            <p className="font-bold text-red-700">
                                {formatCurrency(calculateTotalExpense() / (formData.trip_per_bulan || 1))}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">Expense per Ton</p>
                            <p className="font-bold text-red-700">
                            {formatCurrency(
                                calculateTotalExpense() / 
                                ((parseFloat(formData.tonnage_per_trip) || 0) * (formData.trip_per_bulan || 1))
                            )}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">Expense per Working Day</p>
                            <p className="font-bold text-red-700">
                                {formatCurrency(calculateTotalExpense() / (formData.working_days_per_month || 1))}
                            </p>
                        </div>
                    </div>
                </div>
                )} */}

                <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-600">Equity / Modal Sendiri (Rp)</p>
                            <p className="font-bold text-gray-700">
                                {formatNumberInput(formData.equity_modal || formData?.financial_data?.equity || '')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">Liability / Hutang (Rp)</p>
                            <p className="font-bold text-gray-700">
                            {formatNumberInput(formData.liability_hutang || formData?.financial_data?.liability || '')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expense Categories Breakdown Chart */}
            {calculateTotalExpense() > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Expense Categories (%)</h4>
                    <div className="space-y-3">
                        {/* Tyre Expense Percentage */}
                        {(() => {
                            const value = parseFloat(formData.tyre_expense_monthly) || 0;
                            const percentage = calculateTotalExpense() > 0 ? (value / calculateTotalExpense()) * 100 : 0;
                            if (percentage > 0) {
                                return (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Fuel Expense</span>
                                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Maintenance Expense Percentage */}
                        {(() => {
                            const value = parseFloat(formData.sparepart_expense_monthly) || 0;
                            const percentage = calculateTotalExpense() > 0 ? (value / calculateTotalExpense()) * 100 : 0;
                            if (percentage > 0) {
                                return (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Maintenance Expense</span>
                                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Operator Salary Percentage */}
                        {(() => {
                            const value = parseFloat(formData.salary_operator_monthly) || 0;
                            const percentage = calculateTotalExpense() > 0 ? (value / calculateTotalExpense()) * 100 : 0;
                            if (percentage > 0) {
                                return (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Operator Salary</span>
                                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Insurance Expense Percentage */}
                        {(() => {
                            const value = parseFloat(formData.depreciation_monthly) || 0;
                            const percentage = calculateTotalExpense() > 0 ? (value / calculateTotalExpense()) * 100 : 0;
                            if (percentage > 0) {
                                return (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Insurance Expense</span>
                                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Admin Expense Percentage */}
                        {(() => {
                            const value = parseFloat(formData.interest_monthly) || 0;
                            const percentage = calculateTotalExpense() > 0 ? (value / calculateTotalExpense()) * 100 : 0;
                            if (percentage > 0) {
                                return (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Admin Expense</span>
                                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Other Expense Percentage */}
                        {(() => {
                            const value = parseFloat(formData.overhead_monthly) || 0;
                            const percentage = calculateTotalExpense() > 0 ? (value / calculateTotalExpense()) * 100 : 0;
                            if (percentage > 0) {
                                return (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Other Expense</span>
                                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
            )}

        </div>
  );
}