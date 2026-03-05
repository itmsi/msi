import { useState, useCallback, useRef } from 'react';
import { ProjectDivisionOverviewService } from '@/pages/CRM/Project/services/projectDivisionOverviewService';
import { DivisionOverviewItem } from '@/pages/CRM/Project/types/divisionOverview';

export interface ProjectDetailDivisionOption {
    value: string; // project_detail_id
    label: string; // devision_project_name
}

export const useProjectDetailDivisionSelect = (project_id: string) => {
    const [options, setOptions] = useState<ProjectDetailDivisionOption[]>([]);
    const [paginationState, setPaginationState] = useState({ page: 1, hasMore: true, loading: false });
    const [inputValue, setInputValue] = useState('');

    const isInitialized = useRef(false);
    const isLoadingRef = useRef(false);

    const loadOptions = useCallback(async (
        search: string = '',
        loadedOptions: ProjectDetailDivisionOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        if (!project_id) return loadedOptions;
        if (isLoadingRef.current && !reset) return loadedOptions;

        isLoadingRef.current = true;
        setPaginationState(prev => ({ ...prev, loading: true }));

        try {
            const response = await ProjectDivisionOverviewService.getDivisionOverview(project_id, {
                search,
                page,
                limit: 20,
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            if (response.status) {
                const newOptions = response.data.map((item: DivisionOverviewItem) => ({
                    value: item.project_detail_division_id,
                    label: item.devision_project_name
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setOptions(updatedOptions);

                const hasMore = response.pagination.page < response.pagination.totalPages;
                setPaginationState({ page: response.pagination.page, hasMore, loading: false });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading project detail divisions:', error);
        } finally {
            isLoadingRef.current = false;
            setPaginationState(prev => ({ ...prev, loading: false }));
        }

        return loadedOptions;
    }, [project_id]);

    const handleInputChange = useCallback(async (value: string) => {
        setInputValue(value);
        setOptions([]);
        setPaginationState({ page: 1, hasMore: true, loading: false });
        return await loadOptions(value, [], 1, true);
    }, [loadOptions]);

    const handleMenuScrollToBottom = useCallback(() => {
        if (paginationState.hasMore && !isLoadingRef.current) {
            loadOptions(inputValue, options, paginationState.page + 1, false);
        }
    }, [paginationState.hasMore, paginationState.page, inputValue, options, loadOptions]);

    const initializeOptions = useCallback(async () => {
        if (isInitialized.current || isLoadingRef.current) return;
        isInitialized.current = true;
        await loadOptions('', [], 1, true);
    }, [loadOptions]);

    return {
        options,
        loading: paginationState.loading,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions
    };
};
