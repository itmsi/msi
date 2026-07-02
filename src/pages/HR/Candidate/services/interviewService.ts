import { apiDelete, apiGet, apiPost, apiPut } from '@/helpers/apiHelper';
import type { ApiDetailResponse, ApiListResponse, ApiWrapper } from '../types/hr';

const GW = import.meta.env.VITE_API_BASE_URL;
const HRM = `${GW}/hrm`;

async function unwrapList<T>(url: string, body: Record<string, unknown>): Promise<ApiListResponse<T>> {
  const raw = await apiPost<ApiWrapper<T>>(url, body);
  const d = raw?.data?.data;
  return { data: d?.data || [], pagination: d?.pagination };
}

// ============================================================
// Types
// ============================================================

export interface ScheduleApiItem {
  schedule_interview_id: string;
  candidate_id: string;
  assign_role?: { role?: string } | string | null;
  schedule_interview_date: string;
  schedule_interview_time: string;
  schedule_interview_duration: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
}

export type InterviewSchedule = ScheduleApiItem;

export interface ScheduleCreateRequest {
  candidate_id: string;
  assign_role?: string;
  schedule_interview_date: string;
  schedule_interview_time: string;
  schedule_interview_duration: string;
}

// ============================================================
// Interview Schedule Service (HRM)
// ============================================================

export class interviewScheduleService {
  static async getList(candidateId: string): Promise<ApiListResponse<InterviewSchedule>> {
    return unwrapList<InterviewSchedule>(`${HRM}/schedule_interview/get`, {
      candidate_id: candidateId, page: 1, limit: 100,
    });
  }

  static async create(data: ScheduleCreateRequest): Promise<ApiDetailResponse<InterviewSchedule>> {
    const payload: Record<string, unknown> = {
      candidate_id: data.candidate_id,
      schedule_interview_date: data.schedule_interview_date,
      schedule_interview_time: data.schedule_interview_time,
      schedule_interview_duration: data.schedule_interview_duration,
    };
    if (data.assign_role) {
      payload.assign_role = { role: data.assign_role };
    }
    const response = await apiPost<ApiDetailResponse<InterviewSchedule>>(`${HRM}/schedule_interview/create`, payload);
    return response.data;
  }

  static async update(id: string, data: ScheduleCreateRequest): Promise<ApiDetailResponse<InterviewSchedule>> {
    const payload: Record<string, unknown> = {
      candidate_id: data.candidate_id,
      schedule_interview_date: data.schedule_interview_date,
      schedule_interview_time: data.schedule_interview_time,
      schedule_interview_duration: data.schedule_interview_duration,
    };
    if (data.assign_role) {
      payload.assign_role = { role: data.assign_role };
    }
    const response = await apiPut<ApiDetailResponse<InterviewSchedule>>(`${HRM}/schedule_interview/${id}`, payload);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${HRM}/schedule_interview/${id}`);
  }
}

// ============================================================
// Interview Form Service (HRM)
// ============================================================

export interface InterviewFormItem {
  interview_id: string;
  schedule_interview_id: string;
  assigned_id: string | null;
  company_value: string;
  comment: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
  updated_at: string;
  updated_by_name: string;
  detail_interviews: {
    detail_interview_id: string;
    interview_id: string;
    aspect: string;
    question: string;
    answer: string;
    score: string;
    created_at: string;
    created_by: string;
    created_by_name: string;
  }[];
}

export interface InterviewCreateRequest {
  schedule_interview_id: string;
  assigned_id?: string;
  company_value: string;
  comment: string;
  detail_interviews: { aspect: string; question: string; answer: string; score: string }[];
}

export class interviewFormService {
  static async getList(params: {
    schedule_interview_id: string;
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<ApiListResponse<InterviewFormItem>> {
    return unwrapList<InterviewFormItem>(`${HRM}/interviews/get`, {
      page: params.page || 1,
      limit: params.limit || 100,
      search: params.search || '',
      sort_by: params.sort_by || 'created_at',
      sort_order: params.sort_order || 'desc',
      schedule_interview_id: params.schedule_interview_id,
    });
  }

  static async create(data: InterviewCreateRequest): Promise<ApiDetailResponse<InterviewFormItem>> {
    const payload: Record<string, unknown> = {
      schedule_interview_id: data.schedule_interview_id,
      company_value: data.company_value,
      comment: data.comment,
      detail_interviews: data.detail_interviews,
    };
    if (data.assigned_id) payload.assigned_id = data.assigned_id;
    const response = await apiPost<ApiDetailResponse<InterviewFormItem>>(`${HRM}/interviews/create`, payload);
    return response.data;
  }

  static async getById(id: string): Promise<ApiDetailResponse<InterviewFormItem>> {
    const response = await apiGet<ApiDetailResponse<InterviewFormItem>>(`${HRM}/interviews/${id}`);
    return response.data;
  }

  static async update(id: string, data: Partial<InterviewCreateRequest>): Promise<ApiDetailResponse<InterviewFormItem>> {
    const payload: Record<string, unknown> = {};
    if (data.schedule_interview_id) payload.schedule_interview_id = data.schedule_interview_id;
    if (data.company_value) payload.company_value = data.company_value;
    if (data.comment) payload.comment = data.comment;
    if (data.assigned_id) payload.assigned_id = data.assigned_id;
    if (data.detail_interviews) payload.detail_interviews = data.detail_interviews;
    const response = await apiPut<ApiDetailResponse<InterviewFormItem>>(`${HRM}/interviews/${id}`, payload);
    return response.data;
  }

  static async delete(interviewId: string): Promise<void> {
    await apiDelete(`${HRM}/interviews/${interviewId}`);
  }
}
