import { useState, useCallback } from 'react';
import { TermCondition, TermConditionRequest, Pagination } from '../types/termcondition';
import { TermConditionService } from '../services/termconditionService';

export const useTermCondition = () => {
    const [termConditions, setTermConditions] = useState<TermCondition[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
        has_next_page: false,
        has_prev_page: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTermConditions = useCallback(async (params: Partial<TermConditionRequest> = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await TermConditionService.getTermConditions(params);
            if (response.status) {
                setTermConditions(response.data.items);
                const apiPagination = response.data.pagination;
                setPagination({
                    current_page: apiPagination.page,
                    per_page: apiPagination.limit,
                    total: apiPagination.total,
                    total_pages: apiPagination.totalPages,
                    has_next_page: apiPagination.page < apiPagination.totalPages,
                    has_prev_page: apiPagination.page > 1
                });
            } else {
                setError(response.message || 'Failed to fetch Term Conditions');
            }
        } catch (err) {
            setError('Something went wrong while fetching Term Conditions');
            console.error('Fetch Term Conditions error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTermCondition = useCallback(async (termConditionId: string, termConditionData: Partial<Omit<TermCondition, 'term_content_id'>>) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedTermCondition = await TermConditionService.updateTermCondition(termConditionId, termConditionData);
            // Update local state
            setTermConditions(prev => prev.map(termCondition =>
                termCondition.term_content_id === termConditionId ? updatedTermCondition : termCondition
            ));
            return updatedTermCondition;
        } catch (err) {
            setError('Failed to update Term Condition');
            console.error('Update Term Condition error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTermCondition = useCallback(async (termConditionId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            await TermConditionService.deleteTermCondition(termConditionId);
            // Remove from local state
            setTermConditions(prev => prev.filter(termCondition => termCondition.term_content_id !== termConditionId));
            return true;
        } catch (err) {
            setError('Failed to delete Term Condition');
            console.error('Delete Term Condition error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        termConditions,
        pagination,
        loading,
        error,
        fetchTermConditions,
        updateTermCondition,
        deleteTermCondition,
    };
};