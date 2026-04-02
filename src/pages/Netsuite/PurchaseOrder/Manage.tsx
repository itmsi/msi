import { useCallback, useMemo } from 'react'
import { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrder } from './hooks/usePurchaseOrder';
// import Badge from '@/components/ui/badge/Badge';
import { formatCurrencyID, formatCurrencyZH, formatDateTime } from '@/helpers/generalHelper';
import { MdAdd, MdClear, MdSearch } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import CustomDataTable from '@/components/ui/table';
import { PurchaseOrderItem } from './types/purchaseorder';
// import ModalApproval from './components/ModalApproval';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';

export default function Manage() {
    const navigate = useNavigate();
    
    const {
        purchaseOrders,
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
    } = usePurchaseOrder();
    
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
            name: 'Date',
            selector: row => row.po_number || '-',
            cell: row => (<>
                <a
                    href={`/netsuite/purchase-order/edit/${row.po_id}`}
                    className="absolute inset-0"
                />
                
                <div className="items-center gap-3 py-2">
                    <div className="block text-sm text-gray-500">{formatDateTime(row.po_date)}</div>
                    <div className="font-medium text-gray-900">{row.po_number || '-'}</div>
                </div>
            </>),
            wrap: true,
        },
        {
            name: 'Name',
            selector: row => row.vendor_name || '-',
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.po_status || '-',
            cell: row => (
                <div className="items-center capitalize">
                    <StatusTypeBadge 
                        type={Number(row.approvalstatus) as 1 | 2 | 3} 
                    />
                </div>
            ),
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
        },
        {
            name: 'Currency',
            selector: row => row.currency_symbol || '-',
            wrap: true,
        },
        {
            name: 'Ammount',
            selector: row => row.po_number || '-',
            cell: row => (<>
                <div className="items-center gap-3 py-2">
                    <div className="block text-sm text-gray-500">
                        {row.currency_symbol === 'CNY' ? formatCurrencyZH(377233500.00) : formatCurrencyID(377233500.00)}
                    </div>
                    <div className="font-medium text-gray-900">{925693285650.00}</div>
                </div>
            </>),
            wrap: true,
        },
        // createActionsColumn([
        //     {
        //         icon: MdVerified,
        //         onClick: handleApproval,
        //         className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
        //         tooltip: 'Approve',
        //         permission: 'update'
        //     }
        // ])
        // {
        //     name: 'Updated By',
        //     selector: row => row.updated_by_name || '-',
        //     cell: row => (
        //         <div className="items-center gap-3 py-2">
        //             <div className="font-medium text-gray-900">{row.updated_by_name || '-'}</div>
        //             <div className="block text-sm text-gray-500">{formatDateTime(row.updated_at)}</div>
        //         </div>
        //     ),
        // }
    ];
    
    const SearchAndFilters = useMemo(() => {
        return (
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
        );
    }, [searchValue, sortOrder, statusFilter, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange]);

    return (
        <>
            <PageMeta
                title="Purchase Order - Motor Sights International"
                description="Manage Purchase Orders - Motor Sights International"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
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
                
                {/* Search & Filter */}
                <div className="bg-white shadow rounded-lg px-6 py-4">
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
