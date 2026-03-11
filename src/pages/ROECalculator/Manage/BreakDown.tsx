import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MdKeyboardArrowLeft, MdAdd, MdEdit, MdDeleteOutline } from 'react-icons/md';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { TableColumn } from 'react-data-table-component';
import { toast } from 'react-hot-toast';

import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Loading from '@/components/common/Loading';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Modal } from '@/components/ui/modal';
import { RoecalculatorService } from './services/roecalculatorService';
import { ManageROEBreakdownData, RevenueExpenseProfit, BreakdownBiayaChart, CompareListRequest, Pagination, ManageROECompareData } from '../types/roeCalculator';
import { formatCurrency, formatNumberInput, handleDecimalInput, handleKeyPress } from '@/helpers/generalHelper';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { PermissionButton, PermissionGate } from '@/components/common/PermissionComponents';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import Alert from '@/components/ui/alert/Alert';
import CustomSelect from '@/components/form/select/CustomSelect';
import { useLanguage } from '@/components/lang/useLanguage';
import { roeCalculatorLabels } from '../language/roeCalculatorLabels';
import LanguageSwitcher from '@/components/lang/LanguageSwitcher';

echarts.use([
    BarChart,
    PieChart,
    CanvasRenderer
]);


export default function BreakdownROECalculator() {
    const { lang, langField, setLang } = useLanguage(roeCalculatorLabels);
    const navigate = useNavigate();
    const { calculatorId } = useParams<{ calculatorId: string }>();
    const [breakdownData, setBreakdownData] = useState<ManageROEBreakdownData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Function to translate cost breakdown titles
    const translateCostTitle = (title: string): string => {
        const titleMap: { [key: string]: string } = {
            'BBM': langField('costBBM'),
            'Ban': langField('costBan'),
            'Sparepart': langField('costSparepart'),
            'Gaji Operator': langField('costGajiOperator'),
            'Depresiasi': langField('costDepresiasi'),
            'Bunga': langField('costBunga'),
            'Overhead': langField('costOverhead')
        };
        return titleMap[title] || title;
    };

    
    const [compareBreakDown, setCompareBreakDown] = useState<ManageROECompareData[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddingCompare, setIsAddingCompare] = useState(false);
    const [compareFormData, setCompareFormData] = useState({
        brand: '',
        tonase: '',
        ritase: '',
        qty: '',
        price_per_unit: '',
        fuel_consumption: '',
    });
    const [compareFormErrors, setCompareFormErrors] = useState({
        brand: ''
    });
    const [confirmDelete, setConfirmDelete] = useState({
        show: false,
        id: '',
        name: ''
    });
    const [isDeletingCompare, setIsDeletingCompare] = useState(false);
    
    // Sort states
    const [sortField, setSortField] = useState<string>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const fetchCompareData = async (params: Partial<CompareListRequest> = {}) => {
        try {
            // Add sort parameters to the request
            const requestParams = {
                ...params,
                sort_by: sortField,
                sort_order: sortDirection
            };
            
            const response = await RoecalculatorService.getCompareRoe(requestParams);
            if (response.success) {
                setCompareBreakDown(response.data.data);
                const apiPagination = response.data.pagination;
                setPagination({
                    page: apiPagination.page,
                    limit: apiPagination.limit,
                    total: apiPagination.total,
                    totalPages: apiPagination.totalPages,
                });
            } else {
                setError(response.message || 'Failed to fetch comparison data');
            }
        } catch (err) {
            console.error('Fetch comparison data error:', err);
        }
    };

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
                    const compareParams = {
                        quote_id: calculatorId,
                        page: 1,
                        limit: 10,
                    };
                    fetchCompareData(compareParams);
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

    // Handle form input changes
    const handleCompareFormChange = (field: string, value: string) => {
        setCompareFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (compareFormErrors[field as keyof typeof compareFormErrors]) {
            setCompareFormErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Validation function
    const validateCompareForm = () => {
        const errors = {
            brand: ''
        };
        let isValid = true;

        if (!compareFormData.brand.trim()) {
            errors.brand = langField('brandRequired');
            isValid = false;
        } else if (compareFormData.brand.trim().length < 2) {
            errors.brand = langField('brandMinLength');
            isValid = false;
        }

        setCompareFormErrors(errors);
        return isValid;
    };

    // Handle add new comparison
    const handleAddComparison = async () => {
        if (!validateCompareForm()) {
            toast.error(langField('correctValidationErrors'));
            return;
        }

        if (!calculatorId) {
            toast.error(langField('calculatorIdRequired'));
            return;
        }

        setIsAddingCompare(true);
        try {
            const payload = {
                quote_id: calculatorId,
                brand: compareFormData.brand.trim(),
                tonase: compareFormData.tonase !=='' ? parseFloat(compareFormData.tonase) : 0,
                ritase: compareFormData.ritase !=='' ? parseFloat(compareFormData.ritase) : 0,
                qty: compareFormData.qty !=='' ? parseInt(compareFormData.qty) : 0,
                price_per_unit: compareFormData.price_per_unit !=='' ? parseInt(compareFormData.price_per_unit.replace(/[^\d]/g, '')) : 0,
                fuel_consumption: compareFormData.fuel_consumption !=='' ? parseFloat(compareFormData.fuel_consumption) : 0,
            };

            const response = await RoecalculatorService.addCompare(payload);
            
            if (response.success) {
                toast.success(langField('comparisonAddedSuccess'));
                setIsAddModalOpen(false);
                setCompareFormData({
                    brand: '',
                    tonase: '',
                    ritase: '',
                    qty: '',
                    price_per_unit: '',
                    fuel_consumption: ''
                });
                setCompareFormErrors({
                    brand: ''
                });
                // Refresh comparison data
                fetchCompareData({
                    quote_id: calculatorId,
                    page: pagination.page,
                    limit: pagination.limit
                });
            } else {
                toast.error(response.message || langField('failedToAddComparison'));
            }
        } catch (error) {
            console.error('Add comparison error:', error);
            toast.error(langField('errorOccurredAdding'));
        } finally {
            setIsAddingCompare(false);
        }
    };


    const handleDeleteComparison = async (row: string) => {
        if (!calculatorId) {
            setError(langField('calculatorIdRequired'));
            return false;
        }

        setIsDeletingCompare(true);
        setError('');
        
        try {
            const requestBody = {
                quote_id: calculatorId
            };
            await RoecalculatorService.deleteCompare(row, requestBody);
            return true;
        } catch (err) {
            setError(langField('failedToDeleteCompetitor'));
            console.error('Delete competitor error:', err);
            throw err;
        } finally {
            setIsDeletingCompare(false);
        }
    };

    const cancelDelete = () => {
        setConfirmDelete({
            show: false,
            id: '',
            name: ''
        });
    };

    const confirmdeleteCompetitor = async () => {
        if (!confirmDelete.id) return;
        
        try {
            await handleDeleteComparison(confirmDelete.id);
            toast.success(langField('competitorDeletedSuccess'));
            const compareParams = {
                quote_id: calculatorId,
                page: 1,
                limit: 10,
            };
            await fetchCompareData(compareParams);
            cancelDelete();
        } catch (err) {
            toast.error(langField('failedToDeleteCompetitor'));
        }
    };

    const compareColumns: TableColumn<ManageROECompareData>[] = [
        {
            name: langField('calculatorInfo'),
            cell: (row) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900 text-sm">{row.brand}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {langField('tonase')}: {row.tonase}
                    </div>
                    {row.fuel_consumption && 
                    <div className="text-xs text-gray-500 mt-1">
                        {langField('fuelConsumption')} ({breakdownData?.fuel_consumption_type || 'L/km'}): {row.fuel_consumption}
                    </div>
                    }
                </div>
            ),
            wrap: true
        },
        {
            name: langField('qty'),
            selector: (row) => row.qty || 0,
            cell: (row) => (
                <div className="py-2 text-right">
                    <div className="font-medium text-gray-800 text-sm">
                        {row.qty || 0}
                    </div>
                </div>
            ),
            width: '80px',
        },
        {
            name: langField('roe'),
            cell: (row) => (
                <div className="py-2 text-center">
                    <div className="flex justify-around items-center w-[200px]">
                        <Tooltip content={`${row.brand} - ${langField('roe')} ${langField('roaPercentage')}`} position="top">
                            <span className="text-purple-600 font-medium">{row.roe_percentage}%</span>
                        </Tooltip>
                        <Tooltip content={`${row.brand} - ${langField('roeDifferenceTooltip')}`} position="top">
                            <span className={"font-medium "+clsx(
                                twMerge(
                                "text-gray-900 ",
                                `${row.roe_percentage_diff > 0 ? 'text-red-600' : row.roe_percentage_diff < 0 && 'text-green-600'}`,
                                ),
                            )}>
                                {Math.abs(row.roe_percentage_diff)}%
                            </span>
                        </Tooltip>
                    </div>
                </div>
            ),
            center: true,
            width: '250px',
            wrap: true
        },
        {
            name: langField('roa'),
            cell: (row) => (
                <div className="py-2 text-center">
                    {/* <div className="font-semibold text-blue-600 text-sm">{row.roa_nominal}</div> */}
                    <div className="flex justify-around items-center w-[200px]">
                        
                        <Tooltip content={`${row.brand} - ${langField('roaPercentageTooltip')}`} position="top">
                            <span className="text-blue-600 font-medium">{row.roa_percentage}%</span>
                        </Tooltip>
                        <Tooltip content={`${row.brand} - ${langField('roaDifferenceTooltip')}`} position="top">
                            <span className={"font-medium "+clsx(
                                twMerge(
                                "text-gray-900 ",
                                `${row.roa_percentage_diff > 0 ? 'text-red-600' : row.roa_percentage_diff < 0 && 'text-green-600'}`,
                                ),
                            )}>
                                {Math.abs(row.roa_percentage_diff)}%
                            </span>
                        </Tooltip>
                    </div>
                </div>
            ),
            center: true,
            width: '250px',
            wrap: true
        },
        {
            name: langField('revenue'),
            selector: (row) => row.revenue || 0,
            cell: (row) => (
                <div className="py-2 text-right">
                    <div className="font-medium text-gray-800 text-sm">
                        {formatCurrency(row.revenue || 0)}
                    </div>
                </div>
            ),
            width: '300px',
            wrap: true
        },
        {
            name: langField('actions'),
            cell: (row: any) => (
                <div className="flex justify-end gap-1">
                    {row.properties_list_compare_id !== null && (
                    <PermissionButton
                        permission="delete"
                        onClick={() => {
                            setConfirmDelete({
                                show: true,
                                id: row.properties_list_compare_id,
                                name: row.brand
                            });
                        }}
                        className="!p-2 !rounded-lg !text-red-600 hover:!text-red-700 hover:!bg-red-50 !transition-colors !border-0"
                        title={langField('delete')}
                    >
                        <MdDeleteOutline size={16} />
                    </PermissionButton>
                    )}
                </div>
            ),
            width: '100px',
            center: true,
        }
    ];

    // Handle sort changes
    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortField(field);
        setSortDirection(direction);
    };

    // Refetch data when sort changes
    useEffect(() => {
        if (calculatorId) {
            const compareParams = {
                quote_id: calculatorId,
                page: 1,
                limit: 10,
            };
            fetchCompareData(compareParams);
        }
    }, [sortField, sortDirection]);

    // Compare section component
    const CompareBreakdownSection = () => {
        const sortOptions = [
            { value: 'created_at', label: langField('createdAt') },
            { value: 'brand', label: langField('brand') },
            { value: 'qty', label: langField('quantity') },
            { value: 'roe_percentage', label: langField('roe') + ' %' },
            { value: 'roa_percentage', label: langField('roa') + ' %' },
            { value: 'revenue', label: langField('revenue') }
        ];

        return (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-primary-bold font-normal text-gray-900">{langField('compareWithOtherCalculations')}</h2>
                    
                    <PermissionGate permission="create">
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 font-secondary"
                        >
                            <MdAdd size={16} /> {langField('addComparison')}
                        </Button>
                    </PermissionGate>
                </div>
                
                {/* Sort Controls */}
                <div className="mb-6 flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg hidden">
                    <span className="text-sm font-medium text-gray-700">{langField('sortBy')}</span>
                    <div className="w-40 flex-none">
                        <CustomSelect
                            options={sortOptions}
                            value={sortOptions.find(option => option.value === sortField) || sortOptions[0]}
                            onChange={(option) => handleSortChange(option?.value || '', sortDirection)}
                            placeholder="User Type"
                            isClearable={false}
                            isSearchable={false}
                            className="font-secondary"
                        />
                    </div>
                    <div className="flex items-center">
                        <CustomSelect
                            id="sort_order"
                            name="sort_order"
                            value={sortDirection ? { 
                                value: sortDirection, 
                                label: sortDirection === 'asc' ? langField('ascending') : langField('descending') 
                            } : null}
                            onChange={(selectedOption) => 
                                handleSortChange(sortField, selectedOption?.value as 'asc' | 'desc' || 'asc')
                            }
                            options={[
                                { value: 'asc', label: langField('ascending') },
                                { value: 'desc', label: langField('descending') }
                            ]}
                            placeholder={langField('orderBy')}
                            isClearable={false}
                            isSearchable={false}
                            className="w-40"
                        />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                        Sorted by {sortOptions.find(opt => opt.value === sortField)?.label} ({sortDirection.toUpperCase()})
                    </div>
                </div>
                
                {/* Add horizontal scroll container */}
                <div className="overflow-x-auto font-secondary">
                    <CustomDataTable
                        columns={compareColumns}
                        data={compareBreakDown}
                        loading={isDeletingCompare}
                        pagination={false}
                        paginationServer={false}
                    />
                </div>
            </div>
        );
    };

    // Revenue Expense Profit Chart Component
    const RevenueExpenseProfitChart = ({ data }: { data: RevenueExpenseProfit[] }) => {
        const option = {
            title: {
                text: langField('revenueVsExpenseVsProfit'),
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
                data: [langField('revenue'), langField('totalExpense'), langField('netProfitPerMonth')],
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
                    name: langField('revenue'),
                    type: 'bar',
                    data: data.map(item => item.revenue),
                    itemStyle: {
                        color: '#10b981'
                    }
                },
                {
                    name: langField('totalExpense'),
                    type: 'bar',
                    data: data.map(item => item.expense),
                    itemStyle: {
                        color: '#ef4444'
                    }
                },
                {
                    name: langField('netProfitPerMonth'),
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
                text: langField('breakdownMonthlyCosts'),
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
                data: data.map(item => translateCostTitle(item.title))
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
                        name: translateCostTitle(item.title),
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
                title={`${langField('breakdownTitle')} - MSI Dashboard`}
                description={langField('breakdownTitle')}
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/roe-roa-calculator/manage?lang=${lang}`)}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdAdd size={20} className="text-green-600" />
                            <div className='ms-2'>
                                <h1 className="font-primary-bold font-normal text-xl">{langField('breakdownTitle')}</h1>
                            </div>
                        </div>
                        
                        <div className='flex gap-3'>
                            <LanguageSwitcher currentLang={lang} onChangeLang={setLang} />
                            <Button
                                className="group rounded-lg w-full flex items-center justify-center gap-2 font-secondary py-2"
                                onClick={() => navigate(`/roe-roa-calculator/manage/edit/${calculatorId}?step=4&lang=${lang}`)}
                            >
                                <MdEdit size={20} className="group-hover:text-white" /> {langField('edit')}
                            </Button>
                        </div>
                    </div>

                    <Alert
                        variant='warning'
                        title={langField('attentionTitle')}
                        message={langField('attentionDisclaimer')}
                    />

                    {breakdownData && (
                        <div className="space-y-6 mt-6">
                            {/* Key Financial Metrics */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-primary-bold font-normal text-gray-900 mb-4">{langField('keyFinancialMetrics')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-emerald-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('revenuePerMonth')}</p>
                                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(breakdownData.key_financial_metrics.revenue_per_bulan)}</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('totalExpensePerMonth')}</p>
                                        <p className="text-xl font-bold text-red-600">{formatCurrency(breakdownData.key_financial_metrics.total_expense_per_bulan)}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('netProfitPerMonth')}</p>
                                        <p className="text-xl font-bold text-blue-600">{formatCurrency(breakdownData.key_financial_metrics.net_profit_per_bulan)}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('profitMargin')}</p>
                                        <p className="text-xl font-bold text-purple-600">{breakdownData.key_financial_metrics.profit_margin.toFixed(2)}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* ROE ROA Metrics */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-primary-bold font-normal text-gray-900 mb-4">{langField('roeRoaAnalysis')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* ROE */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-primary-bold font-normal text-green-800">{langField('returnOnEquity')}</h3>
                                            <span className="text-3xl font-bold text-green-600">{breakdownData.roe_roa_metrics.roe.percentage}%</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-green-700">{langField('roeDescription')}</p>
                                            <div className="bg-white/50 p-3 rounded border">
                                                <p className="text-xs text-gray-600 mb-1">{langField('formula')} (Net Profit/Equity) :</p>
                                                <p className="text-sm font-mono text-green-800">
                                                    {formatCurrency(breakdownData.roe_roa_metrics.roe.calculation.net_profit)} 
                                                    / 
                                                    {formatCurrency(breakdownData.roe_roa_metrics.roe.calculation.equity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROA */}
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-primary-bold font-normal text-blue-800">{langField('returnOnAssets')}</h3>
                                            <span className="text-3xl font-bold text-blue-600">{breakdownData.roe_roa_metrics.roa.percentage}%</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-blue-700">{langField('roaDescription')}</p>
                                            <div className="bg-white/50 p-3 rounded border">
                                                <p className="text-xs text-gray-600 mb-1">{langField('formula')} (Net Profit/Total Assets) :</p>
                                                <p className="text-sm font-mono text-blue-800">
                                                    {formatCurrency(breakdownData.roe_roa_metrics.roa.calculation.net_profit)} 
                                                    / 
                                                    {formatCurrency(breakdownData.roe_roa_metrics.roa.calculation.total_assets)}
                                                </p>
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
                                <h2 className="text-xl font-primary-bold font-normal text-gray-900 mb-4">{langField('operationalMetrics')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('tripsPerDay')}</p>
                                        <p className="text-2xl font-bold text-blue-600">{breakdownData.metrik_operasional.ritase_per_hari}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('tripsPerMonth')}</p>
                                        <p className="text-2xl font-bold text-green-600">{breakdownData.metrik_operasional.ritase_per_bulan}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('tonnagePerMonth')}</p>
                                        <p className="text-2xl font-bold text-purple-600">{breakdownData.metrik_operasional.tonnage_per_bulan.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Multiple Unit */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-primary-bold font-normal text-gray-900 mb-4">{langField('revenueMultipleUnit')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('unitQuantityBreakdown')}</p>
                                        <p className="text-xl font-bold text-gray-800">{breakdownData.revenue_multiple_unit.jumlah_unit}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('revenuePerUnit')}</p>
                                        <p className="text-xl font-bold text-gray-800">{formatCurrency(breakdownData.revenue_multiple_unit.revenue_per_unit)}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('totalRevenue')}</p>
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
                                <h2 className="text-xl font-primary-bold font-normal text-gray-900 mb-4">{langField('fuelMetrics')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('fuelPerTrip')}</p>
                                        <p className="text-2xl font-bold text-orange-600">{breakdownData.metrik_bbm.bbm_per_ritase}</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('fuelCostPerTrip')}</p>
                                        <p className="text-xl font-bold text-red-600">{formatCurrency(breakdownData.metrik_bbm.biaya_bbm_per_ritase)}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">{langField('fuelEfficiency')}</p>
                                        <p className="text-2xl font-bold text-yellow-600">{breakdownData.metrik_bbm.efisiensi_l_km_ton}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Cost Breakdown */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-primary-bold font-normal text-gray-900 mb-4">{langField('monthlyExpenseDetail')}</h2>
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
                                                    <span className="font-medium text-gray-900">{translateCostTitle(item.title)}</span>
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
                                        <span className="text-lg font-bold text-red-800">{langField('totalExpense')}</span>
                                        <span className="text-2xl font-bold text-red-600">{formatCurrency(breakdownData?.charts_data?.revenue_expense_profit?.[0]?.expense || '0')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compare Breakdown Section */}
                    <CompareBreakdownSection />

                    {/* Add Comparison Modal */}
                    <Modal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        title={langField('addNewComparison')}
                        className="max-w-xl"
                    >
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="brand">{langField('brand')} *</Label>
                                    <Input
                                        id="brand"
                                        name="brand"
                                        type="text"
                                        placeholder="Enter brand name"
                                        value={compareFormData.brand}
                                        onChange={(e) => handleCompareFormChange('brand', e.target.value)}
                                        className={`mt-1 ${compareFormErrors.brand ? 'border-red-500 focus:border-red-500' : ''}`}
                                        maxLength={50}
                                    />
                                    {compareFormErrors.brand && (
                                        <p className="text-red-500 text-xs mt-1">{compareFormErrors.brand}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="tonase">{langField('tonnagePerUnit')}</Label>
                                        <Input
                                            id="tonase"
                                            value={compareFormData.tonase}
                                            placeholder="0.00"
                                            onChange={(e) => {
                                                const rawValue = e.target.value;                                                
                                                handleDecimalInput(
                                                    rawValue,
                                                    (validValue) => handleCompareFormChange('tonase', validValue),
                                                    () => handleCompareFormChange('tonase', ''),
                                                    true,
                                                    7,
                                                    4
                                                );
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="ritase">{langField('tripsPerShift')}</Label>
                                        <Input
                                            id="ritase"
                                            value={compareFormData.ritase}
                                            placeholder="0.00"
                                            onChange={(e) => {
                                                const rawValue = e.target.value;                                                
                                                handleDecimalInput(
                                                    rawValue,
                                                    (validValue) => handleCompareFormChange('ritase', validValue),
                                                    () => handleCompareFormChange('ritase', ''),
                                                    true,
                                                    7,
                                                    4
                                                );
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="qty">{langField('unitQuantityQty')}</Label>
                                        <Input
                                            id="qty"
                                            value={compareFormData.qty}
                                            placeholder="0"
                                            onChange={(e) => handleCompareFormChange('qty', e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            maxLength={4}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="price_per_unit">{langField('pricePerUnit')}</Label>
                                        <Input
                                            id="price_per_unit"
                                            type="text"
                                            placeholder="0"
                                            value={formatNumberInput(compareFormData.price_per_unit)}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d]/g, '');
                                                handleCompareFormChange('price_per_unit', value);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="fuel_consumption">{langField('fuelConsumption')} {breakdownData?.fuel_consumption_type || 'L/km'}</Label>
                                        <Input
                                            id="fuel_consumption"
                                            placeholder="0.00"
                                            value={compareFormData.fuel_consumption}
                                            onChange={(e) => {
                                                const rawValue = e.target.value;                                                
                                                handleDecimalInput(
                                                    rawValue,
                                                    (validValue) => handleCompareFormChange('fuel_consumption', validValue),
                                                    () => handleCompareFormChange('fuel_consumption', ''),
                                                    true,
                                                    7,
                                                    4
                                                );
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddModalOpen(false)}
                                        disabled={isAddingCompare}
                                    >
                                        {langField('cancel')}
                                    </Button>
                                    <Button
                                        onClick={handleAddComparison}
                                        disabled={isAddingCompare}
                                    >
                                        {isAddingCompare ? langField('adding') : langField('addComparison')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    
                    {/* Delete Confirmation Modal */}
                    <ConfirmationModal
                        isOpen={confirmDelete.show}
                        onClose={cancelDelete}
                        onConfirm={confirmdeleteCompetitor}
                        title={`${langField('deleteCompetitor')}: ${confirmDelete.name}`}
                        message={langField('deleteCompetitorConfirm')}
                        confirmText={langField('delete')}
                        cancelText={langField('cancel')}
                        type="danger"
                        loading={isDeletingCompare}
                    />
                </div>
            </div>
        </>
    );
}