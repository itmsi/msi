import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    MdAdd,
    MdPendingActions,
    MdReceiptLong,
    MdRequestPage,
} from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { formatTanggal, formatDateTime } from '@/helpers/generalHelper';
import { PurchaseOrderDashboardItem } from './types/purchaseorder';
import { usePurchaseOrderDashboard, ChartDataPoint, MultiSeriesChartData } from './hooks/usePurchaseOrderDashboard';

echarts.use([PieChart, BarChart, CanvasRenderer, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

// --- Helpers ---
const SUBSIDIARY_MAP: Record<string, { label: string; color: string }> = {
    'PT Indonesia Equipment Line':   { label: 'IEL', color: 'bg-blue-100 text-blue-700' },
    'PT Indonesia Equipment Centre': { label: 'IEC', color: 'bg-violet-100 text-violet-700' },
    'Motor Sights International':    { label: 'MSI', color: 'bg-emerald-100 text-emerald-700' },
};

function getSubsidiaryBadge(subsidiaryDisplay: string) {
    const match = Object.keys(SUBSIDIARY_MAP).find(k => subsidiaryDisplay?.includes(k));
    const { label, color } = match
        ? SUBSIDIARY_MAP[match]
        : { label: subsidiaryDisplay || '-', color: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}

function getApprovalBadge(display: string) {
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {display}
        </span>
    );
}

function getStatusBadge(label: string) {
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d0e6ef] text-gray-800 border border-gray-200">
            {label}
        </span>
    );
}

// --- Stat Card ---
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    colorClass: string;
    bgClass: string;
}

