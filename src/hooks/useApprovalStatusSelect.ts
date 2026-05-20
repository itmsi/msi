import { useState, useCallback, useRef } from 'react';
import { apiPost } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApprovalStatusSelectOption {
    value: string;
    label: string;
}

interface ApprovalStatusItem {
    id: number;
    code: string;
    name: string;
}

interface ApprovalStatusResponse {
    success: boolean;
    message: string;
    data: {
        items: ApprovalStatusItem[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export const useApprovalStatusSelect = () => {
    const [approvalStatusOptions, setApprovalStatusOptions] = useState<ApprovalStatusSelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const isInitialized = useRef(false);

    const loadApprovalStatus = useCallback(async (search: string = '') => {
        try {
            setLoading(true);
            const response = await apiPost<{ data: ApprovalStatusResponse }>(
                `${API_BASE_URL}/netsuite/approval_status/get`,
                { search, page: 1, limit: 100 }
            );

            const res = response.data as unknown as ApprovalStatusResponse;
            if (res.success && res.data?.items) {
                const options = res.data.items.map((item) => ({
                    value: item.name,
                    label: item.name
                        ? `${item.name}`
                        : item.code,
                }));
                setApprovalStatusOptions(options);
                return options;
            }
        } catch (error) {
            console.error('Error loading approval status:', error);
        } finally {
            setLoading(false);
        }
        return [];
    }, []);

    const initializeOptions = useCallback(async () => {
        if (isInitialized.current) return;
        isInitialized.current = true;
        await loadApprovalStatus();
    }, [loadApprovalStatus]);

    return {
        approvalStatusOptions,
        loading,
        loadApprovalStatus,
        initializeOptions,
    };
};
