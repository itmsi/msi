import moment from 'moment';
import {
    ApplicantFormDetail,
    ApplicantFormListItem,
    ApplicantFormListSections,
    ApplicantFormUpdateRequest,
    ApplicantListSection,
} from '../types/applicant';

export const createEmptyRow: { [K in ApplicantListSection]: () => ApplicantFormListSections[K][number] } = {
    driver_license: () => ({ name: '' }),
    educational_background: () => ({
        type_of_school: '',
        name_of_school: '',
        location: '',
        graduate: '',
        major: '',
        graduation_year: '',
    }),
    informal_education_special_qualification: () => ({
        type_of_training: '',
        institution_name: '',
        location: '',
        certification: '',
        periode: '',
    }),
    family_background: () => ({
        relationship: '',
        name: '',
        age: '',
        employment: '',
        emergency_contact_number: '',
    }),
    working_experiences: () => ({
        name_of_company: '',
        date_from: '',
        date_final: '',
        pay_of_salary: '',
        name_of_supervisor: '',
        reason_of_leaving: '',
    }),
    references_old_company: () => ({
        name: '',
        position_company: '',
        phone: '',
    }),
    following_answers: () => ({
        question: '',
        answers: '',
    }),
};

const parseRows = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || !value.trim()) return [];

    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const toSectionRows = <K extends ApplicantListSection>(section: K, value: unknown): ApplicantFormListSections[K] => {
    const template = createEmptyRow[section]();
    const keys = Object.keys(template) as (keyof typeof template)[];

    return parseRows(value)
        .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
        .map(row => keys.reduce((acc, key) => {
            const raw = row[key as string];
            return { ...acc, [key]: raw === null || raw === undefined ? '' : String(raw) };
        }, template)) as ApplicantFormListSections[K];
};

const toDateInputValue = (value: string | null): string => {
    if (!value) return '';
    const date = moment(value);
    return date.isValid() ? date.format('YYYY-MM-DD') : '';
};

export const createEmptyApplicantForm = (): ApplicantFormUpdateRequest => ({
    full_name: '',
    nickname: '',
    no_mobile: '',
    name_relationship_emergency_contact_number: '',
    email: '',
    id_number: '',
    position_applied_for: '',
    marital_status: '',
    height_weight: '',
    address_as_per_id_card: '',
    present_address: '',
    city: '',
    place_date_of_birth: '',
    blood_type: '',
    tax_identification_number: '',
    working_available_date: '',
    relogion: '',
    tshirt_size: '',
    driver_license: [],
    educational_background: [],
    informal_education_special_qualification: [],
    family_background: [],
    working_experiences: [],
    references_old_company: [],
    following_answers: [],
});

export const toApplicantFormValues = (detail: ApplicantFormDetail): ApplicantFormUpdateRequest => ({
    full_name: detail.name || '',
    nickname: detail.nickname || '',
    no_mobile: detail.no_mobile || '',
    name_relationship_emergency_contact_number: detail.name_relationship_emergency_contact_number || '',
    email: detail.email || '',
    id_number: detail.id_number || '',
    position_applied_for: detail.position_applied_for || '',
    marital_status: detail.marital_status || '',
    height_weight: detail.height_weight || '',
    address_as_per_id_card: detail.address_as_per_id_card || '',
    present_address: detail.present_address || '',
    city: detail.city || '',
    place_date_of_birth: detail.place_date_of_birth || '',
    blood_type: detail.blood_type || '',
    tax_identification_number: detail.tax_identification_number || '',
    working_available_date: toDateInputValue(detail.working_available_date),
    relogion: detail.relogion || '',
    tshirt_size: detail.tshirt_size || '',
    driver_license: toSectionRows('driver_license', detail.driver_license),
    educational_background: toSectionRows('educational_background', detail.educational_background),
    informal_education_special_qualification: toSectionRows('informal_education_special_qualification', detail.informal_education_special_qualification),
    family_background: toSectionRows('family_background', detail.family_background),
    working_experiences: toSectionRows('working_experiences', detail.working_experiences),
    references_old_company: toSectionRows('references_old_company', detail.references_old_company),
    following_answers: toSectionRows('following_answers', detail.following_answers),
});

export const pickApplicantSummary = (detail: ApplicantFormDetail): ApplicantFormListItem => ({
    id: detail.id,
    name: detail.name,
    email: detail.email,
    no_mobile: detail.no_mobile,
    token_expires_at: detail.token_expires_at,
    is_completed: detail.is_completed,
    completed_at: detail.completed_at,
    created_at: detail.created_at,
    created_by_name: detail.created_by_name,
    position_applied_for: detail.position_applied_for,
    city: detail.city,
    working_available_date: detail.working_available_date,
    applicant_form_url: detail.applicant_form_url,
});
