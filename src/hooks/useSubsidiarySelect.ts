import { useState, useCallback, useRef } from 'react';
import { apiPost } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SubsidiarySelectOption {
    value: string;
    label: string;
}

interface SubsidiaryItem {
    id: number;
    company_name: string;
    abbreviation: string;
}

interface SubsidiaryResponse {
    success: boolean;
    message: string;
    data: {
        items: SubsidiaryItem[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export const useSubsidiarySelect = () => {
    const [subsidiaryOptions, setSubsidiaryOptions] = useState<SubsidiarySelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const isInitialized = useRef(false);

    const loadSubsidiaries = useCallback(async (search: string = '') => {
        try {
            setLoading(true);
            const response = await apiPost<{ data: SubsidiaryResponse }>(
                `${API_BASE_URL}/netsuite/subsidiary/get`,
                { search, page: 1, limit: 100 }
            );

            const res = response.data as unknown as SubsidiaryResponse;
            if (res.success && res.data?.items) {
                const options = res.data.items.map((item) => ({
                    value: String(item.id),
                    label: item.abbreviation
                        ? `${item.company_name} (${item.abbreviation})`
                        : item.company_name,
                }));
                setSubsidiaryOptions(options);
                return options;
            }
        } catch (error) {
            console.error('Error loading subsidiaries:', error);
        } finally {
            setLoading(false);
        }
        return [];
    }, []);

    const initializeOptions = useCallback(async () => {
        if (isInitialized.current) return;
        isInitialized.current = true;
        await loadSubsidiaries();
    }, [loadSubsidiaries]);

    return {
        subsidiaryOptions,
        loading,
        loadSubsidiaries,
        initializeOptions,
    };
};
