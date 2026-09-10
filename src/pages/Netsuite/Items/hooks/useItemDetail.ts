import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/helpers/apiHelper';
import { ItemDetail } from '../types/items';
import { ItemsService } from '../services/itemsService';
import toast from 'react-hot-toast';

export const useItemDetail = (internalId?: string) => {
    const [item, setItem] = useState<ItemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchItemDetail = useCallback(async () => {
        if (!internalId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await ItemsService.getItemById(internalId);

            if (!response?.success || !response?.data) {
                setItem(null);
                setError(response?.message || 'Item not found');
                return;
            }

            setItem(response.data);
        } catch (err) {
            const apiError = err as ApiError;
            setItem(null);
            setError(apiError?.message || 'Failed to fetch item detail');
            console.error('Error fetching item detail:', err);
        } finally {
            setLoading(false);
        }
    }, [internalId]);

    const fetchedIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!internalId || fetchedIdRef.current === internalId) return;

        fetchedIdRef.current = internalId;
        fetchItemDetail();
    }, [internalId, fetchItemDetail]);


    const handleSyncById = async (toId: string) => {
        if (isSyncing || !toId) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi Item: ${toId}...`);
        try {
            await ItemsService.syncItemsById(toId);
            toast.success('Sinkronisasi berhasil', { id: toastId });
            await fetchItemDetail();
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    };
    return {
        item,
        loading,
        error,
        fetchItemDetail,
        isSyncing,
        handleSyncById,
    };
};
