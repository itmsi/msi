import { ReactNode, useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdArrowBack, MdReceiptLong, MdCreditCard, MdHistory, MdOutlineComment } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { BillPaymentService } from "./services/billPaymentService";
import { BillPayment, AppliedToItem, CreditAppliedItem, WorkflowHistoryItem, UserNoteItem } from "./types/billPayment";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { PermissionGate } from "@/components/common/PermissionComponents";
import { formatDateTime, formatDateLocal } from "@/helpers/generalHelper";
import CustomDataTable from "@/components/ui/table";
import { TableColumn } from "react-data-table-component";
import ModalApproval from "./components/ModalApproval";

type TabType = 'applied_to' | 'credit_applied' | 'workflow_history' | 'user_notes';

// Section & field dengan susunan 3 kolom seperti form NetSuite
const InfoSection = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        </div>
        <dl className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            {children}
        </dl>
    </div>
);

// Panel isi tab, style disamain dengan Item Lines di Receipts View (ReceiptItemFields)
const TabPanel = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="mb-6 space-y-6 p-6">
        <h3 className="text-lg font-primary-bold font-medium text-gray-900">{title}</h3>
        <div className="font-secondary">{children}</div>
    </div>
);

const InfoField = ({ label, children }: { label: string; children: ReactNode }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 break-words">{children}</dd>
    </div>
);

