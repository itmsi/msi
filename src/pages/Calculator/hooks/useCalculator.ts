import { useState, useCallback } from 'react';
import { HaulingPriceItem, KalkulasiRequest, Pagination } from '../types/calculator';
import { CalculatorService } from '../services/calculatorService';

export const useCalculator = () => {
    const [haulingPrices, setHaulingPrices] = useState<HaulingPriceItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHaulingPrices = useCallback(async (params: Partial<KalkulasiRequest> = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await CalculatorService.getHaulingPrices(params);
            if (response.success) {
                setHaulingPrices(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Gagal memuat data hauling price.');
            }
        } catch {
            setError('Terjadi kesalahan saat memuat data.');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteHaulingPrice = useCallback(async (id: string) => {
        setLoading(true);
        try {
            await CalculatorService.deleteHaulingPrice(id);
            setHaulingPrices(prev => prev.filter(item => item.hauling_prices_id !== id));
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        haulingPrices,
        pagination,
        loading,
        error,
        fetchHaulingPrices,
        deleteHaulingPrice,
    };
};
