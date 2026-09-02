import { Link } from 'react-router-dom';
import { formatTanggal } from '@/helpers/generalHelper';
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
        <div className="space-y-6 gap-2">
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Reference #</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.tranid || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Created From</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">
                            {createdFromHref && receipt.createdfrom ? (
                                <Link to={createdFromHref} className="text-blue-600 hover:underline">
                                    {receipt.createdfrom_display || '-'}
                                </Link>
                            ) : (
                                receipt.createdfrom_display || '-'
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Date</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.trandate ? formatTanggal(receipt.trandate) : '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Posting Period</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">-</p>
                    </div>
                    {receipt.inboundshipment && (
                        <div>
                            <p className="mb-1.5 block text-sm text-gray-700">Inbound Shipment</p>
                            <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.inboundshipment_display || '-'}</p>
                        </div>
                    )}
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Memo</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.memo || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Incoterm</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">-</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Currency</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">-</p>
                    </div>
                    {receipt.source_type !== 'transfer_order' && (
                        <div>
                            <p className="mb-1.5 block text-sm text-gray-700">Vendor</p>
                            <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.vendor_name || '-'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Classification</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Subsidiary</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.subsidiary_display || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Location</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.location_display || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Class</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.class_display || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-1.5 block text-sm text-gray-700">Department</p>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b rounded-none min-h-10.5 flex items-center">{receipt.department_display || '-'}</p>
                    </div>
                </dl>
            </div>
        </div>
    );
}
