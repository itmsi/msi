import { useCallback, useRef, useState } from 'react';
import { apiPost } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface GroupSelectOption {
    value: string;
    label: string;
}

interface GroupItem {
    group_id: string;
    group_name: string;
}

interface GroupListResponse {
    success: boolean;
    message: string;
    data: {
        data?: GroupItem[];
        items?: GroupItem[];
    };
}

export const useGroupSelect = (limit: number = 100) => {
    const [groupOptions, setGroupOptions] = useState<GroupSelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const isInitialized = useRef(false);

    const loadGroups = useCallback(async (search: string = ''): Promise<GroupSelectOption[]> => {
        try {
            setLoading(true);

            const response = await apiPost<GroupListResponse>(`${API_BASE_URL}/sso/group/get`, {
                page: 1,
                limit,
                search,
                sort_by: 'group_name',
                sort_order: 'asc',
            });

            const items = response.data?.data?.data ?? response.data?.data?.items ?? [];
            const options = items
                .map(item => ({ value: item.group_id, label: item.group_name }))
                .sort((a, b) => a.label.localeCompare(b.label));

            setGroupOptions(options);
            return options;
        } catch (error) {
            console.error('Error loading groups:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [limit]);

    const initializeOptions = useCallback(async () => {
        if (isInitialized.current) return;

        isInitialized.current = true;
        await loadGroups();
    }, [loadGroups]);

    return {
        groupOptions,
        loading,
        loadGroups,
        initializeOptions,
    };
};
