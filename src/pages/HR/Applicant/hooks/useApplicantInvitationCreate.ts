import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError } from '@/helpers/apiHelper';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantService } from '../services/applicantService';
import { ApplicantInvitationCreateRequest, ApplicantInvitationField } from '../types/applicant';
import { applicantManage } from '../language/applicantManage';

export type ApplicantInvitationErrors = Partial<Record<ApplicantInvitationField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createEmptyInvitation = (): ApplicantInvitationCreateRequest => ({
    full_name: '',
    email: '',
    no_mobile: '',
});

export const useApplicantInvitationCreate = (onSuccess?: () => void) => {
    const { langField } = useLanguage(applicantManage);
    const [formData, setFormData] = useState<ApplicantInvitationCreateRequest>(createEmptyInvitation);
    const [errors, setErrors] = useState<ApplicantInvitationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((field: ApplicantInvitationField, value: string) => {
        const nextValue = field === 'no_mobile' ? value.replace(/\D/g, '') : value;

        setFormData(prev => ({ ...prev, [field]: nextValue }));
        setErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setFormData(createEmptyInvitation());
        setErrors({});
    }, []);

    const validate = (): boolean => {
        const nextErrors: ApplicantInvitationErrors = {};

        if (!formData.full_name.trim()) nextErrors.full_name = 'fullNameRequired';
        if (!formData.email.trim()) {
            nextErrors.email = 'emailRequired';
        } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
            nextErrors.email = 'emailInvalid';
        }
        if (!formData.no_mobile.trim()) nextErrors.no_mobile = 'mobileNumberRequired';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (isSubmitting || !validate()) return;

        setIsSubmitting(true);
        try {
            const response = await ApplicantService.createApplicantInvitation({
                full_name: formData.full_name.trim(),
                email: formData.email.trim(),
                no_mobile: formData.no_mobile.trim(),
            });

            if (!response?.success) {
                toast.error(response?.message || langField('invitationUnsuccessful'));
                return;
            }

            toast.success(response.message || langField('invitationSuccess'));
            reset();
            onSuccess?.();
        } catch (err) {
            const apiError = err as ApiError;
            toast.error(apiError?.message || langField('invitationFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        reset,
    };
};
