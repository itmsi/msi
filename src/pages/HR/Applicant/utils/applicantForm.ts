import moment from 'moment';
import { FormFieldOption, FormFieldType } from '@/types/form';
import {
    ApplicantAnswer,
    ApplicantEducation,
    ApplicantFamilyMember,
    ApplicantFormAttachments,
    ApplicantFormDetail,
    ApplicantFormFile,
    ApplicantFormListItem,
    ApplicantFormListSections,
    ApplicantFormScalarField,
    ApplicantFormUpdateRequest,
    ApplicantInterviewStep,
    ApplicantListSection,
    ApplicantReference,
    ApplicantWorkingExperience,
} from '../types/applicant';

export interface ApplicantScalarFieldConfig {
    field: ApplicantFormScalarField;
    labelKey: string;
    // 'place_date' hanya dikenal feature ini: satu string "Tempat, YYYY-MM-DD" yang diedit
    // sebagai dua input (tempat + tanggal), jadi bukan bagian dari FormFieldType bersama.
    type?: FormFieldType | 'place_date';
    options?: FormFieldOption[];
    required?: boolean;
    fullWidth?: boolean;
}

export const APPLICANT_FIELD_GROUPS: { titleKey: string; fields: ApplicantScalarFieldConfig[]; withDriverLicense?: boolean }[] = [
    {
        titleKey: 'personalInformation',
        withDriverLicense: true,
        fields: [
            { field: 'full_name', labelKey: 'fullName', required: true },
            { field: 'address_as_per_id_card', labelKey: 'addressIdCard', type: 'textarea', required: true },
            { field: 'nickname', labelKey: 'nickname', required: true },
            { field: 'present_address', labelKey: 'presentAddress', type: 'textarea', required: true },
            { field: 'no_mobile', labelKey: 'mobileNumber', required: true },
            { field: 'city', labelKey: 'city' },
            { field: 'name_relationship_emergency_contact_number', labelKey: 'emergencyContact', required: true },
            { field: 'place_date_of_birth', labelKey: 'placeDateOfBirth', type: 'place_date', required: true },
            { field: 'email', labelKey: 'email', type: 'email', required: true },
            {
                field: 'blood_type',
                labelKey: 'bloodType',
                type: 'choice',
                required: true,
                options: [
                    { value: 'A', label: 'A' },
                    { value: 'B', label: 'B' },
                    { value: 'O', label: 'O' },
                    { value: 'AB', label: 'AB' },
                ],
            },
            { field: 'id_number', labelKey: 'idNumber', required: true },
            { field: 'tax_identification_number', labelKey: 'taxIdNumber' },
            { field: 'position_applied_for', labelKey: 'positionAppliedFor', required: true },
            { field: 'working_available_date', labelKey: 'availableToWork', type: 'date', required: true },
            { field: 'marital_status', labelKey: 'maritalStatus', required: true },
            {
                field: 'relogion',
                labelKey: 'religion',
                type: 'select',
                required: true,
                options: [
                    { value: 'Islam', label: 'Islam' },
                    { value: 'Kristen Protestan', label: 'Kristen Protestan' },
                    { value: 'Katolik', label: 'Katolik' },
                    { value: 'Hindu', label: 'Hindu' },
                    { value: 'Buddha', label: 'Buddha' },
                    { value: 'Konghucu', label: 'Konghucu' },
                    { value: 'Lainnya', label: 'Lainnya' },
                ],
            },
            { field: 'height_weight', labelKey: 'heightWeight', required: true },
            { field: 'tshirt_size', labelKey: 'tshirtSize', required: true },
        ],
    }
];

export const REQUIRED_APPLICANT_FIELDS: ApplicantFormScalarField[] = APPLICANT_FIELD_GROUPS
    .flatMap(group => group.fields)
    .filter(config => config.required)
    .map(config => config.field);

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

// Link cloud mengarah ke halaman share, bukan file. Tambahan /download mengikuti pola
// yang sudah dipakai di HR/Candidate supaya file dan gambarnya terbuka langsung.
export const toDownloadUrl = (url: string): string => (url.startsWith('http') ? `${url}/download` : url);

// Tanda tangan dipakai sebagai gambar, jadi /preview yang mengembalikan berkas gambarnya langsung.
export const toPreviewUrl = (url: string): string => (url.startsWith('http') ? `${url}/preview` : url);

export const toApplicantFormFiles = (value: unknown): ApplicantFormFile[] =>
    parseRows(value)
        .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
        .map(row => ({
            file: String(row.file ?? ''),
            file_type: String(row.file_type ?? ''),
            file_title: String(row.file_title ?? ''),
        }))
        .filter(row => row.file);

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

const toRowsWithDefault = <K extends ApplicantListSection>(section: K, value: unknown): ApplicantFormListSections[K] => {
    const rows = toSectionRows(section, value);
    return (rows.length > 0 ? rows : [createEmptyRow[section]()]) as ApplicantFormListSections[K];
};

