import { useCallback, useMemo, useState } from 'react'
import { TableColumn } from 'react-data-table-component';
import { Link } from 'react-router-dom';
// import Badge from '@/components/ui/badge/Badge';
import { MdClear, MdSearch, MdOutlineSync } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable from '@/components/ui/table';
import { getProfile, formatTanggal, formatDateTime } from '@/helpers/generalHelper';
import { LoadingOverlay } from '@/components/common/Loading';
import { useReceipt } from './hooks/useReceipt';
import { ReceiptItem } from '../PurchaseOrder/types/purchaseorder';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';

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
            selector: row => row.receipt_id || '-',
            wrap: true,
            width: '140px',
            center: true,
        },
        {
            name: 'Date',
            selector: row => row.trandate || '-',
            cell: row => (<>
                <Link to={`/netsuite/purchase-order/${row.createdfrom}/receive/${row.receipt_id}`} className="absolute inset-0" />
                
                <div className="items-center gap-3 py-2">
                    <div className="block text-sm text-gray-500">{formatTanggal(row.trandate)}</div>
                </div>
            </>),
            wrap: true,
            width: '150px'
        },
        {
            name: 'Document Number',
            selector: row => row.tranid || '-',
            wrap: true,
            width: '180px'
        },
        {
            name: 'Name',
            selector: row => row.vendor_name || '-',
            wrap: true,
            width: '350px'
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
            width: '280px'
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
            </div>
            
        </>);
    }, [searchValue, sortOrder, statusFilter, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, showAdvancedFilters, handleToggleFilter, handleClearFilters]);

    return (
        <>
            <PageMeta
                title="Purchase Order - Motor Sights International"
                description="Manage Purchase Orders - Motor Sights International"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg mb-3">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Item Receips
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage Item Receipts and related information
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <PermissionGate permission="read">
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
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>
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
                                paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
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
