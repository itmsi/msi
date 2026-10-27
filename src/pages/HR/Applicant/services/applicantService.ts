import { apiGet, apiPost, apiPut } from '@/helpers/apiHelper';
import {
    ApplicantFormContentsRequest,
    ApplicantFormContentsResponse,
    ApplicantFormDetailResponse,
    ApplicantFormListRequest,
    ApplicantFormListResponse,
    ApplicantFormListResult,
    ApplicantFormUpdateRequest,
    ApplicantFormUpdateResponse,
    ApplicantInvitationCreateRequest,
    ApplicantInvitationCreateResponse,
    ApplicantInvitationResendResponse,
    ApplicantSendEmailStatusRequest,
    ApplicantSendEmailStatusResponse,
    ApplicantSummarizeAllResponse,
    ApplicantSummarizeRequest,
    ApplicantSummarizeResponse,
    ApplicantTranscribeResponse,
} from '../types/applicant';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FORM_CONTENTS_URL = `${API_BASE_URL}/career/applicant_form_contents`;

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

    static async createSummarizeAll(id: string): Promise<ApplicantSummarizeAllResponse> {
        const response = await apiPost<ApplicantSummarizeAllResponse>(`${API_BASE_URL}/career/applicant-forms/create-summarize-all`, { id });
        return response.data;
    }

    static async createApplicantInvitation(payload: ApplicantInvitationCreateRequest): Promise<ApplicantInvitationCreateResponse> {
        const response = await apiPost<ApplicantInvitationCreateResponse>(`${API_BASE_URL}/career/applicant-invitations/create`, payload);
        return response.data;
    }

    static async updateInvitationEmailStatus(
        invitationId: string,
        payload: ApplicantSendEmailStatusRequest
    ): Promise<ApplicantSendEmailStatusResponse> {
        const response = await apiPut<ApplicantSendEmailStatusResponse>(
            `${API_BASE_URL}/career/applicant-invitations/${invitationId}`,
            payload
        );
        return response.data;
    }

    static async resendApplicantInvitation(id: string): Promise<ApplicantInvitationResendResponse> {
        const response = await apiPost<ApplicantInvitationResendResponse>(`${API_BASE_URL}/career/applicant-invitations/${id}/resend`);
        return response.data;
    }

    // Jumlah pertanyaan wawancara masih sedikit (5), jadi semuanya diambil sekali tanpa paging.
    static async getApplicantFormContents(applicantFormId: string): Promise<ApplicantFormContentsResponse> {
        const requestData: ApplicantFormContentsRequest = {
            page: 1,
            limit: 20,
            search: '',
            applicant_form_id: applicantFormId,
            sort_by: 'created_at',
            sort_order: 'desc',
        };

        const response = await apiPost<ApplicantFormContentsResponse>(`${FORM_CONTENTS_URL}/get`, requestData);
        return response.data;
    }

    // file_link_audio berupa URL penuh, jadi di-encode agar tetap menjadi satu segmen path.
    static async transcribeApplicantAudio(fileLinkAudio: string): Promise<ApplicantTranscribeResponse> {
        const response = await apiPost<ApplicantTranscribeResponse>(
            `${FORM_CONTENTS_URL}/audio/${encodeURIComponent(fileLinkAudio)}`
        );
        return response.data;
    }

    static async summarizeApplicantAudio(payload: ApplicantSummarizeRequest): Promise<ApplicantSummarizeResponse> {
        const response = await apiPost<ApplicantSummarizeResponse>(`${FORM_CONTENTS_URL}/summarize`, payload);
        return response.data;
    }

    static async updateApplicantForm(id: string, payload: ApplicantFormUpdateRequest): Promise<ApplicantFormUpdateResponse> {
        const response = await apiPut<ApplicantFormUpdateResponse>(`${API_BASE_URL}/career/applicant-forms/${id}`, payload);
        return response.data;
    }
}
