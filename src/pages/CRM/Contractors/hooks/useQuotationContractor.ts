import { useState, useCallback, useEffect } from 'react';
import { ManageQuotationItem } from '@/pages/Quotation/Manage/types/quotation';
import { QuotationService } from '@/pages/Quotation/Manage/services/quotationService';

interface UseQuotationContractorProps {
    customerID: string;
}

export const useQuotationContractor = ({ customerID }: UseQuotationContractorProps) => {
    const [quotations, setQuotations] = useState<ManageQuotationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch quotations data khusus untuk contractor
    const fetchContractorQuotations = useCallback(async () => {
        if (!customerID) return;
        
        setLoading(true);
        setError(null);
        
        try {

            const requestParams = {
                page: 1,
                limit: 100,
                customer_id: customerID,
                search: '',
                sort_order: 'desc' as 'asc' | 'desc',
                quotation_for: '' as 'customer' | 'leasing' | '',
                island_id: '',
                start_date: '',
                end_date: ''
            };

            const response = await QuotationService.getQuotation(requestParams);
            
            if (response.status) {
                setQuotations(response.data.items);
            } else {
                setError(response.message || 'Failed to fetch quotations');
                setQuotations([]);
            }
        } catch (err) {
            setError('Something went wrong while fetching quotations');
            setQuotations([]);
            console.error('Fetch quotations error:', err);
        } finally {
            setLoading(false);
        }
    }, [customerID]);

    useEffect(() => {
        fetchContractorQuotations();
    }, [fetchContractorQuotations]);

    return {
        quotations,
        loading,
        error,
        refetch: fetchContractorQuotations
    };
};
