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
} from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { formatTanggal } from '@/helpers/generalHelper';
import { PurchaseOrderDashboardItem } from './types/purchaseorder';
import { usePurchaseOrderDashboard, ChartDataPoint, MultiSeriesChartData } from './hooks/usePurchaseOrderDashboard';
import NavigationPO from './components/NavigationPO';

echarts.use([PieChart, BarChart, CanvasRenderer, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

// --- Helpers ---
const SUBSIDIARY_MAP: Record<string, { label: string; color: string }> = {
    'PT Indonesia Equipment Line':   { label: 'IEL', color: 'bg-[#bf1920] text-white' },
    'PT Indonesia Equipment Centre': { label: 'IEC', color: 'bg-[#f59e0b] text-white' },
    'Motor Sights International':    { label: 'MSI', color: 'bg-[#0253a5] text-white' },
};

function getSubsidiaryBadge(subsidiaryDisplay: string) {
    const match = Object.keys(SUBSIDIARY_MAP).find(k => subsidiaryDisplay?.includes(k));
    const { label, color } = match
        ? SUBSIDIARY_MAP[match]
        : { label: subsidiaryDisplay || '-', color: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center text-center justify-center px-2 py-0.5 rounded-md text-xs min-w-[3rem] font-medium ${color}`}>
            {label}
        </span>
    );
}

// --- Stat Card ---
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    bgClass: string;
}

function StatCard({ icon, label, count, bgClass }: StatCardProps) {
    return (
        <div className={`rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden justify-end ${bgClass}`}>
            <div className="xl:pl-[5rem]">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-6xl font-primary-bold text-gray-800">{count.toLocaleString()}</p>
            </div>
            {icon}
        </div>
    );
}

// --- Donut Chart: Pending Approval per Subsidiary ---
function ApprovalStatusChart({ data, loading }: { data: ChartDataPoint[]; loading: boolean }) {
    const COLORS = ['#bf1920', '#f59e0b', '#0253a5'];
    const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { fontSize: 12, color: '#374151' },
        },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '40%'],
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
                label: { show: true, fontSize: 14, fontWeight: 'bold' },
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' },
            },
            data: data.map((d, i) => ({
                value: d.value,
                name: d.name,
                itemStyle: { color: COLORS[i % COLORS.length] },
            })),
        }],
    };
    if (loading) return <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Memuat chart...</div>;
    if (!data.length) return <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Tidak ada data</div>;
    return <ReactECharts option={option} style={{ height: '300px' }} notMerge />;
}

// --- Grouped Bar Chart: Pending per Subsidiary ---
function POStatusChart({ data, loading }: { data: MultiSeriesChartData; loading: boolean }) {
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: {
            data: data.series.map(s => s.name),
            bottom: 0,
            textStyle: { fontSize: 11, color: '#374151' },
        },
        grid: { left: '3%', right: '4%', bottom: '14%', top: '6%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.categories,
            axisLabel: { fontSize: 11, color: '#6b7280', interval: 0, overflow: 'truncate', width: 90 },
        },
        yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 11, color: '#6b7280' } },
        series: data.series.map(s => ({
            name: s.name,
            type: 'bar',
            barMaxWidth: 36,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: s.color },
                    { offset: 1, color: s.lightColor },
                ]),
                borderRadius: [6, 6, 0, 0],
            },
            label: { show: true, position: 'top', fontSize: 11, fontWeight: 'bold', color: '#374151' },
            data: s.data,
        })),
    };
    if (loading) return <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Memuat chart...</div>;
    if (!data.categories.length) return <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Tidak ada data</div>;
    return <ReactECharts option={option} style={{ height: '300px' }} notMerge />;
}

// --- Horizontal Bar Chart: Total PO per Subsidiary ---
function SubsidiaryChart({ data, loading }: { data: ChartDataPoint[]; loading: boolean }) {
    const reversed = [...data].reverse();
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: '3%', top: '3%', containLabel: true },
        xAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 11, color: '#6b7280' } },
        yAxis: {
            type: 'category',
            data: reversed.map(d => d.name),
            axisLabel: { fontSize: 11, color: '#374151', width: 160, overflow: 'truncate' },
        },
        series: [{
            type: 'bar',
            data: reversed.map(d => ({
                value: d.value,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#6366f1' },
                        { offset: 1, color: '#c7d2fe' },
                    ]),
                    borderRadius: [0, 6, 6, 0],
                },
                label: { show: true, position: 'right', fontSize: 11, color: '#374151' },
            })),
            barMaxWidth: 50,
        }],
    };
    if (loading) return <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Memuat chart...</div>;
    if (!data.length) return <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Tidak ada data</div>;
    return <ReactECharts option={option} style={{ height: `${Math.max(300, data.length * 36 + 40)}px` }} notMerge />;
}

// --- PO Item Card List ---
interface POItemListProps {
    title: string;
    items: PurchaseOrderDashboardItem[];
    loading: boolean;
    badgeType: 'approval' | 'status';
    accentClass: string;
}

function POItemList({ title, items, loading, accentClass }: POItemListProps) {
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden h-full flex flex-col">
            <div className={`px-4 py-3 border-b border-gray-200 flex items-center justify-between ${accentClass}`}>
                <h2 className="text-base font-secondary font-semibold text-gray-900">{title}</h2>
            </div>
            <div className="overflow-auto flex-1">
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">Memuat...</div>
                    ) : items.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada data</div>
                    ) : (
                        items.map(item => (
                            <Link
                                key={`${item.id}-${item.po_id}`}
                                className="block px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer min-h-[215px]"
                                to={`/netsuite/purchase-order/edit/${item.po_id || item.id}`}
                                target="_blank"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="font-medium text-sm text-gray-900 max-w-[240px]">
                                        {item.po_number || '-'}
                                        <span className="block text-xs text-gray-500">{formatTanggal(item.po_date)}</span>
                                    </div>
                                    {getSubsidiaryBadge(item.subsidiary_display || '')}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-gray-700">
                                        Vendor: <span className="font-bold font-secondary block">{item.vendor_name || '-'}</span> 
                                    </div>
                                    {title === 'Pending Approval' && (
                                        <div className="text-xs text-gray-700">
                                            Next Approver: <span className="font-bold font-secondary block">
                                                {item.nextapprover || '-'}
                                            </span> 
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-700">
                                        Memo: <span className="font-primary-bold block">
                                            {item.memo || '-'}
                                        </span> 
                                    </div>
                                    <div className="text-xs text-gray-700">
                                        Created By: <span className="font-primary-bold block">
                                            {item.created_by_name || '-'}
                                        </span> 
                                    </div>
                                    {/* <div className="mt-2">
                                        {badgeType === 'approval'
                                            ? getApprovalBadge(item.approvalstatus_display || '-')
                                            : getStatusBadge(item.po_status_label || '-', accentClass)
                                        }
                                    </div> */}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Komponen utama ---
export default function Dashboard() {
    const {
        items,
        summary,
        loading,
        chartPendingApproval,
        poStatusChart,
        subsidiaryChart,
    } = usePurchaseOrderDashboard();

    const { pendingApprovalItems, pendingReceiptItems, pendingBillItems } = useMemo(() => {
        const result = {
            pendingApprovalItems: [] as PurchaseOrderDashboardItem[],
            pendingReceiptItems: [] as PurchaseOrderDashboardItem[],
            pendingBillItems: [] as PurchaseOrderDashboardItem[],
        };
        const parsePoDate = (value?: string) => {
            if (!value) return 0;
            const [month, day, year] = value.split('/').map(Number);
            if (!month || !day || !year) return 0;
            return new Date(year, month - 1, day).getTime();
        };

        const sortByDate = (a: PurchaseOrderDashboardItem, b: PurchaseOrderDashboardItem) =>
            parsePoDate(a.po_date) - parsePoDate(b.po_date);

        result.pendingApprovalItems = items?.pending_approval?.sort(sortByDate) || [];
        result.pendingReceiptItems  = items?.pending_receipt?.sort(sortByDate) || [];
        result.pendingBillItems     = items?.pending_bill?.sort(sortByDate) || [];

        return result;
    }, [items]);
    
    return (
        <>
            <PageMeta
                title="Dashboard Purchase Order - Motor Sights International"
                description="Dashboard Purchase Order"
                image="/motor-sights-international.png"
            />
            <NavigationPO />
            {/* Page Content */}
            <div className="space-y-6">
                {/* Page Header */}
                
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">

                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Dashboard Purchase Order</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Ringkasan dan monitoring status purchase order
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={
                            <MdPendingActions 
                                className="text-amber-600"
                                style={{ 
                                    position: 'absolute',
                                    left: '-28px',
                                    top: '-31px',
                                    bottom: 0,
                                    height: '160px',
                                    width: '160px',
                                    opacity: 0.1
                                }}
                            />
                        }
                        label="Pending Approval"
                        count={summary.pending_approval}
                        bgClass="bg-amber-50"
                    />
                    <StatCard
                        icon={
                            <MdReceiptLong 
                                className="text-blue-600"
                                style={{ 
                                    position: 'absolute',
                                    left: '-28px',
                                    top: '-31px',
                                    bottom: 0,
                                    height: '160px',
                                    width: '160px',
                                    opacity: 0.1
                                }}
                            />
                        }
                        label="Pending Receipt"
                        count={summary.pending_receipt}
                        bgClass="bg-blue-50"
                    />
                    <StatCard
                        icon={
                            <MdRequestPage 
                                className="text-emerald-600"
                                style={{ 
                                    position: 'absolute',
                                    left: '-28px',
                                    top: '-31px',
                                    bottom: 0,
                                    height: '160px',
                                    width: '160px',
                                    opacity: 0.1
                                }}
                            />
                        }
                        label="Pending Bill"
                        count={summary.pending_bill}
                        bgClass="bg-emerald-50"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white shadow rounded-lg p-5">
                        <p className="text-base font-secondary font-semibold text-gray-900 mb-4">Pending Approval per Subsidiary</p>
                        <ApprovalStatusChart data={chartPendingApproval} loading={loading} />
                    </div>
                    <div className="bg-white shadow rounded-lg p-5">
                        <p className="text-base font-secondary font-semibold text-gray-900 mb-4">Status PO per Subsidiary</p>
                        <POStatusChart data={poStatusChart} loading={loading} />
                    </div>
                    <div className="bg-white shadow rounded-lg p-5">
                        <p className="text-base font-secondary font-semibold text-gray-900 mb-4">Total PO per Subsidiary</p>
                        <SubsidiaryChart data={subsidiaryChart} loading={loading} />
                    </div>
                </div>

                {/* Card Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <POItemList
                        title="Pending Approval"
                        items={pendingApprovalItems}
                        loading={loading}
                        badgeType="approval"
                        accentClass="bg-amber-50"
                    />
                    <POItemList
                        title="Pending Receipt"
                        items={pendingReceiptItems}
                        loading={loading}
                        badgeType="status"
                        accentClass="bg-blue-50"
                    />
                    <POItemList
                        title="Pending Bill"
                        items={pendingBillItems}
                        loading={loading}
                        badgeType="status"
                        accentClass="bg-emerald-50"
                    />
                </div>
            </div>
        </>
    );
}
