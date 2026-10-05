import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError } from '@/helpers/apiHelper';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantService } from '../services/applicantService';
import { applicantLabels } from '../language/applicantLabels';
import {
    ApplicantFormListItem,
    ApplicantFormListSections,
    ApplicantFormScalarField,
    ApplicantFormUpdateRequest,
    ApplicantListSection,
} from '../types/applicant';
import {
    createEmptyApplicantForm,
    createEmptyRow,
    isRequiredFamilyRelationship,
    isRequiredListRow,
    pickApplicantSummary,
    REQUIRED_APPLICANT_FIELDS,
    REQUIRED_EDUCATION_FIELDS,
    REQUIRED_FAMILY_FIELDS,
    REQUIRED_REFERENCE_FIELDS,
    REQUIRED_WORKING_EXPERIENCE_FIELDS,
    toApplicantFormValues,
} from '../utils/applicantForm';
import { generateApplicantFormPDF } from '../utils/applicantPdfGenerator';

export type ApplicantFormErrors = Partial<Record<ApplicantFormScalarField, string>>;

// Error field di dalam baris, dengan key `${section}.${index}.${field}`.
export type ApplicantSectionErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useApplicantEdit = (id?: string) => {
    const { langField } = useLanguage(applicantLabels);
    const [summary, setSummary] = useState<ApplicantFormListItem | null>(null);
    const [formData, setFormData] = useState<ApplicantFormUpdateRequest>(createEmptyApplicantForm);
    const [savedFormData, setSavedFormData] = useState<ApplicantFormUpdateRequest | null>(null);
    const [errors, setErrors] = useState<ApplicantFormErrors>({});
    const [sectionErrors, setSectionErrors] = useState<ApplicantSectionErrors>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const fetchApplicantForm = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await ApplicantService.getApplicantFormById(id);

            if (!response?.success || !response?.data) {
                setSummary(null);
                setError(response?.message || langField('applicantFormNotFound'));
                return;
            }

            const values = toApplicantFormValues(response.data);

            setSummary(pickApplicantSummary(response.data));
            setFormData(values);
            setSavedFormData(values);
            setErrors({});
            setSectionErrors({});
        } catch (err) {
            const apiError = err as ApiError;
            setSummary(null);
            setError(apiError?.message || langField('loadApplicantFormFailed'));
        } finally {
            setLoading(false);
        }
    }, [id, langField]);

    const fetchedIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!id || fetchedIdRef.current === id) return;

        fetchedIdRef.current = id;
        fetchApplicantForm();
    }, [id, fetchApplicantForm]);

    const handleFieldChange = useCallback((field: ApplicantFormScalarField, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const handleDriverLicenseToggle = useCallback((name: string, checked: boolean) => {
        setFormData(prev => {
            const withoutName = prev.driver_license.filter(license => license.name !== name);
            return {
                ...prev,
                driver_license: checked ? [...withoutName, { name }] : withoutName,
            };
        });
    }, []);

    const handleRowAdd = useCallback((section: ApplicantListSection) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], createEmptyRow[section]()],
        }));
        setSectionErrors(prev => {
            if (!prev[section]) return prev;

            const next = { ...prev };
            delete next[section];
            return next;
        });
    }, []);

    const handleRowRemove = useCallback((section: ApplicantListSection, index: number) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, rowIndex) => rowIndex !== index),
        }));
    }, []);

    const handleRowChange = useCallback(<K extends ApplicantListSection>(
        section: K,
        index: number,
        key: keyof ApplicantFormListSections[K][number],
        value: string
    ) => {
        setFormData(prev => {
            const rows = [...prev[section]] as ApplicantFormListSections[K][number][];
            if (!rows[index]) return prev;

            rows[index] = { ...rows[index], [key]: value };
            return { ...prev, [section]: rows };
        });
        setSectionErrors(prev => {
            const errorKey = `${section}.${index}.${String(key)}`;
            if (!prev[errorKey]) return prev;

            const next = { ...prev };
            delete next[errorKey];
            return next;
        });
    }, []);

    const validateForm = (): boolean => {
        const nextErrors: ApplicantFormErrors = {};

        REQUIRED_APPLICANT_FIELDS.forEach(field => {
            if (!String(formData[field] ?? '').trim()) nextErrors[field] = 'fieldRequired';
        });

        if (!formData.full_name.trim()) nextErrors.full_name = 'fullNameRequired';
        if (formData.email.trim() && !EMAIL_PATTERN.test(formData.email.trim())) {
            nextErrors.email = 'emailInvalid';
        }

        const nextSectionErrors: ApplicantSectionErrors = {};

        formData.educational_background.forEach((row, index) => {
            REQUIRED_EDUCATION_FIELDS.forEach(key => {
                if (!String(row[key] ?? '').trim()) {
                    nextSectionErrors[`educational_background.${index}.${key}`] = 'fieldRequired';
                }
            });
        });

        formData.family_background.forEach((row, index) => {
            if (!isRequiredFamilyRelationship(row.relationship)) return;

            REQUIRED_FAMILY_FIELDS.forEach(key => {
                if (!String(row[key] ?? '').trim()) {
                    nextSectionErrors[`family_background.${index}.${key}`] = 'fieldRequired';
                }
            });
        });

        const validateMinimumOneItem = <T extends object>(
            section: ApplicantListSection,
            rows: T[],
            keys: (keyof T & string)[]
        ) => {
            if (rows.length === 0) {
                nextSectionErrors[section] = 'minimumOneItemRequired';
                return;
            }

            rows.forEach((row, index) => {
                if (!isRequiredListRow(row, index)) return;

                keys.forEach(key => {
                    if (!String(row[key] ?? '').trim()) {
                        nextSectionErrors[`${section}.${index}.${key}`] = 'fieldRequired';
                    }
                });
            });
        };

        validateMinimumOneItem('working_experiences', formData.working_experiences, REQUIRED_WORKING_EXPERIENCE_FIELDS);
        validateMinimumOneItem('references_old_company', formData.references_old_company, REQUIRED_REFERENCE_FIELDS);

        formData.following_answers.forEach((row, index) => {
            if (!String(row.answers ?? '').trim()) {
                nextSectionErrors[`following_answers.${index}.answers`] = 'fieldRequired';
            }
        });

        setErrors(nextErrors);
        setSectionErrors(nextSectionErrors);
        return Object.keys(nextErrors).length === 0 && Object.keys(nextSectionErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!id || isSubmitting) return;

        if (!validateForm()) {
            toast.error(langField('completeRequiredFields'));
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await ApplicantService.updateApplicantForm(id, formData);

            if (!response?.success) {
                toast.error(response?.message || langField('updateUnsuccessful'));
                return;
            }

            toast.success(response.message || langField('updateSuccess'));
            await fetchApplicantForm();
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError?.message || langField('updateFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportPdf = async () => {
        if (!savedFormData || !summary || isExporting) return;

        setIsExporting(true);
        try {
            await generateApplicantFormPDF(savedFormData, summary);
            toast.success(langField('exportPdfSuccess'));
        } catch (err) {
            console.error('Error generating applicant form PDF:', err);
            toast.error(langField('exportPdfFailed'));
        } finally {
            setIsExporting(false);
        }
    };

    return {
        summary,
        formData,
        errors,
        sectionErrors,
        loading,
        error,
        isSubmitting,
        isExporting,
        fetchApplicantForm,
        handleExportPdf,
        handleFieldChange,
        handleDriverLicenseToggle,
        handleRowAdd,
        handleRowRemove,
        handleRowChange,
        handleSubmit,
    };
};
