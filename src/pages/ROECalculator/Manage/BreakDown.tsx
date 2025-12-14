import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { MdKeyboardArrowLeft, MdSave, MdArrowForward, MdArrowBack, MdEdit, MdAdd } from 'react-icons/md';

import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Loading from '@/components/common/Loading';
import { RoecalculatorService } from './services/roecalculatorService';
import { ManageROEBreakdownData } from '../types/roeCalculator';


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

    // Helper function to format currency
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
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
                    </div>

                    {breakdownData && (
                        <div className="space-y-6">
                            {/* Operational Metrics */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Metrik Operasional</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Ritase per Hari</p>
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
                                    {Object.entries(breakdownData.detail_biaya_bulanan).map(([key, value]) => {
                                        const labelMap: Record<string, string> = {
                                            bbm: 'BBM',
                                            ban: 'Ban',
                                            sparepart: 'Sparepart',
                                            gaji_operator: 'Gaji Operator',
                                            depresiasi: 'Depresiasi',
                                            bunga: 'Bunga',
                                            overhead: 'Overhead'
                                        };
                                        
                                        return (
                                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                                    <span className="font-medium text-gray-900">{labelMap[key]}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-600">{value.persentase}%</span>
                                                    <span className="font-bold text-gray-900">{formatCurrency(value.nominal)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Total Expense */}
                                <div className="mt-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-red-800">Total Expense</span>
                                        <span className="text-2xl font-bold text-red-600">{formatCurrency(breakdownData.total_expense)}</span>
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