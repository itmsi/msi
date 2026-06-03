import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { BillPaymentService } from "./services/billPaymentService";
import { BillPayment, AppliedToItem, CreditAppliedItem, WorkflowHistoryItem, UserNoteItem } from "./types/billPayment";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { formatCurrencyID, formatDateTime, formatDateLocal } from "@/helpers/generalHelper";
import CustomDataTable from "@/components/ui/table";
import { TableColumn } from "react-data-table-component";

type TabType = 'applied_to' | 'credit_applied' | 'workflow_history' | 'user_notes';

export default function View() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [billData, setBillData] = useState<BillPayment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('applied_to');

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const response = await BillPaymentService.getBillPaymentById(id);
                if (response.success && response.data) {
                    setBillData(response.data);
                } else {
                    setError("Bill Payment not found");
                }
            } catch (err: any) {
                console.error("Error fetching bill payment details:", err);
                setError(err.message || "Failed to load bill payment details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const getStatusInfo = (approvalstatus: number) => {
        switch (approvalstatus) {
            case 1: return { label: "Pending Approval", color: "warning" as const };
            case 2: return { label: "Approved", color: "success" as const };
            case 3: return { label: "Rejected", color: "error" as const };
            default: return { label: "Unknown", color: "info" as const };
        }
    };

    const formatNSCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white shadow rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !billData) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || "Bill Payment not found"}</h3>
                <Button onClick={() => navigate("/netsuite/bill-payment")} variant="outline">Back to List</Button>
            </div>
        );
    }

    const statusInfo = getStatusInfo(billData.approvalstatus);

    // Tab columns
    const appliedToColumns: TableColumn<AppliedToItem>[] = [
        { name: 'Type', selector: row => row.type || '-', wrap: true, minWidth: '100px' },
        {
            name: 'Ref No.',
            selector: row => row.ref_no || '-',
            cell: row => (
                <div className="py-1">
                    <div className="text-sm font-medium text-gray-900">{row.ref_no || '-'}</div>
                    {row.apply_id && <div className="text-xs text-gray-400">ID: {row.apply_id}</div>}
                </div>
            ),
            wrap: true,
            minWidth: '160px',
        },
        { name: 'Currency', selector: row => row.currency || '-', minWidth: '90px' },
        {
            name: 'Date Due',
            selector: row => row.date_due || '-',
            cell: row => <span className="text-sm">{row.date_due ? formatDateLocal(row.date_due) : '-'}</span>,
            minWidth: '140px',
        },
        {
            name: 'Orig. Amount',
            selector: row => row.orig_amt,
            cell: row => <span className="text-sm text-right w-full block">{formatNSCurrency(row.orig_amt || 0)}</span>,
            right: true,
            minWidth: '140px',
        },
        {
            name: 'Amount Due',
            selector: row => row.amt_due,
            cell: row => <span className="text-sm text-right w-full block">{formatNSCurrency(row.amt_due || 0)}</span>,
            right: true,
            minWidth: '140px',
        },
        {
            name: 'Disc. Date',
            selector: row => row.disc_date || '-',
            cell: row => <span className="text-sm">{row.disc_date ? formatDateLocal(row.disc_date) : '-'}</span>,
            minWidth: '130px',
        },
        {
            name: 'Disc. Available',
            selector: row => row.disc_avail || '-',
            cell: row => <span className="text-sm text-right w-full block">{row.disc_avail || '-'}</span>,
            right: true,
            minWidth: '140px',
        },
        {
            name: 'Disc. Taken',
            selector: row => row.disc_taken || '-',
            cell: row => <span className="text-sm text-right w-full block">{row.disc_taken || '-'}</span>,
            right: true,
            minWidth: '130px',
        },
        {
            name: 'Payment',
            selector: row => row.payment,
            cell: row => <span className="text-sm font-medium text-right w-full block">{formatNSCurrency(row.payment || 0)}</span>,
            right: true,
            minWidth: '140px',
        },
    ];

    const creditAppliedColumns: TableColumn<CreditAppliedItem>[] = [
        { name: 'Type', selector: row => row.type || '-', wrap: true, minWidth: '120px' },
        {
            name: 'Ref No.',
            selector: row => row.ref_no || '-',
            cell: row => (
                <div className="py-1">
                    <div className="text-sm font-medium text-gray-900">{row.ref_no || '-'}</div>
                    {row.credit_id && <div className="text-xs text-gray-400">ID: {row.credit_id}</div>}
                </div>
            ),
            wrap: true,
            minWidth: '140px',
        },
        { name: 'Applied To', selector: row => row.applied_to || '-', wrap: true, minWidth: '120px' },
        { name: 'Currency', selector: row => row.currency || '-', minWidth: '90px' },
        {
            name: 'Date',
            selector: row => row.date || '-',
            cell: row => <span className="text-sm">{row.date ? formatDateLocal(row.date) : '-'}</span>,
            minWidth: '140px',
        },
        {
            name: 'Payment',
            selector: row => row.payment,
            cell: row => <span className="text-sm font-medium text-right w-full block">{formatNSCurrency(row.payment || 0)}</span>,
            right: true,
            minWidth: '140px',
        },
    ];

    const workflowColumns: TableColumn<WorkflowHistoryItem>[] = [
        { name: 'Workflow', selector: row => row.workflow || '-', wrap: true, minWidth: '180px' },
        {
            name: 'Date Entered State',
            selector: row => row.date_entered || '-',
            cell: row => <span className="text-sm">{row.date_entered ? formatDateTime(row.date_entered) : '-'}</span>,
            minWidth: '160px',
        },
        {
            name: 'Date Exited State',
            selector: row => row.date_exited || '-',
            cell: row => <span className="text-sm">{row.date_exited ? formatDateTime(row.date_exited) : '-'}</span>,
            minWidth: '160px',
        },
        {
            name: 'Options',
            selector: row => row.options_obj || '-',
            cell: row => {
                if (!row.options_obj || Object.keys(row.options_obj).length === 0) return '-';
                return (
                    <div className="py-2 text-sm text-gray-700 space-y-1 max-w-[300px]">
                        {Object.entries(row.options_obj).map(([key, val], idx) => (
                            <div key={idx} className="leading-tight">
                                <span className="font-medium text-gray-900">{key}:</span> {String(val)}
                            </div>
                        ))}
                    </div>
                );
            },
            wrap: true,
            minWidth: '250px',
        },
        {
            name: 'Notes',
            selector: row => row.notes || '-',
            cell: row => (
                <div className="py-2 text-sm text-gray-500 whitespace-pre-wrap max-w-[300px]" title={row.notes}>
                    {row.notes || '-'}
                </div>
            ),
            wrap: true,
            minWidth: '200px',
        },
    ];

    const userNotesColumns: TableColumn<UserNoteItem>[] = [
        {
            name: 'Date',
            selector: row => row.date || '-',
            cell: row => <span className="text-sm">{row.date ? formatDateTime(row.date) : '-'}</span>,
            minWidth: '150px',
            sortable: true,
        },
        {
            name: 'Author',
            selector: row => row.author_display || '-',
            cell: row => <span className="text-sm font-medium text-blue-600">{row.author_display || '-'}</span>,
            wrap: true,
            minWidth: '300px',
        },
        {
            name: 'Title',
            selector: row => row.title || '-',
            cell: row => <span className="text-sm font-medium">{row.title || '-'}</span>,
            wrap: true,
            minWidth: '300px',
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            cell: row => (
                <div className="py-2 text-sm text-gray-700 whitespace-pre-wrap max-w-[400px]">
                    {row.memo || '-'}
                </div>
            ),
            wrap: true,
            minWidth: '300px',
        },
        {
            name: 'Type',
            selector: row => row.type_display || '-',
            minWidth: '80px',
        },
        {
            name: 'Direction',
            selector: row => row.direction_display || '-',
            minWidth: '80px',
        }
    ];

    const tabs: { key: TabType; label: string; count?: number }[] = [
        { key: 'applied_to', label: 'Applied To', count: billData.applied_to?.length ?? 0 },
        { key: 'credit_applied', label: 'Credit Applied', count: billData.credit_applied?.length ?? 0 },
        { key: 'workflow_history', label: 'Workflow History', count: billData.workflow_history?.length ?? 0 },
        { key: 'user_notes', label: 'User Notes', count: Array.isArray(billData.user_notes) ? billData.user_notes.length : 0 },
    ];

    return (
        <>
            <PageMeta
                title={`View Bill Payment ${billData.transactionnumber} - Motor Sights International`}
                description="View Bill Payment details"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate("/netsuite/bill-payment")}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                    title="Back to List"
                                >
                                    <MdArrowBack size={24} />
                                </button>
                                <div>
                                    <h3 className="text-xl leading-6 font-primary-bold text-gray-900 flex items-center gap-3">
                                        {billData.transactionnumber}
                                        <div className="text-sm">
                                            <Badge color={statusInfo.color} variant="light">
                                                {billData.approvalstatus_display || statusInfo.label}
                                            </Badge>
                                        </div>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Last Modified: {billData.last_modified_netsuite ? formatDateTime(billData.last_modified_netsuite) : '-'}
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
                                        <dt className="text-sm font-medium text-gray-500">Transaction Number</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-medium">{billData.transactionnumber || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Document No.</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.tranid || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Vendor (Entity)</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.entity_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Account</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.account_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.trandate ? formatDateLocal(billData.trandate) : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Posting Period</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.postingperiod_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created By</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.custbody_me_wf_created_by_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">NetSuite ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.netsuite_id || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Created At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.created_at ? formatDateTime(billData.created_at) : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Updated At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.updated_at ? formatDateTime(billData.updated_at) : '-'}</dd>
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
                                        <dd className="mt-1 text-sm text-gray-900">{billData.subsidiary_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Department</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.department_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.location_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Class</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.class_display || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">China Cash Flow Item</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{billData.custbody_cseg_cn_cfi_display || '-'}</dd>
                                    </div>
                                    {/* <div>
                                        <dt className="text-xs font-medium text-gray-500">Last Modified (NetSuite)</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {billData.last_modified_netsuite ? formatDateTime(billData.last_modified_netsuite) : '-'}
                                        </dd>
                                    </div> */}
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                                <h4 className="text-lg font-bold text-gray-900">Financial Summary</h4>
                            </div>
                            <div className="p-6">
                                <dl className="space-y-4">
                                    <div className="flex justify-between items-center pt-2">
                                        <dt className="text-lg font-bold text-gray-900">Total</dt>
                                        <dd className="text-xl font-bold text-gray-900">
                                            {formatNSCurrency(Math.abs(billData.total || 0))}
                                        </dd>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <dt className="text-gray-500">Currency</dt>
                                            <dd className="text-gray-900 font-medium">{billData.currency_display || '-'}</dd>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <dt className="text-gray-500">Exchange Rate</dt>
                                            <dd className="text-gray-900">{billData.exchangerate ?? '1.00'}</dd>
                                        </div>
                                        {billData.exchangerate && billData.exchangerate !== 1 && (
                                            <div className="flex justify-between items-center pt-1 text-xs">
                                                <dt className="text-gray-500 font-medium">Amount (IDR Base)</dt>
                                                <dd className="text-gray-900 font-bold">
                                                    {formatCurrencyID(Math.abs(billData.total || 0) * (billData.exchangerate || 1))}
                                                </dd>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-1 text-xs">
                                            <dt className="text-gray-500">Posting Period</dt>
                                            <dd className="text-gray-900">{billData.postingperiod_display || '-'}</dd>
                                        </div>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Approval Information */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-base font-semibold text-gray-900">Approval Information</h4>
                            </div>
                            <div className="p-6">
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 mb-1.5">Approval Status</dt>
                                        <dd>
                                            <Badge color={statusInfo.color} variant="light">
                                                {billData.approvalstatus_display || statusInfo.label}
                                            </Badge>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Created By</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-medium">
                                            {billData.custbody_me_wf_created_by_display || '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Next Approver</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {billData.next_approver || '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">Delegate Approver</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {billData.delegate_approver || '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500">In Delegation</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {billData.in_delegation ? 'Yes' : 'No'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 px-6 overflow-auto">
                        <nav className="flex space-x-8 overflow-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-4 px-1 border-b-2 lg:min-w-auto min-w-[120px] font-medium text-sm transition-colors flex items-center gap-2 ${
                                        activeTab === tab.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                                            activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-0 font-secondary">
                        {activeTab === 'applied_to' && (
                            <CustomDataTable
                                columns={appliedToColumns}
                                data={billData.applied_to || []}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 20, 50]}
                                responsive
                                highlightOnHover
                                striped={false}
                                noDataComponent={
                                    <div className="p-6 text-center text-sm text-gray-500">No applied to data found</div>
                                }
                            />
                        )}

                        {activeTab === 'credit_applied' && (
                            <CustomDataTable
                                columns={creditAppliedColumns}
                                data={billData.credit_applied || []}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 20, 50]}
                                responsive
                                highlightOnHover
                                striped={false}
                                noDataComponent={
                                    <div className="p-6 text-center text-sm text-gray-500">No credit applied data found</div>
                                }
                            />
                        )}

                        {activeTab === 'workflow_history' && (
                            <CustomDataTable
                                columns={workflowColumns}
                                data={billData.workflow_history || []}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 20, 50]}
                                responsive
                                highlightOnHover
                                striped={false}
                                noDataComponent={
                                    <div className="p-6 text-center text-sm text-gray-500">No workflow history found</div>
                                }
                            />
                        )}

                        {activeTab === 'user_notes' && (
                            <CustomDataTable
                                columns={userNotesColumns}
                                data={Array.isArray(billData.user_notes) ? billData.user_notes : []}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 20, 50]}
                                responsive
                                highlightOnHover
                                striped={false}
                                noDataComponent={
                                    <div className="p-6 text-center text-sm text-gray-500">No user notes found</div>
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
