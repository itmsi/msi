import { useCallback, useMemo, useState } from 'react'
import { TableColumn } from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';
import { MdClear, MdSearch, MdOutlineSync, MdFilterListAlt, MdExpandLess, MdExpandMore, MdAdd } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { getProfile, formatTanggal, formatDateTime } from '@/helpers/generalHelper';
import { useInventoryAdjustment } from './hooks/useInventoryAdjustment';
import { InventoryAdjustmentItem } from './types/inventoryAdjustment';
import Button from '@/components/ui/button/Button';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';
import { PermissionGate } from '@/components/common/PermissionComponents';

const APPROVAL_STATUS_OPTIONS = [
    { value: '1', label: 'Pending Approval' },
    { value: '2', label: 'Approved' },
    { value: '3', label: 'Rejected' },
];

// trandate inventory adjustment disimpan sebagai ISO (mis. "2026-09-11T00:00:00+07:00")
// sedangkan formatTanggal hanya menerima "d/m/Y". Normalisasi di sini agar tampilannya
// sama seperti list Fulfillment ("11 September 2026").
const formatTrandate = (value?: string | null): string => {
    if (!value) return '-';
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return formatTanggal(`${Number(iso[3])}/${Number(iso[2])}/${iso[1]}`);
    return formatTanggal(value);
};

