import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdArrowBack, MdInventory2, MdOutlineSync } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { formatDateTime } from '@/helpers/generalHelper';
import { ReceiptService } from './services/receiptService';
import { ReceiptItem, ReceiptLineItem } from './types/receipt';
import ReceiptFields from './components/ReceiptFields';
import ReceiptItemFields from './components/ReceiptItemFields';

const parseLines = (lines?: string | ReceiptLineItem[]): ReceiptLineItem[] => {
    if (!lines) return [];
    if (Array.isArray(lines)) return lines;
    try {
        const parsed = JSON.parse(lines);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export default function View() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [receipt, setReceipt] = useState<ReceiptItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'items'>('items');
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await ReceiptService.getReceiptDetail(id);
            if (response.success && response.data) {
                setReceipt(response.data);
            } else {
                setError('Item Receipt not found');
            }
        } catch (err: any) {
            console.error('Error fetching receipt details:', err);
            setError(err.message || 'Failed to load receipt details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleSyncById = useCallback(async () => {
        if (isSyncing || !id) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi Receipt: ${id}...`);
        try {
            await ReceiptService.syncReceiptById(id);
            toast.success('Sinkronisasi berhasil', { id: toastId });
            await fetchDetail();
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, id, fetchDetail]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white shadow rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !receipt) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || 'Item Receipt not found'}</h3>
                <Button onClick={() => navigate('/netsuite/receipts')} variant="outline">Back to List</Button>
            </div>
        );
    }

    const lines = parseLines(receipt.lines);

    return (
        <>
            <PageMeta
                title={`View Item Receipt ${receipt.tranid} - Motor Sights International`}
                description="View Item Receipt details"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/netsuite/receipts')}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                    title="Back to List"
                                >
                                    <MdArrowBack size={24} />
                                </button>
                                <div>
                                    <h3 className="text-xl leading-6 font-primary-bold text-gray-900 flex items-center gap-3">
                                        {receipt.tranid}
                                        <div className="text-sm">
                                            <Badge color="light" variant="light">
                                                {receipt.status_display || '-'}
                                            </Badge>
                                        </div>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Last Modified: {receipt.last_modified_netsuite ? formatDateTime(receipt.last_modified_netsuite) : '-'}
                                    </p>
                                </div>
                            </div>
                            <PermissionGate permission="read">
                                <Button
                                    onClick={() => handleSyncById()}
                                    disabled={isSyncing}
                                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600"
                                    variant='outline'
                                >
                                    <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                    <div>
                                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                    </div>
                                </Button>
                            </PermissionGate>
                        </div>
                    </div>
                </div>

                <ReceiptFields receipt={receipt} />

                {/* Tab Navigation — style sama seperti tab di TO Edit.tsx / Fulfillment View.tsx */}
                <div>
                    <div className="border-b border-gray-200 overflow-auto">
                        <nav className="flex space-x-2 overflow-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab('items')}
                                className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors flex items-center justify-center gap-2 ${
                                    activeTab === 'items'
                                        ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <MdInventory2 /> Items
                            </button>
                        </nav>
                    </div>

                    <div className="bg-white rounded-b-2xl shadow-sm">
                        {activeTab === 'items' && <ReceiptItemFields lines={lines} />}
                    </div>
                </div>
            </div>
        </>
    );
}
