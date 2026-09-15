import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError } from '@/helpers/apiHelper';
import { ApplicantService } from '../services/applicantService';
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
    pickApplicantSummary,
    toApplicantFormValues,
} from '../utils/applicantForm';

export type ApplicantFormErrors = Partial<Record<ApplicantFormScalarField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useApplicantEdit = (id?: string) => {
    const [summary, setSummary] = useState<ApplicantFormListItem | null>(null);
    const [formData, setFormData] = useState<ApplicantFormUpdateRequest>(createEmptyApplicantForm);
    const [errors, setErrors] = useState<ApplicantFormErrors>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchApplicantForm = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await ApplicantService.getApplicantFormById(id);

            if (!response?.success || !response?.data) {
                setSummary(null);
                setError(response?.message || 'Formulir pelamar tidak ditemukan');
                return;
            }

            setSummary(pickApplicantSummary(response.data));
            setFormData(toApplicantFormValues(response.data));
            setErrors({});
        } catch (err) {
            const apiError = err as ApiError;
            setSummary(null);
            setError(apiError?.message || 'Gagal memuat formulir pelamar');
        } finally {
            setLoading(false);
        }
    }, [id]);

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

    const handleRowAdd = useCallback((section: ApplicantListSection) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], createEmptyRow[section]()],
        }));
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
    }, []);

    const validateForm = (): boolean => {
        const nextErrors: ApplicantFormErrors = {};

        if (!formData.full_name.trim()) nextErrors.full_name = 'Nama lengkap wajib diisi';
        if (formData.email.trim() && !EMAIL_PATTERN.test(formData.email.trim())) {
            nextErrors.email = 'Format email tidak valid';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!id || isSubmitting) return;

        if (!validateForm()) {
            toast.error('Lengkapi field yang wajib diisi');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await ApplicantService.updateApplicantForm(id, formData);

            if (!response?.success) {
                toast.error(response?.message || 'Formulir pelamar tidak berhasil diperbarui');
                return;
            }

            toast.success(response.message || 'Formulir pelamar berhasil diperbarui');
            await fetchApplicantForm();
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError?.message || 'Gagal memperbarui formulir pelamar');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        summary,
        formData,
        errors,
        loading,
        error,
        isSubmitting,
        fetchApplicantForm,
        handleFieldChange,
        handleRowAdd,
        handleRowRemove,
        handleRowChange,
        handleSubmit,
    };
};
