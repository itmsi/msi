import { Link } from 'react-router-dom';
import { formatTanggal } from '@/helpers/generalHelper';
import { FulfillmentItem } from '../types/fulfillment';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';

interface FulfillmentFieldsProps {
    fulfillment: FulfillmentItem;
}

// Label "Vendor"/"Customer" mengikuti tipe transaksi asal (createdfrom.type),
// sama seperti field Entity di UI NetSuite: Vendor Return Authorization ->
// Vendor, Sales Order -> Customer, Transfer Order tidak punya entity sama sekali.
const entityLabel = (sourceType?: string | null) => {
    if (sourceType === 'vendor_return') return 'Vendor';
    if (sourceType === 'sales_order') return 'Customer';
    return null;
};

// Grouping field-nya disamain dengan record Item Fulfillment di NetSuite:
// Primary Information / Approval Information / Classification / Additional Information.
export default function FulfillmentFields({ fulfillment }: FulfillmentFieldsProps) {
    const entityFieldLabel = entityLabel(fulfillment.source_type);
    const isTransferOrder = fulfillment.source_type === 'transfer_order';

    return (
        <div className="space-y-6 gap-2">
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Ref. No.</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.number || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Created From</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">
                            {fulfillment.source_type === 'transfer_order' && fulfillment.createdfrom_id ? (
                                <Link
                                    to={`/netsuite/transfer-orders/edit/${fulfillment.createdfrom_id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {fulfillment.createdfrom_number || '-'}
                                </Link>
                            ) : (
                                fulfillment.createdfrom_number || '-'
                            )}
                        </p>
                    </div>
                    {entityFieldLabel && (
                        <div>
                            <p className="mb-1.5 block text-sm text-gray-700">{entityFieldLabel}</p>
                            <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.entity_name || '-'}</p>
                        </div>
                    )}
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Date</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.date ? formatTanggal(fulfillment.date) : '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Posting Period</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.postingperiod || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Incoterm</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.incoterm_name || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Memo</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.memo || '-'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Approval Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Approval Status</p>
                        <StatusTypeBadge
                            type={Number(fulfillment.custbody_me_approval_status) as 1 | 2 | 3}
                        />
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Next Approver</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.nextapprover || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Created By</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.created_by_netsuite || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Delegate Approver</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_me_delegate_approver || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">In Delegation</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_me_wf_in_delegation ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Classification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">China Cash Flow Item</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_cseg_cn_cfi_display || '-'}</p>
                    </div>
                    {isTransferOrder && (
                        <div>
                            <p className="mb-1.5 block text-sm text-gray-700">Destination Location</p>
                            <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.transferlocation_display || '-'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Additional Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Logistic Vendor</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_me_logistic_vendor_display || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Rate ID</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_me_rate_id_display || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Total Packages</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_me_total_packages || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Gross Weight</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_me_gross_weight || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Packages</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_me_packages || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Related Invoice</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.custbody_me_related_invoice || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Status</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{fulfillment.status_label || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
