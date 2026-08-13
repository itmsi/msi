import { useState, useEffect, useCallback } from 'react';
import { CandidateDetail } from '../types/Candidate';
import { CandidateService } from '../services/Candidateservice';

export const useCandidateDetail = (id: string | undefined) => {
    const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCandidate = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await CandidateService.getCandidateById(id);
            setCandidate(data);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch candidate detail');
            console.error('Error fetching candidate detail:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCandidate();
    }, [fetchCandidate]);

    return { candidate, loading, error, refetch: fetchCandidate };
};
