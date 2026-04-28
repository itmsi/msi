import { useState, useCallback } from 'react';
import { HistoryLogItem } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';

export const useHistoryReceiptTab = (poId: string | undefined) => {
    const [logList, setLogList] = useState<HistoryLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHistoryReceipts = useCallback(async () => {
        if (!poId) return;
        setIsLoading(true);
        try {
            const response = await PurchaseOrderService.getHistoryReceiptById({
                createdfrom: Number(poId)
            });
            setLogList(response.data || []);
        } catch (err) {
            console.error('Error fetching history log list:', err);
        } finally {
            setIsLoading(false);
        }
    }, [poId]);

    return {
        logList,
        isLoading,
        fetchHistoryReceipts,
    };
};
