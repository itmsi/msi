import { apiDelete, apiGet, apiPost } from '@/helpers/apiHelper';
import type { ApiDetailResponse, ApiListResponse } from '../types/hr';

const API_CAREER = 'https://career-api.motorsights.com';

export interface InterviewSchedule {
  id: string;
  candidate_id: string;
  schedule_interview_date: string;
  schedule_interview_time: string;
  schedule_interview_duration: string;
  create_at: string;
  interview?: InterviewGroup[];
}

export interface InterviewGroup {
  assigned_name: string;
  assigned_role_alias: string;
  form_interviews?: FormInterviewItem[];
}

export interface FormInterviewItem {
  interview_id: number | null;
  questions?: InterviewQuestion[];
}

export interface InterviewQuestion {
  aspect_label?: string;
  aspect_key?: string;
  point?: number;
  question?: string;
  remark?: string;
  total_score?: number;
  company_value?: string;
}

export class interviewScheduleService {
  static async getList(candidateId: string): Promise<ApiListResponse<InterviewSchedule>> {
    const response = await apiGet<ApiListResponse<InterviewSchedule>>(`${API_CAREER}/date-interview`, {
      candidate_id: candidateId, systemName: 'interview', menuName: 'candidate', permissionName: 'read',
    });
    return response.data;
  }

  static async create(data: Record<string, unknown>): Promise<ApiDetailResponse<InterviewSchedule>> {
    const response = await apiPost<ApiDetailResponse<InterviewSchedule>>(`${API_CAREER}/date-interview`, data);
    return response.data;
  }

  static async update(id: string, data: Record<string, unknown>): Promise<ApiDetailResponse<InterviewSchedule>> {
    const response = await apiPost<ApiDetailResponse<InterviewSchedule>>(`${API_CAREER}/date-interview/${id}`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${API_CAREER}/date-interview/${id}`);
  }
}

export class interviewFormService {
  static async submit(data: Record<string, unknown>): Promise<ApiDetailResponse<unknown>> {
    const response = await apiPost<ApiDetailResponse<unknown>>(`${API_CAREER}/form-interview`, data);
    return response.data;
  }

  static async update(id: string, data: Record<string, unknown>): Promise<ApiDetailResponse<unknown>> {
    const response = await apiPost<ApiDetailResponse<unknown>>(`${API_CAREER}/form-interview/${id}`, data);
    return response.data;
  }

  static async delete(interviewId: string): Promise<void> {
    await apiDelete(`${API_CAREER}/form-interview/${interviewId}`);
  }
}
