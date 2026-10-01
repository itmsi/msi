import { useCallback, useState } from 'react';
import { apiPost } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ModuleNameSelectOption {
    value: string;
    label: string;
    url?: string;
}

export interface ModuleNamePaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

interface ModuleNameItem {
    module_name: string;
    url: string;
}

interface ModuleNameListResponse {
    success: boolean;
    message: string;
    data: {
        items?: ModuleNameItem[];
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export const useModuleNameSelect = (limit: number = 20) => {
    const [moduleNameOptions, setModuleNameOptions] = useState<ModuleNameSelectOption[]>([]);
    const [pagination, setPagination] = useState<ModuleNamePaginationState>({
        page: 1,
        hasMore: true,
        loading: false,
    });
    const [inputValue, setInputValue] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadModuleNameOptions = useCallback(async (
        search: string = '',
        loadedOptions: ModuleNameSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ): Promise<ModuleNameSelectOption[]> => {
        if (isLoading) return loadedOptions;

        try {
            setIsLoading(true);
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await apiPost<ModuleNameListResponse>(
                `${API_BASE_URL}/netsuite/log-activities/module-names`,
                {
                    page,
                    limit,
                    sort_by: 'module_name',
                    sort_order: 'ASC',
                    search,
                }
            );

            const envelope = response.data;
            const items = envelope?.data?.items ?? [];

            // module_name sekaligus jadi value, karena itu yang dikirim balik sebagai filter.
            const newOptions: ModuleNameSelectOption[] = items.map(item => ({
                value: item.module_name,
                label: item.module_name,
                url: item.url,
            }));

            const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
            setModuleNameOptions(updatedOptions);

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
            console.error('Error loading module names:', error);
            setPagination(prev => ({ ...prev, loading: false }));
            return loadedOptions;
        } finally {
            setIsLoading(false);
            setPagination(prev => ({ ...prev, loading: false }));
        }
    }, [limit, isLoading]);

    const handleInputChange = useCallback(async (search: string) => {
        setInputValue(search);
        setModuleNameOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });

        return await loadModuleNameOptions(search, [], 1, true);
    }, [loadModuleNameOptions]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (!pagination.hasMore || pagination.loading) return;

        await loadModuleNameOptions(inputValue, moduleNameOptions, pagination.page + 1, false);
    }, [pagination.hasMore, pagination.loading, pagination.page, inputValue, moduleNameOptions, loadModuleNameOptions]);

    const initializeOptions = useCallback(async () => {
        if (initialized || isLoading || moduleNameOptions.length > 0) return;

        await loadModuleNameOptions('', [], 1, true);
    }, [initialized, isLoading, moduleNameOptions.length, loadModuleNameOptions]);

    return {
        moduleNameOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadModuleNameOptions,
    };
};
