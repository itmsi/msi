import { useCallback, useState } from 'react';
import { FulfillmentService } from '@/pages/Netsuite/Fulfillment/services/fulfillmentService';
import { ReceiptService } from '@/pages/Netsuite/Receipts/services/receiptService';

export interface RelatedFulfillmentReceiptRow {
    key: string;
    date: string;
    type: 'Item Fulfillment' | 'Item Receipt';
    number: string;
    status_label: string;
    netsuite_id: string;
}

export const useFulfillmentReceiptTab = (tranid: string | undefined, toNetsuiteId: string | null | undefined) => {
    const [items, setItems] = useState<RelatedFulfillmentReceiptRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRelated = useCallback(async () => {
        if (!tranid && !toNetsuiteId) {
            setItems([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const fulfillmentRes = tranid
                ? await FulfillmentService.getFulfillments({ search: tranid, limit: 100 })
                : null;

            const matchedFulfillments = (fulfillmentRes?.data?.items || [])
                .filter(row => !!tranid && !!row.createdfrom_number && row.createdfrom_number.endsWith(tranid));

            const fulfillmentRows: RelatedFulfillmentReceiptRow[] = matchedFulfillments.map(row => ({
                key: `fulfillment-${row.id}`,
                date: row.date,
                type: 'Item Fulfillment',
                number: row.number,
                status_label: row.status_label || row.status || '-',
                netsuite_id: row.netsuite_id,
            }));

            // Receipt bisa lahir langsung dari TO (jarang) atau dari salah satu fulfillment di atas (umum).
            const receiptSearchIds = [
                ...(toNetsuiteId ? [String(toNetsuiteId)] : []),
                ...matchedFulfillments.map(f => String(f.netsuite_id)),
            ];

            const receiptResults = await Promise.all(
                receiptSearchIds.map(searchId => ReceiptService.getReceipts({ search: searchId, limit: 100 }))
            );

            const seenReceiptIds = new Set<string>();
            const receiptRows: RelatedFulfillmentReceiptRow[] = [];
            receiptResults.forEach((receiptRes, idx) => {
                const expectedCreatedFrom = receiptSearchIds[idx];
                (receiptRes?.data?.items || [])
                    .filter(row => String(row.createdfrom) === expectedCreatedFrom)
                    .forEach(row => {
                        if (seenReceiptIds.has(row.id)) return;
                        seenReceiptIds.add(row.id);
                        receiptRows.push({
                            key: `receipt-${row.id}`,
                            date: row.trandate,
                            type: 'Item Receipt',
                            number: row.tranid,
                            status_label: row.status_display || row.status || '-',
                            netsuite_id: row.netsuite_id,
                        });
                    });
            });

            const merged = [...fulfillmentRows, ...receiptRows].sort((a, b) =>
                new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
            );
            setItems(merged);
        } catch (err: any) {
            setError(err?.message || 'Gagal memuat Fulfillment & Receipt terkait');
        } finally {
            setLoading(false);
        }
    }, [tranid, toNetsuiteId]);

    return { items, loading, error, fetchRelated };
};
