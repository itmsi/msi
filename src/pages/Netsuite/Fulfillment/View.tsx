import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdInventory2, MdOutlineComment } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { FulfillmentService } from './services/fulfillmentService';
import { FulfillmentItem } from './types/fulfillment';
import FulfillmentFields from './components/FulfillmentFields';
import FulfillmentItemFields from './components/FulfillmentItemFields';
import NotesTab from './components/tab/NotesTab';

export default function View() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [fulfillment, setFulfillment] = useState<FulfillmentItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'items' | 'notes'>('items');

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const response = await FulfillmentService.getFulfillmentDetail(id);
                if (response.success && response.data) {
                    setFulfillment(response.data);
                } else {
                    setError('Item Fulfillment not found');
                }
            } catch (err: any) {
                console.error('Error fetching fulfillment details:', err);
                setError(err.message || 'Failed to load fulfillment details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white shadow rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !fulfillment) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || 'Item Fulfillment not found'}</h3>
                <Button onClick={() => navigate('/netsuite/fulfillments')} variant="outline">Back to List</Button>
            </div>
        );
    }

    const lines = fulfillment.lines || [];
    const notes = fulfillment.user_notes || [];

    return (
        <>
            <PageMeta
                title={`View Item Fulfillment ${fulfillment.number} - Motor Sights International`}
                description="View Item Fulfillment details"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/netsuite/fulfillments')}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                    title="Back to List"
                                >
                                    <MdArrowBack size={24} />
                                </button>
                                <div>
                                    <h3 className="text-xl leading-6 font-primary-bold text-gray-900 flex items-center gap-3">
                                        {fulfillment.number}
                                        <div className="text-sm">
                                            <Badge color="light" variant="light">
                                                {fulfillment.status_label || '-'}
                                            </Badge>
                                        </div>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <FulfillmentFields fulfillment={fulfillment} />

                {/* Tab Navigation — style sama seperti tab di TO Edit.tsx */}
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
                            <button
                                type="button"
                                onClick={() => setActiveTab('notes')}
                                className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors flex items-center justify-center gap-2 ${
                                    activeTab === 'notes'
                                        ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <MdOutlineComment /> Notes
                            </button>
                        </nav>
                    </div>

                    <div className="bg-white rounded-b-2xl shadow-sm">
                        {activeTab === 'items' && <FulfillmentItemFields lines={lines} />}
                        {activeTab === 'notes' && <NotesTab notes={notes} />}
                    </div>
                </div>
            </div>
        </>
    );
}
