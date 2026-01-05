import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MdKeyboardArrowLeft, MdAdd, MdEdit } from 'react-icons/md';
import ReactECharts from 'echarts-for-react';

import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Loading from '@/components/common/Loading';
import { RoecalculatorService } from './services/roecalculatorService';
import { ManageROEBreakdownData, RevenueExpenseProfit, BreakdownBiayaChart } from '../types/roeCalculator';
import { formatCurrency } from '@/helpers/generalHelper';


export default function BreakdownROECalculator() {
    const navigate = useNavigate();
    const { calculatorId } = useParams<{ calculatorId: string }>();
    const [breakdownData, setBreakdownData] = useState<ManageROEBreakdownData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchBreakdownData = async () => {
            if (!calculatorId) {
                setError('Calculator ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await RoecalculatorService.breakdownRoe(calculatorId);
                
                if (response.data.success) {
                    setBreakdownData(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch breakdown data');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchBreakdownData();
    }, [calculatorId]);

    // Revenue Expense Profit Chart Component
    const RevenueExpenseProfitChart = ({ data }: { data: RevenueExpenseProfit[] }) => {
        const option = {
            title: {
                text: 'Revenue vs Expense vs Profit',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params: any) {
                    let result = `${params[0].axisValue}<br/>`;
                    params.forEach((param: any) => {
                        const value = new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(param.value);
                        result += `${param.marker}${param.seriesName}: ${value}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['Revenue', 'Expense', 'Profit'],
                bottom: '5%'
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.category)
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: function(value: number) {
                        return (value / 1000000).toFixed(0) + 'M';
                    }
                }
            },
            series: [
                {
                    name: 'Revenue',
                    type: 'bar',
                    data: data.map(item => item.revenue),
                    itemStyle: {
                        color: '#10b981'
                    }
                },
                {
                    name: 'Expense',
                    type: 'bar',
                    data: data.map(item => item.expense),
                    itemStyle: {
                        color: '#ef4444'
                    }
                },
                {
                    name: 'Profit',
                    type: 'bar',
                    data: data.map(item => item.profit),
                    itemStyle: {
                        color: '#3b82f6'
                    }
                }
            ]
        };

        return <ReactECharts option={option} style={{ height: '400px' }} />;
    };

    // Breakdown Biaya Doughnut Chart Component
    const BreakdownBiayaChart = ({ data }: { data: BreakdownBiayaChart[] }) => {
        const option = {
            title: {
                text: 'Breakdown Biaya Bulanan',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params: any) {
                    const value = new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(params.value);
                    return `${params.name}: ${value} (${params.percent}%)`;
                }
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: data.map(item => item.title)
            },
            series: [
                {
                    name: 'Biaya',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['60%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: data.map((item, index) => ({
                        value: item.nominal,
                        name: item.title,
                        itemStyle: {
                            color: [
                                '#ef4444', '#f97316', '#eab308', '#22c55e', 
                                '#3b82f6', '#6366f1', '#8b5cf6'
                            ][index % 7]
                        }
                    }))
                }
            ]
        };

        return <ReactECharts option={option} style={{ height: '400px' }} />;
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Breakdown ROE Calculator - MSI Dashboard`}
                description={`ROE ROA Calculator`}
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/roe-roa-calculator/manage')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdAdd size={20} className="text-green-600" />
                            <div className='ms-2'>
                                <h1 className="font-primary-bold font-normal text-xl">Breakdown ROE Calculator</h1>
                            </div>
                        </div>
                        
                        <div className='flex gap-3'>
                            <Button
                                className="group rounded-lg w-full flex items-center justify-center gap-2 font-secondary py-2"
                                onClick={() => navigate(`/roe-roa-calculator/manage/edit/${calculatorId}?step=4}`)}
                            >
                                <MdEdit size={20} className="group-hover:text-white" /> Edit
                            </Button>
                        </div>
                    </div>

                    {breakdownData && (
                        <div className="space-y-6">
                            {/* Key Financial Metrics */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Financial Metrics</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-emerald-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Revenue per Bulan</p>
                                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(breakdownData.key_financial_metrics.revenue_per_bulan)}</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Expense per Bulan</p>
                                        <p className="text-xl font-bold text-red-600">{formatCurrency(breakdownData.key_financial_metrics.total_expense_per_bulan)}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Net Profit per Bulan</p>
                                        <p className="text-xl font-bold text-blue-600">{formatCurrency(breakdownData.key_financial_metrics.net_profit_per_bulan)}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Profit Margin</p>
                                        <p className="text-xl font-bold text-purple-600">{breakdownData.key_financial_metrics.profit_margin.toFixed(2)}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* ROE ROA Metrics */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">ROE & ROA Analysis</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* ROE */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-green-800">Return on Equity (ROE)</h3>
                                            <span className="text-3xl font-bold text-green-600">{breakdownData.roe_roa_metrics.roe.percentage}%</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-green-700">{breakdownData.roe_roa_metrics.roe.description}</p>
                                            <div className="bg-white/50 p-3 rounded border">
                                                <p className="text-xs text-gray-600 mb-1">Formula:</p>
                                                <p className="text-sm font-mono text-green-800">{breakdownData.roe_roa_metrics.roe.calculation.formula}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROA */}
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-blue-800">Return on Assets (ROA)</h3>
                                            <span className="text-3xl font-bold text-blue-600">{breakdownData.roe_roa_metrics.roa.percentage}%</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-blue-700">{breakdownData.roe_roa_metrics.roa.description}</p>
                                            <div className="bg-white/50 p-3 rounded border">
                                                <p className="text-xs text-gray-600 mb-1">Formula:</p>
                                                <p className="text-sm font-mono text-blue-800">{breakdownData.roe_roa_metrics.roa.calculation.formula}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue Expense Profit Chart */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <RevenueExpenseProfitChart data={breakdownData.charts_data.revenue_expense_profit} />
                                </div>

                                {/* Breakdown Biaya Doughnut Chart */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <BreakdownBiayaChart data={breakdownData.charts_data.breakdown_biaya} />
                                </div>
                            </div>

                            {/* Operational Metrics */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Metrik Operasional</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Ritase per Shift</p>
                                        <p className="text-2xl font-bold text-blue-600">{breakdownData.metrik_operasional.ritase_per_hari}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Ritase per Bulan</p>
                                        <p className="text-2xl font-bold text-green-600">{breakdownData.metrik_operasional.ritase_per_bulan}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Tonnage per Bulan</p>
                                        <p className="text-2xl font-bold text-purple-600">{breakdownData.metrik_operasional.tonnage_per_bulan.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Multiple Unit */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Multiple Unit</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Jumlah Unit</p>
                                        <p className="text-xl font-bold text-gray-800">{breakdownData.revenue_multiple_unit.jumlah_unit}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Revenue per Unit</p>
                                        <p className="text-xl font-bold text-gray-800">{formatCurrency(breakdownData.revenue_multiple_unit.revenue_per_unit)}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Revenue</p>
                                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(breakdownData.revenue_multiple_unit.total_revenue)}</p>
                                    </div>
                                </div>
                                {/* <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Formula</p>
                                    <p className="text-sm font-mono text-blue-800">{breakdownData.revenue_multiple_unit.formula}</p>
                                </div> */}
                            </div>

                            {/* BBM Metrics */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Metrik BBM</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">BBM per Ritase (L)</p>
                                        <p className="text-2xl font-bold text-orange-600">{breakdownData.metrik_bbm.bbm_per_ritase}</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Biaya BBM per Ritase</p>
                                        <p className="text-xl font-bold text-red-600">{formatCurrency(breakdownData.metrik_bbm.biaya_bbm_per_ritase)}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Efisiensi L/KM/Ton</p>
                                        <p className="text-2xl font-bold text-yellow-600">{breakdownData.metrik_bbm.efisiensi_l_km_ton}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Cost Breakdown */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detail Biaya Bulanan</h2>
                                <div className="space-y-4">
                                    {breakdownData.charts_data.breakdown_biaya.map((item, index) => {
                                        const colors = [
                                            'bg-red-500',      // BBM
                                            'bg-orange-500',   // Ban
                                            'bg-yellow-500',   // Sparepart
                                            'bg-green-500',    // Gaji Operator
                                            'bg-blue-500',     // Depresiasi
                                            'bg-indigo-500',   // Bunga
                                            'bg-purple-500'    // Overhead
                                        ];
                                        
                                        return (
                                            <div key={item.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                                                    <span className="font-medium text-gray-900">{item.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-600">{item.persentase}%</span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(item.nominal)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Total Expense */}
                                <div className="mt-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-red-800">Total Expense</span>
                                        <span className="text-2xl font-bold text-red-600">{formatCurrency(breakdownData?.charts_data?.revenue_expense_profit?.[0]?.expense || '0')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}