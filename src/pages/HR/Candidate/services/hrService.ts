import { apiDelete, apiPost, apiPostMultipart, apiPutMultipart } from '@/helpers/apiHelper';
import type {
  ApiListResponse,
  ApiDetailResponse,
  Candidate,
  NoteItem,
  NoteCreateRequest,
  BackgroundCheckItem,
  OnBoardDocument,
  ApiWrapper,
  Group,
  Company,
  Department,
  JobTitle,
  CandidateListRequest,
} from '../types/hr';

const GW = import.meta.env.VITE_API_BASE_URL;
const HRM = `${GW}/hrm`;

async function unwrapList<T>(url: string, body: Record<string, unknown>): Promise<ApiListResponse<T>> {
  const raw = await apiPost<ApiWrapper<T>>(url, body);
  const d = raw?.data?.data;
  return { data: d?.data || [], pagination: d?.pagination };
}

export class candidateService {
  static async getList(req?: CandidateListRequest): Promise<ApiListResponse<Candidate>> {
    return unwrapList<Candidate>(`${HRM}/candidates/get`, (req || {}) as Record<string, unknown>);
  }

  static async createMultipart(formData: FormData): Promise<ApiDetailResponse<Candidate>> {
    const response = await apiPostMultipart<ApiDetailResponse<Candidate>>(`${HRM}/candidates/create`, formData);
    return response.data;
  }

  static async updateMultipart(id: string, formData: FormData): Promise<ApiDetailResponse<Candidate>> {
    const response = await apiPutMultipart<ApiDetailResponse<Candidate>>(`${HRM}/candidates/${id}`, formData);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${HRM}/candidates/${id}`);
  }
}

export class hrGroupService {
  static async getList(body: Record<string, unknown> = { page: 1, limit: 10, search: '', sort_by: 'created_at', sort_order: 'desc' }): Promise<ApiListResponse<Group>> {
    return unwrapList<Group>(`${GW}/sso/group/get`, body);
  }
}

export class hrCompanyService {
  static async getList(limit = 100): Promise<ApiListResponse<Company>> {
    return unwrapList<Company>(`${GW}/companies/get`, { limit });
  }
}

export class hrDepartmentService {
  static async getList(companiesId: string, limit = 100): Promise<ApiListResponse<Department>> {
    return unwrapList<Department>(`${GW}/departments/get`, { limit, company_id: companiesId });
  }
}

export class hrJobTitleService {
  static async getList(departementId: string, limit = 100): Promise<ApiListResponse<JobTitle>> {
    return unwrapList<JobTitle>(`${GW}/titles/get`, { limit, department_id: departementId });
  }
}

export class notesService {
  static async getList(candidateId: string): Promise<ApiListResponse<NoteItem>> {
    return unwrapList<NoteItem>(`${HRM}/note/get`, { candidate_id: candidateId, page: 1, limit: 100 });
  }

  static async create(data: NoteCreateRequest): Promise<ApiDetailResponse<NoteItem>> {
    const response = await apiPost<ApiDetailResponse<NoteItem>>(`${HRM}/note/create`, data as unknown as Record<string, unknown>);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${HRM}/note/${id}`);
  }
}

export class backgroundCheckService {
  static async getList(candidateId: string): Promise<ApiListResponse<BackgroundCheckItem>> {
    return unwrapList<BackgroundCheckItem>(`${HRM}/background_check/get`, {
      candidate_id: candidateId, page: 1, limit: 100,
    });
  }

  static async create(formData: FormData): Promise<ApiDetailResponse<BackgroundCheckItem>> {
    const response = await apiPostMultipart<ApiDetailResponse<BackgroundCheckItem>>(`${HRM}/background_check/create`, formData);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${HRM}/background_check/${id}`);
  }
}

export class documentService {
  static async getList(candidateId: string): Promise<ApiListResponse<OnBoardDocument>> {
    return unwrapList<OnBoardDocument>(`${HRM}/on_board_document/get`, {
      candidate_id: candidateId, page: 1, limit: 100,
    });
  }

  static async create(formData: FormData): Promise<void> {
    await apiPostMultipart(`${HRM}/on_board_document/create`, formData);
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`${HRM}/on_board_document/${id}`);
  }
}
