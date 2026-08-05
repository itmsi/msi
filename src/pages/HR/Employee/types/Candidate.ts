export interface CandidateRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: 'created_at' | 'updated_at' | '';
    sort_order: 'asc' | 'desc' | '';
    group_id?: string;
    company_id?: string;
    department_id?: string;
    title_id?: string;
    candidate_status?: string;
    candidate_status_offering_letter?: string;
    assign_role?: string;
}

export interface CandidateScheduleInterview {
    assign_role: string[] | string | null;
    schedule_interview_date: string | null;
    schedule_interview_time: string | null;
    schedule_interview_duration: string | number | null;
}

export interface CandidateItem {
    candidate_id: string;
    company_id: string | null;
    department_id: string | null;
    title_id: string | null;
    candidate_number: string;
    candidate_name: string;
    candidate_email: string;
    candidate_phone: string;
    candidate_religion: string | null;
    candidate_gender: string | null;
    candidate_marital_status: string | null;
    candidate_age: number | null;
    candidate_date_birth: string | null;
    candidate_nationality: string | null;
    candidate_city: string | null;
    candidate_state: string | null;
    candidate_country: string | null;
    candidate_address: string | null;
    candidate_foto: string | null;
    candidate_resume: string | null;
    candidate_foto_path: string | null;
    candidate_resume_path: string | null;
    ptk_date: string | null;
    offering_letter: string | null;
    remark: string | null;
    schedule_interview: CandidateScheduleInterview | null;
    candidate_status: string;
    candidate_status_offering_letter: string | null;
    group_name: string | null;
    company_name: string | null;
    department_name: string | null;
    title_name: string | null;
    created_by_name: string | null;
    updated_by_name: string | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CandidateOfferingCount {
    all: number;
    ok: number;
    not_ok: number;
    null: number;
}

// Endpoint hrm/candidates/get membungkus hasil dalam envelope
// {success, message, data, timestamp} — beda dengan endpoint project yang
// langsung {status, data, pagination} di level atas. "pagination" dan
// "candidate_status_offering_count" ada DI DALAM field "data", bukan di
// level atas envelope.
export interface CandidateListResult {
    data: CandidateItem[];
    pagination: Pagination;
    candidate_status_offering_count: CandidateOfferingCount;
}

export interface CandidateListResponse {
    success: boolean;
    message: string;
    data: CandidateListResult;
    timestamp: string;
}