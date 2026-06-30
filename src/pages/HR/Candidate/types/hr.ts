// ============================================================
// Candidate Types — langsung dari API gateway HRM
// ============================================================

export interface ScheduleInterview {
  assign_role?: string;
  schedule_interview_date?: string;
  schedule_interview_time?: string;
  schedule_interview_duration?: string;
}

export interface Candidate {
  candidate_id: string;
  company_id: string;
  department_id: string | null;
  title_id: string | null;
  candidate_number: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_religion: string;
  candidate_gender: string;
  candidate_marital_status: string;
  candidate_age: number | null;
  candidate_date_birth: string | null;
  candidate_nationality: string;
  candidate_city: string;
  candidate_state: string;
  candidate_country: string;
  candidate_address: string;
  candidate_foto: string | null;
  candidate_resume: string | null;
  candidate_foto_path: string | null;
  candidate_resume_path: string | null;
  schedule_interview: ScheduleInterview | null;
  ptk_date: string | null;
  offering_letter: string | null;
  remark: string | null;
  group_id: string | null;
  candidate_status: string;
  candidate_status_offering_letter: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  deleted_at: string | null;
  deleted_by: string | null;
  is_delete: boolean;
  // Joined fields
  group_name?: string;
  company_name?: string;
  department_name?: string;
  title_name?: string;
}

export interface CandidateListRequest {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  group_id?: string;
  company_id?: string;
  department_id?: string;
  title_id?: string;
  candidate_status?: string;
  candidate_status_offering_letter?: string;
  assign_role?: string;
}

export interface CandidateCreateRequest {
  company_id: string;
  department_id: string;
  title_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_religion: string;
  candidate_gender: string;
  candidate_marital_status: string;
  candidate_age: number;
  candidate_date_birth: string;
  candidate_nationality: string;
  candidate_city: string;
  candidate_state: string;
  candidate_country: string;
  candidate_address: string;
  ptk_date?: string;
  offering_letter?: string;
  remark?: string;
  group_id?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiWrapper<T> {
  success: boolean;
  message?: string;
  data: {
    data: T[];
    pagination?: Pagination;
  };
  timestamp?: string;
}

// ============================================================
// Schedule Interview Types
// ============================================================

export interface ScheduleInterviewItem {
  schedule_interview_id: string;
  candidate_id: string;
  assign_role?: string | { role?: string };
  schedule_interview_date: string;
  schedule_interview_time: string;
  schedule_interview_duration: string;
  created_at: string;
  created_by: string;
}

// ============================================================
// Interview / Scoring Types
// ============================================================

export interface DetailInterview {
  detail_interview_id: string;
  interview_id: string;
  aspect: string;
  question: string;
  answer: string;
  score: string;
}

export interface InterviewItem {
  interview_id: string;
  schedule_interview_id: string;
  assigned_id: string | null;
  company_value: string;
  comment: string;
  detail_interviews: DetailInterview[];
  created_at: string;
  created_by: string;
}

// ============================================================
// Notes Types
// ============================================================

export interface NoteItem {
  note_id: string;
  candidate_id: string;
  notes: string;
  created_at: string;
  created_by: string;
}

export interface NoteCreateRequest {
  candidate_id: string;
  notes: string;
  created_by: string;
}

// ============================================================
// Background Check Types
// ============================================================

export interface BackgroundCheckItem {
  background_check_id: string;
  candidate_id: string;
  background_check_note: string;
  file_attachment: string | null;
  file_attachment_path: string | null;
  background_check_status: string;
  created_at: string;
  created_by: string | null;
  created_by_name?: string | null;
}

// ============================================================
// On Board Document Types
// ============================================================

export interface OnBoardDocument {
  on_board_documents_id: string;
  candidate_id: string;
  on_board_documents_name: string;
  on_board_documents_file: string;
  on_board_documents_file_path: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
}

// ============================================================
// Dropdown Types (dari gateway SSO)
// ============================================================

export interface Group {
  group_id: string;
  group_name: string;
}

export interface Company {
  company_id: string;
  company_name: string;
}

export interface Department {
  department_id: string;
  department_name: string;
  company_id: string;
  company_name?: string;
}

export interface JobTitle {
  title_id: string;
  title_name: string;
  department_id: string;
  department_name?: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiListResponse<T> {
  data: T[];
  pagination?: Pagination;
}

export interface ApiDetailResponse<T> {
  data: T;
  message?: string;
  status?: boolean;
}

// ============================================================
// Utility types for form
// ============================================================

export interface NoteFormData {
  candidate_id: string;
  notes: string;
  create_by: string;
}

export interface BackgroundCheckFormData {
  status: string;
  notes: string;
  file_attachment: File | null;
}

export interface FormInterviewAspect {
  key: string;
  label: string;
  defaultQuestion?: string;
}

export interface ScoreMetric {
  company_value: string;
  total_score: number;
}

export interface InterviewScoreData {
  data_candidate: Record<string, unknown>;
  data_score: ScoreMetric[];
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiDetailResponse<T> {
  data: T;
  message?: string;
  status?: boolean;
}
