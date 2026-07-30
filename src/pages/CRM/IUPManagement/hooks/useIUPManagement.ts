import { useState, useEffect, useCallback } from 'react';
import { IupItem, IupRequest, IupSummary, Pagination } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';
import { useLocation, useSearchParams } from 'react-router-dom';

type FilterState = {
    sort_by?: 'updated_at' | 'created_at' | '';
    sort_order: 'asc' | 'desc' | '';
    search: string;
    status: string;
    segmentation_id?: string;
    island_id?: string;
    group_id?: string;
    area_id?: string;
    iup_zone_id?: string;
    iup_segment_id?: string;
    is_contractor_count?: string;
    is_selection_iup?: 'true' | 'false';
};
export const useIupManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation(); 
    const [searchValue, setSearchValue] = useState('');
    
    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || 'desc',
        sort_by: (searchParams.get('sort_by') as FilterState['sort_by']) || '',
        status: searchParams.get('status') || '',
        segmentation_id: searchParams.get('segmentation_id') || '',
        island_id: searchParams.get('island_id') || '',
        group_id: searchParams.get('group_id') || '',
        area_id: searchParams.get('area_id') || '',
        iup_zone_id: searchParams.get('iup_zone_id') || '',
        iup_segment_id: searchParams.get('iup_segment_id') || '',
        is_contractor_count: searchParams.get('is_contractor_count') || '',
        is_selection_iup: searchParams.get('is_selection_iup') as FilterState['is_selection_iup'] || 'true',
    };
    
    // const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('desc');
    // const [sortModify, setSortModify] = useState<'updated_at' | 'created_at' | ''>('updated_at');
    // const [statusFilter, setStatusFilter] = useState('');
    // const [segmentationFilter, setSegmentationFilter] = useState('');
    
    // Territory filter states
    // const [islandFilter, setIslandFilter] = useState('');
    // const [groupFilter, setGroupFilter] = useState('');
    // const [areaFilter, setAreaFilter] = useState('');
    // const [iupZoneFilter, setIupZoneFilter] = useState('');
    // const [iupSegmentFilter, setIupSegmentFilter] = useState('');
    // const [contractorCountFilter, setContractorCountFilter] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [iup, setIup] = useState<IupItem[]>([]);
    const [summary, setSummary] = useState<IupSummary>({
        total_iup: 0,
        total_iup_aktif: 0,
        total_contractor: 0,
        total_iup_have_contractor: 0,
        total_iup_no_contractor: 0,
    });
    const [pagination, setPagination] = useState<Pagination>({
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
            if (value && value !== 'desc') { // Jangan masukkan nilai kosong atau default sort
                params.set(key, value);
            }
        });
        
        setSearchParams(params);
    }, [setSearchParams]);

    const fetchIup = useCallback(async (params?: Partial<IupRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await IupService.getIUPManagement({
                page: params?.page || pagination.page,
                limit: params?.limit || pagination.limit,
                sort_by: params?.sort_by || "",
                ...urlFilters,
                ...params
            });
            
            setIup(response.data || []);
            setSummary(response.Summary);
            setPagination(response.pagination || pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch IUP data');
            console.error('Error fetching IUP data:', err);
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

    const executeSearch = useCallback(() => {
        handleFilterChange({ search: searchValue });
    }, [handleFilterChange, searchValue]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') executeSearch();
    }, [executeSearch]);
    
    // Clear search — reset URL params agar useEffect trigger refetch otomatis
    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        updateUrlParams({
            search: '',
            sort_order: 'desc',
            sort_by: '',
            segmentation_id: '',
            island_id: '',
            group_id: '',
            area_id: '',
            iup_zone_id: '',
            iup_segment_id: '',
            is_contractor_count: '',
            is_selection_iup: 'true',
            status: '',
        }, 1, urlLimit);
    }, [updateUrlParams, urlLimit]);
    
    useEffect(() => {
        fetchIup();
        setSearchValue(urlFilters.search);
    }, [location.search]);

    // Territory batch filter - untuk menghindari multiple API calls
    // const handleFilterChange = useCallback((filterType: string, value: string) => {
    //     if (filterType === 'status') {
    //         setStatusFilter(value);
    //     } else if (filterType === 'segmentation') {
    //         setSegmentationFilter(value);
    //     } else if (filterType === 'sort_by') {
    //         setSortModify(value as 'updated_at' | 'created_at' | '');
    //     } else if (filterType === 'sort_order') {
    //         setSortOrder(value as 'asc' | 'desc' | '');
    //     } else if (filterType === 'island_id') {
    //         setIslandFilter(value);
    //     } else if (filterType === 'group_id') {
    //         setGroupFilter(value);
    //     } else if (filterType === 'area_id') {
    //         setAreaFilter(value);
    //     } else if (filterType === 'iup_zone_id') {
    //         setIupZoneFilter(value);
    //     } else if (filterType === 'iup_segment_id') {
    //         setIupSegmentFilter(value);
    //     } else if (filterType === 'is_contractor_count') {
    //         setContractorCountFilter(value);
    //     }
        
    //     setPagination(prev => ({ ...prev, page: 1 }));
        
    //     const params: any = { page: 1 };
    //     if (filterType === 'status') {
    //         params.status = value;
    //     } else if (filterType === 'segmentation') {
    //         params.segmentation_id = value;
    //     } else if (filterType === 'sort_by') {
    //         params.sort_by = value;
    //     } else if (filterType === 'sort_order') {
    //         params.sort_order = value;
    //     } else if (filterType === 'island_id') {
    //         params.island_id = value;
    //     } else if (filterType === 'group_id') {
    //         params.group_id = value;
    //     } else if (filterType === 'area_id') {
    //         params.area_id = value;
    //     } else if (filterType === 'iup_zone_id') {
    //         params.iup_zone_id = value;
    //     } else if (filterType === 'iup_segment_id') {
    //         params.iup_segment_id = value;
    //     } else if (filterType === 'is_contractor_count') {
    //         params.is_contractor_count = value || null;
    //     }
        
    //     fetchIup(params);
    // }, [fetchIup]);

    // const handleFilters = useCallback((filters: { search?: string; mine_type?: string; status?: string }) => {
    //     setPagination(prev => ({ ...prev, page: 1 }));
    //     fetchIup({ ...filters, page: 1 });
    // }, [fetchIup]);
    // interface TerritoryFilters {
    //     island_id?: string;
    //     group_id?: string;
    //     area_id?: string;
    //     iup_zone_id?: string;
    //     iup_segment_id?: string;
    // }
    
    // const handleTerritoryFilterChange = useCallback((filters: TerritoryFilters) => {
    //     // Update semua state sekaligus
    //     if (filters.island_id !== undefined) setIslandFilter(filters.island_id);
    //     if (filters.group_id !== undefined) setGroupFilter(filters.group_id);
    //     if (filters.area_id !== undefined) setAreaFilter(filters.area_id);
    //     if (filters.iup_zone_id !== undefined) setIupZoneFilter(filters.iup_zone_id);
    //     if (filters.iup_segment_id !== undefined) setIupSegmentFilter(filters.iup_segment_id);
        
    //     setPagination(prev => ({ ...prev, page: 1 }));
        
    //     fetchIup({
    //         page: 1,
    //         ...filters
    //     });
    // }, [fetchIup]);

    // Initial load

    return {
        // State
        iup,
        summary,
        loading,
        error,
        pagination,
        
        filters: urlFilters,
        searchValue,
        setSearchValue,

        fetchIup,

        // Actions
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        // handleFilters,
        
        // Filter actions
        // handleTerritoryFilterChange,
        // handleSearch,
        
        // Search functions
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        // resetFilters,
    };
};