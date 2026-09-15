export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApplicantFormListItem {
    id: string;
    name: string;
    email: string | null;
    no_mobile: string | null;
    token_expires_at: string | null;
    is_completed: boolean;
    completed_at: string | null;
    created_at: string;
    created_by_name: string | null;
    position_applied_for: string | null;
    city: string | null;
    working_available_date: string | null;
    applicant_form_url: string | null;
}

export type ApplicantFormListRequest = {
    page: number;
    limit: number;
    search: string;
    sort_by: 'created_at';
    sort_order: 'asc' | 'desc';
    position_applied_for: string;
    city: string;
    is_completed?: boolean;
}

export interface ApplicantFormListResponse {
    success: boolean;
    message: string;
    data: {
        items?: ApplicantFormListItem[];
        data?: ApplicantFormListItem[];
        pagination?: Pagination;
    };
}

export interface ApplicantFormListResult {
    success: boolean;
    message: string;
    items: ApplicantFormListItem[];
    pagination: Pagination;
}

export type ApplicantFormStatus = 'completed' | 'pending' | 'expired';

export interface ApplicantDriverLicense {
    name: string;
}

export interface ApplicantEducation {
    type_of_school: string;
    name_of_school: string;
    location: string;
    graduate: string;
    major: string;
    graduation_year: string;
}

export interface ApplicantInformalEducation {
    type_of_training: string;
    institution_name: string;
    location: string;
    certification: string;
    periode: string;
}

export interface ApplicantFamilyMember {
    relationship: string;
    name: string;
    age: string;
    employment: string;
    emergency_contact_number: string;
}

export interface ApplicantWorkingExperience {
    name_of_company: string;
    date_from: string;
    date_final: string;
    pay_of_salary: string;
    name_of_supervisor: string;
    reason_of_leaving: string;
}

export interface ApplicantReference {
    name: string;
    position_company: string;
    phone: string;
}

export interface ApplicantAnswer {
    question: string;
    answers: string;
}

export type ApplicantFormListSections = {
    driver_license: ApplicantDriverLicense[];
    educational_background: ApplicantEducation[];
    informal_education_special_qualification: ApplicantInformalEducation[];
    family_background: ApplicantFamilyMember[];
    working_experiences: ApplicantWorkingExperience[];
    references_old_company: ApplicantReference[];
    following_answers: ApplicantAnswer[];
}

export type ApplicantListSection = keyof ApplicantFormListSections;

export interface ApplicantFormDetail extends ApplicantFormListItem {
    nickname: string | null;
    name_relationship_emergency_contact_number: string | null;
    id_number: string | null;
    marital_status: string | null;
    height_weight: string | null;
    address_as_per_id_card: string | null;
    present_address: string | null;
    place_date_of_birth: string | null;
    blood_type: string | null;
    tax_identification_number: string | null;
    relogion: string | null;
    tshirt_size: string | null;
    is_delete: boolean;
    driver_license: unknown;
    educational_background: unknown;
    informal_education_special_qualification: unknown;
    family_background: unknown;
    working_experiences: unknown;
    references_old_company: unknown;
    following_answers: unknown;
}

export interface ApplicantFormDetailResponse {
    success: boolean;
    message: string;
    data: ApplicantFormDetail | null;
}

export type ApplicantFormUpdateRequest = ApplicantFormListSections & {
    full_name: string;
    nickname: string;
    no_mobile: string;
    name_relationship_emergency_contact_number: string;
    email: string;
    id_number: string;
    position_applied_for: string;
    marital_status: string;
    height_weight: string;
    address_as_per_id_card: string;
    present_address: string;
    city: string;
    place_date_of_birth: string;
    blood_type: string;
    tax_identification_number: string;
    working_available_date: string;
    relogion: string;
    tshirt_size: string;
}

export type ApplicantFormScalarField = Exclude<keyof ApplicantFormUpdateRequest, ApplicantListSection>;

export type ApplicantInvitationCreateRequest = {
    full_name: string;
    email: string;
    no_mobile: string;
}

export type ApplicantInvitationField = keyof ApplicantInvitationCreateRequest;

export interface ApplicantInvitationCreateResponse {
    success: boolean;
    message: string;
}

export interface ApplicantFormUpdateResponse {
    success: boolean;
    message: string;
}
