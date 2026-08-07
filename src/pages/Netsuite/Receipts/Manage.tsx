import { useCallback, useMemo, useState } from 'react'
import { TableColumn } from 'react-data-table-component';
// import Badge from '@/components/ui/badge/Badge';
import { MdClear, MdSearch, MdOutlineSync, MdFilterListAlt, MdExpandLess, MdExpandMore } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable from '@/components/ui/table';
import { getProfile, formatTanggal, formatDateTime } from '@/helpers/generalHelper';
import { LoadingOverlay } from '@/components/common/Loading';
import { useReceipt } from './hooks/useReceipt';
import { ReceiptItem } from './types/receipt';
import Button from '@/components/ui/button/Button';
import PageHeaderManage from '@/components/common/PageHeaderManage';

const SOURCE_TYPE_OPTIONS = [
    { value: 'purchase_order', label: 'Purchase Order' },
    { value: 'transfer_order', label: 'Transfer Order' },
    { value: 'customer_return', label: 'Customer Return' },
];

export default function Manage() {
    // const navigate = useNavigate();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    
    const {
        receipt,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        statusFilter,
        typeFilter,
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
        // handleSyncById,
        // handleDownloadInvoice,
    } = useReceipt(profileSSOId);
    
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


    const columns: TableColumn<ReceiptItem>[] = [
        {
            name: 'Internal id',
            selector: row => row.netsuite_id || '-',
            wrap: true,
            width: '140px',
            center: true,
        },
        {
            name: 'Date',
            selector: row => row.trandate || '-',
            cell: row => (
                <div className="items-center gap-3 py-2">
                    <div className="block text-sm text-gray-500">{formatTanggal(row.trandate)}</div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Document Number',
            selector: row => row.tranid || '-',
            wrap: true,
        },
        {
            name: 'Type',
            selector: row => row.source_type_display || '-',
            wrap: true,
            center: true,
        },
        {
            name: 'Name',
            selector: row => row.vendor_name || '-',
            wrap: true,
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
        }
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
                                type="text"
                                placeholder="Search project... (Press Enter)"
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
                        className="w-full"
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

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <CustomSelect
                                id="filter_source_type"
                                name="filter_source_type"
                                value={typeFilter ? SOURCE_TYPE_OPTIONS.find(o => o.value === typeFilter) || null : null}
                                onChange={(opt) => handleFilterChange('source_type', opt?.value || '')}
                                options={SOURCE_TYPE_OPTIONS}
                                placeholder="All Types"
                                isClearable={true}
                                isSearchable={true}
                            />
                        </div>
                    </div>
                    {activeFilterCount > 0 && (
                        <div className="mt-3 flex justify-end">
                            <Button
                                onClick={handleClearFilters}
                                size="sm"
                                className="bg-transparent border border-red-300 text-red-600 hover:bg-red-50"
                            >
                                <MdClear className="w-4 h-4 mr-1" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>);
    }, [searchValue, sortOrder, statusFilter, typeFilter, activeFilterCount, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, showAdvancedFilters, handleToggleFilter, handleClearFilters]);

    return (
        <>
            <PageMeta
                title="Purchase Order - Motor Sights International"
                description="Manage Purchase Orders - Motor Sights International"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Header */}
                <PageHeaderManage
                    title="Item Receipts"
                    subtitle="Manage Item Receipts"
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
                        
                        {loading ? (    
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <LoadingOverlay
                                        message="Loading data purchase order..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <CustomDataTable
                                columns={columns}
                                data={receipt}
                                loading={loading}
                                pagination
                                paginationServer
                                paginationTotalRows={pagination?.total || 0}
                                paginationPerPage={pagination?.limit || 10}
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
                        )}
                    </div>
                </div>
            </div>
        </>

    )
}
