import { apiGet, apiPost } from '@/helpers/apiHelper';
import {
    ActivityDetailResponse,
    ActivityItem,
    ActivityListRequest,
    ActivityListResponse,
    ActivityListResult,
} from '../types/activity';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ActivityService {
    static async getActivityDetail(id: string, typeData: string): Promise<ActivityItem> {
        const response = await apiGet<ActivityDetailResponse>(
            `${API_BASE_URL}/netsuite/log-activities/${encodeURIComponent(id)}`,
            { type_data: typeData },
        );
        const envelope = response.data;

        if (!envelope?.success || !envelope.data) {
            throw new Error(envelope?.message || 'Failed to fetch activity detail');
        }

        return envelope.data;
    }

    static async getActivities(params: Partial<ActivityListRequest> = {}): Promise<ActivityListResult> {
        const requestData: ActivityListRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            type_data: '',
            client: '',
            status: '',
            module_name: '',
            start_date: '',
            end_date: '',
            ...params,
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/log-activities/get`, requestData);
        const envelope = response.data as ActivityListResponse;

        return {
            success: Boolean(envelope?.success),
            message: envelope?.message || '',
            items: envelope?.data?.items ?? [],
            pagination: envelope?.data?.pagination ?? {
                page: requestData.page,
                limit: requestData.limit,
                total: 0,
                totalPages: 0,
            },
        };
    }
}
