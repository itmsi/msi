import { useState, useCallback } from 'react';
import { ReceiptItem, Pagination } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';

export const useReceiptTab = (poId: string | undefined) => {
    const [receiptList, setReceiptList] = useState<ReceiptItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchReceipts = useCallback(async (page = 1, pageSize = 10) => {
        if (!poId) return;
        setIsLoading(true);
        try {
            const response = await PurchaseOrderService.getReceiptById({
                page,
                limit: pageSize,
                sort_by: 'last_modified',
                sort_order: 'desc',
                filters: {
                    createdfrom: Number(poId)
                }
            });
            setReceiptList(response.data?.items || []);
            setPagination(response.data?.pagination || pagination);
        } catch (err) {
            console.error('Error fetching receipt list:', err);
        } finally {
            setIsLoading(false);
        }
    }, [poId]);

    return {
        receiptList,
        isLoading,
        pagination,
        fetchReceipts,
    };
};
