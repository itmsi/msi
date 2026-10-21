import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdArrowBack, MdReceiptLong, MdHistory, MdOutlineComment, MdAttachFile, MdSync, MdOutlineSync, MdDownload, MdSearch, MdClear, MdRefresh } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { VendorPrepaymentService } from "./services/vendorPrepaymentService";
import { VendorPrepayment, AppliedToItem, WorkflowHistoryItem, UserNoteItem, AttachmentFile } from "./types/vendorPrepayment";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { PermissionGate } from "@/components/common/PermissionComponents";
import { formatDateTime, formatDateLocal } from "@/helpers/generalHelper";
import CustomDataTable, { createActionsColumn } from "@/components/ui/table";
import { TableColumn } from "react-data-table-component";
import ModalApproval from "./components/ModalApproval";

type TabType = 'applied_to' | 'workflow_history' | 'user_notes' | 'files';

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

    const [files, setFiles] = useState<AttachmentFile[]>([]);
    const [filesLoading, setFilesLoading] = useState<boolean>(false);
    const [fileSearchInput, setFileSearchInput] = useState<string>('');
    const [fileSearch, setFileSearch] = useState<string>(''); // term yang sudah diterapkan (setelah debounce)
    const [filePage, setFilePage] = useState<number>(1);
    const [filePerPage, setFilePerPage] = useState<number>(10);
    const [fileTotal, setFileTotal] = useState<number>(0);

    // Search otomatis: tunggu user berhenti mengetik 500ms sebelum request
    useEffect(() => {
        const timer = setTimeout(() => {
            setFileSearch(fileSearchInput.trim());
            setFilePage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [fileSearchInput]);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);
    const [syncingFileKey, setSyncingFileKey] = useState<string | null>(null); // 'all' atau file_netsuite_id

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

    // Files (attachments) — list dari DB, sync dari bridge API
    const prepaymentNetsuiteId = prepaymentData?.netsuite_id ? Number(prepaymentData.netsuite_id) : null;

    const loadFiles = useCallback(async () => {
        if (!prepaymentNetsuiteId) return;
        try {
            setFilesLoading(true);
            const res = await VendorPrepaymentService.getAttachmentFiles(String(prepaymentNetsuiteId), fileSearch, filePage, filePerPage);
            setFiles(res?.data?.items ?? []);
            setFileTotal(res?.data?.pagination?.total ?? res?.data?.items?.length ?? 0);
        } catch (err: any) {
            toast.error(err?.message || 'Gagal memuat file');
        } finally {
            setFilesLoading(false);
        }
    }, [prepaymentNetsuiteId, fileSearch, filePage, filePerPage]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    // Sync semua file vendor prepayment dari bridge API
    const handleSyncFiles = useCallback(async () => {
        if (!prepaymentNetsuiteId) return;
        setSyncingFileKey('all');
        const toastId = toast.loading('Sinkronisasi file...');
        try {
            const res = await VendorPrepaymentService.syncAttachmentFiles(prepaymentNetsuiteId);
            toast.success(res?.message || 'Sinkronisasi file berhasil', { id: toastId });
            await loadFiles();
        } catch (err: any) {
            toast.error(err?.message || 'Gagal sinkronisasi file', { id: toastId });
        } finally {
            setSyncingFileKey(null);
        }
    }, [prepaymentNetsuiteId, loadFiles]);

    // Tunggu hasil convert sampai SUCCESS: 2x cek, jeda 15 detik (total ±30 detik)
    const waitForFileSuccess = useCallback(async (fileNetsuiteId: string) => {
        if (!prepaymentNetsuiteId) throw new Error('Vendor prepayment tidak valid');
        for (let attempt = 0; attempt < 2; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 15000));
            if (!isMountedRef.current) throw new Error('cancelled');
            const res = await VendorPrepaymentService.getAttachmentFiles(String(prepaymentNetsuiteId), '', 1, 1, fileNetsuiteId);
            const status = res?.data?.items?.[0]?.status?.toUpperCase();
            if (status === 'SUCCESS') return;
            if (status && status !== 'PENDING') throw new Error(`Convert gagal (status ${status}), klik Convert untuk mengulang`);
        }
        throw new Error('Convert masih diproses, klik tombol Refresh untuk cek lagi');
    }, [prepaymentNetsuiteId]);

    // Ambil link download file SUCCESS lalu trigger unduhan di browser
    const triggerDownload = useCallback(async (fileNetsuiteId: string) => {
        const res = await VendorPrepaymentService.getAttachmentDownloadLink(fileNetsuiteId);
        const url = res?.data?.url;
        if (!res?.success || !url) throw new Error(res?.message || 'Link download tidak tersedia');

        const a = document.createElement('a');
        a.href = url;
        a.download = res.data?.file_name || '';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }, []);

    // Convert file yang belum SUCCESS: trigger convert, tunggu sampai SUCCESS, langsung download, lalu list di-refresh
    const handleConvertFile = useCallback(async (file: AttachmentFile) => {
        if (!prepaymentNetsuiteId) return;
        const fileNetsuiteId = file.file_netsuite_id;
        setDownloadingFileId(fileNetsuiteId);
        const toastId = toast.loading('Memproses convert file...');
        try {
            // kalau sudah PENDING, convert sedang berjalan — cukup tunggu hasilnya
            if (file.status?.toUpperCase() !== 'PENDING') {
                const convertRes = await VendorPrepaymentService.syncAttachmentFile(prepaymentNetsuiteId, fileNetsuiteId);
                if (!convertRes?.success) throw new Error(convertRes?.message || 'Gagal memulai convert');
                await loadFiles();
            }
            await waitForFileSuccess(fileNetsuiteId);
            // convert sukses → langsung download
            await triggerDownload(fileNetsuiteId);
            toast.success('Convert selesai, file diunduh', { id: toastId });
        } catch (err: any) {
            if (err?.message === 'cancelled') {
                toast.dismiss(toastId);
            } else {
                toast.error(err?.message || 'Gagal convert file', { id: toastId });
            }
        } finally {
            if (isMountedRef.current) {
                setDownloadingFileId(null);
                await loadFiles();
            }
        }
    }, [prepaymentNetsuiteId, loadFiles, waitForFileSuccess, triggerDownload]);

    // Download file berstatus SUCCESS langsung dari url-nya
    const handleDownloadFile = useCallback(async (fileNetsuiteId: string) => {
        setDownloadingFileId(fileNetsuiteId);
        try {
            await triggerDownload(fileNetsuiteId);
        } catch (err: any) {
            toast.error(err?.message || 'Gagal mengunduh file');
        } finally {
            setDownloadingFileId(null);
        }
    }, [triggerDownload]);

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

    const formatFileSize = (value: string | number | null | undefined) => {
        const bytes = Number(value);
        if (!bytes || isNaN(bytes)) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'SUCCESS': return 'success' as const;
            case 'PENDING': return 'warning' as const;
            case 'FAILED':
            case 'ERROR': return 'error' as const;
            default: return 'info' as const;
        }
    };

    const filesColumns: TableColumn<AttachmentFile>[] = [
        {
            name: 'File Name',
            selector: row => row.file_name || '-',
            cell: row => <span className="text-sm">{row.file_name || '-'}</span>,
            wrap: true,
            minWidth: '280px',
            pinned: 'left',
        },
        { name: 'Type', selector: row => row.file_type || '-', minWidth: '90px' },
        { name: 'Size', selector: row => formatFileSize(row.file_size), minWidth: '100px' },
        {
            name: 'Status',
            selector: row => row.status || '-',
            cell: row => <Badge color={getFileStatusColor(row.status)} variant="light">{row.status || '-'}</Badge>,
            minWidth: '120px',
        },
        {
            name: 'Updated',
            selector: row => row.updated_at || '-',
            cell: row => (
                <div className="py-1">
                    <div className="text-sm">{row.updated_at ? formatDateTime(row.updated_at) : '-'}</div>
                    <div className="text-sm text-gray-500">File ID: {row.file_netsuite_id || '-'}</div>
                </div>
            ),
            minWidth: '170px',
        },
        createActionsColumn([
            {
                // status SUCCESS: langsung download
                icon: MdDownload,
                onClick: (row: AttachmentFile) => handleDownloadFile(row.file_netsuite_id),
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Download File',
                permission: 'read',
                condition: (row: AttachmentFile) => row.status?.toUpperCase() === 'SUCCESS',
                disable: () => downloadingFileId !== null || syncingFileKey !== null,
            },
            {
                // status belum convert / gagal: convert sekali, cek 2x (15 detik), SUCCESS langsung download
                icon: MdOutlineSync,
                onClick: (row: AttachmentFile) => handleConvertFile(row),
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Convert File',
                iconClassName: (row: AttachmentFile) => downloadingFileId === row.file_netsuite_id ? 'animate-spin' : '',
                permission: 'read',
                condition: (row: AttachmentFile) => {
                    const status = row.status?.toUpperCase();
                    return status !== 'SUCCESS' && status !== 'PENDING';
                },
                disable: () => downloadingFileId !== null || syncingFileKey !== null,
            },
            {
                // status PENDING: tidak convert ulang, hanya cek status 2x (15 detik), SUCCESS langsung download
                icon: MdRefresh,
                onClick: (row: AttachmentFile) => handleConvertFile(row),
                className: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
                tooltip: 'Refresh Status',
                iconClassName: (row: AttachmentFile) => downloadingFileId === row.file_netsuite_id ? 'animate-spin' : '',
                permission: 'read',
                condition: (row: AttachmentFile) => row.status?.toUpperCase() === 'PENDING',
                disable: () => downloadingFileId !== null || syncingFileKey !== null,
            },
        ]),
    ];

    const tabs: { key: TabType; label: string; icon: ReactNode; count?: number }[] = [
        { key: 'applied_to', label: 'Applied To', icon: <MdReceiptLong />, count: prepaymentData.applied_to?.length ?? 0 },
        { key: 'workflow_history', label: 'Workflow History', icon: <MdHistory />, count: prepaymentData.workflow_history?.length ?? 0 },
        { key: 'user_notes', label: 'User Notes', icon: <MdOutlineComment />, count: Array.isArray(prepaymentData.user_notes) ? prepaymentData.user_notes.length : 0 },
        { key: 'files', label: 'Files', icon: <MdAttachFile />, count: fileTotal },
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


                        {activeTab === 'workflow_history' && (
                            <TabPanel title="Workflow History">
                                <CustomDataTable
                                    columns={workflowColumns}
                                    data={prepaymentData.workflow_history || []}
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
                                    data={Array.isArray(prepaymentData.user_notes) ? prepaymentData.user_notes : []}
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

                        {activeTab === 'files' && (
                            <TabPanel title="Files">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
                                    <div className="flex-1 w-full">
                                        <div className="relative flex">
                                            <div className="relative flex-1">
                                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                <Input
                                                    type="text"
                                                    placeholder="Search File Name..."
                                                    value={fileSearchInput}
                                                    onChange={(e) => setFileSearchInput(e.target.value)}
                                                    className={`pl-10 py-2 w-full ${fileSearchInput ? 'pr-10' : 'pr-4'}`}
                                                />
                                                {fileSearchInput && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setFileSearchInput(''); setFileSearch(''); }}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                    >
                                                        <MdClear className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={syncingFileKey !== null}
                                            onClick={() => handleSyncFiles()}
                                            className="h-[42px] px-4 py-2 whitespace-nowrap bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300"
                                        >
                                            <MdSync className={`w-4 h-4 mr-2 ${syncingFileKey === 'all' ? 'animate-spin' : ''}`} />
                                            Sync All Files
                                        </Button>
                                    </div>
                                </div>
                                <CustomDataTable
                                    columns={filesColumns}
                                    data={files}
                                    loading={filesLoading}
                                    pagination={fileTotal > 10}
                                    paginationServer
                                    paginationTotalRows={fileTotal}
                                    paginationPerPage={filePerPage}
                                    paginationDefaultPage={filePage}
                                    paginationRowsPerPageOptions={[10, 20, 50, 100]}
                                    onChangePage={setFilePage}
                                    onChangeRowsPerPage={(perPage) => { setFilePerPage(perPage); setFilePage(1); }}
                                    responsive
                                    highlightOnHover
                                    striped={false}
                                    noDataComponent={
                                        <div className="text-center py-8 text-gray-500">No files found</div>
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
