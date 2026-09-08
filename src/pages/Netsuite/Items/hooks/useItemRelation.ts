import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/helpers/apiHelper';
import {
    ItemLocation,
    ItemRelationListResponse,
    ItemRelationRequest,
    ItemSerialNumber,
    ItemTierPrice,
    ItemsPagination
} from '../types/items';
import { ItemsService } from '../services/itemsService';

type RelationFetcher<T> = (params: Partial<ItemRelationRequest>) => Promise<ItemRelationListResponse<T>>;

const useItemRelation = <T,>(fetcher: RelationFetcher<T>, netsuiteItemId?: string) => {
    const [rows, setRows] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [pagination, setPagination] = useState<ItemsPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const paginationRef = useRef(pagination);
    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    const fetchRows = useCallback(async (params?: Partial<ItemRelationRequest>) => {
        if (!netsuiteItemId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetcher({
                page: params?.page ?? paginationRef.current.page,
                limit: params?.limit ?? paginationRef.current.limit,
                search: params?.search !== undefined ? params.search : searchValue,
                netsuite_item_id: netsuiteItemId,
            });

            if (!response?.success) {
                setRows([]);
                setError(response?.message || 'Failed to fetch data');
                return;
            }

            setRows(response.data?.items || []);
            setPagination(response.data?.pagination || paginationRef.current);
        } catch (err) {
            const apiError = err as ApiError;
            setRows([]);
            setError(apiError?.message || 'Failed to fetch data');
            console.error('Error fetching item relation data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetcher, netsuiteItemId, searchValue]);

    const handlePageChange = useCallback((page: number) => {
        if (page === paginationRef.current.page) return;

        setPagination(prev => ({ ...prev, page }));
        fetchRows({ page, limit: paginationRef.current.limit });
    }, [fetchRows]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        if (limit === paginationRef.current.limit && page === paginationRef.current.page) return;

        setPagination(prev => ({ ...prev, limit, page }));
        fetchRows({ limit, page });
    }, [fetchRows]);

    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchRows({ search: searchQuery, page: 1 });
    }, [fetchRows]);

    const executeSearch = useCallback(() => {
        handleSearch(searchValue);
    }, [handleSearch, searchValue]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') executeSearch();
    }, [executeSearch]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        handleSearch('');
    }, [handleSearch]);

    const fetchedItemIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!netsuiteItemId || fetchedItemIdRef.current === netsuiteItemId) return;

        fetchedItemIdRef.current = netsuiteItemId;
        fetchRows({ page: 1 });
    }, [netsuiteItemId]);

    return {
        rows,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        fetchRows,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
    };
};

export const useItemLocations = (netsuiteItemId?: string) =>
    useItemRelation<ItemLocation>(ItemsService.getItemLocations, netsuiteItemId);

export const useItemSerialNumbers = (netsuiteItemId?: string) =>
    useItemRelation<ItemSerialNumber>(ItemsService.getItemSerialNumbers, netsuiteItemId);

export const useItemTierPrices = (netsuiteItemId?: string) =>
    useItemRelation<ItemTierPrice>(ItemsService.getItemTierPrices, netsuiteItemId);
