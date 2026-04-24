import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { NetSuiteSyncService, SyncMasterDataKey, SYNC_MODULE_KEY_MAP, SyncListItem } from '../services/netSuiteSyncService';
// SyncListItem is used for the latestByKey Map type below
import { getProfile } from '@/helpers/generalHelper';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'idle' | 'queued' | 'processing' | 'success' | 'failed';

export interface LastSyncInfo {
    synced_by: string;
    synced_at: string; // ISO string
}

export interface MasterDataItem {
    key: SyncMasterDataKey;
    label: string;
    description: string;
    icon: string;
    status: SyncStatus;
    lastSync: LastSyncInfo | null;
    errorMessage?: string;
}

const INITIAL_ITEMS: Omit<MasterDataItem, 'status' | 'lastSync' | 'errorMessage'>[] = [
    {
        key: 'departments',
        label: 'Department',
        description: 'Sync department master data from NetSuite',
        icon: 'department',
    },
    {
        key: 'locations',
        label: 'Location',
        description: 'Sync location master data from NetSuite',
        icon: 'location',
    },
    {
        key: 'terms',
        label: 'Term',
        description: 'Sync payment terms master data from NetSuite',
        icon: 'term',
    },
    {
        key: 'classes',
        label: 'Class',
        description: 'Sync class master data from NetSuite',
        icon: 'class',
    },
    {
        key: 'items',
        label: 'Items',
        description: 'Sync items master data from NetSuite',
        icon: 'item',
    },
    {
        key: 'vendors',
        label: 'Vendor',
        description: 'Sync vendor master data from NetSuite',
        icon: 'vendor',
    },
    {
        key: 'purchasing_orders',
        label: 'Purchasing Orders',
        description: 'Sync purchasing orders from NetSuite',
        icon: 'purchasing_orders',
    },
    {
        key: 'sales_orders',
        label: 'Sales Orders',
        description: 'Sync sales orders from NetSuite',
        icon: 'sales_orders',
    },
    {
        key: 'invoice_sales_orders',
        label: 'Invoice Sales Orders',
        description: 'Sync invoice sales orders from NetSuite',
        icon: 'invoice_sales_orders',
    },
];

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useNetsuiteSync() {
    const profile = getProfile() as any;
    const userName: string =
        profile?.name ||
        profile?.full_name ||
        profile?.email ||
        'Unknown User';

    const [isFetchingHistory, setIsFetchingHistory] = useState(true);

    // Build initial state — lastSync starts null; populated from API
    const [items, setItems] = useState<MasterDataItem[]>(() =>
        INITIAL_ITEMS.map((item) => ({
            ...item,
            status: 'idle' as SyncStatus,
            lastSync: null,
        }))
    );

    // Queue of keys waiting to be synced
    const queueRef = useRef<SyncMasterDataKey[]>([]);

    // Whether the worker is currently processing an item
    const processingRef = useRef<boolean>(false);

    // Helper: update a single item's fields
    const updateItem = useCallback((key: SyncMasterDataKey, patch: Partial<MasterDataItem>) => {
        setItems((prev) =>
            prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
        );
    }, []);

    // ── Fetch sync history from API on mount ──────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function fetchSyncHistory() {
            setIsFetchingHistory(true);
            try {
                const data = await NetSuiteSyncService.getSyncList();

                if (cancelled) return;

                // Group by module key, keep only the latest record per key
                // (list is already sorted by created_at desc)
                const latestByKey = new Map<SyncMasterDataKey, SyncListItem>();
                for (const record of data.items) {
                    const key = SYNC_MODULE_KEY_MAP[record.sync_module];
                    if (key && !latestByKey.has(key)) {
                        latestByKey.set(key, record);
                    }
                }

                setItems((prev) =>
                    prev.map((item) => {
                        const record = latestByKey.get(item.key);
                        if (!record) return item;

                        const lastSync: LastSyncInfo = {
                            synced_by: record.created_by_name,
                            synced_at: record.created_at,
                        };

                        return {
                            ...item,
                            // Keep status as 'idle' on page load — API history only
                            // provides "last sync" metadata (who & when), not current state.
                            status: 'idle' as SyncStatus,
                            lastSync,
                        };
                    })
                );
            } catch {
                // Non-critical: cards fall back to localStorage data
            } finally {
                if (!cancelled) setIsFetchingHistory(false);
            }
        }

        fetchSyncHistory();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Queue worker ──────────────────────────────────────────────────────────
    const processQueue = useCallback(async () => {
        if (processingRef.current) return; // already running
        if (queueRef.current.length === 0) return;

        processingRef.current = true;
        const key = queueRef.current[0];

        updateItem(key, { status: 'processing', errorMessage: undefined });

        try {
            await NetSuiteSyncService.sync(key);

            const lastSync: LastSyncInfo = {
                synced_by: userName,
                synced_at: new Date().toISOString(),
            };
            updateItem(key, { status: 'success', lastSync });
            toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} sync completed successfully`);
        } catch (err: any) {
            const errorMessage = err?.message || 'Sync failed';
            updateItem(key, { status: 'failed', errorMessage });
            toast.error(`Failed to sync ${key}: ${errorMessage}`);
        } finally {
            // Remove current item from queue
            queueRef.current = queueRef.current.slice(1);
            processingRef.current = false;

            // Clear "queued" label on completed item — already done via status above
            // Process next item if any
            if (queueRef.current.length > 0) {
                processQueue();
            }
        }
    }, [updateItem, userName]);

    // ── Public: enqueue sync ──────────────────────────────────────────────────
    const enqueueSync = useCallback(
        (key: SyncMasterDataKey) => {
            // Don't add if already in queue or syncing
            const currentItem = items.find((i) => i.key === key);
            if (
                currentItem?.status === 'processing' ||
                currentItem?.status === 'queued' ||
                queueRef.current.includes(key)
            ) {
                return;
            }

            queueRef.current = [...queueRef.current, key];
            updateItem(key, { status: 'queued', errorMessage: undefined });

            // Try to start processing immediately
            processQueue();
        },
        [items, updateItem, processQueue]
    );

    // ── Public: enqueue ALL items sequentially ────────────────────────────────
    const enqueueAll = useCallback(() => {
        const keysToAdd: SyncMasterDataKey[] = [];

        INITIAL_ITEMS.forEach(({ key }) => {
            const currentItem = items.find((i) => i.key === key);
            // Skip if already syncing or already in queue
            if (
                currentItem?.status === 'processing' ||
                currentItem?.status === 'queued' ||
                queueRef.current.includes(key)
            ) {
                return;
            }
            keysToAdd.push(key);
        });

        if (keysToAdd.length === 0) return;

        // Batch-add to queue and mark as queued in state
        queueRef.current = [...queueRef.current, ...keysToAdd];
        setItems((prev) =>
            prev.map((item) =>
                keysToAdd.includes(item.key)
                    ? { ...item, status: 'queued' as SyncStatus, errorMessage: undefined }
                    : item
            )
        );

        // Kick off the worker
        processQueue();
    }, [items, processQueue]);

    // Status 'success' / 'failed' dibiarkan tampil sampai user pindah halaman.
    // State otomatis reset karena component unmount saat navigasi.

    const isAnyActive = items.some(
        (i) => i.status === 'processing' || i.status === 'queued'
    );

    return {
        items,
        enqueueSync,
        enqueueAll,
        isAnyActive,
        isFetchingHistory,
    };
}