export default function Manage() {
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;

    const {
        inventoryAdjustment,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        approvalStatusFilter,
        activeFilterCount,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
        handleClearFilters,
        isSyncing,
        handleSync,
        handleSyncById,
    } = useInventoryAdjustment(profileSSOId);

    const handlePageChangeAman = useCallback((halamanBaru: number) => {
        const halamanSaatIni = pagination?.page || 1;
        if (halamanBaru === halamanSaatIni) return;
        handlePageChange(halamanBaru);
    }, [pagination?.page, handlePageChange]);

    const handleRowsPerPageAman = useCallback((limitBaru: number, halamanBaru: number) => {
        const halamanSaatIni = pagination?.page || 1;
        const limitSaatIni = pagination?.limit || 10;
        if (limitBaru === limitSaatIni && halamanBaru === halamanSaatIni) return;
        handleRowsPerPageChange(limitBaru, halamanBaru);
    }, [pagination?.page, pagination?.limit, handleRowsPerPageChange]);


    const columns: TableColumn<InventoryAdjustmentItem>[] = [
        {
            id: 'doc_number',
            name: 'Document Number',
            selector: row => row.tranid || '-',
            cell: row => (<>
                <Link
                    to={`/netsuite/inventory-adjustments/view/${row.netsuite_id || row.id}`}
                    className="absolute inset-0"
                />
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.tranid || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatTrandate(row.trandate)}</div>
                </div>
            </>),
            wrap: true,
            width: '230px',
            pinned: 'left'
        },
        {
            id: 'account',
            name: 'Adjustment Account',
            selector: row => row.account_display || '-',
            wrap: true,
            width: '200px',
        },
        {
            id: 'adj_location',
            name: 'Adjustment Location',
            selector: row => row.adj_location_display || '-',
            wrap: true,
            width: '200px',
        },
        {
            id: 'customer',
            name: 'Customer',
            selector: row => row.customer_display || '-',
            wrap: true,
            width: '220px',
        },
        {
            id: 'memo',
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
            width: '260px',
        },
        {
            id: 'department',
            name: 'Department',
            selector: row => row.department_display || '-',
            wrap: true,
            width: '180px',
            center: true,
        },
        {
            id: 'class',
            name: 'Class',
            selector: row => row.class_display || '-',
            wrap: true,
            width: '180px',
            center: true,
        },
        {
            id: 'approval_status',
            name: 'Approval Status',
            selector: row => row.custbody_me_approval_status_display || '-',
            cell: row => (
                <div className="items-center capitalize">
                    {row.custbody_me_approval_status ? (
                        <StatusTypeBadge
                            type={Number(row.custbody_me_approval_status) as 1 | 2 | 3}
                            label={row.custbody_me_approval_status_display || undefined}
                        />
                    ) : '-'}
                </div>
            ),
            center: true,
            width: '180px'
        },
        {
            id: 'created_by',
            name: 'Created By',
            selector: row => row.netsuite_id || row.id,
            cell: row => (<>
                <Link
                    to={`/netsuite/inventory-adjustments/view/${row.netsuite_id || row.id}`}
                    className="absolute inset-0"
                />
                <div className="flex flex-col py-2">
                    <span className="font-medium text-gray-900">
                        {row.created_by_name || '-'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.created_at ? formatDateTime(row.created_at) : '-'}
                    </span>
                    <span className="text-xs text-gray-500">
                        Inventory Adjustment ID: {row.netsuite_id || '-'}
                    </span>
                </div>
            </>),
            wrap: true,
            width: '320px'
        },
        createActionsColumn([
            {
                icon: MdOutlineSync,
                onClick: handleSyncById,
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Sync this Inventory Adjustment',
                permission: 'read',
                width: '88px',
            },
        ])
    ];

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const handleToggleFilter = () => {
        setShowAdvancedFilters(prev => !prev);
    };

    const SearchAndFilters = useMemo(() => {
        return (<>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                id='search'
                                type="text"
                                placeholder="Search inventory adjustment... (Press Enter)"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                            />
                            {searchValue && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    type="button"
                                >
                                    <MdClear className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={sortOrder ? {
                            value: sortOrder,
                            label: sortOrder === 'ASC' ? 'Ascending' : 'Descending'
                        } : null}
                        onChange={(selectedOption) =>
                            handleFilterChange('sort_order', selectedOption?.value || '')
                        }
                        options={[
                            { value: 'ASC', label: 'Ascending' },
                            { value: 'DESC', label: 'Descending' }
                        ]}
                        placeholder="Order by"
                        isClearable={false}
                        isSearchable={false}
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleToggleFilter}
                        className="h-10.5 px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 relative"
                        size="sm"
                    >
                        <MdFilterListAlt className="w-4 h-4 mr-2" />
                        Filter
                        {activeFilterCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                                {activeFilterCount}
                            </span>
                        )}
                        {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                            <CustomSelect
                                id="filter_approval_status"
                                name="filter_approval_status"
                                value={approvalStatusFilter ? APPROVAL_STATUS_OPTIONS.find(o => o.value === approvalStatusFilter) || null : null}
                                onChange={(opt) => handleFilterChange('approval_status', opt?.value || '')}
                                options={APPROVAL_STATUS_OPTIONS}
                                placeholder="All Status"
                                isClearable={true}
                                isSearchable={true}
                            />
                        </div>
                    </div>
                    {activeFilterCount > 0 && (
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                            <Button
                                onClick={handleClearFilters}
                                className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                                size="sm"
                            >
                                <MdClear className="w-4 h-4 mr-1" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>);
    }, [searchValue, sortOrder, approvalStatusFilter, activeFilterCount, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, showAdvancedFilters, handleToggleFilter, handleClearFilters]);

    return (
        <>
            <PageMeta
                title="Inventory Adjustment - Motor Sights International"
                description="Manage Inventory Adjustment - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <PageHeaderManage
                    title="Inventory Adjustment"
                    subtitle="Manage Inventory Adjustment"
                    actions={[
                        {
                            key: 'sync',
                            element: (
                                <PermissionGate permission="read">
                                    <Button
                                        onClick={() => handleSync()}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600"
                                        variant='outline'
                                    >
                                        <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                    </Button>
                                </PermissionGate>
                            )
                        },
                        {
                            key: 'create',
                            element: (
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate('/netsuite/inventory-adjustments/create')}
                                        className="flex items-center gap-2"
                                    >
                                        <MdAdd size={20} />
                                        <span>Create Inventory Adjustment</span>
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
                    {SearchAndFilters}
                </div>
                {/* Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        <CustomDataTable
                            columns={columns}
                            data={inventoryAdjustment}
                            loading={loading}
                            pagination
                            paginationServer
                            paginationTotalRows={pagination?.total || 0}
                            paginationPerPage={pagination?.limit || 20}
                            paginationDefaultPage={pagination?.page || 1}
                            paginationRowsPerPageOptions={[10, 20, 50, 100]}
                            onChangePage={handlePageChangeAman}
                            onChangeRowsPerPage={handleRowsPerPageAman}
                            fixedHeader={true}
                            fixedHeaderScrollHeight="625px"
                            responsive
                            highlightOnHover
                            striped={false}
                            persistTableHead
                            borderRadius="8px"
                        />
                    </div>
                </div>
            </div>
        </>

    )
}
