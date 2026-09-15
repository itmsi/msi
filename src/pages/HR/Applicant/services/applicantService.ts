import { apiGet, apiPost, apiPut } from '@/helpers/apiHelper';
import {
    ApplicantFormDetailResponse,
    ApplicantFormListRequest,
    ApplicantFormListResponse,
    ApplicantFormListResult,
    ApplicantFormUpdateRequest,
    ApplicantFormUpdateResponse,
} from '../types/applicant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApplicantService {
    static async getApplicantForms(params: Partial<ApplicantFormListRequest> = {}): Promise<ApplicantFormListResult> {
        const requestData: ApplicantFormListRequest = {
            page: 1,
            limit: 10,
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
            position_applied_for: '',
            city: '',
            ...params,
        };

        const response = await apiPost(`${API_BASE_URL}/career/applicant-forms/get`, requestData);
        const envelope = response.data as ApplicantFormListResponse;

        return {
            success: Boolean(envelope?.success),
            message: envelope?.message || '',
            items: envelope?.data?.items ?? envelope?.data?.data ?? [],
            pagination: envelope?.data?.pagination ?? {
                page: requestData.page,
                limit: requestData.limit,
                total: 0,
                totalPages: 0,
            },
        };
    }

    static async getApplicantFormById(id: string): Promise<ApplicantFormDetailResponse> {
        const response = await apiGet<ApplicantFormDetailResponse>(`${API_BASE_URL}/career/applicant-forms/${id}`);
        return response.data;
    }

    static async updateApplicantForm(id: string, payload: ApplicantFormUpdateRequest): Promise<ApplicantFormUpdateResponse> {
        const response = await apiPut<ApplicantFormUpdateResponse>(`${API_BASE_URL}/career/applicant-forms/${id}`, payload);
        return response.data;
    }
}
