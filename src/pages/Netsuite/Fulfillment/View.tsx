import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import CustomDataTable from '@/components/ui/table';
import { formatDateTime, formatTanggal } from '@/helpers/generalHelper';
import { FulfillmentService } from './services/fulfillmentService';
import { FulfillmentItem, FulfillmentLineItem } from './types/fulfillment';

const formatQty = (value: number | string) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);

export default function View() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [fulfillment, setFulfillment] = useState<FulfillmentItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    const lineColumns: TableColumn<FulfillmentLineItem>[] = [
        {
            name: 'Item',
            selector: row => row.item_display || '-',
            cell: row => (
                <div className="py-1">
                    <div className="text-sm font-medium text-gray-900">{row.item_display || '-'}</div>
                    {row.memo && <div className="text-xs text-gray-500">{row.memo}</div>}
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
            name: 'Location',
            selector: row => row.location_display || '-',
            wrap: true,
            minWidth: '200px',
        },
        {
            name: 'Department',
            selector: row => row.department_display || '-',
            wrap: true,
            minWidth: '180px',
        },
        {
            name: 'Class',
            selector: row => row.class_display || '-',
            wrap: true,
            minWidth: '160px',
        },
    ];

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
                                    <p className="mt-1 text-sm text-gray-500">
                                        Last Modified: {fulfillment.last_modified ? formatDateTime(fulfillment.last_modified) : '-'}
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
                                        <dd className="mt-1 text-sm text-gray-900 font-medium">{fulfillment.number || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.date ? formatTanggal(fulfillment.date) : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Customer</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.entity_name || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created From</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.createdfrom_number || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">NetSuite ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.netsuite_id || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Posting Period</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.postingperiod || '-'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Memo</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.memo || '-'}</dd>
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
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.subsidiary_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.location_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Ship To</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.transferlocation_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Department</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.department_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Class</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.class_display || '-'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Approval & Logistics */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">Approval &amp; Logistics</h4>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Approval Status</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_approval_status_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Next Approver</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.nextapprover || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Logistic Vendor</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_logistic_vendor_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Gross Weight</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_gross_weight || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Total Packages</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_total_packages || '-'}</dd>
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
                                        <dd className="mt-1 text-sm text-gray-900 font-medium">{fulfillment.created_by || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Created At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.created_at ? formatDateTime(fulfillment.created_at) : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Updated At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{fulfillment.updated_at ? formatDateTime(fulfillment.updated_at) : '-'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {notes.length > 0 && (
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h4 className="text-base font-semibold text-gray-900">Notes</h4>
                                </div>
                                <div className="p-6 space-y-4">
                                    {notes.map((note, idx) => (
                                        <div key={idx} className="text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900">{note.author || '-'}</span>
                                                <span className="text-xs text-gray-500">{note.date || '-'}</span>
                                            </div>
                                            <p className="mt-1 text-gray-600">{note.note || '-'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
