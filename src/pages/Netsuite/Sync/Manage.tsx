import PageMeta from '@/components/common/PageMeta';
import { useNetsuiteSync, MasterDataItem, SyncStatus } from './hooks/useNetsuiteSync';
import { SyncMasterDataKey } from './services/netSuiteSyncService';
import {
    MdSync,
    // MdCheckCircle,
    // MdError,
    MdSchedule,
    // MdBusiness,
    // MdLocationOn,
    // MdDescription,
    // MdCategory,
    MdAccessTime,
    MdPerson,
    // MdDoneAll,
    // MdInventory2,
    // MdStorefront,
    MdOutlineSync,
} from 'react-icons/md';
import Button from '@/components/ui/button/Button';

// ─── Icon Map ─────────────────────────────────────────────────────────────────

// const ICON_MAP: Record<string, React.ReactNode> = {
//     department: <MdBusiness size={28} />,
//     location:   <MdLocationOn size={28} />,
//     term:       <MdDescription size={28} />,
//     class:      <MdCategory size={28} />,
//     item:       <MdInventory2 size={28} />,
//     vendor:     <MdStorefront size={28} />,
// };

// ─── Status Badge ─────────────────────────────────────────────────────────────

// const STATUS_CONFIG: Record<SyncStatus, {
//     label: string;
//     className: string;
//     icon: React.ReactNode;
// }> = {
//     idle: {
//         label: 'Idle',
//         className: 'bg-gray-100 text-gray-600',
//         icon: null,
//     },
//     queued: {
//         label: 'Queued',
//         className: 'bg-amber-100 text-amber-700',
//         icon: <MdSchedule size={14} className="inline mr-1" />,
//     },
//     processing: {
//         label: 'Syncing...',
//         className: 'bg-blue-100 text-blue-700 animate-pulse',
//         icon: <MdSync size={14} className="inline mr-1 animate-spin" />,
//     },
//     success: {
//         label: 'Success',
//         className: 'bg-green-100 text-green-700',
//         icon: <MdCheckCircle size={14} className="inline mr-1" />,
//     },
//     failed: {
//         label: 'Failed',
//         className: 'bg-red-100 text-red-700',
//         icon: <MdError size={14} className="inline mr-1" />,
//     },
// };

// function StatusBadge({ status }: { status: SyncStatus }) {
//     const config = STATUS_CONFIG[status];
//     return (
//         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
//             {config.icon}
//             {config.label}
//         </span>
//     );
// }

// ─── Format Date ──────────────────────────────────────────────────────────────

function formatSyncDate(isoString: string): string {
    try {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(isoString));
    } catch {
        return isoString;
    }
}

// ─── Sync Card ────────────────────────────────────────────────────────────────

interface SyncCardProps {
    item: MasterDataItem;
    onSync: (key: SyncMasterDataKey) => void;
    isLoadingHistory?: boolean;
}