export const FOLLOWING_QUESTION_TEMPLATES = [
    'Apakah Anda pernah terlibat dalam tindakan kriminal?',
    'Apakah Anda pernah menggunakan atau mengonsumsi narkotika, psikotropika, atau zat terlarang lainnya?',
    'Apakah Anda bersedia ditempatkan di lokasi kerja mana pun sesuai kebutuhan perusahaan?',
];

const toFollowingAnswerRows = (value: unknown): ApplicantAnswer[] => {
    const rows = toSectionRows('following_answers', value);
    return rows.length > 0 ? rows : FOLLOWING_QUESTION_TEMPLATES.map(question => ({ question, answers: '' }));
};

type LangField = (key: string) => string;

interface TypeOption {
    value: string;
    labelKey: string;
    nameKey: string;
    required?: boolean;
}
export const EDUCATION_LEVEL_OPTIONS: { value: string; label: string }[] = [
    { value: 'S3', label: 'S3' },
    { value: 'S2', label: 'S2' },
    { value: 'S1', label: 'S1' },
    { value: 'D3', label: 'D3' },
    { value: 'D1', label: 'D1' },
    { value: 'SMA', label: 'SMA' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SD', label: 'SD' },
];

export interface ApplicantRowFieldConfig<T> {
    key: keyof T & string;
    labelKey: string;
    type?: FormFieldType;
    options?: FormFieldOption[];
    required?: boolean;
    fullWidth?: boolean;
}

export const EDUCATION_FIELDS: ApplicantRowFieldConfig<ApplicantEducation>[] = [
    {
        key: 'type_of_school',
        labelKey: 'lastEducation',
        type: 'choice',
        options: EDUCATION_LEVEL_OPTIONS,
        required: true,
        fullWidth: true,
    },
    { key: 'name_of_school', labelKey: 'schoolName', required: true },
    { key: 'location', labelKey: 'location', required: true },
    { key: 'graduate', labelKey: 'degree' },
    { key: 'major', labelKey: 'major' },
    { key: 'graduation_year', labelKey: 'graduationYear', required: true },
];

export const REQUIRED_EDUCATION_FIELDS = EDUCATION_FIELDS
    .filter(config => config.required)
    .map(config => config.key);

export const FAMILY_RELATIONSHIPS: TypeOption[] = [
    { value: 'ayah', labelKey: 'father', nameKey: 'fatherName', required: true },
    { value: 'ibu', labelKey: 'mother', nameKey: 'motherName', required: true },
    { value: 'suami/istri', labelKey: 'spouse', nameKey: 'spouseName' },
    { value: 'anak ke-1', labelKey: 'firstChild', nameKey: 'firstChildName' },
    { value: 'anak ke-2', labelKey: 'secondChild', nameKey: 'secondChildName' },
    { value: 'anak ke-3', labelKey: 'thirdChild', nameKey: 'thirdChildName' },
    { value: 'anak ke-4', labelKey: 'fourthChild', nameKey: 'fourthChildName' },
];

const normalizeType = (value: string): string => value.trim().toLowerCase();

const findTypeOption = (options: TypeOption[], value: string) =>
    options.find(option => normalizeType(option.value) === normalizeType(value));

export const REQUIRED_FAMILY_FIELDS: (keyof ApplicantFamilyMember & string)[] = [
    'name',
    'age',
    'employment',
];

export const isRequiredFamilyRelationship = (relationship: string): boolean =>
    Boolean(findTypeOption(FAMILY_RELATIONSHIPS, relationship)?.required);

export const REQUIRED_WORKING_EXPERIENCE_FIELDS: (keyof ApplicantWorkingExperience & string)[] = [
    'name_of_company',
    'date_from',
    // 'date_final',
    // 'name_of_supervisor',
    'reason_of_leaving',
    // 'pay_of_salary'
];

export const REQUIRED_REFERENCE_FIELDS: (keyof ApplicantReference & string)[] = [
    'name',
    'position_company',
    'phone',
];

export const hasRowValue = (row: object): boolean =>
    Object.values(row).some(value => String(value ?? '').trim());

// Section yang minimal butuh 1 item: baris pertama selalu wajib, baris berikutnya
// hanya wajib kalau sudah mulai diisi, supaya tidak ada baris terisi separuh.
export const isRequiredListRow = (row: object, index: number): boolean =>
    index === 0 || hasRowValue(row);

export const getFamilyRelationshipLabel = (relationship: string, langField: LangField): string => {
    const option = findTypeOption(FAMILY_RELATIONSHIPS, relationship);
    return option ? langField(option.labelKey) : relationship || '-';
};

export const getFamilyNameLabel = (relationship: string, langField: LangField): string => {
    const option = findTypeOption(FAMILY_RELATIONSHIPS, relationship);
    return langField(option ? option.nameKey : 'familyMemberName');
};

const orderRowsByType = <T extends object>(
    rows: T[],
    options: { value: string }[],
    getType: (row: T) => string,
    createRow: (type: string) => T
): T[] => {
    const isKnownType = (row: T) => options.some(option => normalizeType(option.value) === normalizeType(getType(row)));

    const fixedRows = options.flatMap(({ value: type }) => {
        const matches = rows.filter(row => normalizeType(getType(row)) === normalizeType(type));
        return matches.length > 0 ? matches : [createRow(type)];
    });

    return [...fixedRows, ...rows.filter(row => !isKnownType(row))];
};

const toEducationRows = (value: unknown): ApplicantEducation[] =>
    toRowsWithDefault('educational_background', value);

const toFamilyRows = (value: unknown): ApplicantFamilyMember[] =>
    orderRowsByType(
        toSectionRows('family_background', value),
        FAMILY_RELATIONSHIPS,
        row => row.relationship,
        relationship => ({ ...createEmptyRow.family_background(), relationship })
    );

export const toDateInputValue = (value: string | null): string => {
    if (!value) return '';
    const date = moment(value, ['YYYY-MM-DD', moment.ISO_8601], true);
    return date.isValid() ? date.format('YYYY-MM-DD') : '';
};

export const parseApplicantDate = (value: string): Date | null => {
    const dateValue = toDateInputValue(value);
    return dateValue ? moment(dateValue, 'YYYY-MM-DD').toDate() : null;
};

export const toApplicantDateValue = (date: Date): string => moment(date).format('YYYY-MM-DD');

// Locale dikunci ke 'en': mengimpor 'moment/locale/id' di tempat lain (mis. CandidateProfileSidebar)
// mengganti locale global moment, sehingga "Oct" bisa berubah menjadi "Okt" di seluruh aplikasi.
export const formatBirthDate = (date: string): string => {
    const parsed = moment(date, 'YYYY-MM-DD', true).locale('en');
    return parsed.isValid() ? parsed.format('DD MMM YYYY') : date;
};

const PLACE_DATE_PATTERN = /^(.*?)\s*,\s*(\d{4}-\d{2}-\d{2})$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Backend menyimpan tempat dan tanggal lahir dalam satu string "Jakarta, 1941-10-03".
// Teks lama yang tidak mengikuti pola itu dikembalikan utuh sebagai tempat, tanpa tanggal.
export const parsePlaceDateOfBirth = (value: string): { place: string; date: string } => {
    const trimmed = value.trim();
    const match = PLACE_DATE_PATTERN.exec(trimmed);

    if (match) return { place: match[1].trim(), date: match[2] };
    if (DATE_ONLY_PATTERN.test(trimmed)) return { place: '', date: trimmed };

    return { place: trimmed, date: '' };
};

export const buildPlaceDateOfBirth = (place: string, date: string): string => {
    const trimmedPlace = place.trim();

    if (!date) return trimmedPlace;
    return trimmedPlace ? `${trimmedPlace}, ${date}` : date;
};

export const formatPlaceDateOfBirth = (value: string): string => {
    const { place, date } = parsePlaceDateOfBirth(value);

    if (!date) return place;
    return place ? `${place}, ${formatBirthDate(date)}` : formatBirthDate(date);
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
    educational_background: toEducationRows(detail.educational_background),
    informal_education_special_qualification: toRowsWithDefault('informal_education_special_qualification', detail.informal_education_special_qualification),
    family_background: toFamilyRows(detail.family_background),
    working_experiences: toRowsWithDefault('working_experiences', detail.working_experiences),
    references_old_company: toRowsWithDefault('references_old_company', detail.references_old_company),
    following_answers: toFollowingAnswerRows(detail.following_answers),
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

export const toApplicantInterviewSteps = (value: unknown): ApplicantInterviewStep[] =>
    parseRows(value)
        .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
        .map(row => {
            const read = (key: string): string => (row[key] === null || row[key] === undefined ? '' : String(row[key]));

            return {
                step: read('step'),
                idQuestion: read('id_question'),
                questionId: read('question_id'),
                questionEn: read('question_en'),
                questionCn: read('question_cn'),
                focusAssessment: read('focus_assessment'),
                videoUrl: read('file_video'),
                videoTitle: read('file_title_video'),
                audioUrl: read('file_audio'),
                audioTitle: read('file_title_audio'),
            };
        })
        .filter(item => item.questionId || item.questionEn || item.questionCn || item.videoUrl || item.audioUrl)
        .sort((a, b) => (Number(a.step) || 0) - (Number(b.step) || 0));

export const pickApplicantAttachments = (detail: ApplicantFormDetail): ApplicantFormAttachments => ({
    files: toApplicantFormFiles(detail.applicant_form_files),
    signatureLink: detail.signature_link || '',
    signatureDate: toDateInputValue(detail.signature_date ?? null),
    interviewSteps: toApplicantInterviewSteps(detail.applicant_form_contents),
});
