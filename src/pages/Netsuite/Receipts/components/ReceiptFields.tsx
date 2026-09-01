import { Link } from 'react-router-dom';
import { formatDateLocal } from '@/helpers/generalHelper';
import { ReceiptItem } from '../types/receipt';

interface ReceiptFieldsProps {
    receipt: ReceiptItem;
}

// Grouping field-nya disamain dengan record Item Receipt di NetSuite:
// Primary Information / Classification.
export default function ReceiptFields({ receipt }: ReceiptFieldsProps) {
    const createdFromHref = receipt.source_type === 'transfer_order'
        ? `/netsuite/transfer-orders/edit/${receipt.createdfrom}`
        : receipt.source_type === 'purchase_order'
            ? `/netsuite/purchase-order/edit/${receipt.createdfrom}`
            : null;

    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-base font-semibold text-gray-900">Primary Information</h4>
                </div>
                <div className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Reference #</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-medium">{receipt.tranid || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Created From</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {createdFromHref && receipt.createdfrom ? (
                                    <Link to={createdFromHref} className="text-blue-600 hover:underline">
                                        {receipt.createdfrom_display || '-'}
                                    </Link>
                                ) : (
                                    receipt.createdfrom_display || '-'
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{receipt.trandate ? formatDateLocal(receipt.trandate) : '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Posting Period</dt>
                            <dd className="mt-1 text-sm text-gray-900">-</dd>
                        </div>
                        {receipt.inboundshipment && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Inbound Shipment</dt>
                                <dd className="mt-1 text-sm text-gray-900">{receipt.inboundshipment_display || '-'}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Memo</dt>
                            <dd className="mt-1 text-sm text-gray-900">{receipt.memo || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Incoterm</dt>
                            <dd className="mt-1 text-sm text-gray-900">-</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Currency</dt>
                            <dd className="mt-1 text-sm text-gray-900">-</dd>
                        </div>
                        {receipt.source_type !== 'transfer_order' && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                                <dd className="mt-1 text-sm text-gray-900">{receipt.vendor_name || '-'}</dd>
                            </div>
                        )}
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
                            <dt className="text-sm font-medium text-gray-500">Subsidiary</dt>
                            <dd className="mt-1 text-sm text-gray-900">{receipt.subsidiary_display || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Department</dt>
                            <dd className="mt-1 text-sm text-gray-900">{receipt.department_display || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Class</dt>
                            <dd className="mt-1 text-sm text-gray-900">{receipt.class_display || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Location</dt>
                            <dd className="mt-1 text-sm text-gray-900">{receipt.location_display || '-'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
