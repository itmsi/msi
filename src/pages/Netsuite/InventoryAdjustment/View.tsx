import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdInventory2, MdOutlineSync, MdOutlineAttachFile, MdOutlineComment } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button/Button';
import { InventoryAdjustmentService } from './services/inventoryAdjustmentService';
import { InventoryAdjustmentItem } from './types/inventoryAdjustment';
import InventoryAdjustmentFields from './components/InventoryAdjustmentFields';
import InventoryAdjustmentItemFields from './components/InventoryAdjustmentItemFields';
import FilesItems from '../Fulfillment/components/FilesItems';
import NotesTab from '../Fulfillment/components/tab/NotesTab';
import useGoBack from '@/hooks/useGoBack';
import PageHeader from '@/components/common/PageHeader';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';

export default function View() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const goBack = useGoBack();

    const [inventoryAdjustment, setInventoryAdjustment] = useState<InventoryAdjustmentItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'items' | 'files' | 'notes'>('items');
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await InventoryAdjustmentService.getInventoryAdjustmentDetail(id);
            if (response.success && response.data) {
                setInventoryAdjustment(response.data);
            } else {
                setError('Inventory Adjustment not found');
            }
        } catch (err: any) {
            console.error('Error fetching inventory adjustment details:', err);
            setError(err.message || 'Failed to load inventory adjustment details');
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
        const toastId = toast.loading(`Sinkronisasi Inventory Adjustment: ${id}...`);
        try {
            await InventoryAdjustmentService.syncInventoryAdjustmentById(id);
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

    if (error || !inventoryAdjustment) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || 'Inventory Adjustment not found'}</h3>
                <Button onClick={() => navigate('/netsuite/inventory-adjustments')} variant="outline">Back to List</Button>
            </div>
        );
    }

    const lines = inventoryAdjustment.lines || [];
    const files = inventoryAdjustment.files || [];
    const notes = inventoryAdjustment.user_notes || [];

    return (
        <>
            <PageMeta
                title={`View Inventory Adjustment ${inventoryAdjustment.tranid} - Motor Sights International`}
                description="View Inventory Adjustment details"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Inventory Adjustment Details"
                    backPath={() => goBack(`/netsuite/inventory-adjustments`)}
                    subtitle={inventoryAdjustment.tranid || '-'}
                    actions={
                        <>
                            {inventoryAdjustment?.custbody_me_approval_status && (
                                <StatusTypeBadge
                                    type={Number(inventoryAdjustment.custbody_me_approval_status) as 1 | 2 | 3}
                                    label={inventoryAdjustment.custbody_me_approval_status_display || undefined}
                                />
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

                <InventoryAdjustmentFields inventoryAdjustment={inventoryAdjustment} />

                {/* Tab Navigation — style sama seperti tab di Receipts View.tsx / Fulfillment View.tsx */}
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
                        {activeTab === 'items' && <InventoryAdjustmentItemFields lines={lines} />}
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
