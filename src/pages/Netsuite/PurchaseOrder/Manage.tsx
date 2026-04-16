import { useCallback, useMemo, useState } from 'react'
import { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrder } from './hooks/usePurchaseOrder';
// import Badge from '@/components/ui/badge/Badge';
import { MdAdd, MdClear, MdExpandLess, MdExpandMore, MdFilterListAlt, MdSearch, MdOutlineSync } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { PurchaseOrderItem } from './types/purchaseorder';
// import ModalApproval from './components/ModalApproval';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';
import { getProfile, formatCurrencyID, formatTanggal, formatDateTime } from '@/helpers/generalHelper';
import FilterSection from './components/FilterSection';
import { LoadingOverlay } from '@/components/common/Loading';
import { createByDateColumn } from '@/components/ui/table/columnUtils';
import { FaRegFilePdf } from 'react-icons/fa6';

export default function Manage() {
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    
    const {
        purchaseOrders,
        syncInfo,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        statusFilter,
        subsidiaryFilter,
        locationFilter,
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
        handleDownloadInvoice,
    } = usePurchaseOrder(profileSSOId);
    
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

    
    // const [isOpen, setIsOpen] = useState(false);
    // const [selectedPoId, setSelectedPoId] = useState<number | null>(null);

    // const handleApproval = (row: PurchaseOrderItem) => {
    //     setSelectedPoId(row.id);
    //     setIsOpen(true);
    // };

    const columns: TableColumn<PurchaseOrderItem>[] = [
        {
            name: 'PO ID',
            selector: row => row.po_id || '-',
            wrap: true,
            width: '100px'
        },
        {
            name: 'Subsidiary',
            selector: row => row.subsidiary_display || '-',
            wrap: true,
            width: '280px'
        },
        {
            name: 'Document Number',
            selector: row => row.po_number || '-',
            cell: row => (<>
                <a
                    href={`/netsuite/purchase-order/edit/${row.po_id}`}
                    className="absolute inset-0"
                />
                
                <div className="items-center gap-3 py-2">
                    <div className="block text-sm text-gray-500">{formatTanggal(row.po_date)}</div>
                    <div className="font-medium text-gray-900">{row.po_number || '-'}</div>
                </div>
            </>),
            wrap: true,
            width: '230px'
        },
        {
            name: 'Vendor Name',
            selector: row => row.vendor_name || '-',
            wrap: true,
            width: '350px'
        },
        {
            name: 'PR Number',
            selector: row => row.custbody_me_pr_number || '-',
            wrap: true,
            width: '200px',
            center: true
        },
        {
            name: 'Location',
            selector: row => row.location_display || '-',
            wrap: true,
            width: '220px',
            center: true,
            cell: row => (
                <div className="items-start capitalize w-full">
                    {row.location_display || '-'}
                </div>
            ),
        },
        {
            name: 'Next Approval',
            selector: row => Number(row.approvalstatus) === 1 ? row.nextapprover || '-' : '-',
            wrap: true,
            width: '220px',
            center: true
        },
        {
            name: 'Approval Status',
            selector: row => row.po_status || '-',
            cell: row => (
                <div className="items-center capitalize">
                    <StatusTypeBadge 
                        type={Number(row.approvalstatus) as 1 | 2 | 3} 
                        label={row.approvalstatus_display || undefined}
                    />
                </div>
            ),
            center: true,
            width: '200px'
        },
        {
            name: 'Status',
            selector: row => row.po_status || '-',
            cell: row => (
                <div className="items-center capitalize">
                    <span 
                        className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]`}
                    >
                        {row.po_status_label}
                    </span>
                    
                </div>
            ),
            center: true,
            width: '250px'
        },
        {
            name: 'Total Amount',
            selector: row => formatCurrencyID(row.total) || '-',
            wrap: true,
            width: '240px'
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
            width: '300px'
        },
        createByDateColumn('Updated By', 'last_modified', 'custbody_msi_createdby_api', '300px'),
        createActionsColumn([
            {
                icon: FaRegFilePdf,
                onClick: handleDownloadInvoice,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Download Invoice',
                permission: 'read',
            },
            {
                icon: MdOutlineSync,
                onClick: handleSyncById,
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Perbarui',
                width: '120px',
                title: 'Action',
            }
        ])
    ];
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const handleToggleFilter = () => {
        setShowAdvancedFilters(prev => !prev);
    };
    
    // Count active filters
    const activeFiltersCount = [subsidiaryFilter, locationFilter].filter(Boolean).length;
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
                        className={`h-[42px] px-4 py-2 ${activeFiltersCount > 0 ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300' : 'bg-transparent hover:bg-gray-300 text-gray-700'} border border-gray-300 relative`}
                        size="sm"
                    >
                        <MdFilterListAlt className="w-4 h-4 mr-2" />
                        Filter
                        {/* {activeFiltersCount > 0 && (
                            <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                                {activeFiltersCount}
                            </span>
                        )} */}
                        {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>
            
            {showAdvancedFilters && (
                <FilterSection
                    filterSubsidiary={subsidiaryFilter}
                    filterLocation={locationFilter}
                    filterStatus={statusFilter}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
            )}
        </>);
    }, [searchValue, sortOrder, statusFilter, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, showAdvancedFilters, handleToggleFilter, subsidiaryFilter, locationFilter, handleClearFilters, activeFiltersCount]);

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
                                    Purchase Orders
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage Purchase Orders and related information
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
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate('/netsuite/purchase-order/create')}
                                        className="flex items-center gap-2"
                                    >
                                        <MdAdd size={20} />
                                        <span>Create Purchase Order</span>
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
                                data={purchaseOrders}
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

                {/* <ModalApproval
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    poId={selectedPoId}
                    onSuccess={() => handleFilterChange('sort_order', sortOrder)}
                    submit={true}
                    titleModal="Submit Approval"
                    descriptionModal="Masukkan catatan untuk proses approval"
                /> */}
            </div>
        </>

    )
}
