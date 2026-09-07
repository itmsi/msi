import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/helpers/apiHelper';
import { ItemDetail } from '../types/items';
import { ItemsService } from '../services/itemsService';

export const useItemDetail = (internalId?: string) => {
    const [item, setItem] = useState<ItemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // StrictMode menjalankan effect dua kali saat development,
    // guard ini menjaga detail hanya di-fetch sekali per internalId
    const fetchedIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!internalId || fetchedIdRef.current === internalId) return;

        fetchedIdRef.current = internalId;
        fetchItemDetail();
    }, [internalId, fetchItemDetail]);

    return {
        item,
        loading,
        error,
        fetchItemDetail,
    };
};
