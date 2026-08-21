import { useMemo } from 'react';
import { use } from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import ReactECharts from 'echarts-for-react';
import { CanvasRenderer } from 'echarts/renderers';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
} from 'echarts/components';
import PageMeta from '@/components/common/PageMeta';
import { useCustomerDashboard } from './hooks/useCustomerDashboard';
import { LuTruck, LuLayers, LuClipboardCheck, LuReceiptText, LuBuilding2, LuCalendar, LuUser, LuMapPin, LuPhone, LuMail, LuFileCheck } from 'react-icons/lu';
import { StatCard } from './components/StatCard';
import UnitTable from './components/UnitTable';
import TerritoryTableCustomer from './components/TerritoryTableCustomer';
import RkabTable from './components/RkabTable';
import QuotationTable from './components/QuotationTable';
import SalesOrderTable from './components/SalesOrderTable';
import PageHeader from '@/components/common/PageHeader';
import { useLocation } from 'react-router-dom';

use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    PieChart,
    BarChart,
    CanvasRenderer,
]);

export default function Dashboard() {
    const location = useLocation();
    const listRoute = `/crm/customer${location.search}`;
    const { customerInformation, customerData, loading } = useCustomerDashboard();
    const fleetData = customerData?.data_unit_per_segmentasi || {};
    const totalFleet = Object.values(fleetData).reduce((sum, value) => sum + value, 0);

    const yearsRKAB = customerData?.data_rkab?.map(item => item.tahun) || [];
    const minYear = Math.min(...yearsRKAB);
    const maxYear = Math.max(...yearsRKAB);

    const segmentationCounts = customerData?.data_teritory?.reduce((acc, curr) => {
        const segmentation = curr.iup_segmentation_name;
        if (segmentation) {
            acc[segmentation] = (acc[segmentation] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const descriptionTextTerritory = Object.entries(segmentationCounts || {})
        .map(([name, count]) => `${count} ${name}`)
        .join(' · ');

    const iupSegmentasiChart = useMemo(() => {
        if (!customerData?.data_unit_per_segmentasi) return null;

        const data = Object.entries(customerData.data_unit_per_segmentasi).map(
            ([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
            })
        );

        return {
            tooltip: { trigger: 'item' },
            legend: {
                textStyle: { fontSize: 12, color: '#374151' }
            },
            series: [
                {
                    name: 'Jumlah IUP',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '40%'],
                    data,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
            ],
        };
    }, [customerData?.data_iup_per_segmentasi]);

    const unitPerBrandChart = useMemo(() => {
        if (
            !customerData?.data_unit_per_brand
        )
            return null;

        const brands = Object.entries(customerData.data_unit_per_brand).map(
            ([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
            })
        );

        return {
            tooltip: { trigger: 'item' },
            legend: {
                textStyle: { fontSize: 12, color: '#374151' },
            },
            series: [
                {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '40%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold' },
                        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' },
                    },
                    data: brands
                }
            ],
        };
    }, [customerData?.data_unit_per_brand_iup_aktif, customerData?.data_unit_per_brand_iup_non_aktif]);

    return (
        <>
            <PageMeta
                title="Customer Dashboard - Motor Sights International"
                description="Customer Dashboard - Motor Sights International"
                image="/motor-sights-international.png"
            />
            <div className="space-y-5">

                <PageHeader
                    title={customerInformation?.customer_name ? `${customerInformation.customer_code ? `${customerInformation.customer_code} - ` : ''} ${customerInformation.customer_name} ` : 'Customer Dashboard'}
                    backPath={listRoute}
                />
                {/* Customer Information Card */}
                {customerInformation && (<>
                    <div className="flex justify-end items-center">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                            <LuCalendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-500">Data Terakhir:</span>
                            <span className="text-sm font-primary-bold text-slate-700">Juni 2026</span>
                        </div>
                    </div>
                    <div className="bg-white flex flex-col gap-6 rounded-xl border border-l-4 border-l-blue-500 shadow">
                        <div className="p-6">
                            <div className={`grid grid-cols-1 gap-2 ${(customerData?.data_customer?.contact_persons.length === 1 || customerData?.data_customer?.contact_persons.length === 0) ? 'md:grid-cols-2 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informasi Perusahaan</p>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <LuBuilding2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{customerInformation.customer_name}</p>
                                                <p className="text-xs text-slate-500">{customerInformation.customer_code}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <LuMapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                            <p className="text-sm text-slate-600">
                                                {customerInformation.customer_address}
                                                {customerInformation.customer_state ? `, ${customerInformation.customer_state}` : ''}
                                                {customerInformation.customer_city ? `, ${customerInformation.customer_city}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`space-y-3 ${(customerData?.data_customer?.contact_persons.length === 1 || customerData?.data_customer?.contact_persons.length === 0) ? '' : 'md:col-span-2'}`}>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PIC / Account Manager</p>
                                    <div className='flex flex-wrap gap-6'>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start gap-2">
                                                <LuUser className="h-4 w-4 text-slate-400" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{customerInformation.contact_person}</p>
                                                    <p className="text-xs text-slate-500">{customerInformation.job_title}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <LuPhone className="h-4 w-4 text-slate-400" />
                                                <p className="text-sm text-slate-600">{customerInformation.customer_phone}</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <LuMail className="h-4 w-4 text-slate-400" />
                                                <p className="text-sm text-slate-600">{customerInformation.customer_email}</p>
                                            </div>
                                        </div>

                                        {customerData?.data_customer?.contact_persons.map((site, index) => (
                                            <div key={index} className="flex-1 space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <LuUser className="h-4 w-4 text-slate-400" />
                                                    <p className="text-sm font-semibold text-slate-800">{site.contact_person_name}</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <LuPhone className="h-4 w-4 text-slate-400" />
                                                    <p className="text-sm text-slate-600">{site.contact_person_phone}</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <LuMail className="h-4 w-4 text-slate-400" />
                                                    <p className="text-sm text-slate-600">{site.contact_person_email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>)}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Unit Kendaraan"
                        value={totalFleet}
                        Icon={LuTruck}
                        description={`${fleetData.nikel} Nikel · ${fleetData.batubara} Batu Bara`}
                        className="bg-blue-50 border-blue-200"
                        iconClassName="text-blue-600"
                    />
                    <StatCard
                        title="Total IUP"
                        value={customerData?.data_teritory?.length || 0}
                        Icon={LuLayers}
                        description={descriptionTextTerritory}
                        className="bg-amber-50 border-amber-200"
                        iconClassName="text-amber-600"
                    />

                    <StatCard
                        title="RKAB IUP"
                        value={customerData?.data_rkab?.length || 0}
                        Icon={LuClipboardCheck}
                        description={`Periode ${minYear}-${maxYear}`}
                        className="bg-emerald-50 border-emerald-200"
                        iconClassName="text-emerald-600"
                    />

                    <StatCard
                        title="Sales Order"
                        value={customerData?.data_sales_order?.length || 0}
                        Icon={LuReceiptText}
                        description={`Total Sales Order`}
                        className="bg-violet-50 border-violet-200"
                        iconClassName="text-violet-600"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* IUP Per Segmentasi */}
                    {iupSegmentasiChart && (
                        <div className="bg-white shadow rounded-lg p-5">
                            <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Populasi Unit per Komoditas</h3>
                            <ReactECharts option={iupSegmentasiChart} style={{ height: '300px' }} />
                        </div>
                    )}

                    {/* Unit Per Brand */}
                    {unitPerBrandChart && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Populasi Unit per Merek</h3>
                            <ReactECharts option={unitPerBrandChart} style={{ height: '300px' }} notMerge />
                        </div>
                    )}
                </div>
                {/* POPULATION UNIT */}
                <div className="bg-white shadow rounded-lg relative overflow-hidden">
                    <div className="p-6 font-secondary">
                        <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Daftar Unit</h3>
                        <UnitTable units={customerData?.units || []} loading={loading} />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Quotations */}
                    <div className="bg-white shadow rounded-lg relative overflow-hidden">
                        <div className="p-6 font-secondary">
                            <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Quotations</h3>
                            <QuotationTable quotations={customerData?.data_quotations || []} loading={loading} Icon={LuFileCheck} iconClassName="text-blue-600" />
                        </div>
                    </div>
                    {/* POPULATION UNIT */}
                    <div className="bg-white shadow rounded-lg relative overflow-hidden">
                        <div className="p-6 font-secondary">
                            <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Daftar Territory</h3>
                            <TerritoryTableCustomer territory={customerData?.data_teritory || []} loading={loading} Icon={LuLayers} iconClassName="text-amber-600" />
                        </div>
                    </div>
                </div>

                {/* RKAB Table */}
                <div className="bg-white shadow rounded-lg relative overflow-hidden">
                    <div className="p-6 font-secondary">
                        <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">RKAB (Rencana Kerja & Anggaran Biaya)</h3>
                        <RkabTable rkab={customerData?.data_rkab || []} loading={loading} />
                    </div>
                </div>

                {/* Sales Orders */}
                <div className="bg-white shadow rounded-lg relative overflow-hidden">
                    <div className="p-6 font-secondary">
                        <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Sales Orders</h3>
                        <SalesOrderTable salesOrders={customerData?.data_sales_order || []} loading={loading} />
                    </div>
                </div>

            </div>
        </>
    );
}