function StatCard({ icon, label, count, colorClass, bgClass }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass}`}>
                <span className={colorClass}>{icon}</span>
            </div>
            <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-primary-bold text-gray-800">{count.toLocaleString()}</p>
            </div>
        </div>
    );
}

// --- Donut Chart: Pending Approval per Subsidiary ---
function ApprovalStatusChart({ data, loading }: { data: ChartDataPoint[]; loading: boolean }) {
    const COLORS = ['#f59e0b', '#6366f1', '#10b981'];
    const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: {
            orient: 'vertical',
            right: '2%',
            top: 'center',
            textStyle: { fontSize: 12, color: '#374151' },
        },
        series: [{
            type: 'pie',
            radius: ['45%', '72%'],
            center: ['38%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false },
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
    return <ReactECharts option={option} style={{ height: '220px' }} notMerge />;
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
            axisLabel: { fontSize: 10, color: '#6b7280', interval: 0, overflow: 'truncate', width: 90 },
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
    return <ReactECharts option={option} style={{ height: '240px' }} notMerge />;
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
                label: { show: true, position: 'right', fontSize: 12, color: '#374151' },
            })),
            barMaxWidth: 32,
        }],
    };
    if (loading) return <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Memuat chart...</div>;
    if (!data.length) return <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Tidak ada data</div>;
    return <ReactECharts option={option} style={{ height: `${Math.max(200, data.length * 36 + 40)}px` }} notMerge />;
}

// --- PO Item Card List ---
interface POItemListProps {
    title: string;
    items: PurchaseOrderDashboardItem[];
    loading: boolean;
    badgeType: 'approval' | 'status';
    accentClass: string;
}

function POItemList({ title, items, loading, badgeType, accentClass }: POItemListProps) {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className={`px-4 py-3 border-b border-gray-200 flex items-center justify-between ${accentClass}`}>
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <span className="text-xs font-medium text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">
                    {items.length} item
                </span>
            </div>
            <div className="overflow-auto flex-1">
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">Memuat...</div>
                    ) : items.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada data</div>
                    ) : (
                        items.map(item => (
                            <div
                                key={`${item.id}-${item.po_id}`}
                                className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/netsuite/purchase-order/edit/${item.po_id || item.id}`)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="font-medium text-sm text-gray-900 truncate max-w-[140px]">
                                        {item.po_number || '-'}
                                    </div>
                                    {getSubsidiaryBadge(item.subsidiary_display || '')}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-gray-500">
                                        <span className="font-medium">Tgl:</span> {formatTanggal(item.po_date)}
                                    </div>
                                    {item.nextapprover && (
                                        <div className="text-xs text-gray-700 truncate">
                                            <span className="font-medium">Next:</span> {item.nextapprover}
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        {badgeType === 'approval'
                                            ? getApprovalBadge(item.approvalstatus_display || '-')
                                            : getStatusBadge(item.po_status_label || '-')
                                        }
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Komponen utama ---
export default function Dashboard() {
    const navigate = useNavigate();

    const {
        chartItems,
        summary,
        syncInfo,
        chartLoading,
        error,
        approvalStatusChart,
        poStatusChart,
        subsidiaryChart,
    } = usePurchaseOrderDashboard();

    const pendingApprovalItems = useMemo(() =>
        chartItems.filter(item => (item.approvalstatus_display || '').toLowerCase().includes('pending'))
    , [chartItems]);

    const pendingReceiptItems = useMemo(() =>
        chartItems.filter(item => (item.po_status_label || '').toLowerCase().includes('receipt'))
    , [chartItems]);

    const pendingBillItems = useMemo(() =>
        chartItems.filter(item => (item.po_status_label || '').toLowerCase().includes('bill'))
    , [chartItems]);

    return (
        <>
            <PageMeta
                title="Dashboard Purchase Order - Motor Sights International"
                description="Dashboard Purchase Order"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-primary-bold text-gray-900">Dashboard Purchase Order</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Ringkasan dan monitoring status purchase order
                            {syncInfo && (
                                <span className="ml-2 text-green-600">
                                    · Last sync: {formatDateTime(syncInfo.created_at)} oleh {syncInfo.created_by_name}
                                </span>
                            )}
                        </p>
                    </div>
                    <PermissionGate permission="create">
                        <Button
                            onClick={() => navigate('/netsuite/purchase-order/create')}
                            className="flex items-center gap-2 shrink-0"
                        >
                            <MdAdd size={20} />
                            Buat Purchase Order
                        </Button>
                    </PermissionGate>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={<MdPendingActions size={26} />}
                        label="Pending Approval"
                        count={summary.pending_approval}
                        colorClass="text-amber-600"
                        bgClass="bg-amber-50"
                    />
                    <StatCard
                        icon={<MdReceiptLong size={26} />}
                        label="Pending Receipt"
                        count={summary.pending_receipt}
                        colorClass="text-blue-600"
                        bgClass="bg-blue-50"
                    />
                    <StatCard
                        icon={<MdRequestPage size={26} />}
                        label="Pending Bill"
                        count={summary.pending_bill}
                        colorClass="text-emerald-600"
                        bgClass="bg-emerald-50"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <p className="text-sm font-primary-bold text-gray-700 mb-4">Pending Approval per Subsidiary</p>
                        <ApprovalStatusChart data={approvalStatusChart} loading={chartLoading} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <p className="text-sm font-primary-bold text-gray-700 mb-4">Status PO per Subsidiary</p>
                        <POStatusChart data={poStatusChart} loading={chartLoading} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <p className="text-sm font-primary-bold text-gray-700 mb-4">Total PO per Subsidiary</p>
                        <SubsidiaryChart data={subsidiaryChart} loading={chartLoading} />
                    </div>
                </div>

                {/* Card Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <POItemList
                        title="Pending Approval"
                        items={pendingApprovalItems}
                        loading={chartLoading}
                        badgeType="approval"
                        accentClass="bg-amber-50"
                    />
                    <POItemList
                        title="Pending Receipt"
                        items={pendingReceiptItems}
                        loading={chartLoading}
                        badgeType="status"
                        accentClass="bg-blue-50"
                    />
                    <POItemList
                        title="Pending Bill"
                        items={pendingBillItems}
                        loading={chartLoading}
                        badgeType="status"
                        accentClass="bg-emerald-50"
                    />
                </div>
            </div>
        </>
    );
}
