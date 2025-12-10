import Label from '@/components/form/Label';
import { ROECalculatorFormData, CalculationResponse } from '../types/roeCalculator';
import Input from '@/components/form/input/InputField';
import { formatNumberInput } from '@/helpers/generalHelper';
import { useEffect } from 'react';

interface Step5Props {
    formData: ROECalculatorFormData;
    calculationResults: CalculationResponse | null;
    calculatorId?: string;
}

export default function Step5FinancialData({ 
    formData, 
    calculatorId
    // calculationResults 
}: Step5Props) {
    
    // Validasi step: hanya bisa akses step 5 jika sudah menyelesaikan step 4
    useEffect(() => {
        if (calculatorId && formData.step && formData.step < 5) {
            window.location.href = `/roe-roa-calculator/manage/edit/${calculatorId}?step=${formData.step}`;
        }
    }, [formData.step, calculatorId]);
  // const formatCurrency = (value: number) => {
  //   return new Intl.NumberFormat('id-ID', {
  //     style: 'currency',
  //     currency: 'IDR',
  //     minimumFractionDigits: 0
  //   }).format(value);
  // };

  // const formatPercentage = (value: number) => {
  //   return `${value.toFixed(2)}%`;
  // };

//   const calculateRevenue = () => {
//     // const hargaPerTon = parseFloat(formData.harga_per_ton) || 0;
//     // const tonnagePerTrip = parseFloat(formData.tonnage_per_trip) || 0;
//     // const tripPerBulan = formData.trip_per_bulan || 0;
//     // const utilizationRate = formData.utilization_percent || 0;
    
//     // return hargaPerTon * tonnagePerTrip * tripPerBulan * (utilizationRate / 100);
//   };

  // const calculateTotalExpense = () => {
  //   const variableExpenses = [
  //     parseFloat(formData.fuel_expense) || 0,
  //     parseFloat(formData.maintenance_expense) || 0,
  //     parseFloat(formData.operator_salary) || 0,
  //     parseFloat(formData.insurance_expense) || 0,
  //     parseFloat(formData.admin_expense) || 0,
  //     parseFloat(formData.other_expense) || 0
  //   ].reduce((sum, expense) => sum + expense, 0);

    // const fixedExpenses = calculationResults?.expense_impact.total_fixed_cost_unit || 0;
    
  //   return variableExpenses + fixedExpenses;
  // };

//   const calculateNetProfit = () => {
//     // return calculateRevenue() - calculateTotalExpense();
//   };

//   const getRatioColor = (value: number, type: 'roe' | 'roa') => {
//     const thresholds = type === 'roe' ? [15, 25] : [8, 15];
//     if (value >= thresholds[1]) return 'text-green-600';
//     if (value >= thresholds[0]) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   const getPerformanceLevel = (value: number, type: 'roe' | 'roa') => {
//     const thresholds = type === 'roe' ? [15, 25] : [8, 15];
//     if (value >= thresholds[1]) return 'Excellent';
//     if (value >= thresholds[0]) return 'Good';
//     return 'Need Improvement';
//   };


  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary & ROE/ROA Analysis</h3>
            <p className="text-sm text-gray-600 mb-6">
                
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fuel Expense */}
            <div>
                <Label htmlFor="equity">Equity / Modal Sendiri (Rp)</Label>
                <Input
                    id="equity"
                    value={formatNumberInput(formData.equity_modal || formData?.financial_data?.equity || '')}
                    readonly
                />
            </div>
            <div>
                <Label htmlFor="liability">Liability / Hutang (Rp)</Label>
                <Input
                    id="liability"
                    value={formatNumberInput(formData.liability_hutang || formData?.financial_data?.liability || '')}
                    readonly
                />
            </div>
        </div>
    </div>
    // <div className="space-y-6">
    //   <div>
    //     <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary & ROE/ROA Analysis</h3>
    //     <p className="text-sm text-gray-600 mb-6">
    //       Ringkasan lengkap perhitungan finansial dan analisis ROE/ROA berdasarkan data yang telah diinput
    //     </p>
    //   </div>

    //   {/* Revenue Summary */}
    //   <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    //     <h4 className="font-medium text-green-900 mb-4">Revenue Analysis</h4>
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //       <div className="text-center">
    //         <Label>Monthly Revenue</Label>
    //         <p className="text-xl font-bold text-green-700">
    //           {formatCurrency(calculateRevenue())}
    //         </p>
    //       </div>
    //       <div className="text-center">
    //         <Label>Revenue per Trip</Label>
    //         <p className="text-lg font-medium text-green-600">
    //           {formatCurrency(calculateRevenue() / (formData.trip_per_bulan || 1))}
    //         </p>
    //       </div>
    //       <div className="text-center">
    //         <Label>Revenue per Ton</Label>
    //         <p className="text-lg font-medium text-green-600">
    //           {formatCurrency(parseFloat(formData.harga_per_ton) || 0)}
    //         </p>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Expense Summary */}
    //   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    //     <h4 className="font-medium text-red-900 mb-4">Expense Analysis</h4>
    //     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    //       <div className="text-center">
    //         <Label>Variable Expense</Label>
    //         <p className="text-lg font-bold text-red-700">
    //           {formatCurrency([
    //             parseFloat(formData.fuel_expense) || 0,
    //             parseFloat(formData.maintenance_expense) || 0,
    //             parseFloat(formData.operator_salary) || 0,
    //             parseFloat(formData.insurance_expense) || 0,
    //             parseFloat(formData.interest_monthly) || 0,
    //             parseFloat(formData.overhead_monthly) || 0
    //           ].reduce((sum, exp) => sum + exp, 0))}
    //         </p>
    //       </div>
    //       <div className="text-center">
    //         <Label>Fixed Expense (Unit)</Label>
    //         <p className="text-lg font-bold text-red-700">
    //           {formatCurrency(calculationResults?.expense_impact.total_fixed_cost_unit || 0)}
    //         </p>
    //       </div>
    //       <div className="text-center">
    //         <Label>Total Expense</Label>
    //         <p className="text-xl font-bold text-red-800">
    //           {formatCurrency(calculateTotalExpense())}
    //         </p>
    //       </div>
    //       <div className="text-center">
    //         <Label>Expense Ratio</Label>
    //         <p className="text-lg font-medium text-red-600">
    //           {calculateRevenue() > 0 ? formatPercentage((calculateTotalExpense() / calculateRevenue()) * 100) : '0%'}
    //         </p>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Profit Analysis */}
    //   <div className={`border rounded-lg p-4 ${calculateNetProfit() >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
    //     <h4 className={`font-medium mb-4 ${calculateNetProfit() >= 0 ? 'text-green-900' : 'text-red-900'}`}>
    //       Profit Analysis
    //     </h4>
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //       <div className="text-center">
    //         <Label>Net Profit/Month</Label>
    //         <p className={`text-2xl font-bold ${calculateNetProfit() >= 0 ? 'text-green-700' : 'text-red-700'}`}>
    //           {formatCurrency(calculateNetProfit())}
    //         </p>
    //       </div>
    //       <div className="text-center">
    //         <Label>Profit Margin</Label>
    //         <p className={`text-lg font-medium ${calculateNetProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    //           {calculateRevenue() > 0 ? formatPercentage((calculateNetProfit() / calculateRevenue()) * 100) : '0%'}
    //         </p>
    //       </div>
    //       <div className="text-center">
    //         <Label>Profit per Trip</Label>
    //         <p className={`text-lg font-medium ${calculateNetProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    //           {formatCurrency(calculateNetProfit() / (formData.trip_per_bulan || 1))}
    //         </p>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Financial Structure */}
    //   {calculationResults && (
    //     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    //       <h4 className="font-medium text-blue-900 mb-4">Financial Structure</h4>
    //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //         <div className="text-center p-3 bg-white rounded border">
    //           <Label>ASSET</Label>
    //           <p className="text-xl font-bold text-blue-700">
    //             {formatCurrency(calculationResults.financial_structure.asset)}
    //           </p>
    //           <p className="text-sm text-gray-600">Total Asset Value</p>
    //         </div>
    //         <div className="text-center p-3 bg-white rounded border">
    //           <Label>EQUITY</Label>
    //           <p className="text-xl font-bold text-green-700">
    //             {formatCurrency(calculationResults.financial_structure.equity)}
    //           </p>
    //           <p className="text-sm text-gray-600">Owner's Capital</p>
    //         </div>
    //         <div className="text-center p-3 bg-white rounded border">
    //           <Label>LIABILITY</Label>
    //           <p className="text-xl font-bold text-orange-700">
    //             {formatCurrency(calculationResults.financial_structure.liability)}
    //           </p>
    //           <p className="text-sm text-gray-600">Debt Financing</p>
    //         </div>
    //       </div>
    //       <div className="mt-4 text-center">
    //         <Label>Debt to Equity Ratio</Label>
    //         <p className="text-lg font-bold text-gray-700">
    //           {calculationResults.debt_to_equity_ratio.toFixed(2)}
    //         </p>
    //         <p className="text-xs text-gray-600">
    //           {calculationResults.debt_to_equity_ratio < 1 ? 'Conservative Leverage' : 
    //            calculationResults.debt_to_equity_ratio < 2 ? 'Moderate Leverage' : 'High Leverage'}
    //         </p>
    //       </div>
    //     </div>
    //   )}

    //   {/* ROE & ROA Analysis - Main Results */}
    //   {calculationResults && (
    //     <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
    //       <h4 className="font-medium text-purple-900 mb-6 text-center text-lg">
    //         ROE & ROA Performance Analysis
    //       </h4>
          
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //         {/* ROE Analysis */}
    //         <div className="text-center p-4 bg-white rounded-lg border">
    //           <Label className="text-lg">Return on Equity (ROE)</Label>
    //           <p className={`text-4xl font-bold mb-2 ${getRatioColor(calculationResults.financial_structure.roe_percentage, 'roe')}`}>
    //             {formatPercentage(calculationResults.financial_structure.roe_percentage)}
    //           </p>
    //           <p className={`text-lg font-medium mb-2 ${getRatioColor(calculationResults.financial_structure.roe_percentage, 'roe')}`}>
    //             {getPerformanceLevel(calculationResults.financial_structure.roe_percentage, 'roe')}
    //           </p>
    //           <p className="text-sm text-gray-600">
    //             Net Profit / Equity × 100%
    //           </p>
    //           <div className="mt-3 text-xs text-gray-500">
    //             <p>Excellent: ≥ 25%</p>
    //             <p>Good: 15% - 24%</p>
    //             <p>Need Improvement: &lt; 15%</p>
    //           </div>
    //         </div>

    //         {/* ROA Analysis */}
    //         <div className="text-center p-4 bg-white rounded-lg border">
    //           <Label className="text-lg">Return on Asset (ROA)</Label>
    //           <p className={`text-4xl font-bold mb-2 ${getRatioColor(calculationResults.financial_structure.roa_percentage, 'roa')}`}>
    //             {formatPercentage(calculationResults.financial_structure.roa_percentage)}
    //           </p>
    //           <p className={`text-lg font-medium mb-2 ${getRatioColor(calculationResults.financial_structure.roa_percentage, 'roa')}`}>
    //             {getPerformanceLevel(calculationResults.financial_structure.roa_percentage, 'roa')}
    //           </p>
    //           <p className="text-sm text-gray-600">
    //             Net Profit / Total Asset × 100%
    //           </p>
    //           <div className="mt-3 text-xs text-gray-500">
    //             <p>Excellent: ≥ 15%</p>
    //             <p>Good: 8% - 14%</p>
    //             <p>Need Improvement: &lt; 8%</p>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   )}

    //   {/* Business Recommendations */}
    //   {calculationResults && (
    //     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    //       <h4 className="font-medium text-yellow-900 mb-4">Business Recommendations</h4>
    //       <div className="space-y-3 text-sm">
    //         {calculateNetProfit() <= 0 && (
    //           <div className="flex items-start gap-2">
    //             <span className="text-red-500 font-bold">⚠️</span>
    //             <p className="text-red-700">
    //               <strong>Urgent:</strong> Bisnis mengalami kerugian. Evaluasi struktur biaya dan tingkatkan revenue atau kurangi expense.
    //             </p>
    //           </div>
    //         )}
            
    //         {calculationResults.financial_structure.roe_percentage < 15 && (
    //           <div className="flex items-start gap-2">
    //             <span className="text-yellow-600 font-bold">💡</span>
    //             <p className="text-yellow-800">
    //               <strong>ROE Improvement:</strong> ROE di bawah 15%. Pertimbangkan untuk meningkatkan profit margin atau mengoptimalkan struktur modal.
    //             </p>
    //           </div>
    //         )}

    //         {calculationResults.financial_structure.roa_percentage < 8 && (
    //           <div className="flex items-start gap-2">
    //             <span className="text-yellow-600 font-bold">💡</span>
    //             <p className="text-yellow-800">
    //               <strong>ROA Improvement:</strong> ROA di bawah 8%. Fokus pada peningkatan utilization rate dan efisiensi operasional.
    //             </p>
    //           </div>
    //         )}

    //         {calculationResults.debt_to_equity_ratio > 2 && (
    //           <div className="flex items-start gap-2">
    //             <span className="text-orange-500 font-bold">⚖️</span>
    //             <p className="text-orange-700">
    //               <strong>Leverage Risk:</strong> Debt to Equity ratio tinggi ({calculationResults.debt_to_equity_ratio.toFixed(2)}). Pertimbangkan menambah modal atau mengurangi debt.
    //             </p>
    //           </div>
    //         )}

    //         {formData.utilization_rate < 80 && (
    //           <div className="flex items-start gap-2">
    //             <span className="text-blue-500 font-bold">📈</span>
    //             <p className="text-blue-700">
    //               <strong>Utilization Opportunity:</strong> Utilization rate {formData.utilization_rate}%. Ada potensi peningkatan revenue dengan optimasi operasional.
    //             </p>
    //           </div>
    //         )}

    //         <div className="flex items-start gap-2">
    //           <span className="text-green-500 font-bold">✅</span>
    //           <p className="text-green-700">
    //             <strong>Next Steps:</strong> Monitor performance bulanan, review expense secara berkala, dan pertimbangkan ekspansi jika ROE/ROA konsisten tinggi.
    //           </p>
    //         </div>
    //       </div>
    //     </div>
    //   )}

    //   {/* Calculation Notes */}
    //   {formData.expense_notes && (
    //     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    //       <h4 className="font-medium text-gray-900 mb-2">Catatan Tambahan</h4>
    //       <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.expense_notes}</p>
    //     </div>
    //   )}
    // </div>
  );
}