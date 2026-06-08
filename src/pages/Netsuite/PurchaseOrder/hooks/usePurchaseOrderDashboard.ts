import { useState, useEffect, useCallback, useMemo } from 'react';
import { PurchaseOrderDashboardItem } from '../types/purchaseorder';
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

export const usePurchaseOrderDashboard = () => {
    // Data untuk tabel (paginated)
    const [items, setItems] = useState<PurchaseOrderDashboardItem[]>([]);
    // Data untuk chart (semua item, limit besar)
    const [chartItems, setChartItems] = useState<PurchaseOrderDashboardItem[]>([]);

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
                limit: 500,
                sort_by: 'last_modified',
                sort_order: 'asc',
                ...(profileSSOId ? { classes: profileSSOId } : {}),
            });
            const allItems = res.data?.items || [];
            setChartItems(allItems);
            setItems(allItems);
            setSummary({
                pending_approval: res.data?.pending_approval || 0,
                pending_receipt: res.data?.pending_receipt || 0,
                pending_bill: res.data?.pending_bill || 0,
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

    const matchSubsidiary = (display: string) =>
        SUBSIDIARY_LIST.find(s => display.includes(s));

    // Hitung metrik per subsidiary
    const subsidiaryMetrics = useMemo(() => {
        const result: Record<string, { pending_approval: number; pending_receipt: number; pending_bill: number }> = {};
        SUBSIDIARY_LIST.forEach(s => {
            result[s] = { pending_approval: 0, pending_receipt: 0, pending_bill: 0 };
        });
        chartItems.forEach(item => {
            const sub = matchSubsidiary(item.subsidiary_display || '');
            if (!sub) return;
            const approvalLower = (item.approvalstatus_display || '').toLowerCase();
            const statusLower = (item.po_status_label || '').toLowerCase();
            if (approvalLower.includes('pending')) result[sub].pending_approval++;
            switch (statusLower) {
                case 'pending receipt':
                    return result[sub].pending_receipt++;
                case 'pending bill':
                    return result[sub].pending_bill++;
            }
        });
        return result;
    }, [chartItems]);

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
        chartItems.forEach(item => {
            const key = item.subsidiary_display || '';
            if (SUBSIDIARY_LIST.some(s => key.includes(s))) {
                const fullName = SUBSIDIARY_LIST.find(s => key.includes(s)) ?? key;
                map.set(fullName, (map.get(fullName) || 0) + 1);
            }
        });
        return SUBSIDIARY_LIST
            .map(name => ({ name: SUBSIDIARY_ABBR[name] ?? name, value: map.get(name) || 0 }))
            .filter(d => d.value > 0);
    }, [chartItems]);

    return {
        items,
        chartItems,
        summary,
        loading,
        error,
        approvalStatusChart,
        poStatusChart,
        subsidiaryChart,
    };
};
