import { Link } from 'react-router-dom';
import { formatTanggal } from '@/helpers/generalHelper';
import { FulfillmentItem } from '../types/fulfillment';

interface FulfillmentFieldsProps {
    fulfillment: FulfillmentItem;
}

// Grouping field-nya disamain dengan record Item Fulfillment di NetSuite:
// Primary Information / Approval Information / Classification / Additional Information.
export default function FulfillmentFields({ fulfillment }: FulfillmentFieldsProps) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-base font-semibold text-gray-900">Primary Information</h4>
                </div>
                <div className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Ref. No.</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-medium">{fulfillment.number || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.date ? formatTanggal(fulfillment.date) : '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Memo</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.memo || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Created From</dt>
                            <dd className="mt-1 text-sm text-gray-900">
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
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Posting Period</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.postingperiod || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Incoterm</dt>
                            <dd className="mt-1 text-sm text-gray-900">DAP</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-base font-semibold text-gray-900">Approval Information</h4>
                </div>
                <div className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Created By</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.created_by_netsuite || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Delegate Approver</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_delegate_approver || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">In Delegation</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_wf_in_delegation ? 'Yes' : 'No'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Approval Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_approval_status_display || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Next Approver</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.nextapprover || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-base font-semibold text-gray-900">Classification</h4>
                </div>
                <div className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">China Cash Flow Item</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_cseg_cn_cfi_display || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Destination Location</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.transferlocation_display || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-base font-semibold text-gray-900">Additional Information</h4>
                </div>
                <div className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Logistic Vendor</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_logistic_vendor_display || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Rate ID</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_rate_id_display || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Total Packages</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_total_packages || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Gross Weight</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_gross_weight || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Packages</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_packages || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Related Invoice</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.custbody_me_related_invoice || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">{fulfillment.status_label || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
