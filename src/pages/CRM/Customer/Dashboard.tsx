import { useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import {
    MdPendingActions,
    MdReceiptLong,
    MdRequestPage,
    MdMap,
    MdFileDownload,
} from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { useCustomerDashboard } from './hooks/useCustomerDashboard';
import { LuTruck, LuLayers,LuClipboardCheck, LuTag } from 'react-icons/lu';
import { StatCard } from './components/StatCard';

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
                orient: 'vertical',
                left: 'left',
            },
            series: [
                {
                    name: 'Jumlah IUP',
                    type: 'pie',
                    radius: '50%',
                    data,
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
            !customerData?.data_unit_per_brand_iup_aktif ||
            !customerData?.data_unit_per_brand_iup_non_aktif
        )
            return null;

        const brands = Array.from(
            new Set([
                ...Object.keys(customerData.data_unit_per_brand_iup_aktif),
                ...Object.keys(customerData.data_unit_per_brand_iup_non_aktif),
            ])
        );

        return {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: {},
            xAxis: {
                type: 'category',
                data: brands.map((b) => b.charAt(0).toUpperCase() + b.slice(1)),
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    name: 'Aktif',
                    type: 'bar',
                    data: brands.map(
                        (b) => customerData.data_unit_per_brand_iup_aktif?.[b] || 0
                    ),
                    itemStyle: { color: '#10b981' },
                },
                {
                    name: 'Non-Aktif',
                    type: 'bar',
                    data: brands.map(
                        (b) => customerData.data_unit_per_brand_iup_non_aktif?.[b] || 0
                    ),
                    itemStyle: { color: '#ef4444' },
                },
            ],
        };
    }, [customerData?.data_unit_per_brand_iup_aktif, customerData?.data_unit_per_brand_iup_non_aktif]);

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

            <div className="space-y-6">
                {/* Customer Information Card */}
                {customerInformation && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            {customerInformation.customer_name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Kode Customer</p>
                                <p className="font-semibold">{customerInformation.customer_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-semibold break-all">
                                    {customerInformation.customer_email}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Telepon</p>
                                <p className="font-semibold">{customerInformation.customer_phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Kontak Person</p>
                                <p className="font-semibold">
                                    {customerInformation.contact_person}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Negara</p>
                                <p className="font-semibold">{customerInformation.customer_country}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Provinsi</p>
                                <p className="font-semibold">{customerInformation.customer_state}</p>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <p className="text-sm text-gray-500">Alamat</p>
                                <p className="font-semibold">{customerInformation.customer_address}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Unit Kendaraan"
                        value={totalFleet}
                        Icon={LuTruck}
                        description={`${fleetData.nikel} Nikel · ${fleetData.batubara} Batu Bara`}
                    />
                    <StatCard
                        title="Total IUP"
                        value={customerData?.data_teritory?.length || 0}
                        Icon={LuLayers}
                        description={descriptionTextTerritory}
                    />
                    
                    <StatCard
                        title="RKAB IUP Aktif"
                        value={customerData?.data_rkab?.length || 0}
                        Icon={LuClipboardCheck}
                        description={`Periode ${minYear}-${maxYear}`}
                    />
                    
                    <StatCard
                        title="Sales Order"
                        value={customerData?.data_sales_order?.length || 0}
                        Icon={LuTag}
                        description={`Total Sales Order`}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* IUP Per Segmentasi */}
                    {iupSegmentasiChart && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">IUP Per Segmentasi</h3>
                            <ReactECharts option={iupSegmentasiChart} style={{ height: '300px' }} />
                        </div>
                    )}

                    {/* Unit Per Brand */}
                    {unitPerBrandChart && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Unit Per Brand</h3>
                            <ReactECharts option={unitPerBrandChart} style={{ height: '300px' }} />
                        </div>
                    )}
                </div>

                {/* Territories Table */}
                {customerData?.data_teritory && customerData.data_teritory.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Daftar Territory / IUP</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold">Pulau</th>
                                        <th className="px-4 py-2 text-left font-semibold">Grup</th>
                                        <th className="px-4 py-2 text-left font-semibold">Area</th>
                                        <th className="px-4 py-2 text-left font-semibold">IUP Zone</th>
                                        <th className="px-4 py-2 text-left font-semibold">
                                            Segmentasi
                                        </th>
                                        <th className="px-4 py-2 text-left font-semibold">Nama IUP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerData.data_teritory.map((territory, idx) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{territory.island_name}</td>
                                            <td className="px-4 py-2">{territory.group_name}</td>
                                            <td className="px-4 py-2">{territory.area_name}</td>
                                            <td className="px-4 py-2">{territory.iup_zone_name}</td>
                                            <td className="px-4 py-2">
                                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                    {territory.iup_segmentation_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 font-semibold">
                                                {territory.iup_name}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Quotations & Sales Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quotations Table */}
                    {customerData?.data_quotations && customerData.data_quotations.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Quotations</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold">
                                                Produk
                                            </th>
                                            <th className="px-3 py-2 text-left font-semibold">
                                                Model
                                            </th>
                                            <th className="px-3 py-2 text-center font-semibold">
                                                Qty
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold">
                                                Harga
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerData.data_quotations.map((quotation, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="px-3 py-2">{quotation.msi_product}</td>
                                                <td className="px-3 py-2 text-xs">
                                                    {quotation.msi_model}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {quotation.quantity}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {quotation.min_price.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Sales Orders Table */}
                    {customerData?.data_sales_order && customerData.data_sales_order.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Sales Orders</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold">
                                                Produk
                                            </th>
                                            <th className="px-3 py-2 text-left font-semibold">
                                                Model
                                            </th>
                                            <th className="px-3 py-2 text-center font-semibold">
                                                Qty
                                            </th>
                                            <th className="px-3 py-2 text-right font-semibold">
                                                Harga
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerData.data_sales_order.map((order, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="px-3 py-2">{order.msi_product}</td>
                                                <td className="px-3 py-2 text-xs">
                                                    {order.msi_model}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {order.quantity}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {order.min_price.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* RKAB Table */}
                {customerData?.data_rkab && customerData.data_rkab.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">RKAB (Rencana Kerja & Anggaran Biaya)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold">Nama IUP</th>
                                        <th className="px-4 py-2 text-center font-semibold">Tahun</th>
                                        <th className="px-4 py-2 text-center font-semibold">RKAB</th>
                                        <th className="px-4 py-2 text-right font-semibold">
                                            Target Produksi
                                        </th>
                                        <th className="px-4 py-2 text-right font-semibold">
                                            Produksi Saat Ini
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold">
                                            Progress
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerData.data_rkab.map((rkab, idx) => {
                                        const progress =
                                            rkab.target_production > 0
                                                ? Math.round(
                                                    (rkab.current_production /
                                                        rkab.target_production) *
                                                    100
                                                )
                                                : 0;
                                        return (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 font-semibold">
                                                    {rkab.nama_iup}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {rkab.tahun}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {rkab.rkab}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {rkab.target_production.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {rkab.current_production.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span
                                                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                                            progress >= 80
                                                                ? 'bg-green-100 text-green-800'
                                                                : progress >= 50
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {progress}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}