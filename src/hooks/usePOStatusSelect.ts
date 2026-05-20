import { useState, useCallback, useRef } from 'react';
import { apiPost } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface POStatusSelectOption {
    value: string;
    label: string;
}

interface POStatusItem {
    id: number;
    code: string;
    name: string;
}

interface POStatusResponse {
    success: boolean;
    message: string;
    data: {
        items: POStatusItem[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export const usePOStatusSelect = () => {
    const [poStatusOptions, setPOStatusOptions] = useState<POStatusSelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const isInitialized = useRef(false);

    const loadPOStatus = useCallback(async (search: string = '') => {
        try {
            setLoading(true);
            const response = await apiPost<{ data: POStatusResponse }>(
                `${API_BASE_URL}/netsuite/po_status/get`,
                { search, page: 1, limit: 100 }
            );

            const res = response.data as unknown as POStatusResponse;
            if (res.success && res.data?.items) {
                const options = res.data.items.map((item) => ({
                    value: item.name,
                    label: item.name
                        ? `${item.name}`
                        : item.code,
                }));
                setPOStatusOptions(options);
                return options;
            }
        } catch (error) {
            console.error('Error loading PO status:', error);
        } finally {
            setLoading(false);
        }
        return [];
    }, []);

    const initializeOptions = useCallback(async () => {
        if (isInitialized.current) return;
        isInitialized.current = true;
        await loadPOStatus();
    }, [loadPOStatus]);

    return {
        poStatusOptions,
        loading,
        loadPOStatus,
        initializeOptions,
    };
};
