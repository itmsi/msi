import { apiDelete, apiGet, apiPatch, apiPost, apiPostMultipart } from '@/helpers/apiHelper';
import type {
  ApiListResponse,
  ApiDetailResponse,
  Candidate,
  CandidateNote,
  NoteFormData,
  BackgroundCheckItem,
  OnBoardDocument,
  Company,
  Department,
  JobTitle,
} from '../types/hr';

const API_CAREER = 'https://career-api.motorsights.com';
const API_CUM = 'https://dev-cum-api.motorsights.com/api/v1';

export class candidateService {
  static async getList(params?: Record<string, string | number | boolean>): Promise<ApiListResponse<Candidate>> {
    const response = await apiGet<ApiListResponse<Candidate>>(`${API_CAREER}/dashboard/candidates`, params);
    return response.data;
  }

  static async getById(id: string): Promise<ApiDetailResponse<Candidate>> {
    const response = await apiGet<ApiDetailResponse<Candidate>>(`${API_CAREER}/candidates/${id}`);
    return response.data;
  }

  static async create(data: Record<string, unknown>): Promise<ApiDetailResponse<Candidate>> {
    const response = await apiPost<ApiDetailResponse<Candidate>>(`${API_CAREER}/candidates`, data);
    return response.data;
  }

  static async createMultipart(formData: FormData): Promise<ApiDetailResponse<Candidate>> {
    const response = await apiPostMultipart<ApiDetailResponse<Candidate>>(`${API_CAREER}/candidates/multipart`, formData);
    return response.data;
  }

  static async update(id: string, data: Record<string, unknown>): Promise<ApiDetailResponse<Candidate>> {
    const response = await apiPatch<ApiDetailResponse<Candidate>>(`${API_CAREER}/candidates/${id}`, data);
    return response.data;
  }

  static async updateMultipart(id: string, formData: FormData): Promise<ApiDetailResponse<Candidate>> {
    const response = await apiPostMultipart<ApiDetailResponse<Candidate>>(
      `${API_CAREER}/candidates/${id}/multipart?permissionName=update&menuName=candidate&systemName=interview`,
      formData
    );
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${API_CAREER}/candidates/${id}`);
  }
}

export class hrCompanyService {
  static async getList(limit = 500): Promise<ApiListResponse<Company>> {
    const response = await apiGet<ApiListResponse<Company>>(`${API_CUM}/companies`, { limit });
    return response.data;
  }
}

export class hrDepartmentService {
  static async getList(companiesId: string, limit = 500): Promise<ApiListResponse<Department>> {
    const response = await apiGet<ApiListResponse<Department>>(`${API_CUM}/departement`, {
      limit, companies_id: companiesId,
    });
    return response.data;
  }
}

export class hrJobTitleService {
  static async getList(departementId: string, limit = 500): Promise<{ response: { result: JobTitle[] } }> {
    const response = await apiGet<{ response: { result: JobTitle[] } }>(`${API_CUM}/job-titles`, {
      limit, departement_id: departementId,
    });
    return response.data;
  }
}

export class notesService {
  static async getList(candidateId: string): Promise<ApiListResponse<CandidateNote>> {
    const response = await apiGet<ApiListResponse<CandidateNote>>(`${API_CAREER}/notes`, {
      page: 1, limit: 500, orderBy: 'create_at', orderDirection: 'DESC', candidate_id: candidateId,
    });
    return response.data;
  }

  static async create(data: NoteFormData): Promise<ApiDetailResponse<CandidateNote>> {
    const response = await apiPost<ApiDetailResponse<CandidateNote>>(`${API_CAREER}/notes`, data as unknown as Record<string, unknown>);
    return response.data;
  }
}

export class backgroundCheckService {
  static async getList(candidateId: string): Promise<ApiListResponse<BackgroundCheckItem>> {
    const response = await apiGet<ApiListResponse<BackgroundCheckItem>>(`${API_CAREER}/background-check`, {
      page: 1, limit: 500, orderBy: 'create_at', orderDirection: 'DESC', candidate_id: candidateId,
    });
    return response.data;
  }

  static async create(formData: FormData): Promise<ApiDetailResponse<BackgroundCheckItem>> {
    const response = await apiPostMultipart<ApiDetailResponse<BackgroundCheckItem>>(`${API_CAREER}/background-check/multipart`, formData);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${API_CAREER}/background-check/${id}`);
  }
}

export class documentService {
  static async getList(candidateId: string): Promise<ApiListResponse<OnBoardDocument>> {
    const response = await apiGet<ApiListResponse<OnBoardDocument>>(`${API_CAREER}/on-board-documents`, {
      page: 1, limit: 500, orderBy: 'create_at', orderDirection: 'DESC', candidate_id: candidateId,
    });
    return response.data;
  }

  static async create(formData: FormData): Promise<void> {
    await apiPostMultipart(`${API_CAREER}/on-board-documents/multipart`, formData);
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${API_CAREER}/on-board-documents/${id}`);
  }
}
