import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransferOrder } from './hooks/useTransferOrder';
import { formatDateTime, getProfile } from '@/helpers/generalHelper';
import {
    MdOutlineSync,
    MdAdd,
    MdFileDownload,
} from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import ExportExcelModal from './components/ExportExcelModal';
import FilterSection, { TransferOrderFilterField } from './components/FilterSection';
import TransferOrderTable from './components/TransferOrderTable';

export default function Manage() {
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;

    const {
        transferOrders,
        loading,
        error,
        pagination,
        searchValue,
        filters,
        activeFilterCount,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleDateRangeChange,
        handleKeyPress,
        handleClearSearch,
        handleClearAllFilters,
        syncInfo,
        isSyncing,
        handleSync,
        handleSyncById,
    } = useTransferOrder(profileSSOId);

    const [showExportModal, setShowExportModal] = useState(false);

    const handleFilterFieldChange = useCallback((field: TransferOrderFilterField, value: string) => {
        if (field === 'sort_order') {
            handleFilterChange({ sort_order: (value as 'asc' | 'desc') || 'desc' });
            return;
        }
        handleFilterChange({ [field]: value });
    }, [handleFilterChange]);

    const statusTypeOptions = [
        { value: 'Pending Approval', label: 'Pending Approval' },
        { value: 'Pending Fulfillment', label: 'Pending Fulfillment' },
        { value: 'Pending Receipt', label: 'Pending Receipt' },
        { value: 'Partially Fulfilled', label: 'Partially Fulfilled' },
        { value: 'Received', label: 'Received' },
        { value: 'Pending Receipt/Partially Fulfilled', label: 'Pending Receipt/Partially Fulfilled' },
    ];

    return (
        <>
            <PageMeta
                title="Transfer Orders - Motor Sights International"
                description="Manage Transfer Orders from NetSuite - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <PageHeaderManage
                    title="Transfer Orders"
                    subtitle="Manage Transfer Orders"
                    actions={[
                        {
                            key: 'export',
                            element: (
                                <PermissionGate permission="read">
                                    <Button
                                        onClick={() => setShowExportModal(true)}
                                        className="flex items-center gap-2"
                                        variant='outline'
                                    >
                                        <MdFileDownload size={20} />
                                        <span>Download Excel</span>
                                    </Button>
                                </PermissionGate>
                            )
                        },
                        {
                            key: 'sync',
                            element: (
                                <Button
                                    onClick={() => handleSync()}
                                    disabled={isSyncing}
                                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600"
                                    variant='outline'
                                >
                                    <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                    <div>
                                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                    </div>
                                </Button>
                            )
                        },
                        {
                            key: 'create',
                            element: (
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate('/netsuite/transfer-orders/create')}
                                        className="flex items-center gap-2"
                                    >
                                        <MdAdd className="mr-2" size={20} />
                                        Create Transfer Order
                                    </Button>
                                </PermissionGate>
                            )
                        }
                    ]}
                />

                {
                    syncInfo && (<>
                        <span className='block text-xs text-green-600 pe-6 text-end mb-0'>Last Sync: {formatDateTime(syncInfo.created_at)} by {syncInfo.created_by_name}</span>
                    </>)
                }

                {/* Search & Filter */}
                <div className="bg-white shadow rounded-lg px-6 py-4 mt-3">
                    <FilterSection
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        onSearchKeyPress={handleKeyPress}
                        onClearSearch={handleClearSearch}
                        searchPlaceholder="Search TO Number / Memo... (Press Enter)"
                        filters={filters}
                        statusOptions={statusTypeOptions}
                        onFilterChange={handleFilterFieldChange}
                        onDateRangeChange={handleDateRangeChange}
                        onClearFilters={handleClearAllFilters}
                        defaultOpen={activeFilterCount > 0}
                    />
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        <TransferOrderTable
                            data={transferOrders}
                            loading={loading}
                            pagination={pagination}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleRowsPerPageChange}
                            onSyncById={handleSyncById}
                        />
                    </div>
                </div>
            </div>

            <ExportExcelModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                statusOptions={statusTypeOptions}
            />
        </>
    );
}
