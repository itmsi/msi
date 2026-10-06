import { useCallback, useState } from 'react';
import { apiPost } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AggregateTypeSelectOption {
    value: string;
    label: string;
    scriptId?: string;
}

export interface AggregateTypePaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

interface NetsuiteScriptItem {
    module: string;
    script_id: string;
}

interface NetsuiteScriptListResponse {
    success: boolean;
    message: string;
    data: {
        items?: NetsuiteScriptItem[];
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export const useAggregateTypeSelect = (limit: number = 20) => {
    const [aggregateTypeOptions, setAggregateTypeOptions] = useState<AggregateTypeSelectOption[]>([]);
    const [pagination, setPagination] = useState<AggregateTypePaginationState>({
        page: 1,
        hasMore: true,
        loading: false,
    });
    const [inputValue, setInputValue] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadAggregateTypeOptions = useCallback(async (
        search: string = '',
        loadedOptions: AggregateTypeSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ): Promise<AggregateTypeSelectOption[]> => {
        if (isLoading) return loadedOptions;

        try {
            setIsLoading(true);
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await apiPost<NetsuiteScriptListResponse>(
                `${API_BASE_URL}/netsuite/netsuite_scripts/get`,
                {
                    page,
                    limit,
                    sort_by: 'created_at',
                    sort_order: 'ASC',
                    search,
                }
            );

            const envelope = response.data;
            const items = envelope?.data?.items ?? [];

            const newOptions: AggregateTypeSelectOption[] = items.map(item => ({
                value: item.module,
                label: item.module,
                scriptId: item.script_id,
            }));

            const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
            setAggregateTypeOptions(updatedOptions);

            const currentPage = envelope?.data?.pagination?.page ?? page;
            const totalPages = envelope?.data?.pagination?.totalPages ?? currentPage;

            setPagination({
                page: currentPage,
                hasMore: currentPage < totalPages,
                loading: false,
            });

            if (reset) setInitialized(true);

            return updatedOptions;
        } catch (error) {
            console.error('Error loading aggregate types:', error);
            setPagination(prev => ({ ...prev, loading: false }));
            return loadedOptions;
        } finally {
            setIsLoading(false);
            setPagination(prev => ({ ...prev, loading: false }));
        }
    }, [limit, isLoading]);

    const handleInputChange = useCallback(async (search: string) => {
        setInputValue(search);
        setAggregateTypeOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });

        return await loadAggregateTypeOptions(search, [], 1, true);
    }, [loadAggregateTypeOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (!pagination.hasMore || pagination.loading) return;

        await loadAggregateTypeOptions(inputValue, aggregateTypeOptions, pagination.page + 1, false);
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, aggregateTypeOptions, loadAggregateTypeOptions]);

    const initializeOptions = useCallback(async () => {
        if (initialized || isLoading || aggregateTypeOptions.length > 0) return;

        await loadAggregateTypeOptions('', [], 1, true);
    }, [initialized, isLoading, aggregateTypeOptions.length, loadAggregateTypeOptions]);

    return {
        aggregateTypeOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadAggregateTypeOptions,
    };
};
