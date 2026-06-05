import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PurchaseOrderDashboardItem, PurchaseOrderDashboardRequest, SyncInfo } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';

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
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const [searchValue, setSearchValue] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [subsidiaryFilter, setSubsidiaryFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [approvalStatusFilter, setApprovalStatusFilter] = useState('');

    const paginationRef = useRef(pagination);
    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    // Fetch untuk chart — limit besar, sekali load
    const fetchChartData = useCallback(async () => {
        setChartLoading(true);
        try {
            const res = await PurchaseOrderService.getDashboardPurchaseOrders({
                page: 1,
                limit: 500,
                sort_by: 'created_at',
                sort_order: 'desc',
            });
            setChartItems(res.data?.items || []);
            setSummary({
                pending_approval: res.data?.pending_approval || 0,
                pending_receipt: res.data?.pending_receipt || 0,
                pending_bill: res.data?.pending_bill || 0,
            });
            setSyncInfo(res.sync_info || null);
        } catch {
            // chart gagal tidak perlu error state
        } finally {
            setChartLoading(false);
        }
    }, []);

    // Fetch untuk tabel (paginated + filter)
    const fetchData = useCallback(async (params?: Partial<PurchaseOrderDashboardRequest>) => {
        setLoading(true);
        setError(null);
        try {
            const res = await PurchaseOrderService.getDashboardPurchaseOrders({
                page: params?.page ?? paginationRef.current.page,
                limit: params?.limit ?? paginationRef.current.limit,
                sort_by: 'created_at',
                sort_order: params?.sort_order ?? sortOrder,
                search: params?.search !== undefined ? params.search : searchValue,
                subsidiary: params?.subsidiary !== undefined ? params.subsidiary : subsidiaryFilter,
                location: params?.location !== undefined ? params.location : locationFilter,
                po_status: params?.po_status !== undefined ? params.po_status : statusFilter,
                approvalstatus: params?.approvalstatus !== undefined ? params.approvalstatus : approvalStatusFilter,
            });

            setItems(res.data?.items || []);
            setPagination(prev => ({
                ...prev,
                total: (res.data?.items || []).length,
                page: params?.page ?? prev.page,
                limit: params?.limit ?? prev.limit,
            }));
        } catch (err: any) {
            setError(err?.message || 'Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    }, [searchValue, sortOrder, subsidiaryFilter, locationFilter, statusFilter, approvalStatusFilter]);

    useEffect(() => {
        fetchChartData();
        fetchData();
    }, []);

    // Aggregasi chart dari chartItems
    const SUBSIDIARY_LIST = [
        'PT Indonesia Equipment Line',
        'PT Indonesia Equipment Centre',
        'Motor Sights International',
    ];

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
            name,
            value: subsidiaryMetrics[name]?.pending_approval || 0,
        })).filter(d => d.value > 0)
    , [subsidiaryMetrics]);

    // Grouped bar: Pending Approval + Pending Receipt + Pending Bill per subsidiary
    const poStatusChart = useMemo<MultiSeriesChartData>(() => ({
        categories: SUBSIDIARY_LIST,
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
                const label = SUBSIDIARY_LIST.find(s => key.includes(s)) ?? key;
                map.set(label, (map.get(label) || 0) + 1);
            }
        });
        return SUBSIDIARY_LIST
            .map(name => ({ name, value: map.get(name) || 0 }))
            .filter(d => d.value > 0);
    }, [chartItems]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchData({ page, limit: paginationRef.current.limit });
    }, [fetchData]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, limit, page }));
        fetchData({ limit, page });
    }, [fetchData]);

    const handleFilterChange = useCallback((filterType: string, value: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        const params: Partial<PurchaseOrderDashboardRequest> = { page: 1 };

        if (filterType === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            params.sort_order = value as 'asc' | 'desc';
        } else if (filterType === 'subsidiary') {
            setSubsidiaryFilter(value);
            params.subsidiary = value;
        } else if (filterType === 'location') {
            setLocationFilter(value);
            params.location = value;
        } else if (filterType === 'po_status') {
            setStatusFilter(value);
            params.po_status = value;
        } else if (filterType === 'approvalstatus') {
            setApprovalStatusFilter(value);
            params.approvalstatus = value;
        }

        fetchData(params);
    }, [fetchData]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setPagination(prev => ({ ...prev, page: 1 }));
            fetchData({ search: searchValue, page: 1 });
        }
    }, [fetchData, searchValue]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchData({ search: '', page: 1 });
    }, [fetchData]);

    const handleClearFilters = useCallback(() => {
        setSubsidiaryFilter('');
        setLocationFilter('');
        setStatusFilter('');
        setApprovalStatusFilter('');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchData({ subsidiary: '', location: '', po_status: '', approvalstatus: '', page: 1 });
    }, [fetchData]);

    return {
        items,
        chartItems,
        summary,
        syncInfo,
        loading,
        chartLoading,
        error,
        approvalStatusChart,
        poStatusChart,
        subsidiaryChart,
    };
};
