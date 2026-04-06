import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { InvoiceSalesOrderService } from './services/invoiceSalesOrderService';
import { InvoiceSalesOrder } from './types/invoiceSalesOrder';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { formatCurrencyID, formatCurrencyZH, parseNetsuiteDate, formatDateTime } from '@/helpers/generalHelper';

export default function View() {
    const { tranid } = useParams<{ tranid: string }>();
    const navigate = useNavigate();
    
    const [invoiceData, setInvoiceData] = useState<InvoiceSalesOrder | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoiceDetail = async () => {
            if (!tranid) return;
            
            try {
                setLoading(true);
                setError(null);
                
                const response = await InvoiceSalesOrderService.getInvoiceSalesOrders({
                    page: 1,
                    page_size: 20,
                    sort_by: 'trandate',
                    sort_order: 'DESC',
                    filters: {
                        tranid: tranid
                    }
                });
                
                if (response.success && response.data.items && response.data.items.length > 0) {
                    setInvoiceData(response.data.items[0]);
                } else {
                    setError('Invoice Sales Order not found');
                }
            } catch (err: any) {
                console.error('Error fetching invoice details:', err);
                setError(err.message || 'Failed to load invoice details');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoiceDetail();
    }, [tranid]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case '1': return { label: 'Paid In Full', color: 'success' as const };
            case '2': return { label: 'Pending Approval', color: 'warning' as const };
            case '3': return { label: 'Rejected', color: 'error' as const };
            default: return { label: status || 'Unknown', color: 'info' as const };
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white shadow rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !invoiceData) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || 'Invoice not found'}</h3>
                <Button onClick={() => navigate('/netsuite/invoice-sales-order')} variant="outline">
                    Back to List
                </Button>
            </div>
        );
    }

    const statusInfo = getStatusInfo(invoiceData.approvalstatus);
    
    // Calculate Totals
    const totalForeign = invoiceData.lines && invoiceData.lines.length > 0
        ? invoiceData.lines.reduce((sum, line) => sum + (line.grossamt || 0), 0)
        : 0;
    const exRate = Number(invoiceData.exchangerate) || 1;
    const totalBase = totalForeign * exRate;

    return (
        <>
            <PageMeta
                title={`View Invoice ${invoiceData.tranid} - Motor Sights International`}
                description="View Invoice Sales Orders details"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/netsuite/invoice-sales-order')}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                    title="Back to List"
                                >
                                    <MdArrowBack size={24} />
                                </button>
                                <div>
                                    <h3 className="text-xl leading-6 font-primary-bold text-gray-900 flex items-center gap-3">
                                        Invoice {invoiceData.tranid}
                                        <div className="text-sm">
                                            <Badge color={statusInfo.color} variant="light">
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Last Updated: {invoiceData.trandate ? formatDateTime(parseNetsuiteDate(invoiceData.trandate)) : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {/* Edit functionality can be added later if needed */}
                                {/* <Button
                                    onClick={() => navigate(`/netsuite/invoice-sales-order/edit/${invoiceData.id}`)}
                                    className="flex items-center gap-2"
                                    color="warning"
                                >
                                    <MdEdit size={18} />
                                    <span>Edit</span>
                                </Button> */}
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
                                        <dt className="text-sm font-medium text-gray-500">Document Number</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-medium">{invoiceData.tranid}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.entityid || invoiceData.entity || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.trandate || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Account</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.account_display || invoiceData.account || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">PO #</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.otherrefnum || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created From</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.createdfrom_display || '-'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Memo</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.memo || '-'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Classification Info */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">Classification & Custom Fields</h4>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Subsidiary</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.subsidiary_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Department</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.department_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.location_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Class</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.class_display || '-'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">MSI - Bank Payment</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.custbody_msi_bank_payment_so_display || invoiceData.custbody_msi_bank_payment_so || '-'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">ME - Related Fulfillment</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.custbody_me_related_fulfillment || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created By</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoiceData.custbody_me_wf_created_by_display || invoiceData.custbody_me_wf_created_by || '-'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">Financial Summary</h4>
                            </div>
                            <div className="p-6">
                                <dl className="space-y-6">
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <dt className="text-sm font-medium text-gray-500">Currency</dt>
                                        <dd className="text-sm text-gray-900 font-medium">{invoiceData.currency_display || invoiceData.currency || '-'}</dd>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <dt className="text-sm font-medium text-gray-500">Exchange Rate</dt>
                                        <dd className="text-sm text-gray-900">{invoiceData.exchangerate || '1.00'}</dd>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <dt className="text-sm font-medium text-gray-500">Amount (Foreign)</dt>
                                        <dd className="text-base text-gray-900 font-semibold">
                                            {invoiceData.currency === 'CNY' || invoiceData.currency === 'Yuan' || invoiceData.currency_display === 'CNY' || invoiceData.currency_display === 'Yuan' 
                                                ? formatCurrencyZH(totalForeign) 
                                                : formatCurrencyID(totalForeign)}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <dt className="text-base font-bold text-gray-700">Amount (IDR Base)</dt>
                                        <dd className="text-lg text-blue-700 font-bold">
                                            {formatCurrencyID(totalBase)}
                                        </dd>
                                    </div>
                                    {invoiceData.postingperiod && (
                                        <div className="flex justify-between items-center pt-2 text-sm">
                                            <dt className="text-gray-500">Posting Period</dt>
                                            <dd className="text-gray-900">{invoiceData.postingperiod}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h4 className="text-base font-semibold text-gray-900">Items ({invoiceData.lines?.length || 0})</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-2">Price Level</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Code / Rate</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amt</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Amt</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoiceData.lines && invoiceData.lines.length > 0 ? (
                                    invoiceData.lines.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{line.item_display || line.item}</div>
                                                <div className="text-xs text-gray-500">{line.itemtype}</div>
                                            </td>
                                            <td className="px-6 py-4 min-w-[200px]">
                                                <div className="text-sm text-gray-900 line-clamp-2" title={line.memo || ''}>{line.memo || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap px-2">
                                                <div className="text-sm text-gray-900">{line.price_display || line.price || '-'}</div>
                                                {line.custcol_me_tier_price && (
                                                    <div className="text-xs text-blue-600">Tier: {line.custcol_me_tier_price}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                {line.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                {formatCurrencyID(line.rate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                {formatCurrencyID(line.netamount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm text-gray-900">{line.taxcode || '-'}</div>
                                                <div className="text-xs text-gray-500">{(line.taxrate1 * 100).toFixed(1)}%</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                {formatCurrencyID(Math.abs(line.tax1amt))} 
                                                {/* Some API versions might return negative values like -1474000, so we use absolute */}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                {formatCurrencyID(line.grossamt)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No items found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
