import { useLanguage } from '@/components/lang/useLanguage';
import {
    ApplicantAnswer,
    ApplicantEducation,
    ApplicantFamilyMember,
    ApplicantFormListSections,
    ApplicantInformalEducation,
    ApplicantListSection,
    ApplicantReference,
    ApplicantWorkingExperience,
} from '../types/applicant';
import { applicantLabels } from '../language/applicantLabels';
import {
    EDUCATION_FIELDS,
    getFamilyNameLabel,
    getFamilyRelationshipLabel,
    isRequiredFamilyRelationship,
    isRequiredListRow,
    REQUIRED_FAMILY_FIELDS,
    REQUIRED_REFERENCE_FIELDS,
    REQUIRED_WORKING_EXPERIENCE_FIELDS,
} from '../utils/applicantForm';
import { ApplicantSectionErrors } from '../hooks/useApplicantEdit';
import RepeatableRowsSection, { RepeatableField } from './RepeatableRowsSection';

interface ApplicantSectionsProps {
    values: ApplicantFormListSections;
    readOnly: boolean;
    errors?: ApplicantSectionErrors;
    onRowAdd: (section: ApplicantListSection) => void;
    onRowRemove: (section: ApplicantListSection, index: number) => void;
    onRowChange: <K extends ApplicantListSection>(
        section: K,
        index: number,
        key: keyof ApplicantFormListSections[K][number],
        value: string
    ) => void;
}

const ApplicantSections = ({ values, readOnly, errors, onRowAdd, onRowRemove, onRowChange }: ApplicantSectionsProps) => {
    const { langField } = useLanguage(applicantLabels);

    const educationFields: RepeatableField<ApplicantEducation>[] = EDUCATION_FIELDS.map(
        ({ labelKey, ...field }) => ({ ...field, label: langField(labelKey) })
    );

    const informalEducationFields: RepeatableField<ApplicantInformalEducation>[] = [
        { key: 'type_of_training', label: langField('typeOfTraining') },
        { key: 'institution_name', label: langField('institutionName') },
        { key: 'location', label: langField('location') },
        { key: 'certification', label: langField('certification') },
        { key: 'periode', label: langField('period') },
    ];

    // Wajib hanya untuk hubungan yang ditandai di FAMILY_RELATIONSHIPS, yaitu ayah dan ibu.
    const isFamilyFieldRequired = (key: keyof ApplicantFamilyMember & string) =>
        REQUIRED_FAMILY_FIELDS.includes(key)
            ? (row: ApplicantFamilyMember) => isRequiredFamilyRelationship(row.relationship)
            : undefined;

    const familyFieldLabels: RepeatableField<ApplicantFamilyMember>[] = [
        { key: 'name', label: (row) => getFamilyNameLabel(row.relationship, langField) },
        { key: 'age', label: langField('age') },
        { key: 'employment', label: langField('occupation') },
        { key: 'emergency_contact_number', label: langField('emergencyContactNumber') },
    ];

    const familyFields: RepeatableField<ApplicantFamilyMember>[] = familyFieldLabels.map(
        field => ({ ...field, required: isFamilyFieldRequired(field.key) })
    );

    const workingExperienceLabels: RepeatableField<ApplicantWorkingExperience>[] = [
        { key: 'name_of_company', label: langField('companyName') },
        { key: 'date_from', label: langField('startDate'), type: 'date' },
        { key: 'date_final', label: langField('endDate'), type: 'date' },
        { key: 'pay_of_salary', label: langField('salary'), type: 'number' },
        { key: 'name_of_supervisor', label: langField('supervisorName') },
        { key: 'reason_of_leaving', label: langField('reasonForLeaving'), type: 'textarea', fullWidth: true },
    ];

    const workingExperienceFields: RepeatableField<ApplicantWorkingExperience>[] = workingExperienceLabels.map(
        field => ({
            ...field,
            required: REQUIRED_WORKING_EXPERIENCE_FIELDS.includes(field.key) ? isRequiredListRow : undefined,
        })
    );

    const referenceLabels: RepeatableField<ApplicantReference>[] = [
        { key: 'name', label: langField('name') },
        { key: 'position_company', label: langField('positionCompany') },
        { key: 'phone', label: langField('phoneNumber') },
    ];

    const referenceFields: RepeatableField<ApplicantReference>[] = referenceLabels.map(
        field => ({
            ...field,
            required: REQUIRED_REFERENCE_FIELDS.includes(field.key) ? isRequiredListRow : undefined,
        })
    );

    const answerFields: RepeatableField<ApplicantAnswer>[] = [
        {
            key: 'answers',
            label: langField('answer'),
            type: 'choice',
            required: true,
            options: [
                { value: 'Ya', label: langField('yes') },
                { value: 'Tidak', label: langField('no') },
            ],
        },
    ];

    return (
        <>
            <RepeatableRowsSection
                id="educational_background"
                title={langField('formalEducation')}
                rowLabel={() => langField('formalEducation')}
                rows={values.educational_background}
                fields={educationFields}
                readOnly={readOnly}
                errors={errors}
                onChange={(index, key, value) => onRowChange('educational_background', index, key, value)}
            />
            <RepeatableRowsSection
                id="informal_education_special_qualification"
                title={langField('informalEducation')}
                rowLabel={langField('training')}
                rows={values.informal_education_special_qualification}
                fields={informalEducationFields}
                readOnly={readOnly}
                onAdd={() => onRowAdd('informal_education_special_qualification')}
                onRemove={(index) => onRowRemove('informal_education_special_qualification', index)}
                onChange={(index, key, value) => onRowChange('informal_education_special_qualification', index, key, value)}
            />
            <RepeatableRowsSection
                id="family_background"
                title={langField('familyBackground')}
                rowLabel={(row) => getFamilyRelationshipLabel(row.relationship, langField)}
                rows={values.family_background}
                fields={familyFields}
                readOnly={readOnly}
                errors={errors}
                onChange={(index, key, value) => onRowChange('family_background', index, key, value)}
            />
            <RepeatableRowsSection
                id="working_experiences"
                title={langField('workingExperience')}
                rowLabel={langField('experience')}
                rows={values.working_experiences}
                fields={workingExperienceFields}
                readOnly={readOnly}
                errors={errors}
                onAdd={() => onRowAdd('working_experiences')}
                onRemove={(index) => onRowRemove('working_experiences', index)}
                onChange={(index, key, value) => onRowChange('working_experiences', index, key, value)}
            />
            <RepeatableRowsSection
                id="references_old_company"
                title={langField('references')}
                rowLabel={langField('reference')}
                rows={values.references_old_company}
                fields={referenceFields}
                readOnly={readOnly}
                errors={errors}
                onAdd={() => onRowAdd('references_old_company')}
                onRemove={(index) => onRowRemove('references_old_company', index)}
                onChange={(index, key, value) => onRowChange('references_old_company', index, key, value)}
            />
            <RepeatableRowsSection
                id="following_answers"
                title={langField('additionalQuestions')}
                rowLabel={(row, index) => `${index + 1}. ${row.question || '-'}`}
                rows={values.following_answers}
                fields={answerFields}
                readOnly={readOnly}
                errors={errors}
                onChange={(index, key, value) => onRowChange('following_answers', index, key, value)}
            />
        </>
    );
};

export default ApplicantSections;
