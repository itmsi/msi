import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import toast from 'react-hot-toast';
import { IupSurveyItem, Pagination } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';
const LIMIT = 10;
export const useIupSurvey = () => {
    const { id } = useParams<{ id: string }>();

    const [surveys, setSurveys] = useState<IupSurveyItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);


    const fetchSurveyData = useCallback(async (targetPage: number, append: boolean) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await IupService.getIupSurvey({
                iup_id: id,
                page: targetPage,
                limit: LIMIT,
                search,
                sort_by: 'created_at',
                sort_order: 'desc',
            });

            setSurveys((prev) => (append ? [...prev, ...(response.data ?? [])] : response.data ?? []));
            setPagination(response.pagination ?? null);
            setPage(targetPage);
        } catch (error: any) {
            console.error('Error loading survey data:', error);
            toast.error('Failed to load survey data');
        } finally {
            if (append) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        }
    }, [id, search]);

    useEffect(() => {
        fetchSurveyData(1, false);
    }, [id, search]);

    const executeSearch = useCallback(() => {
        setSearch(searchInput);
    }, [searchInput]);
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') executeSearch();
    }, [executeSearch]);
    const handleClearSearch = useCallback(() => {
        setSearchInput('');
        setSearch('');
    }, []);

    const hasMore = pagination ? pagination.page < pagination.totalPages : false;
    const loadMore = useCallback(() => {
        if (loading || loadingMore || !hasMore) return;
        fetchSurveyData(page + 1, true);
    }, [loading, loadingMore, hasMore, page, fetchSurveyData]);
    const groupedSurveys = useMemo(() => {
        const map = new Map<string, IupSurveyItem[]>();
        for (const entry of surveys) {
            const key = moment(entry.chat_date).format('YYYY-MM-DD');
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(entry);
        }
        return Array.from(map.entries());
    }, [surveys]);

    return {
        surveys,
        groupedSurveys,
        pagination,
        page,

        searchInput,
        setSearchInput,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        isSearching: searchInput.trim() !== search,

        hasMore,
        loadMore,
        loading,
        loadingMore,
        refetch: () => fetchSurveyData(1, false),
    };
}