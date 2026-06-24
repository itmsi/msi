import { useState, useEffect, useCallback, useMemo } from 'react';
import { PurchaseOrderDashboardItems } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';
import { getProfile } from '@/helpers/generalHelper';

export interface DashboardSummary {
    pending_approval: number;
    pending_receipt: number;
    pending_bill: number;
}

export interface MultiSeriesChartData {
    categories: string[];
    series: { name: string; color: string; lightColor: string; data: number[] }[];
}

export interface ChartDataPoint {
    name: string;
    value: number;
}

interface SubsidiaryChartRaw {
    pending_approval_per_subsidiary: Record<string, number>;
    status_po_per_subsidiary: Record<string, { pending_approval: number; pending_receipt: number; pending_bill: number }>;
    total_po_per_subsidiary: Record<string, number>;
}

export const usePurchaseOrderDashboard = () => {
    // Data untuk tabel (paginated)
    const [items, setItems] = useState<PurchaseOrderDashboardItems>({
        pending_approval: [],
        pending_receipt: [],
        pending_bill: [],
    });
    // Data untuk chart (semua item, limit besar)
    const [chartPendingApproval, setChartPendingApproval] = useState<ChartDataPoint[]>([]);
    const [chartRaw, setChartRaw] = useState<SubsidiaryChartRaw>({
        pending_approval_per_subsidiary: {},
        status_po_per_subsidiary: {},
        total_po_per_subsidiary: {},
    });

    const [summary, setSummary] = useState<DashboardSummary>({
        pending_approval: 0,
        pending_receipt: 0,
        pending_bill: 0,
    });
    // const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await PurchaseOrderService.getDashboardPurchaseOrders({
                page: 1,
                limit: 10,
                sort_by: 'last_modified',
                sort_order: 'asc',
                ...(profileSSOId ? { classes: profileSSOId } : {}),
            });
            const pendingApprovalBySub = res.data?.chart_data?.pending_approval_per_subsidiary ?? {};
            const dataPendingApproval: ChartDataPoint[] = Object.entries(pendingApprovalBySub)
                .map(([subsidiary, total]) => ({
                    name: subsidiary.toUpperCase(),
                    value: Number(total) || 0,
                }))
                .filter(item => item.value > 0);

            setChartRaw({
                pending_approval_per_subsidiary: res.data?.chart_data?.pending_approval_per_subsidiary ?? {},
                status_po_per_subsidiary: res.data?.chart_data?.status_po_per_subsidiary ?? {},
                total_po_per_subsidiary: res.data?.chart_data?.total_po_per_subsidiary ?? {},
            });
            
            setChartPendingApproval(dataPendingApproval);
            setItems(res.data?.list_tabel);
            setSummary({
                pending_approval: res.data?.total_data?.pending_approval || 0,
                pending_receipt: res.data?.total_data?.pending_receipt || 0,
                pending_bill: res.data?.total_data?.pending_bill || 0,
            });
            // setSyncInfo(res.sync_info || null);
        } catch (err: any) {
            setError(err?.message || 'Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    }, [profileSSOId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Aggregasi chart dari chartItems
    const SUBSIDIARY_LIST = [
        'PT Indonesia Equipment Line',
        'PT Indonesia Equipment Centre',
        'Motor Sights International',
    ];

    const SUBSIDIARY_ABBR: Record<string, string> = {
        'PT Indonesia Equipment Line': 'IEL',
        'PT Indonesia Equipment Centre': 'IEC',
        'Motor Sights International': 'MSI',
    };

    const SUBSIDIARY_BY_KEY: Record<string, string> = {
        iel: 'PT Indonesia Equipment Line',
        iec: 'PT Indonesia Equipment Centre',
        msi: 'Motor Sights International',
    };

    const resolveSubsidiaryName = (label: string) => {
        const normalized = label.toLowerCase();

        if (SUBSIDIARY_BY_KEY[normalized]) {
            return SUBSIDIARY_BY_KEY[normalized];
        }

        return SUBSIDIARY_LIST.find(
            s => normalized.includes(s.toLowerCase()) || s.toLowerCase().includes(normalized)
        );
    };

    // Ambil metrik chart langsung dari chart_data
    const subsidiaryMetrics = useMemo(() => {
        const result: Record<string, { pending_approval: number; pending_receipt: number; pending_bill: number }> = {};
        SUBSIDIARY_LIST.forEach(s => {
            result[s] = { pending_approval: 0, pending_receipt: 0, pending_bill: 0 };
        });

        Object.entries(chartRaw.status_po_per_subsidiary).forEach(([subsidiaryName, values]) => {
            const sub = resolveSubsidiaryName(subsidiaryName);
            if (!sub) return;
            result[sub] = {
                pending_approval: Number(values.pending_approval) || 0,
                pending_receipt: Number(values.pending_receipt) || 0,
                pending_bill: Number(values.pending_bill) || 0,
            };
        });

        return result;
    }, [chartRaw]);

    // Donut: Pending Approval per subsidiary
    const approvalStatusChart = useMemo<ChartDataPoint[]>(() =>
        SUBSIDIARY_LIST.map(name => ({
            name: SUBSIDIARY_ABBR[name] ?? name,
            value: subsidiaryMetrics[name]?.pending_approval || 0,
        })).filter(d => d.value > 0)
    , [subsidiaryMetrics]);

    // Grouped bar: Pending Approval + Pending Receipt + Pending Bill per subsidiary
    const poStatusChart = useMemo<MultiSeriesChartData>(() => ({
        categories: SUBSIDIARY_LIST.map(s => SUBSIDIARY_ABBR[s] ?? s),
        series: [
            {
                name: 'Pending Approval',
                color: '#f59e0b',
                lightColor: '#fde68a',
                data: SUBSIDIARY_LIST.map(s => subsidiaryMetrics[s]?.pending_approval || 0),
            },
            {
                name: 'Pending Receipt',
                color: '#3b82f6',
                lightColor: '#bfdbfe',
                data: SUBSIDIARY_LIST.map(s => subsidiaryMetrics[s]?.pending_receipt || 0),
            },
            {
                name: 'Pending Bill',
                color: '#10b981',
                lightColor: '#a7f3d0',
                data: SUBSIDIARY_LIST.map(s => subsidiaryMetrics[s]?.pending_bill || 0),
            },
        ],
    }), [subsidiaryMetrics]);

    const subsidiaryChart = useMemo<ChartDataPoint[]>(() => {
        const map = new Map<string, number>();

        Object.entries(chartRaw.total_po_per_subsidiary).forEach(([subsidiaryName, total]) => {
            const sub = resolveSubsidiaryName(subsidiaryName);
            if (!sub) return;
            map.set(sub, Number(total) || 0);
        });

        return SUBSIDIARY_LIST
            .map(name => ({ name: SUBSIDIARY_ABBR[name] ?? name, value: map.get(name) || 0 }))
            .filter(d => d.value > 0);
    }, [chartRaw]);
    return {
        items,
        summary,
        loading,
        error,
        chartPendingApproval,
        approvalStatusChart,
        poStatusChart,
        subsidiaryChart,
    };
};
