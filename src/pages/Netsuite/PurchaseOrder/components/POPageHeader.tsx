import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { MdKeyboardArrowLeft, MdOutlineSync } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface POPageHeaderProps {
    title: string;
    backPath: string;
    subtitle?: string | null;

    // Edit-mode props (opsional)
    poStatus?: string | null;
    poNumber?: string | null;
    statusLabel?: string | null;
    isSyncing?: boolean;
    onSync?: (poId: string) => void;
    poId?: string | null;

    // Slot untuk action tambahan di kanan
    actions?: React.ReactNode;
}

export default function POPageHeader({
    title,
    backPath,
    subtitle,
    poStatus,
    poNumber,
    statusLabel,
    isSyncing = false,
    onSync,
    poId,
    actions,
}: POPageHeaderProps) {
    const navigate = useNavigate();

    const showSyncButton = onSync && poId && poStatus !== 'pending' && poStatus !== 'failed';

    return (
        <div className="flex items-center justify-between lg:h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-1 w-full">
                <Button
                    variant="outline"
                    onClick={() => navigate(backPath)}
                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                >
                    <MdKeyboardArrowLeft size={20} />
                </Button>
                <div className="border-l border-gray-300 h-6 mx-3"></div>

                <div className="flex items-center gap-4 justify-between w-full lg:flex-row flex-col">
                    <div>
                        <h1 className="ms-2 font-primary-bold font-normal text-xl">{title}</h1>
                        {subtitle && <p className="ms-2 text-sm text-gray-600">{subtitle}</p>}
                    </div>

                    {(showSyncButton || statusLabel || actions) && (
                        <div className="capitalize ms-2 flex gap-2 items-center">
                            {showSyncButton && (
                                <PermissionGate permission="read">
                                    <Button
                                        onClick={() => onSync!(poId!)}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600 py-2"
                                        variant="outline"
                                    >
                                        <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                    </Button>
                                </PermissionGate>
                            )}

                            {poNumber && statusLabel && (
                                <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                                    {statusLabel}
                                </span>
                            )}

                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
