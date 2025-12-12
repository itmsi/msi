import { useState, useCallback } from 'react';
import { Pagination, RorEntity, RorListRequest } from '../types/roecalculator';
import { RoecalculatorService } from '../services/roecalculatorService';
import { generateROEPDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

export const useRoeCalculator = () => {
    const [roeCalculator, setRoeCalculator] = useState<RorEntity[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoeCalculator = useCallback(async (params: Partial<RorListRequest> = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await RoecalculatorService.getRor(params);
            if (response.success) {
                setRoeCalculator(response.data.data);
                const apiPagination = response.data.pagination;
                setPagination({
                    page: apiPagination.page,
                    limit: apiPagination.limit,
                    total: apiPagination.total,
                    totalPages: apiPagination.totalPages,
                });
            } else {
                setError(response.message || 'Failed to fetch Accessories');
            }
        } catch (err) {
            setError('Something went wrong while fetching Accessories');
            console.error('Fetch Accessories error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateRorCalculator = useCallback(async (rorId: string, rorData: Partial<Omit<RorEntity, 'ror_id'>>) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedRor = await RoecalculatorService.updateRor(rorId, rorData);
            // Update local state
            setRoeCalculator(prev => prev.map(itm => 
                itm.id === rorId ? updatedRor : itm
            ));
            return updatedRor;
        } catch (err) {
            setError('Failed to update Accessories');
            console.error('Update Accessories error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteRorCalculator = useCallback(async (rorId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            await RoecalculatorService.deleteRor(rorId);
            setRoeCalculator(prev => prev.filter(ror => ror.id !== rorId));
            return true;
        } catch (err) {
            setError('Failed to delete accessories');
            console.error('Delete accessories error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const downloadRoe = useCallback(async (roeCalculatorId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await RoecalculatorService.downloadRoe(roeCalculatorId); 
            console.log('Full download response:', response);
            console.log('Response data:', response.data);
            console.log('Response success:', response.data?.success);
            console.log('Response data content:', response.data?.data);
            
            if (response.data?.success && response.data?.data) {
                console.log('Starting PDF generation...');
                console.log('PDF data to generate:', response.data.data);
                
                try {
                    await generateROEPDF(response.data.data);
                    console.log('PDF generation completed successfully');
                    toast.success('PDF downloaded successfully');
                    return true;
                } catch (pdfError) {
                    console.error('PDF Generation Error:', pdfError);
                    toast.error('Failed to generate PDF: ' + (pdfError as Error).message);
                    return false;
                }
            } else {
                const errorMsg = response.data?.message || 'Failed to fetch ROE calculator data';
                toast.error(errorMsg);
                console.error('Download failed - Response check failed:');
                console.error('- success:', response.data?.success);
                console.error('- data exists:', !!response.data?.data);
                console.error('- message:', response.data?.message);
                return false;
            }
        } catch (err: any) {
            console.error('Download error details:', err);
            setError('Failed to download quotation');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);
    return {
        roeCalculator,
        pagination,
        loading,
        error,
        fetchRoeCalculator,
        updateRorCalculator,
        deleteRorCalculator,
        downloadRoe
    };
};