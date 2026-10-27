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
    applicant_form_invitation_id: string;
    status_send_email: ApplicantSendEmailStatus;
    applicant_form_url: string | null;
}

export type ApplicantSendEmailStatus = 'Success' | 'Process' | 'Failed' | null;

export type ApplicantSendEmailStatusRequest = {
    status_send_email: Exclude<ApplicantSendEmailStatus, 'Process' | null>;
}

export interface ApplicantSendEmailStatusResponse {
    success: boolean;
    message: string;
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

export interface ApplicantFormFile {
    file: string;
    file_type: string;
    file_title: string;
}

// null berarti audio belum pernah ditranskrip.
export type ApplicantSpeechStatus = 'Success' | 'Pending' | 'Failed' | null;

export interface ApplicantInterviewStep {
    id: string;
    step: string;
    idQuestion: string;
    questionId: string;
    questionEn: string;
    questionCn: string;
    focusAssessment: string;
    videoUrl: string;
    videoTitle: string;
    audioUrl: string;
    audioTitle: string;
    speechText: string;
    speechStatus: ApplicantSpeechStatus;
    speechMessage: string;
    transcriptionId: string;
    summary: string;
    summaryStatus: ApplicantSummaryStatus;
    summaryMessage: string;
}

export type ApplicantSummaryStatus = 'Success' | 'Failed' | null;

// Ringkasan gabungan seluruh jawaban wawancara, dari detail applicant form.
export interface ApplicantSummaryAll {
    text: string;
    status: ApplicantSummaryStatus;
    message: string;
}

export interface ApplicantSummarizeAllResponse {
    success: boolean;
    message: string;
}

export type ApplicantSummarizeRequest = {
    file_link_audio: string;
}

export interface ApplicantSummarizeResponse {
    success: boolean;
    message: string;
}

export type ApplicantFormContentsRequest = {
    page: number;
    limit: number;
    search: string;
    applicant_form_id: string;
    sort_by: 'step' | 'created_at';
    sort_order: 'asc' | 'desc';
}

export interface ApplicantFormContentsResponse {
    success: boolean;
    message: string;
    data?: {
        data?: unknown[];
        pagination?: Pagination;
    };
}

export interface ApplicantTranscribeResponse {
    success: boolean;
    message: string;
}

// Data tambahan dari detail yang hanya dibaca (lampiran dan tanda tangan),
// tidak ikut dikirim pada update form.
export interface ApplicantFormAttachments {
    files: ApplicantFormFile[];
    signatureLink: string;
    signatureDate: string;
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
    place_of_birth?: string | null;
    date_of_birth?: string | null;
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
    applicant_form_files?: unknown;
    summary_all?: string | null;
    summary_all_status?: string | null;
    summary_all_message?: string | null;
    signature_link?: string | null;
    signature_date?: string | null;
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
    place_of_birth: string;
    date_of_birth: string;
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

export interface ApplicantInvitationResendResponse {
    success: boolean;
    message: string;
}

export interface ApplicantFormUpdateResponse {
    success: boolean;
    message: string;
}
