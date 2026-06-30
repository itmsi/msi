import { apiDelete, apiPost, apiPut } from '@/helpers/apiHelper';
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

export class interviewFormService {
  static async submit(data: Record<string, unknown>): Promise<ApiDetailResponse<unknown>> {
    const response = await apiPost<ApiDetailResponse<unknown>>(`${HRM}/interviews/create`, data);
    return response.data;
  }

  static async update(id: string, data: Record<string, unknown>): Promise<ApiDetailResponse<unknown>> {
    const response = await apiPut<ApiDetailResponse<unknown>>(`${HRM}/interviews/${id}`, data);
    return response.data;
  }

  static async delete(interviewId: string): Promise<void> {
    await apiDelete(`${HRM}/interviews/${interviewId}`);
  }
}
