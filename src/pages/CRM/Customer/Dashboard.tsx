import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
} from 'echarts/components';
import PageMeta from '@/components/common/PageMeta';
import { useCustomerDashboard } from './hooks/useCustomerDashboard';
import { LuTruck, LuLayers,LuClipboardCheck, LuReceiptText, LuBuilding2, LuCalendar, LuUser, LuMapPin, LuPhone, LuMail, LuLightbulb, LuTarget, LuChevronRight } from 'react-icons/lu';
import { StatCard } from './components/StatCard';
import UnitTable from './components/UnitTable';
import TerritoryTableCustomer from './components/TerritoryTableCustomer';
import RkabTable from './components/RkabTable';
import QuotationTable from './components/QuotationTable';
import SalesOrderTable from './components/SalesOrderTable';
import Badge from '@/components/ui/badge/Badge';

echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    PieChart,
    BarChart,
    CanvasRenderer,
]);

export default function Dashboard() {
    const { customerInformation, customerData, loading } = useCustomerDashboard();
    const fleetData = customerData?.data_unit_per_segmentasi_iup_aktif || {};
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
        if (!customerData?.data_iup_per_segmentasi) return null;

        const data = Object.entries(customerData.data_iup_per_segmentasi).map(
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
            !customerData?.data_unit_per_brand_iup_aktif
        )
        return null;

        const brands = Object.entries(customerData.data_unit_per_brand_iup_aktif).map(
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
                    // label: {
                    //     show: false,
                    //     position: 'center'
                    // },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold' },
                        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' },
                    },
                    data: brands
                }
            ],
        };
    }, [customerData?.data_unit_per_brand_iup_aktif, customerData?.data_unit_per_brand_iup_non_aktif]);

    const opportunities = (customerData?.data_rkab || []).map(item => {
            const gap = item.target_production - item.current_production;
            const achievement = (item.current_production / item.target_production) * 100;
            return { ...item, gap, achievement };
        })
        .filter(item => item.gap > 0)
        .sort((a, b) => b.gap - a.gap);

    const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );

    return (
        <>
            <PageMeta 
                title="Customer Dashboard - Motor Sights International" 
                description="Customer Dashboard - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-5">
                {/* Customer Information Card */}
                {customerInformation && (<>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-500">
                            <LuBuilding2 className="h-8 w-8" />
                            <h1 className="text-xl font-primary-bold text-slate-900">{customerInformation.customer_name}</h1>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                            <LuCalendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-500">Data Terakhir:</span>
                            <span className="text-sm font-semibold text-slate-700">Juni 2026</span>
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
                                                {customerInformation.customer_address } 
                                                {customerInformation.customer_state ? `, ${customerInformation.customer_state}` : ''} 
                                                {customerInformation.customer_city ? `, ${customerInformation.customer_city}` : ''} 
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`space-y-3 ${(customerData?.data_customer?.contact_persons.length === 1 || customerData?.data_customer?.contact_persons.length === 0) ? '' : 'md:col-span-2'}`}>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PIC / Account Manager</p>
                                    <div className='flex '>
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
                                {/* <div className="space-y-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site Operasional</p>
                                    <div className="space-y-2">
                                    {customerData?.data_teritory.map((site, index) => (
                                        <div key={index} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <LuFactory className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-sm text-slate-700">{site.iup_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <LuTruck className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-sm font-semibold text-slate-800">{site.units} unit</span>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </div> */}
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
                        title="RKAB IUP Aktif"
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

                    {/* <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
                        <MdRequestPage className="text-3xl text-yellow-500" />
                        <div>
                            <p className="text-sm text-gray-500">Total Quotation</p>
                            <p className="text-2xl font-bold">
                                {customerData?.data_quotations?.length || 0}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
                        <MdReceiptLong className="text-3xl text-purple-500" />
                        <div>
                            <p className="text-sm text-gray-500">Total Sales Order</p>
                            <p className="text-2xl font-bold">
                                {customerData?.data_sales_order?.length || 0}
                            </p>
                        </div>
                    </div> */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* POPULATION UNIT */}
                    <div className="bg-white shadow rounded-lg relative overflow-hidden">
                        <div className="p-6 font-secondary">
                            <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Daftar Unit</h3>
                            <UnitTable units={customerData?.units || []} loading={loading} Icon={LuTruck} iconClassName="text-blue-600" />
                        </div>
                    </div>
                    {/* POPULATION UNIT */}
                    <div className="bg-white shadow rounded-lg relative overflow-hidden">
                        <div className="p-6 font-secondary">
                            <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Daftar Territory</h3>
                            <TerritoryTableCustomer territory={customerData?.data_teritory || []} loading={loading} Icon={LuLayers} iconClassName="text-amber-600"/>
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


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Quotation */}
                    <div className="bg-white shadow rounded-lg relative overflow-hidden">
                        <div className="p-6 font-secondary">
                            <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Quotations</h3>
                            <QuotationTable quotations={customerData?.data_quotations || []} loading={loading} />
                        </div>
                    </div>
                    {/* Sales Orders */}
                    <div className="bg-white shadow rounded-lg relative overflow-hidden">
                        <div className="p-6 font-secondary">
                            <h3 className="text-base font-secondary font-semibold text-gray-900 mb-4">Sales Orders</h3>
                            <SalesOrderTable salesOrders={customerData?.data_sales_order || []} loading={loading}/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* <div className="border-l-4 border-l-amber-400">
                        <div>
                            <div className="flex items-center gap-2">
                                <LuCircleAlert className="h-4 w-4 text-amber-500" />
                                Open Actions / Follow-up
                            </div>
                            <div>Quotation yang membutuhkan tindak lanjut</div>
                        </div>
                        <div className="space-y-3">
                            {openActions.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Tidak ada open actions</p>
                            ) : (
                            openActions.map((action) => (
                                <div key={action.id} className="flex items-start justify-between gap-3 bg-slate-50 rounded-lg p-3 border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-slate-500">{action.id}</span>
                                            {getStatusBadge(action.status)}
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 truncate">{action.item}</p>
                                        <p className="text-sm text-slate-600 mt-0.5">{formatCurrencyFull(action.value)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                    {action.dueDate ? (
                                    <div className="flex items-center gap-1 text-amber-600">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">
                                            Due: {new Date(action.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                                        </span>
                                    </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">Dalam proses</span>
                                    )}
                                </div>
                            </div>
                            ))
                        )}
                        </div>
                    </div> */}

                    <div className="border-l-4 border-l-emerald-400">
                        <div>
                            <div className="flex items-center gap-2">
                                <LuLightbulb className="h-4 w-4 text-emerald-500" />
                                Potential Opportunity
                            </div>
                            <div>Peluang berdasarkan gap produksi RKAB IUP</div>
                        </div>
                        <div className="space-y-3">
                            {opportunities.map((opp, index) => (
                                <div key={index} className="bg-slate-50 rounded-lg p-3 border space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-medium text-slate-600">{opp.nama_iup}</span>
                                        <Badge variant="outline">
                                            Gap: {formatNumber(opp.gap)} ton
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <LuTarget className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Achievement baru <span className="font-semibold text-slate-800">{opp.achievement.toFixed(1)}%</span></span>
                                    </div>
                                    <div className="flex items-start gap-2 mt-1 bg-emerald-50 rounded px-2 py-1.5">
                                        <LuChevronRight className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-emerald-700">
                                        {opp.gap > 20000
                                            ? "Potensi penambahan unit atau spare parts untuk mendorong produksi."
                                            : "Potensi penjualan spare parts & consumables untuk optimasi produksi."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}