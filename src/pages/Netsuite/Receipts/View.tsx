import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdInventory2, MdOutlineSync, MdOutlineAttachFile, MdOutlineComment } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '@/components/ui/button/Button';
import { ReceiptService } from './services/receiptService';
import { ReceiptItem } from './types/receipt';
import ReceiptFields from './components/ReceiptFields';
import ReceiptItemFields from './components/ReceiptItemFields';
import FilesItems from '../Fulfillment/components/FilesItems';
import NotesTab from '../Fulfillment/components/tab/NotesTab';
import useGoBack from '@/hooks/useGoBack';
import PageHeader from '@/components/common/PageHeader';
import { FaExternalLinkAlt } from 'react-icons/fa';

const parseLines = <T,>(lines?: string | T[] | null): T[] => {
    if (!lines) return [];
    if (Array.isArray(lines)) return lines as T[];

    try {
        const parsed = JSON.parse(lines);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
        return [];
    }
};

export default function View() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const goBack = useGoBack();

    const [receipt, setReceipt] = useState<ReceiptItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'items' | 'files' | 'notes'>('items');
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
    const files = parseLines(receipt.files);
    const notes = parseLines(receipt.user_notes);
    const sourceLink =
        receipt.source_type === 'transfer_order' && receipt.createdfrom
            ? `/netsuite/transfer-orders/edit/${receipt.createdfrom}`
            : receipt.source_type === 'purchase_order' && receipt.createdfrom
                ? `/netsuite/purchase-order/edit/${receipt.createdfrom}`
                : null;

    return (
        <>
            <PageMeta
                title={`View Item Receipt ${receipt.tranid} - Motor Sights International`}
                description="View Item Receipt details"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Receipt Details"
                    backPath={() => goBack(`/netsuite/receipts`)}
                    // subtitle={`${receipt?.tranid || ''} - Last Modified: ${receipt.last_modified_netsuite ? formatDateTime(receipt.last_modified_netsuite) : '-'}`}
                    subtitle={
                        <>
                            {sourceLink ? (
                                <Link
                                    className="flex text-blue-400 hover:underline items-center gap-1 me-1"
                                    to={sourceLink}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaExternalLinkAlt className="me-1" />
                                    {receipt.createdfrom_display || '-'}
                                </Link>
                            ) : (
                                <span className="text-gray-600">{receipt.createdfrom_display || '-'}</span>
                            )}
                            {receipt.tranid && <span className="text-gray-600"> - {receipt.tranid}</span>}
                        </>
                    }
                    actions={
                        <>
                            {receipt?.status_display && (
                                <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                                    {receipt.status_display || '-'}
                                </span>
                            )}
                            <PermissionGate permission="read">
                                <Button
                                    onClick={() => handleSyncById()}
                                    disabled={isSyncing}
                                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600"
                                    variant='outline'
                                >
                                    <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                    <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                </Button>
                            </PermissionGate>
                        </>
                    }
                />

                <ReceiptFields receipt={receipt} />

                {/* Tab Navigation — style sama seperti tab di TO Edit.tsx / Fulfillment View.tsx */}
                <div>
                    <div className="border-b border-gray-200 overflow-auto">
                        <nav className="flex space-x-2 overflow-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab('items')}
                                className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-25 font-medium text-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'items'
                                    ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <MdInventory2 /> Items
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('files')}
                                className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-25 font-medium text-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'files'
                                    ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <MdOutlineAttachFile /> Files
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('notes')}
                                className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-25 font-medium text-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'notes'
                                    ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <MdOutlineComment /> Notes
                            </button>
                        </nav>
                    </div>

                    <div className="bg-white rounded-b-2xl shadow-sm">
                        {activeTab === 'items' && <ReceiptItemFields lines={lines} />}
                        {activeTab === 'files' &&
                            <FilesItems
                                files={files}
                            />
                        }
                        {activeTab === 'notes' && <NotesTab notes={notes} />}
                    </div>
                </div>
            </div>
        </>
    );
}
