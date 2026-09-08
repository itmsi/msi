import { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/helpers/apiHelper';
import { Item, ItemsPagination, ItemsRequest } from '../types/items';
import { DEFAULT_ITEM_TYPE, ItemsService } from '../services/itemsService';

type FilterState = {
    search: string;
    sort_order: 'asc' | 'desc' | '';
    item_type: string[];
};

// Param list dikirim ke URL sebagai comma separated value
const parseListParam = (value: string | null): string[] => {
    if (!value) return [];
    return value.split(',').filter(Boolean);
};

export const useItems = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        item_type: parseListParam(searchParams.get('item_type')),
    };

    const [searchValue, setSearchValue] = useState(urlFilters.search);

    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<ItemsPagination>({
        page: urlPage,
        limit: urlLimit,
        total: 0,
        totalPages: 0
    });

    const updateUrlParams = useCallback((currentFilters: FilterState, page: number, limit: number) => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', String(page));
        if (limit !== 10) params.set('limit', String(limit));

        Object.entries(currentFilters).forEach(([key, value]) => {
            const paramValue = Array.isArray(value) ? value.join(',') : value;
            if (paramValue && paramValue !== 'desc') { // Jangan masukkan nilai kosong atau default sort
                params.set(key, paramValue);
            }
        });

        setSearchParams(params);
    }, [setSearchParams]);

    const fetchItems = useCallback(async (params?: Partial<ItemsRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await ItemsService.getItems({
                page: urlPage,
                limit: urlLimit,
                sort_by: 'lastModifiedDate',
                ...urlFilters,
                item_type: urlFilters.item_type.length ? urlFilters.item_type : DEFAULT_ITEM_TYPE,
                ...params,
            });

            if (!response?.success) {
                setItems([]);
                setError(response?.message || 'Failed to fetch items data');
                return;
            }

            setItems(response.data?.items || []);
            setPagination(response.data?.pagination || {
                page: urlPage,
                limit: urlLimit,
                total: 0,
                totalPages: 0
            });
        } catch (err) {
            const apiError = err as ApiError;
            setItems([]);
            setError(apiError?.message || 'Failed to fetch items data');
            console.error('Error fetching items data:', err);
        } finally {
            setLoading(false);
        }
    }, [urlFilters, urlLimit, urlPage]);

    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        const updatedFilters = { ...urlFilters, ...newFilters };
        updateUrlParams(updatedFilters, 1, urlLimit); // Reset ke page 1 tiap filter berubah
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handlePageChange = useCallback((page: number) => {
        updateUrlParams(urlFilters, page, urlLimit);
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        updateUrlParams(urlFilters, page, limit);
    }, [urlFilters, updateUrlParams]);

    // Item type dikirim sebagai array sesuai kontrak endpoint
    const handleItemTypeChange = useCallback((itemType: string) => {
        handleFilterChange({
            item_type: itemType ? [itemType] : []
        });
    }, [handleFilterChange]);

    const executeSearch = useCallback(() => {
        handleFilterChange({ search: searchValue });
    }, [handleFilterChange, searchValue]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') executeSearch();
    }, [executeSearch]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        handleFilterChange({ search: '' });
    }, [handleFilterChange]);

    useEffect(() => {
        fetchItems({
            page: urlPage,
            limit: urlLimit,
        });

        // Memastikan input text search ter-reset jika user memencet tombol Back
        setSearchValue(urlFilters.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    return {
        items,
        filters: urlFilters,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        fetchItems,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleItemTypeChange,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
    };
};
