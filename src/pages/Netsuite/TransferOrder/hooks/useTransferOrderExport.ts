import { useCallback, useMemo, useState } from 'react';
import moment from 'moment';
import { ApiError } from '@/helpers/apiHelper';
import { formatDateToYMD } from '@/helpers/generalHelper';
import { TransferOrderService } from '../services/transferOrderService';

// Batas rentang tanggal yang boleh diunduh dalam satu file
export const MAX_EXPORT_DAYS = 14;

export interface ExportDateRange {
    startDate: Date;
    endDate: Date;
    key: string;
}

export interface ExportResult {
    fileUrl: string;
    fileName: string;
}

const buildRange = (days: number): ExportDateRange[] => ([{
    startDate: moment().subtract(days - 1, 'days').toDate(),
    endDate: new Date(),
    key: 'selection',
}]);

export const useTransferOrderExport = () => {
    const [dateRange, setDateRange] = useState<ExportDateRange[]>(buildRange(MAX_EXPORT_DAYS));
    const [statusName, setStatusName] = useState('');
    const [includeChild, setIncludeChild] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ExportResult | null>(null);

    const startDate = dateRange[0]?.startDate;
    const endDate = dateRange[0]?.endDate;

    // Rentang dihitung inklusif: tanggal 1 sampai 14 berarti 14 hari
    const dayCount = useMemo(() => {
        if (!startDate || !endDate) return 0;
        return moment(endDate).startOf('day').diff(moment(startDate).startOf('day'), 'days') + 1;
    }, [startDate, endDate]);

    const isRangeValid = dayCount > 0 && dayCount <= MAX_EXPORT_DAYS;

    const applyPreset = useCallback((days: number) => {
        setDateRange(buildRange(days));
        setResult(null);
        setError(null);
    }, []);

    const handleRangeChange = useCallback((range: ExportDateRange) => {
        setDateRange([range]);
        setResult(null);
        setError(null);
    }, []);

    const submit = useCallback(async () => {
        if (!isRangeValid || !startDate || !endDate) return;

        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const response = await TransferOrderService.exportTransferOrders({
                page: null,
                limit: null,
                start_date: formatDateToYMD(startDate),
                end_date: formatDateToYMD(endDate),
                include_child: includeChild,
                // Status hanya dikirim kalau dipilih
                ...(statusName ? { status_name: statusName } : {}),
            });

            if (!response?.success || !response.data?.file_url) {
                setError(response?.message || 'Failed to generate the Excel file');
                return;
            }

            setResult({
                fileUrl: response.data.file_url,
                fileName: response.data.file_name || 'transfer-orders.xlsx',
            });
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError?.message || 'Failed to generate the Excel file');
            console.error('Error exporting transfer orders:', err);
        } finally {
            setLoading(false);
        }
    }, [isRangeValid, startDate, endDate, statusName, includeChild]);

    const reset = useCallback(() => {
        setDateRange(buildRange(MAX_EXPORT_DAYS));
        setStatusName('');
        setIncludeChild(false);
        setError(null);
        setResult(null);
        setLoading(false);
    }, []);

    return {
        dateRange,
        startDate,
        endDate,
        dayCount,
        isRangeValid,
        statusName,
        setStatusName,
        includeChild,
        setIncludeChild,
        loading,
        error,
        result,
        applyPreset,
        handleRangeChange,
        submit,
        reset,
    };
};
