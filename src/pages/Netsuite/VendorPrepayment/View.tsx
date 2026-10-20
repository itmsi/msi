import { ReactNode, useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdArrowBack, MdReceiptLong, MdOutlineSync } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { VendorPrepaymentService } from "./services/vendorPrepaymentService";
import { VendorPrepayment, AppliedToItem } from "./types/vendorPrepayment";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { PermissionGate } from "@/components/common/PermissionComponents";
import { formatDateTime, formatDateLocal } from "@/helpers/generalHelper";
import CustomDataTable from "@/components/ui/table";
import { TableColumn } from "react-data-table-component";
import ModalApproval from "./components/ModalApproval";

type TabType = 'applied_to';

// Section & field dengan susunan 3 kolom seperti form NetSuite
const InfoSection = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        </div>
        <dl className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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

    const [prepaymentData, setPrepaymentData] = useState<VendorPrepayment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('applied_to');

    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false); // approve/reject sudah sukses, tunggu status ter-update
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await VendorPrepaymentService.getVendorPrepaymentById(id);
            if (response.success && response.data) {
                setPrepaymentData(response.data);
            } else {
                setError("Vendor Prepayment not found");
            }
        } catch (err: any) {
            console.error("Error fetching vendor prepayment details:", err);
            setError(err.message || "Failed to load vendor prepayment details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // Setelah approve/reject: sync data dari NetSuite by id, lalu muat ulang detail
    const handleAfterApproval = useCallback(async () => {
        // sembunyikan tombol approve/reject langsung agar tidak bisa diklik ulang saat sync berjalan
        setApprovalSubmitted(true);
        setIsSyncing(true);
        const toastId = toast.loading('Sinkronisasi data...');
        try {
            await VendorPrepaymentService.syncVendorPrepaymentById(String(id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            await fetchDetail();
            setIsSyncing(false);
        }
    }, [id, fetchDetail]);

    // Sync manual data vendor prepayment dari NetSuite
    const handleSyncById = useCallback(async () => {
        if (isSyncing || !id) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi Vendor Prepayment: ${id}...`);
        try {
            await VendorPrepaymentService.syncVendorPrepaymentById(String(id));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            await fetchDetail();
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, id, fetchDetail]);

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

    if (error || !prepaymentData) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || "Vendor Prepayment not found"}</h3>
                <Button onClick={() => navigate("/netsuite/vendor-prepayment")} variant="outline">Back to List</Button>
            </div>
        );
    }

    const statusInfo = getStatusInfo(Number(prepaymentData.approval_status));

    const loginApproverId = getLoginApproverId();
    const nextApproverId = prepaymentData.next_approver_blank ? String(prepaymentData.next_approver_blank) : null;
    const canApprove = Number(prepaymentData.approval_status) === 1
        && !approvalSubmitted
        && !isSyncing
        && !!loginApproverId
        && loginApproverId === nextApproverId;

    // Tab columns
    const appliedToColumns: TableColumn<AppliedToItem>[] = [
        {
            name: 'Date Applied',
            selector: row => row.date_applied || '-',
            cell: row => <span className="text-sm">{row.date_applied ? formatDateLocal(row.date_applied) : '-'}</span>,
            minWidth: '140px',
        },
        { name: 'Type', selector: row => row.type || '-', wrap: true, minWidth: '100px' },
        {
            name: 'Number',
            selector: row => row.number || '-',
            cell: row => (
                <div className="py-1">
                    <div className="text-sm text-gray-500">{row.number || '-'}</div>
                    {row.applied_id && <div className="text-sm font-medium text-gray-900">ID: {row.applied_id}</div>}
                </div>
            ),
            wrap: true,
            minWidth: '160px',
        },
        {
            name: 'Date',
            selector: row => row.date || '-',
            cell: row => <span className="text-sm">{row.date ? formatDateLocal(row.date) : '-'}</span>,
            minWidth: '140px',
        },
        {
            name: 'Original Amount',
            selector: row => Number(row.original_amount) || 0,
            cell: row => <span className="text-sm text-right w-full block">{formatNSCurrency(Number(row.original_amount) || 0)}</span>,
            right: true,
            minWidth: '160px',
        },
        {
            name: 'Applied Amount',
            selector: row => Number(row.applied_amount) || 0,
            cell: row => <span className="text-sm font-medium text-right w-full block">{formatNSCurrency(Number(row.applied_amount) || 0)}</span>,
            right: true,
            minWidth: '160px',
        },
    ];

    const tabs: { key: TabType; label: string; icon: ReactNode; count?: number }[] = [
        { key: 'applied_to', label: 'Applied To', icon: <MdReceiptLong />, count: prepaymentData.applied_to?.length ?? 0 },
    ];

    return (
        <>
            <PageMeta
                title={`View Vendor Prepayment ${prepaymentData.transactionnumber} - Motor Sights International`}
                description="View Vendor Prepayment details"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate("/netsuite/vendor-prepayment")}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                                    title="Back to List"
                                >
                                    <MdArrowBack size={24} />
                                </button>
                                <div>
                                    <h3 className="text-xl leading-6 font-primary-bold text-gray-900 flex items-center gap-3">
                                        Vendor Prepayment {prepaymentData.transactionnumber}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Last Updated:{" "}
                                        {prepaymentData.last_modified_netsuite
                                            ? formatDateTime(prepaymentData.last_modified_netsuite)
                                            : "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:ml-auto">
                                <div className="text-sm">
                                    <Badge color={statusInfo.color} variant="light">
                                        {prepaymentData.approval_status_name || statusInfo.label}
                                    </Badge>
                                </div>
                                <PermissionGate permission="read">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleSyncById()}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600"
                                    >
                                        <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Information — pengelompokan sama seperti form NetSuite Vendor Prepayment */}
                <InfoSection title="Primary Information">
                    <div className="space-y-5">
                        <InfoField label="Transaction Number">
                            <span className="font-medium">{prepaymentData.transactionnumber || '-'}</span>
                        </InfoField>
                        <InfoField label="Payee">{prepaymentData.entity_name || '-'}</InfoField>
                        <InfoField label="Purchase Order">{prepaymentData.purchaseorder_name || '-'}</InfoField>
                        <InfoField label="Account">{prepaymentData.account_name || '-'}</InfoField>
                        <InfoField label="Payment Amount">
                            <span className="font-medium">{formatAmount(prepaymentData.payment, true)}</span>
                        </InfoField>
                    </div>
                    <div className="space-y-5">
                        <InfoField label="Currency">{prepaymentData.currency_name || '-'}</InfoField>
                        <InfoField label="Exchange Rate">{formatAmount(prepaymentData.exchangerate ?? 1)}</InfoField>
                        <InfoField label="Date">{prepaymentData.tran_date ? formatDateLocal(prepaymentData.tran_date) : '-'}</InfoField>
                        <InfoField label="Posting Period">{prepaymentData.postingperiod_name || '-'}</InfoField>
                        <InfoField label="Prepayment Account">{prepaymentData.prepaymentaccount_name || '-'}</InfoField>
                        <div className="flex items-center gap-6 text-sm text-gray-900">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={!!prepaymentData.tobeprinted} disabled readOnly className="h-4 w-4 rounded border-gray-300" />
                                To Be Printed
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={!!prepaymentData.printvoucher} disabled readOnly className="h-4 w-4 rounded border-gray-300" />
                                Voucher
                            </label>
                        </div>
                        <InfoField label="Check #">{prepaymentData.tranid || '-'}</InfoField>
                        <InfoField label="Memo">
                            <span className="whitespace-pre-wrap">{prepaymentData.memo || '-'}</span>
                        </InfoField>
                    </div>
                </InfoSection>

                {/* Approval Information */}
                <InfoSection title="Approval Information">
                    <div className="space-y-5">
                        <InfoField label="Approval Status">
                            <Badge color={statusInfo.color} variant="light">
                                {prepaymentData.approval_status_name || statusInfo.label}
                            </Badge>
                        </InfoField>
                        <InfoField label="Created By">{prepaymentData.wf_created_by_name || '-'}</InfoField>
                        <InfoField label="Delegate Approver">{prepaymentData.delegate_approver_name || '-'}</InfoField>
                    </div>
                    <div className="space-y-5">
                        <label className="flex items-center gap-2 text-sm text-gray-900">
                            <input type="checkbox" checked={!!prepaymentData.in_delegation} disabled readOnly className="h-4 w-4 rounded border-gray-300" />
                            In Delegation
                        </label>
                        <InfoField label="Next Approver">{prepaymentData.next_approver_blank_name || '-'}</InfoField>
                    </div>
                </InfoSection>

                {/* Classification */}
                <InfoSection title="Classification">
                    <div className="space-y-5">
                        <InfoField label="Subsidiary">{prepaymentData.subsidiary_name || '-'}</InfoField>
                        <InfoField label="Department">{prepaymentData.department_name || '-'}</InfoField>
                        <InfoField label="Class">{prepaymentData.class_name || '-'}</InfoField>
                    </div>
                    <div className="space-y-5">
                        <InfoField label="Location">{prepaymentData.location_name || '-'}</InfoField>
                        <InfoField label="China Cash Flow Item">{prepaymentData.cseg_cn_cfi_name || '-'}</InfoField>
                    </div>
                    <div className="md:col-span-2">
                        <InfoField label="Pay To">
                            <span className="whitespace-pre-wrap">{prepaymentData.address || '-'}</span>
                        </InfoField>
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
                                    data={prepaymentData.applied_to || []}
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

                    </div>
                </div>

                {/* Form Actions */}
                {canApprove && (
                    <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm mb-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/netsuite/vendor-prepayment")}
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
                vendorPrepaymentId={prepaymentData.netsuite_id ? Number(prepaymentData.netsuite_id) : null}
                action={approvalAction ?? 'approve'}
                approverNetsuiteId={loginApproverId}
                onSuccess={handleAfterApproval}
                titleModal={approvalAction === 'reject' ? 'Reject' : 'Approve'}
                descriptionModal={`Masukkan catatan untuk proses ${approvalAction === 'reject' ? 'reject' : 'approve'} ${prepaymentData.transactionnumber || ''}`}
            />
        </>
    );
}
