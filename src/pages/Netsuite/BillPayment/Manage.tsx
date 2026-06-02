import { useCallback, useMemo, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { useBillPayment } from './hooks/useBillPayment';
import { formatCurrencyID, getStatusBadge, formatDateTime, formatDateLocal } from '@/helpers/generalHelper';
import { MdClear, MdSearch, MdFilterListAlt, MdExpandLess, MdExpandMore, MdOutlineSync } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { BillPayment } from './types/billPayment';
import Button from '@/components/ui/button/Button';
import FilterSection from './components/FilterSection';
import { MdVisibility } from 'react-icons/md';

export default function Manage() {
    const navigate = useNavigate();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const {
        billPayments,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        filterApprovalStatus,
        filterStartDate,
        filterEndDate,
        filterSubsidiary,
        activeFilterCount,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
        handleClearAllFilters,
        isSyncing,
        handleSync,
    } = useBillPayment();

    const handlePageChangeSafe = useCallback((newPage: number) => {
        const currentPage = pagination?.page || 1;
        if (newPage === currentPage) return;
        handlePageChange(newPage);
    }, [pagination?.page, handlePageChange]);

    const handleRowsPerPageSafe = useCallback((newLimit: number, newPage: number) => {
        const currentPage = pagination?.page || 1;
        const currentLimit = pagination?.page_size || 10;
        if (newLimit === currentLimit && newPage === currentPage) return;
        handleRowsPerPageChange(newLimit, newPage);
    }, [pagination?.page, pagination?.page_size, handleRowsPerPageChange]);

    const getApprovalStatusBadge = (approvalstatus: number, approvalstatus_display: string) => {
        let statusKey = 'draft';
        if (approvalstatus === 1) statusKey = 'pending';
        else if (approvalstatus === 2) statusKey = 'approved';
        else if (approvalstatus === 3) statusKey = 'rejected';
        return { badge: getStatusBadge(statusKey), label: approvalstatus_display || '-' };
    };

    const columns: TableColumn<BillPayment>[] = [
        {
            name: 'ID',
            selector: row => row.netsuite_id?.toString() || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-900">{row.netsuite_id || '-'}</div>
                </div>
            ),
            wrap: true,
            minWidth: '80px',
        },
        {
            name: 'Transaction No.',
            selector: row => row.transactionnumber || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="font-medium text-gray-900">{row.transactionnumber || '-'}</div>
                    <div className="block text-sm text-gray-500">Doc. Number: {row.tranid || '-'}</div>
                </div>
            ),
            wrap: true,
            minWidth: '160px',
        },
        {
            name: 'Subsidiary',
            selector: row => row.subsidiary_display || '-',
            wrap: true,
            minWidth: '200px',
        },
        {
            name: 'Vendor',
            selector: row => row.entity_display || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-900">{row.entity_display || '-'}</div>
                </div>
            ),
            wrap: true,
            minWidth: '220px',
        },
        {
            name: 'Account',
            selector: row => row.account_display || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-900">{row.account_display || '-'}</div>
                </div>
            ),
            wrap: true,
            minWidth: '260px',
        },
        {
            name: 'Date',
            selector: row => row.trandate || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-500">{formatDateLocal(row.trandate)}</div>
                    <div className="block text-xs text-gray-400">{row.postingperiod_display || '-'}</div>
                </div>
            ),
            wrap: true,
            minWidth: '160px',
        },
        {
            name: 'Currency',
            selector: row => row.currency_display || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-900">{row.currency_display || '-'}</div>
                    {row.exchangerate !== 1 && (
                        <div className="block text-xs text-gray-500">Rate: {row.exchangerate}</div>
                    )}
                </div>
            ),
            wrap: true,
            minWidth: '100px',
        },
        {
            name: 'Total',
            selector: row => row.total,
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm font-medium text-gray-900">
                        {formatCurrencyID(Math.abs(row.total || 0))}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: '160px',
        },
        {
            name: 'Approval Status',
            selector: row => row.approvalstatus_display || '-',
            cell: row => {
                const { badge, label } = getApprovalStatusBadge(row.approvalstatus, row.approvalstatus_display);
                return (
                    <div className="items-center capitalize">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {label}
                        </span>
                    </div>
                );
            },
            center: true,
            minWidth: '200px',
        },
        {
            name: 'Created By',
            selector: row => row.custbody_me_wf_created_by_display || '-',
            cell: row => (
                <div className="items-start py-2">
                    <div className="block text-sm text-gray-500">{row.custbody_me_wf_created_by_display || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatDateTime(row.created_at)}</div>
                </div>
            ),
            wrap: true,
            minWidth: '200px',
        },
        createActionsColumn([
            {
                icon: MdVisibility,
                onClick: (row: BillPayment) => navigate(`/netsuite/bill-payment/view/${row.id}`),
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'View Detail',
                permission: 'read',
            },
        ])
    ];

    const handleToggleFilter = () => {
        setShowAdvancedFilters(prev => !prev);
    };

    const SearchAndFilters = useMemo(() => {
        return (
            <>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1">
                        <div className="relative flex">
                            <div className="relative flex-1">
                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type="text"
                                    placeholder="Search Transaction No... (Press Enter)"
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
                            id="bp_sort_order"
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
                                { value: 'desc', label: 'Descending' }
                            ]}
                            placeholder="Order by"
                            isClearable={false}
                            isSearchable={false}
                            className="w-40"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleToggleFilter}
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

                {/* Advanced Filters Collapse */}
                {showAdvancedFilters && (
                    <FilterSection
                        filterApprovalStatus={filterApprovalStatus}
                        filterStartDate={filterStartDate}
                        filterEndDate={filterEndDate}
                        filterSubsidiary={filterSubsidiary}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearAllFilters}
                    />
                )}
            </>
        );
    }, [searchValue, sortOrder, filterApprovalStatus, filterStartDate, filterEndDate, filterSubsidiary, activeFilterCount, showAdvancedFilters, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, handleToggleFilter, handleClearAllFilters]);

    return (
        <>
            <PageMeta
                title="Bill Payment - Motor Sights International"
                description="Manage Bill Payment - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg mb-3">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Bill Payment
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage Bill Payment and related information
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <PermissionGate permission="read">
                                    <Button
                                        onClick={() => handleSync()}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600"
                                        variant="outline"
                                    >
                                        <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                        <div>
                                            <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                        </div>
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>

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
                            data={billPayments}
                            loading={loading}
                            pagination
                            paginationServer
                            paginationTotalRows={pagination?.total_records || 0}
                            paginationPerPage={pagination?.page_size || 10}
                            paginationDefaultPage={pagination?.page || 1}
                            paginationRowsPerPageOptions={[10, 20, 50, 100]}
                            onChangePage={handlePageChangeSafe}
                            onChangeRowsPerPage={handleRowsPerPageSafe}
                            fixedHeader={true}
                            fixedHeaderScrollHeight="625px"
                            responsive
                            highlightOnHover
                            onRowClicked={(row) => navigate(`/netsuite/bill-payment/view/${row.id}`)}
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