function SyncCard({ item, onSync, isLoadingHistory = false }: SyncCardProps) {
    const isDisabled = item.status === 'processing' || item.status === 'queued';

    // Card border accent color based on status
    const cardAccent: Record<SyncStatus, string> = {
        idle:       'border-t-transparent',
        queued:     'border-t-amber-400',
        processing: 'border-t-blue-500',
        success:    'border-t-green-500',
        failed:     'border-t-red-500',
    };

    // Icon background tint based on status
    // const iconBg: Record<SyncStatus, string> = {
    //     idle:       'bg-indigo-50 text-indigo-600',
    //     queued:     'bg-amber-50 text-amber-600',
    //     processing: 'bg-blue-50 text-blue-600',
    //     success:    'bg-green-50 text-green-600',
    //     failed:     'bg-red-50 text-red-600',
    // };

    return (
        <div
            className={`
                bg-white rounded-xl shadow-sm border border-transparent border-t-4
                ${cardAccent[item.status]}
                p-6 flex flex-col gap-4
                transition-all duration-300
                hover:shadow-md hover:-translate-y-0.5 justify-between
            `}
        >
            {/* Top row: icon + status */}
            {/* <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${iconBg[item.status]} transition-colors duration-300`}>
                    {ICON_MAP[item.icon] ?? <MdSync size={28} />}
                </div>
                <StatusBadge status={item.status} />
            </div> */}

            {/* Title & description */}
            <div>
                <h3 className="text-base font-primary-bold font-medium text-gray-900">{item.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
            </div>

            {/* Error message */}
            {item.status === 'failed' && item.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                    {item.errorMessage}
                </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Last Sync info */}
            <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Last Sync</p>
                {isLoadingHistory ? (
                    /* Skeleton while API history is loading */
                    <div className="space-y-2 animate-pulse">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 flex-shrink-0" />
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-gray-200 flex-shrink-0" />
                            <div className="h-3 w-32 bg-gray-200 rounded" />
                        </div>
                    </div>
                ) : item.lastSync ? (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <MdPerson size={14} className="text-gray-400 flex-shrink-0" />
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-gray-400">By</span>
                                <p className="text-sm font-medium text-gray-700 truncate leading-tight">
                                    {item.lastSync.synced_by}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-1.5">
                            <MdAccessTime size={14} className="text-gray-400 flex-shrink-0" />
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-gray-400">At</span>
                                <p className="text-sm text-gray-600 leading-tight">
                                    {formatSyncDate(item.lastSync.synced_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">Never synced</p>
                )}
            </div>

            {/* Sync button */}
            <Button
                // id={`sync-btn-${item.key}`}
                onClick={() => onSync(item.key)}
                disabled={isDisabled}
                variant='outline'
                className={`
                    flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600 bg-transparent
                    ${isDisabled
                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                        : ''
                    }
                `}
            >
                <MdOutlineSync
                    size={16}
                    className={item.status === 'processing' ? 'animate-spin' : ''}
                />
                {item.status === 'queued'     && 'Waiting in Queue...'}
                {item.status === 'processing' && 'Syncing...'}
                {item.status === 'idle'       && 'Sync Now'}
                {item.status === 'success'    && 'Sync Again'}
                {item.status === 'failed'     && 'Retry Sync'}
            </Button>
        </div>
    );
}

// ─── Queue Indicator ──────────────────────────────────────────────────────────

interface QueueIndicatorProps {
    items: MasterDataItem[];
}

function QueueIndicator({ items }: QueueIndicatorProps) {
    const queued     = items.filter(i => i.status === 'queued');
    const processing = items.find(i => i.status === 'processing');

    if (!processing && queued.length === 0) return null;

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
            <div className="flex items-start gap-3">
                <MdSync size={20} className="text-blue-600 animate-spin mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-800">
                        Sync Queue Active
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {processing && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-medium">
                                <MdSync size={11} className="animate-spin" />
                                {processing.label} — Running
                            </span>
                        )}
                        {queued.map((item, idx) => (
                            <span
                                key={item.key}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                            >
                                <MdSchedule size={11} />
                                {item.label} — #{idx + 1} in queue
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NetSuiteSyncManage() {
    const { items, enqueueSync, enqueueAll, isAnyActive, isFetchingHistory } = useNetsuiteSync();

    return (
        <>
            <PageMeta
                title="NetSuite Sync - Motor Sights International"
                description="Sync master data from NetSuite"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* ── Page Header ── */}
                <div className="bg-white shadow rounded-xl">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    NetSuite Sync
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Synchronize master data from NetSuite to this system
                                </p>
                            </div>

                            {/* Sync All button */}
                            <Button
                                onClick={enqueueAll}
                                disabled={isAnyActive}
                                variant='outline'
                                className={`
                                    flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600
                                    ${isAnyActive
                                        ? 'bg-green-50 text-green-700'
                                        : ''
                                    }
                                `}
                            >
                                <MdOutlineSync size={18} className={isAnyActive ? 'animate-spin' : ''} />
                                <span className="whitespace-nowrap">
                                    {isAnyActive ? 'Sync Running...' : 'Sync All'}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Queue Indicator ── */}
                <QueueIndicator items={items} />

                {/* ── Master Data Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((item) => (
                        <SyncCard
                            key={item.key}
                            item={item}
                            onSync={enqueueSync}
                            isLoadingHistory={isFetchingHistory}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
