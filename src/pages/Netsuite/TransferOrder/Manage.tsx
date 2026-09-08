import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';
import { useTransferOrder } from './hooks/useTransferOrder';
import { formatDateTime, formatTanggal, formatDateToYMD, getProfile } from '@/helpers/generalHelper';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
    MdClear,
    MdSearch,
    MdFilterListAlt,
    MdExpandLess,
    MdExpandMore,
    MdOutlineSync,
    MdAdd,
    MdDateRange,
} from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { TransferOrderListItem } from './types/transferOrder';
import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { createByDateColumn } from '@/components/ui/table/columnUtils';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomSelect from '@/components/form/select/CustomSelect';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import moment from 'moment';

export default function Manage() {
    const navigate = useNavigate();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;

    const {
        transferOrders,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        filterLocation,
        filterTransferLocation,
        filterStatus,
        filterStartDate,
        filterEndDate,
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

    // Location filter select
    const {
        POLocationOptions: locationOptions,
        pagination: locationPagination,
        inputValue: locationInputValue,
        handleInputChange: handleLocationInputChange,
        handleMenuScrollToBottom: handleLocationMenuScrollToBottom,
        initializeOptions: initializeLocationOptions,
    } = usePOLocationSelect(30, false);

    const {
        POLocationOptions: transferLocationOptions,
        pagination: transferLocationPagination,
        inputValue: transferLocationInputValue,
        handleInputChange: handleTransferLocationInputChange,
        handleMenuScrollToBottom: handleTransferLocationMenuScrollToBottom,
        initializeOptions: initializeTransferLocationOptions,
    } = usePOLocationSelect(30, false);

    useEffect(() => {
        initializeLocationOptions();
        initializeTransferLocationOptions();
    }, [initializeLocationOptions, initializeTransferLocationOptions]);

    const [selectedLocationFilter, setSelectedLocationFilter] = useState<any>(null);
    const [selectedTransferLocationFilter, setSelectedTransferLocationFilter] = useState<any>(null);

    // Date range filter
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateRangeState, setDateRangeState] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }]);
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset tampilan kalender kalau filter tanggal dibersihkan dari luar (Clear All).
    useEffect(() => {
        if (!filterStartDate && !filterEndDate) {
            setDateRangeState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        }
    }, [filterStartDate, filterEndDate]);

    const handleDateRangeSelect = useCallback((item: any) => {
        const selection = item.selection;
        setDateRangeState([selection]);
        if (selection.startDate && selection.endDate) {
            handleDateRangeChange(formatDateToYMD(selection.startDate), formatDateToYMD(selection.endDate));
        }
    }, [handleDateRangeChange]);

    const handleClearDateRange = useCallback(() => {
        setDateRangeState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        setShowDatePicker(false);
        handleDateRangeChange('', '');
    }, [handleDateRangeChange]);

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

    const statusTypeOptions = [
        { value: 'Pending Approval', label: 'Pending Approval' },
        { value: 'Pending Fulfillment', label: 'Pending Fulfillment' },
        { value: 'Pending Receipt', label: 'Pending Receipt' },
        { value: 'Partially Fulfilled', label: 'Partially Fulfilled' },
        { value: 'Received', label: 'Received' },
        { value: 'Pending Receipt/Partially Fulfilled', label: 'Pending Receipt/Partially Fulfilled' },
    ];

    const columns: TableColumn<TransferOrderListItem>[] = [
        {
            name: 'Document Number',
            selector: row => row.tranid || '-',
            cell: row => (<>
                <Link
                    to={`/netsuite/transfer-orders/edit/${row.netsuite_id || row.id}`}
                    className="absolute inset-0"
                />
                <div className="items-center py-2">
                    <div className="font-medium text-gray-900">{row.tranid || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatTanggal(row.tran_date || '-')}</div>
                </div>
            </>),
            wrap: true,
            width: '230px',
            pinned: 'left',
        },
        {
            name: 'From Location',
            selector: row => row.from_location_name || '-',
            wrap: true,
            width: '260px',
        },
        {
            name: 'To Location',
            selector: row => row.to_location_name || '-',
            wrap: true,
            width: '260px',
        },
        {
            name: 'Status',
            selector: row => row.status_name || row.status_code || '-',
            cell: row => (
                <div className="items-center capitalize">
                    {row.status_name ? (
                        <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                            {row.status_name}
                        </span>
                    ) : '-'}
                </div>
            ),
            center: true,
            width: '280px'
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
        {
            id: 'created_by',
            name: 'Created By',
            selector: row => row.netsuite_id || row.id,
            cell: row => (<>
                <Link
                    to={`/netsuite/transfer-orders/edit/${row.netsuite_id || row.id}`}
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
                        TO ID: {row.netsuite_id || '-'}
                    </span>
                </div>
            </>),
            wrap: true,
            width: '320px'
        },
        createByDateColumn('Updated By', 'updated_at', 'updated_by_name', '320px'),
        createActionsColumn([
            {
                icon: MdOutlineSync,
                onClick: handleSyncById,
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Sync this TO',
                permission: 'read',
            }
        ]),
    ];
    const getDateRangeDisplayText = (): string => {
        if (filterStartDate && filterEndDate) {
            return `${moment(filterStartDate).format('DD MMM YYYY')} - ${moment(filterEndDate).format('DD MMM YYYY')}`;
        }
        return 'Select Date Range';
    };
    const SearchAndFilters = useMemo(() => (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Search TO Number / Memo... (Press Enter)"
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
                        className="h-10.5 px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 relative"
                        size="sm"
                    >
                        <MdFilterListAlt className="w-4 h-4 mr-2" />
                        Filter
                        {/* {activeFilterCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                                {activeFilterCount}
                            </span>
                        )} */}
                        {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
                            <CustomAsyncSelect
                                name="filter_location"
                                value={selectedLocationFilter}
                                onChange={(opt) => {
                                    setSelectedLocationFilter(opt);
                                    handleFilterChange('location', opt?.value || '');
                                }}
                                defaultOptions={locationOptions}
                                loadOptions={handleLocationInputChange}
                                onMenuScrollToBottom={handleLocationMenuScrollToBottom}
                                isLoading={locationPagination.loading}
                                inputValue={locationInputValue}
                                onInputChange={handleLocationInputChange}
                                placeholder="All Locations"
                                isClearable={true}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                            <CustomAsyncSelect
                                name="filter_transferlocation"
                                value={selectedTransferLocationFilter}
                                onChange={(opt) => {
                                    setSelectedTransferLocationFilter(opt);
                                    handleFilterChange('transferlocation', opt?.value || '');
                                }}
                                defaultOptions={transferLocationOptions}
                                loadOptions={handleTransferLocationInputChange}
                                onMenuScrollToBottom={handleTransferLocationMenuScrollToBottom}
                                isLoading={transferLocationPagination.loading}
                                inputValue={transferLocationInputValue}
                                onInputChange={handleTransferLocationInputChange}
                                placeholder="All Locations"
                                isClearable={true}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <CustomSelect
                                options={statusTypeOptions}
                                value={statusTypeOptions.find(option => option.value === filterStatus) || null}
                                onChange={(option) => handleFilterChange('status_name', option?.value || '')}
                                placeholder="Select status_name"
                                isClearable={false}
                                isSearchable={false}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <div className="relative" ref={datePickerRef}>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-h-[43px] flex items-center justify-between"
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                >
                                    <div className="flex items-center gap-2">
                                        <MdDateRange className="text-gray-400" />
                                        <span className={`${filterStartDate && filterEndDate
                                            ? 'text-gray-900'
                                            : 'text-gray-500'
                                            }`}>
                                            {getDateRangeDisplayText()}
                                        </span>
                                    </div>
                                    {filterStartDate && filterEndDate && (
                                        <MdClear
                                            className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClearDateRange();
                                            }}
                                        />
                                    )}
                                </div>

                                {showDatePicker && (
                                    <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <DateRange
                                            editableDateInputs={true}
                                            onChange={handleDateRangeSelect}
                                            moveRangeOnFirstSelection={false}
                                            ranges={dateRangeState}
                                            direction="horizontal"
                                            rangeColors={['#0253a5']}
                                            color="#0253a5"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* {activeFilterCount > 0 && ( */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                        <Button
                            onClick={() => {
                                setSelectedLocationFilter(null);
                                setSelectedTransferLocationFilter(null);
                                handleClearAllFilters();
                            }}
                            className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                            size="sm"
                        >
                            <MdClear className="w-4 h-4 mr-1" />
                            Clear All
                        </Button>
                    </div>
                    {/* )} */}
                </div>
            )}
        </>
    ), [searchValue, sortOrder, filterLocation, filterTransferLocation, filterStatus, activeFilterCount, showAdvancedFilters, locationOptions, transferLocationOptions, selectedLocationFilter, selectedTransferLocationFilter, showDatePicker, dateRangeState, filterStartDate, filterEndDate, handleDateRangeSelect, handleClearDateRange]);

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
                            data={transferOrders}
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
                            // onRowClicked={(row) => navigate(`/netsuite/transfer-orders/edit/${row.netsuite_id || row.id}`)}
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