export default function View() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [billData, setBillData] = useState<BillPayment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('applied_to');

    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

    const fetchDetail = useCallback(async () => {
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
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // Setelah approve/reject: sync data dari NetSuite by id, lalu muat ulang detail
    const handleAfterApproval = useCallback(async () => {
        const toastId = toast.loading('Sinkronisasi data...');
        try {
            await BillPaymentService.syncBillPaymentById(String(id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            await fetchDetail();
        }
    }, [id, fetchDetail]);

    // ID NetSuite user yang login (auth_user.current_approver_netsuite_id), sama seperti filter di list
    const getLoginApproverId = (): string | null => {
        try {
            const authUserStr = localStorage.getItem('auth_user');
            if (!authUserStr) return null;
            const value = JSON.parse(authUserStr)?.current_approver_netsuite_id;
            return value === undefined || value === null || value === '' ? null : String(value);
        } catch {
            return null;
        }
    };

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

    // Nilai bisa number atau string ("200000.00"); absolute dipakai untuk Amount (selalu positif di NetSuite)
    const formatAmount = (value: number | string | null | undefined, absolute = false) => {
        if (value === null || value === undefined || value === '') return '-';
        const num = Number(value);
        if (isNaN(num)) return String(value);
        return formatNSCurrency(absolute ? Math.abs(num) : num);
    };

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

    const loginApproverId = getLoginApproverId();
    const nextApproverId = billData.next_approver ? String(billData.next_approver) : null;
    const canApprove = Number(billData.approvalstatus) === 1
        && !!loginApproverId
        && loginApproverId === nextApproverId;

    // Tab columns
    const appliedToColumns: TableColumn<AppliedToItem>[] = [
        { name: 'Type', selector: row => row.type || '-', wrap: true, minWidth: '100px' },
        {
            name: 'Ref No.',
            selector: row => row.ref_no || '-',
            cell: row => (
                <div className="py-1">
                    <div className="text-sm text-gray-500">{row.ref_no || '-'}</div>
                    {row.apply_id && <div className="text-sm font-medium text-gray-900">ID: {row.apply_id}</div>}
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
                    <div className="text-sm text-gray-500">{row.ref_no || '-'}</div>
                    {row.credit_id && <div className="text-sm font-medium text-gray-900">ID: {row.credit_id}</div>}
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

    const parseOptionsObj = (optionsObj?: string | Record<string, any>) => {
        if (!optionsObj) return {};

        if (typeof optionsObj === 'string') {
            try {
                return JSON.parse(optionsObj) as Record<string, any>;
            } catch {
                return {};
            }
        }

        return optionsObj;
    };

    const getWorkflowOptionValue = (optionsObj?: string | Record<string, any>, label?: string) => {
        if (!label) return '-';

        const parsedOptions = parseOptionsObj(optionsObj);
        if (!parsedOptions || typeof parsedOptions !== 'object') return '-';

        const normalized = Object.entries(parsedOptions).reduce<Record<string, any>>((acc, [key, value]) => {
            acc[key.replace(/\?/g, '')] = value;
            return acc;
        }, {});

        const withId = `${label} Id`;
        return normalized[label] ?? normalized[withId] ?? '-';
    };

    const workflowColumns: TableColumn<WorkflowHistoryItem>[] = [
        { name: 'Workflow', selector: row => row.workflow || '-', wrap: true, minWidth: '180px' },
        {
            name: 'Is Final',
            selector: row => getWorkflowOptionValue(row.options_obj, 'Is Final'),
            cell: row => <span className="text-sm">{getWorkflowOptionValue(row.options_obj, 'Is Final')}</span>,
            minWidth: '120px',
        },
        {
            name: 'Current Approver',
            selector: row => getWorkflowOptionValue(row.options_obj, 'Current Approver'),
            cell: row => <span className="text-sm">{getWorkflowOptionValue(row.options_obj, 'Current Approver')}</span>,
            wrap: true,
            minWidth: '220px',
        },
        {
            name: 'Is Final Delegate',
            selector: row => getWorkflowOptionValue(row.options_obj, 'Is Final Delegate'),
            cell: row => <span className="text-sm">{getWorkflowOptionValue(row.options_obj, 'Is Final Delegate')}</span>,
            minWidth: '140px',
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

    const tabs: { key: TabType; label: string; icon: ReactNode; count?: number }[] = [
        { key: 'applied_to', label: 'Applied To', icon: <MdReceiptLong />, count: billData.applied_to?.length ?? 0 },
        { key: 'credit_applied', label: 'Credit Applied', icon: <MdCreditCard />, count: billData.credit_applied?.length ?? 0 },
        { key: 'workflow_history', label: 'Workflow History', icon: <MdHistory />, count: billData.workflow_history?.length ?? 0 },
        { key: 'user_notes', label: 'User Notes', icon: <MdOutlineComment />, count: Array.isArray(billData.user_notes) ? billData.user_notes.length : 0 },
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
                                        Bill Payment {billData.transactionnumber}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Last Updated:{" "}
                                        {billData.last_modified_netsuite
                                            ? formatDateTime(billData.last_modified_netsuite)
                                            : "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:ml-auto">
                                <div className="text-sm">
                                    <Badge color={statusInfo.color} variant="light">
                                        {billData.approvalstatus_display || statusInfo.label}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Information */}
                <InfoSection title="Primary Information">
                    <div className="space-y-5">
                        <InfoField label="Transaction Number">
                            <span className="font-medium">{billData.transactionnumber || '-'}</span>
                        </InfoField>
                        <InfoField label="Payee">{billData.entity_display || '-'}</InfoField>
                        <InfoField label="Account">{billData.account_display || '-'}</InfoField>
                        <InfoField label="Amount">
                            <span className="font-medium">{formatAmount(billData.total, true)}</span>
                        </InfoField>
                    </div>
                    <div className="space-y-5">
                        <InfoField label="Currency">{billData.currency_display || '-'}</InfoField>
                        <InfoField label="Exchange Rate">{formatAmount(billData.exchangerate ?? 1)}</InfoField>
                        <InfoField label="Date">{billData.trandate ? formatDateLocal(billData.trandate) : '-'}</InfoField>
                        <InfoField label="Posting Period">{billData.postingperiod_display || '-'}</InfoField>
                    </div>
                    <div className="space-y-5">
                        <InfoField label="Check #">{billData.tranid || '-'}</InfoField>
                        <InfoField label="Memo">
                            <span className="whitespace-pre-wrap">{billData.memo || '-'}</span>
                        </InfoField>
                    </div>
                </InfoSection>

                {/* Approval Information */}
                <InfoSection title="Approval Information">
                    <div className="space-y-5">
                        <InfoField label="Created By">{billData.custbody_me_wf_created_by_display || '-'}</InfoField>
                        <InfoField label="Approval Status">
                            <Badge color={statusInfo.color} variant="light">
                                {billData.approvalstatus_display || statusInfo.label}
                            </Badge>
                        </InfoField>
                        <InfoField label="Next Approver">{billData.next_approver_blank || '-'}</InfoField>
                    </div>
                    <div className="space-y-5">
                        <InfoField label="Delegate Approver">{billData.delegate_approver || '-'}</InfoField>
                    </div>
                    <div className="space-y-5">
                        <InfoField label="In Delegation">{billData.in_delegation ? 'Yes' : 'No'}</InfoField>
                    </div>
                </InfoSection>

                {/* Classification */}
                <InfoSection title="Classification">
                    <div className="space-y-5">
                        <InfoField label="Subsidiary">{billData.subsidiary_display || '-'}</InfoField>
                        <InfoField label="Department">{billData.department_display || '-'}</InfoField>
                    </div>
                    <div className="space-y-5">
                        <InfoField label="Class">{billData.class_display || '-'}</InfoField>
                        <InfoField label="Location">{billData.location_display || '-'}</InfoField>
                    </div>
                    <div className="space-y-5">
                        <InfoField label="China Cash Flow Item">{billData.custbody_cseg_cn_cfi_display || '-'}</InfoField>
                    </div>
                </InfoSection>

                {/* Tabs Section — style sama seperti tab Items di Receipts View.tsx */}
                <div>
                    <div className="border-b border-gray-200 overflow-auto">
                        <nav className="flex space-x-2 overflow-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-25 font-medium text-md transition-colors flex items-center justify-center gap-2 ${activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.icon} {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-white rounded-b-2xl shadow-sm">
                        {activeTab === 'applied_to' && (
                            <TabPanel title="Applied To">
                                <CustomDataTable
                                    columns={appliedToColumns}
                                    data={billData.applied_to || []}
                                    pagination={false}
                                    responsive
                                    highlightOnHover
                                    striped={false}
                                    noDataComponent={
                                        <div className="text-center py-8 text-gray-500">No applied to data found</div>
                                    }
                                />
                            </TabPanel>
                        )}

                        {activeTab === 'credit_applied' && (
                            <TabPanel title="Credit Applied">
                                <CustomDataTable
                                    columns={creditAppliedColumns}
                                    data={billData.credit_applied || []}
                                    pagination={false}
                                    responsive
                                    highlightOnHover
                                    striped={false}
                                    noDataComponent={
                                        <div className="text-center py-8 text-gray-500">No credit applied data found</div>
                                    }
                                />
                            </TabPanel>
                        )}

                        {activeTab === 'workflow_history' && (
                            <TabPanel title="Workflow History">
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
                                        <div className="text-center py-8 text-gray-500">No workflow history found</div>
                                    }
                                />
                            </TabPanel>
                        )}

                        {activeTab === 'user_notes' && (
                            <TabPanel title="User Notes">
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
                                        <div className="text-center py-8 text-gray-500">No user notes found</div>
                                    }
                                />
                            </TabPanel>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                {canApprove && (
                    <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm mb-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/netsuite/bill-payment")}
                            className="px-6 rounded-full"
                        >
                            Cancel
                        </Button>
                        <PermissionGate permission={["create", "update"]}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setApprovalAction('reject')}
                                className="group px-6 rounded-full ring-1 ring-inset ring-red-600 text-red-600 hover:bg-red-600 hover:text-white hover:ring-red-600"
                            >
                                Reject
                            </Button>
                        </PermissionGate>
                        <PermissionGate permission={["create", "update"]}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setApprovalAction('approve')}
                                className="group px-6 rounded-full ring-1 ring-inset ring-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:ring-green-600"
                            >
                                Approve
                            </Button>
                        </PermissionGate>
                    </div>
                )}
            </div>

            <ModalApproval
                isOpen={approvalAction !== null}
                onClose={() => setApprovalAction(null)}
                billPaymentId={billData.netsuite_id ? Number(billData.netsuite_id) : null}
                action={approvalAction ?? 'approve'}
                approverNetsuiteId={loginApproverId}
                onSuccess={handleAfterApproval}
                titleModal={approvalAction === 'reject' ? 'Reject' : 'Approve'}
                descriptionModal={`Masukkan catatan untuk proses ${approvalAction === 'reject' ? 'reject' : 'approve'} ${billData.transactionnumber || ''}`}
            />
        </>
    );
}
