import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ApiError } from '@/helpers/apiHelper';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantService } from '../services/applicantService';
import { applicantLabels } from '../language/applicantLabels';
import { ApplicantInterviewStep } from '../types/applicant';
import { toApplicantInterviewSteps } from '../utils/applicantForm';

// Jeda refetch selama masih ada transkrip berstatus Pending.
const PENDING_REFETCH_MS = 5000;

export const useApplicantInterview = (applicantFormId?: string) => {
    const { langField } = useLanguage(applicantLabels);
    const [steps, setSteps] = useState<ApplicantInterviewStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transcribingIds, setTranscribingIds] = useState<string[]>([]);
    // Bertambah setiap kali fetch selesai (berhasil atau gagal) agar jadwal refetch Pending tetap berjalan.
    const [fetchCount, setFetchCount] = useState(0);
    const requestIdRef = useRef(0);

    const fetchSteps = useCallback(async (silent = false) => {
        if (!applicantFormId) return;

        const requestId = ++requestIdRef.current;
        if (!silent) {
            setLoading(true);
            setError(null);
        }

        try {
            const response = await ApplicantService.getApplicantFormContents(applicantFormId);
            if (requestId !== requestIdRef.current) return;

            if (!response?.success) {
                if (!silent) setError(response?.message || langField('loadInterviewFailed'));
                return;
            }

            setSteps(toApplicantInterviewSteps(response.data?.data));
            setError(null);
        } catch (err) {
            if (requestId !== requestIdRef.current) return;
            if (!silent) setError((err as ApiError)?.message || langField('loadInterviewFailed'));
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
                setFetchCount(count => count + 1);
            }
        }
    }, [applicantFormId, langField]);

    // Sama seperti useApplicantEdit: fetch awal hanya saat id berubah, bukan saat bahasa diganti.
    const fetchedIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!applicantFormId || fetchedIdRef.current === applicantFormId) return;

        fetchedIdRef.current = applicantFormId;
        fetchSteps();
    }, [applicantFormId, fetchSteps]);

    const refetch = useCallback(() => fetchSteps(), [fetchSteps]);

    const hasPending = import.meta.env.VITE_FEATURE_INTERVIEW_TRANSCRIPT === 'true'
        && steps.some(step => step.speechStatus === 'Pending');

    useEffect(() => {
        if (!hasPending) return;

        const timer = window.setTimeout(() => fetchSteps(true), PENDING_REFETCH_MS);
        return () => window.clearTimeout(timer);
    }, [hasPending, fetchCount, fetchSteps]);

    const handleTranscribe = useCallback(async (step: ApplicantInterviewStep) => {
        if (!step.audioUrl || transcribingIds.includes(step.id)) return;

        setTranscribingIds(prev => [...prev, step.id]);
        try {
            const response = await ApplicantService.transcribeApplicantAudio(step.audioUrl);

            if (!response?.success) {
                toast.error(response?.message || langField('transcribeFailed'));
                return;
            }

            toast.success(response.message || langField('transcribeStarted'));
            await fetchSteps(true);
        } catch (err) {
            toast.error((err as ApiError)?.message || langField('transcribeFailed'));
        } finally {
            setTranscribingIds(prev => prev.filter(id => id !== step.id));
        }
    }, [transcribingIds, fetchSteps, langField]);

    return {
        steps,
        loading,
        error,
        transcribingIds,
        refetch,
        handleTranscribe,
    };
};
