// ============================================================
// Candidate Types
// ============================================================

export interface CandidatePersonalInfo {
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_nationality?: string;
  candidate_gender?: string;
  candidate_religion?: string;
  candidate_date_birth?: string;
  candidate_marital_status?: string;
}

export interface CandidateAddressInfo {
  candidate_address?: string;
  candidate_city?: string;
  candidate_state?: string;
  candidate_country?: string;
}

export interface CandidateReferred {
  name: string;
  email: string;
  role: string;
  role_alias: string;
}

export interface DateSchedule {
  id: string | number;
  name: string;
  interviewer: string[];
  image: string;
  date: string;
  time: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  image: string | null;
  id_candidate: string;
  date_applied: string;
  position: string;
  interviewer: string[];
  status: string;
  age: string;
  company: string;
  department?: string;
  referred: CandidateReferred[];
  personal_information: CandidatePersonalInfo[];
  address_information: CandidateAddressInfo[];
  resume: string | null;
  notes: CandidateNote[];
  date_schedule: DateSchedule[];
  position_id?: string;
  company_id?: string;
  department_id?: string;
}

export interface CandidateFormData {
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_title: string;
  cum_title_id: string;
  candidate_company: string;
  cum_companies_id: string;
  candidate_department: string;
  cum_departement_id: string;
  candidate_nationality: string;
  candidate_gender: string;
  candidate_religion: string;
  candidate_date_birth: Date | null;
  candidate_age: string;
  candidate_marital_status: string;
  candidate_address: string;
  candidate_city: string;
  candidate_state: string;
  candidate_country: string;
  candidate_foto: File | string | null;
  candidate_resume: File | string | null;
}

// ============================================================
// Interview / Date Schedule Types
// ============================================================

export interface DateInterviewForm {
  date: Date | null;
  time: Date | null;
  assign: string[];
  duration: string;
}

export interface InterviewAssignment {
  cum_id?: number;
  assigned_name: string;
  assigned_email: string;
  assigned_role: string;
  assigned_role_alias: string;
}

export interface InterviewFormData {
  schedule_interview_date: string;
  schedule_interview_time: string;
  schedule_interview_duration: string;
  assigned_data: InterviewAssignment[];
}

// ============================================================
// Notes Types
// ============================================================

export interface CandidateNote {
  id: number | string;
  name: string;
  image_profile: string | null;
  date_created: string;
  role_alias: string;
  note: string;
  note_id?: number;
  candidate_id?: number;
  create_at?: string;
  create_by?: string;
}

export interface NoteFormData {
  candidate_id: string;
  notes: string;
  create_by: string;
  assigned_data: InterviewAssignment[];
}

// ============================================================
// Background Check Types
// ============================================================

export interface BackgroundCheckItem {
  id: string;
  candidate_id: string;
  status: string;
  notes: string;
  file_attachment: string | null;
  create_at: string;
  create_by: string;
}

export interface BackgroundCheckFormData {
  status: string;
  notes: string;
  file_attachment: File | null;
}

// ============================================================
// Document Onboarding Types
// ============================================================

export interface OnBoardDocument {
  id: string;
  candidate_id: string;
  on_board_documents_name: string;
  on_board_documents_file: string;
  create_at: string;
  create_by: string;
}

// ============================================================
// Form Interview / Scoring Types
// ============================================================

export interface FormInterviewAspect {
  key: string;
  label: string;
  defaultQuestion?: string;
}

export interface FormInterviewPoint {
  point: string;
  question: string;
  remark: string;
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
// Company / Department / Job Title Types
// ============================================================

export interface Company {
  company_id: string;
  company_name: string;
}

export interface Department {
  departement_id: string;
  departement_name: string;
}

export interface JobTitle {
  job_title_id: string;
  job_title_name: string;
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
