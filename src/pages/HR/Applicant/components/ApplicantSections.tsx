import {
    ApplicantAnswer,
    ApplicantDriverLicense,
    ApplicantEducation,
    ApplicantFamilyMember,
    ApplicantFormListSections,
    ApplicantInformalEducation,
    ApplicantListSection,
    ApplicantReference,
    ApplicantWorkingExperience,
} from '../types/applicant';
import RepeatableRowsSection, { RepeatableField } from './RepeatableRowsSection';

const DRIVER_LICENSE_FIELDS: RepeatableField<ApplicantDriverLicense>[] = [
    { key: 'name', label: 'Jenis SIM' },
];

const EDUCATION_FIELDS: RepeatableField<ApplicantEducation>[] = [
    { key: 'type_of_school', label: 'Jenjang Sekolah' },
    { key: 'name_of_school', label: 'Nama Sekolah' },
    { key: 'location', label: 'Lokasi' },
    { key: 'graduate', label: 'Gelar / Lulusan' },
    { key: 'major', label: 'Jurusan' },
    { key: 'graduation_year', label: 'Tahun Lulus' },
];

const INFORMAL_EDUCATION_FIELDS: RepeatableField<ApplicantInformalEducation>[] = [
    { key: 'type_of_training', label: 'Jenis Pelatihan' },
    { key: 'institution_name', label: 'Nama Lembaga' },
    { key: 'location', label: 'Lokasi' },
    { key: 'certification', label: 'Sertifikasi' },
    { key: 'periode', label: 'Periode' },
];

const FAMILY_FIELDS: RepeatableField<ApplicantFamilyMember>[] = [
    { key: 'relationship', label: 'Hubungan' },
    { key: 'name', label: 'Nama' },
    { key: 'age', label: 'Usia' },
    { key: 'employment', label: 'Pekerjaan' },
    { key: 'emergency_contact_number', label: 'No. Kontak Darurat' },
];

const WORKING_EXPERIENCE_FIELDS: RepeatableField<ApplicantWorkingExperience>[] = [
    { key: 'name_of_company', label: 'Nama Perusahaan' },
    { key: 'date_from', label: 'Mulai' },
    { key: 'date_final', label: 'Selesai' },
    { key: 'pay_of_salary', label: 'Gaji' },
    { key: 'name_of_supervisor', label: 'Nama Atasan' },
    { key: 'reason_of_leaving', label: 'Alasan Keluar', type: 'textarea', fullWidth: true },
];

const REFERENCE_FIELDS: RepeatableField<ApplicantReference>[] = [
    { key: 'name', label: 'Nama' },
    { key: 'position_company', label: 'Jabatan / Perusahaan' },
    { key: 'phone', label: 'No. Telepon' },
];

const ANSWER_FIELDS: RepeatableField<ApplicantAnswer>[] = [
    { key: 'question', label: 'Pertanyaan', fullWidth: true },
    { key: 'answers', label: 'Jawaban', type: 'textarea', fullWidth: true },
];

interface ApplicantSectionsProps {
    values: ApplicantFormListSections;
    readOnly: boolean;
    onRowAdd: (section: ApplicantListSection) => void;
    onRowRemove: (section: ApplicantListSection, index: number) => void;
    onRowChange: <K extends ApplicantListSection>(
        section: K,
        index: number,
        key: keyof ApplicantFormListSections[K][number],
        value: string
    ) => void;
}

const ApplicantSections = ({ values, readOnly, onRowAdd, onRowRemove, onRowChange }: ApplicantSectionsProps) => (
    <>
        <RepeatableRowsSection
            title="SIM yang Dimiliki"
            rowLabel="SIM"
            rows={values.driver_license}
            fields={DRIVER_LICENSE_FIELDS}
            readOnly={readOnly}
            onAdd={() => onRowAdd('driver_license')}
            onRemove={(index) => onRowRemove('driver_license', index)}
            onChange={(index, key, value) => onRowChange('driver_license', index, key, value)}
        />
        <RepeatableRowsSection
            title="Pendidikan Formal"
            rowLabel="Pendidikan"
            rows={values.educational_background}
            fields={EDUCATION_FIELDS}
            readOnly={readOnly}
            onAdd={() => onRowAdd('educational_background')}
            onRemove={(index) => onRowRemove('educational_background', index)}
            onChange={(index, key, value) => onRowChange('educational_background', index, key, value)}
        />
        <RepeatableRowsSection
            title="Pendidikan Non-Formal & Kualifikasi Khusus"
            rowLabel="Pelatihan"
            rows={values.informal_education_special_qualification}
            fields={INFORMAL_EDUCATION_FIELDS}
            readOnly={readOnly}
            onAdd={() => onRowAdd('informal_education_special_qualification')}
            onRemove={(index) => onRowRemove('informal_education_special_qualification', index)}
            onChange={(index, key, value) => onRowChange('informal_education_special_qualification', index, key, value)}
        />
        <RepeatableRowsSection
            title="Latar Belakang Keluarga"
            rowLabel="Anggota Keluarga"
            rows={values.family_background}
            fields={FAMILY_FIELDS}
            readOnly={readOnly}
            onAdd={() => onRowAdd('family_background')}
            onRemove={(index) => onRowRemove('family_background', index)}
            onChange={(index, key, value) => onRowChange('family_background', index, key, value)}
        />
        <RepeatableRowsSection
            title="Pengalaman Kerja"
            rowLabel="Pengalaman"
            rows={values.working_experiences}
            fields={WORKING_EXPERIENCE_FIELDS}
            readOnly={readOnly}
            onAdd={() => onRowAdd('working_experiences')}
            onRemove={(index) => onRowRemove('working_experiences', index)}
            onChange={(index, key, value) => onRowChange('working_experiences', index, key, value)}
        />
        <RepeatableRowsSection
            title="Referensi Perusahaan Sebelumnya"
            rowLabel="Referensi"
            rows={values.references_old_company}
            fields={REFERENCE_FIELDS}
            readOnly={readOnly}
            onAdd={() => onRowAdd('references_old_company')}
            onRemove={(index) => onRowRemove('references_old_company', index)}
            onChange={(index, key, value) => onRowChange('references_old_company', index, key, value)}
        />
        <RepeatableRowsSection
            title="Pertanyaan Tambahan"
            rowLabel="Pertanyaan"
            rows={values.following_answers}
            fields={ANSWER_FIELDS}
            readOnly={readOnly}
            onAdd={() => onRowAdd('following_answers')}
            onRemove={(index) => onRowRemove('following_answers', index)}
            onChange={(index, key, value) => onRowChange('following_answers', index, key, value)}
        />
    </>
);

export default ApplicantSections;
