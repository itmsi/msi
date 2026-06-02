import { useCallback, useMemo, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { useSalesOrder } from './hooks/useSalesOrder';
import { formatDateTime, formatCurrencyDynamic } from '@/helpers/generalHelper';
import {
    MdClear,
    MdSearch,
    MdFilterListAlt,
    MdExpandLess,
    MdExpandMore,
    MdOutlineSync,
    MdAdd,
} from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { SalesOrder } from './types/salesOrder';
import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';
import { createByDateColumn } from '@/components/ui/table/columnUtils';

const SO_STATUS_OPTIONS = [
    { value: 'A', label: 'Pending Approval' },
    { value: 'B', label: 'Pending Fulfillment' },
    { value: 'C', label: 'Cancelled' },
    { value: 'D', label: 'Partially Fulfilled' },
    { value: 'E', label: 'Pending Billing/Partially Fulfilled' },
    { value: 'F', label: 'Pending Billing' },
    { value: 'G', label: 'Billed' },
    { value: 'H', label: 'Closed' },
];

const formatDateID = (dateString: string) => {
    if (!dateString || dateString === '-') return '-';
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        const [, , m, d] = isoMatch;
        const year = isoMatch[1];
        const monthNum = parseInt(m, 10);
        const dayNum = parseInt(d, 10);
        const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        return `${String(dayNum).padStart(2, '0')} ${monthNames[monthNum - 1]} ${year}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('id-ID', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

export default function Manage() {
    const navigate = useNavigate();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const {
        salesOrders,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        filterStatus,
        filterStartDate,
        filterEndDate,
        activeFilterCount,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
        handleClearAllFilters,
        syncInfo,
        isSyncing,
        handleSync,
        handleSyncById,
    } = useSalesOrder();

    const handlePageChangeSafe = useCallback((newPage: number) => {
        const currentPage = pagination?.page || 1;
        if (newPage === currentPage) return;
        handlePageChange(newPage);
    }, [pagination?.page, handlePageChange]);

    const handleRowsPerPageSafe = useCallback((newLimit: number, newPage: number) => {
        const currentPage = pagination?.page || 1;
        const currentLimit = pagination?.page_size || 20;
        if (newLimit === currentLimit && newPage === currentPage) return;
        handleRowsPerPageChange(newLimit, newPage);
    }, [pagination?.page, pagination?.page_size, handleRowsPerPageChange]);

    const columns: TableColumn<SalesOrder>[] = [
        {
            name: 'SO ID',
            selector: row => row.customer_id || '-',
            wrap: true,
            width: '100px'
        },
        {
            name: 'Document Number',
            selector: row => row.tranid || '-',
            cell: row => (<>
                <a
                    href={`/netsuite/sales-orders/edit/${row.netsuite_id || row.id}`}
                    className="absolute inset-0"
                />
                <div className="items-center py-2">
                    <div className="font-medium text-gray-900">{row.tranid || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatDateID(row.tran_date || '-')}</div>
                </div>
            </>),
            wrap: true,
            width: '230px'
        },
        {
            name: 'Customer',
            selector: row => row.customer_name || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="font-medium text-gray-900">{row.customer_name || '-'}</div>
                    {/* <div className="block text-xs text-gray-400">ID: {row.customer_id || '-'}</div> */}
                </div>
            ),
            wrap: true,
            width: '310px'
        },
        {
            name: 'PO Number',
            selector: row => row.otherrefnum || '-',
            wrap: true,
            width: '200px',
            center: true
        },
        {
            name: 'Quotation Number',
            selector: row => row.custbody_msi_quotation_no_iec || '-',
            wrap: true,
            width: '200px',
            center: true
        },
        {
            name: 'Location',
            selector: row => row.location_name || '-',
            wrap: true,
            width: '220px',
            center: true,
            cell: row => (
                <div className="items-start capitalize w-full">
                    {row.location_name || '-'}
                </div>
            ),
        },
        {
            name: 'Next Approval',
            selector: row => Number(row.custbody_me_approval_status) === 1 ? row.nextapprover || '-' : '-',
            wrap: true,
            width: '220px',
            center: true
        },
        {
            name: 'Approval Status',
            selector: row => row.custbody_me_approval_status_name || '-',
            cell: row => (
                <div className="items-center capitalize">
                    <StatusTypeBadge
                        type={Number(row.custbody_me_approval_status) as 1 | 2 | 3} 
                        label={row.custbody_me_approval_status_name || undefined}
                    />
                </div>
            ),
            center: true,
            minWidth: '200px',
        },
        {
            name: 'Status',
            selector: row => row.status_name || row.status_code || '-',
            cell: row => (
                <div className="items-center capitalize">
                    {row.status_name ? (
                        <span 
                            className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]`}
                        >
                            {row.status_name}
                        </span>
                    ) : '-'}
                </div>
            ),
            center: true,
            width: '280px'
        },
        {
            name: 'Total Amount',
            selector: row => row.total_amount ? formatCurrencyDynamic(row.total_amount, row.currency_name || 'IDR') : '-',
            wrap: true,
            width: '240px'
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            cell: row => (
                <div className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={row.memo || ''}>
                    {row.memo || '-'}
                </div>
            ),
            wrap: true,
            minWidth: '180px',
        },
        createByDateColumn('Updated By', 'last_modified', 'last_modified_by_name', '320px'),
        createActionsColumn([
            {
                icon: MdOutlineSync,
                onClick: handleSyncById,
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Sync this SO',
                permission: 'read',
            }
        ]),
    ];

    const SearchAndFilters = useMemo(() => (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Search SO Number / Customer... (Press Enter)"
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
                <div className="flex items-center gap-2">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={sortOrder ? {
                            value: sortOrder,
                            label: sortOrder === 'asc' ? 'Ascending' : 'Descending'
                        } : null}
                        onChange={(selectedOption) =>
                            handleFilterChange('sort_order', selectedOption?.value || '')
                        }
                        options={[
                            { value: 'asc', label: 'Ascending' },
                            { value: 'desc', label: 'Descending' },
                        ]}
                        placeholder="Order by"
                        isClearable={false}
                        isSearchable={false}
                        className="w-40"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowAdvancedFilters(prev => !prev)}
                        className="h-[42px] px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 relative"
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
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <CustomSelect
                                id="filter_status"
                                name="filter_status"
                                value={filterStatus ? SO_STATUS_OPTIONS.find(o => o.value === filterStatus) || null : null}
                                onChange={(opt) => handleFilterChange('status', opt?.value || '')}
                                options={SO_STATUS_OPTIONS}
                                placeholder="All Status"
                                isClearable={true}
                                isSearchable={true}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <Input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => handleFilterChange('tran_date_start', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <Input
                                type="date"
                                value={filterEndDate}
                                onChange={(e) => handleFilterChange('tran_date_end', e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                    {activeFilterCount > 0 && (
                        <div className="mt-3 flex justify-end">
                            <Button
                                onClick={handleClearAllFilters}
                                size="sm"
                                className="bg-transparent border border-red-300 text-red-600 hover:bg-red-50"
                            >
                                <MdClear className="w-4 h-4 mr-1" />
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    ), [searchValue, sortOrder, filterStatus, filterStartDate, filterEndDate, activeFilterCount, showAdvancedFilters]);

    return (
        <>
            <PageMeta
                title="Sales Orders - Motor Sights International"
                description="Manage Sales Orders from NetSuite - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Sales Orders
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage NetSuite Sales Orders and related information
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <PermissionGate permission="read">
                                    <Button
                                        onClick={() => handleSync()}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600"
                                        variant='outline'
                                        size="sm"
                                    >
                                        <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                        <div>
                                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                        </div>
                                    </Button>
                                </PermissionGate>
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate('/netsuite/sales-orders/create')}
                                        className="flex items-center gap-2"
                                    >
                                        <MdAdd size={20} />
                                        <span>Create Sales Order</span>
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    syncInfo && (<>
                        <span className='block text-xs text-green-600 pe-6 text-end mb-0 mt-[-10px]'>Last Sync: {formatDateTime(syncInfo.created_at)} by {syncInfo.created_by_name}</span>
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
                            data={salesOrders}
                            loading={loading}
                            pagination
                            paginationServer
                            paginationTotalRows={pagination?.total_records || 0}
                            paginationPerPage={pagination?.page_size || 20}
                            paginationDefaultPage={pagination?.page || 1}
                            paginationRowsPerPageOptions={[10, 20, 50, 100]}
                            onChangePage={handlePageChangeSafe}
                            onChangeRowsPerPage={handleRowsPerPageSafe}
                            fixedHeader={true}
                            fixedHeaderScrollHeight="625px"
                            responsive
                            highlightOnHover
                            onRowClicked={(row) => navigate(`/netsuite/sales-orders/edit/${row.netsuite_id || row.id}`)}
                            striped={false}
                            persistTableHead
                            borderRadius="8px"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

