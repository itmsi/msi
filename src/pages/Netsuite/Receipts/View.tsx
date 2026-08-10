import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import CustomDataTable from '@/components/ui/table';
import { formatDateLocal, formatDateTime } from '@/helpers/generalHelper';
import { ReceiptService } from './services/receiptService';
import { ReceiptItem, ReceiptLineItem } from './types/receipt';

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

const formatQty = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value || 0);

const formatAmount = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);

export default function View() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [receipt, setReceipt] = useState<ReceiptItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
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

    if (error || !receipt) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || 'Item Receipt not found'}</h3>
                <Button onClick={() => navigate('/netsuite/receipts')} variant="outline">Back to List</Button>
            </div>
        );
    }

    const lines = parseLines(receipt.lines);

    const lineColumns: TableColumn<ReceiptLineItem>[] = [
        {
            name: 'Item',
            selector: row => row.item_display || '-',
            cell: row => (
                <div className="py-1">
                    <div className="text-sm font-medium text-gray-900">{row.item_display || '-'}</div>
                    {row.description && <div className="text-xs text-gray-500">{row.description}</div>}
                </div>
            ),
            wrap: true,
            minWidth: '260px',
        },
        {
            name: 'Quantity',
            selector: row => row.quantity,
            cell: row => <span className="text-sm text-right w-full block">{formatQty(row.quantity)}</span>,
            right: true,
            minWidth: '110px',
        },
        {
            name: 'Rate',
            selector: row => row.rate,
            cell: row => <span className="text-sm text-right w-full block">{formatAmount(row.rate)}</span>,
            right: true,
            minWidth: '130px',
        },
        {
            name: 'Amount',
            selector: row => row.amount,
            cell: row => <span className="text-sm font-medium text-right w-full block">{formatAmount(row.amount)}</span>,
            right: true,
            minWidth: '140px',
        },
        {
            name: 'Location',
            selector: row => row.location_display || '-',
            wrap: true,
            minWidth: '180px',
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
            minWidth: '200px',
        },
    ];

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
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Primary Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">Primary Information</h4>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Document No.</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-medium">{receipt.tranid || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.trandate ? formatDateLocal(receipt.trandate) : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.vendor_name || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Type</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.source_type_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created From</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.createdfrom_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">NetSuite ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.netsuite_id || '-'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Memo</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.memo || '-'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">Classification</h4>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Subsidiary</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.subsidiary_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.location_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Department</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.department_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Class</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.class_display || '-'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">Record Info</h4>
                            </div>
                            <div className="p-6">
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Created By</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-medium">{receipt.created_by_name || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Created At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.created_at ? formatDateTime(receipt.created_at) : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Updated At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{receipt.updated_at ? formatDateTime(receipt.updated_at) : '-'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Item Lines */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h4 className="text-base font-semibold text-gray-900">Item Lines</h4>
                    </div>
                    <div className="font-secondary">
                        <CustomDataTable
                            columns={lineColumns}
                            data={lines}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 20, 50]}
                            responsive
                            highlightOnHover
                            striped={false}
                            noDataComponent={
                                <div className="p-6 text-center text-sm text-gray-500">No item lines found</div>
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
