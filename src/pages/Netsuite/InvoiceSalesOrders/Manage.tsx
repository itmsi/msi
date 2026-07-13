import { useCallback, useMemo, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { useInvoiceSalesOrder } from './hooks/useInvoiceSalesOrder';
import { formatCurrencyID, formatDateTime } from '@/helpers/generalHelper';
import { MdClear, MdSearch, MdEdit, MdFilterListAlt, MdExpandLess, MdExpandMore, MdOutlineSync, MdDoneAll } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import Switch from '@/components/form/switch/Switch';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { InvoiceSalesOrder } from './types/invoiceSalesOrder';
import { FakturService } from './services/fakturService';
import toast from 'react-hot-toast';
import Button from '@/components/ui/button/Button';
import { generateFakturXML } from './utils/fakturExportUtils';
import FilterSection from './components/FilterSection';
import { BsFiletypeXml } from 'react-icons/bs';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';
import PageHeaderManage from '@/components/common/PageHeaderManage';

// Helper: export single invoice row as XML
const exportRowAsXML = async (row: InvoiceSalesOrder) => {
    if (!row.fakture_id) {
        toast.error('Data Faktur tidak ditemukan untuk invoice ini');
        return;
    }

    const toastId = toast.loading('Sedang menyiapkan data faktur...');
    try {
        const response = await FakturService.getFakturById(row.fakture_id);
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Gagal mengambil data faktur');
        }

        const xmlContent = generateFakturXML([{ faktur: response.data, row }]);
        const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `faktur_${row.tranid || row.id}.xml`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Faktur ${row.tranid} berhasil diekspor ke XML`, { id: toastId });
    } catch (error: any) {
        console.error('Export XML failed:', error);
        toast.error(`Gagal ekspor XML: ${error.message}`, { id: toastId });
    }
};

export default function Manage() {
    const navigate = useNavigate();
    const [selectedRows, setSelectedRows] = useState<InvoiceSalesOrder[]>([]);
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [statusChanges, setStatusChanges] = useState<Record<string, boolean>>({});
    const {
        invoiceSalesOrders,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        filterApprovalStatus,
        filterStartDate,
        filterEndDate,
        filterSubsidiary,
        filterImportStatus,
        activeFilterCount,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
        handleClearAllFilters,
        isSyncing,
        syncInfo,
        handleSync,
        fetchInvoiceSalesOrders,
    } = useInvoiceSalesOrder();

    const handleBulkUpdateStatus = async () => {
        const changesArray = Object.entries(statusChanges).map(([id, status]) => ({ id, status }));
        if (changesArray.length === 0) {
            toast.error('Tidak ada perubahan status untuk diupdate');
            return;
        }

        const toastId = toast.loading(`Mengupdate status ${changesArray.length} faktur...`);
        try {
            await FakturService.bulkUpdateStatusFaktur(changesArray);
            toast.success(`${changesArray.length} Status Faktur berhasil diupdate`, { id: toastId });
            setStatusChanges({});
            fetchInvoiceSalesOrders();
        } catch (error: any) {
            console.error('Bulk update status failed:', error);
            toast.error(`Gagal update status: ${error.message}`, { id: toastId });
        }
    };
    
    const handleExportSelected = async () => {
        if (!selectedRows || selectedRows.length === 0) {
            toast.error('Tidak ada data terpilih untuk diekspor');
            return;
        }

        const invoicesWithFaktur = selectedRows.filter((row: InvoiceSalesOrder) => row.fakture_id);
        if (invoicesWithFaktur.length === 0) {
            toast.error('Tidak ada data Faktur yang valid dari pilihan Anda');
            return;
        }

        const toastId = toast.loading(`Mengekspor ${invoicesWithFaktur.length} data faktur ke XML...`);
        try {
            const fakturPromises = invoicesWithFaktur.map((row: InvoiceSalesOrder) => 
                FakturService.getFakturById(row.fakture_id).then(res => ({ res, row }))
            );
            
            const results = await Promise.all(fakturPromises);
            const successfulFakturs = results
                .filter(({ res }: { res: any }) => res.success && res.data)
                .map(({ res, row }: { res: any, row: InvoiceSalesOrder }) => ({ faktur: res.data, row }));

            if (successfulFakturs.length === 0) {
                throw new Error('Gagal mengambil data faktur untuk semua invoice terpilih');
            }

            const xmlContent = generateFakturXML(successfulFakturs);
            const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `faktur_bulk_${new Date().getTime()}.xml`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            // Clear selection after successful export
            setClearSelectedRows(!clearSelectedRows);
            setSelectedRows([]);
            
            toast.success(`${successfulFakturs.length} Faktur berhasil diekspor ke XML`, { id: toastId });
        } catch (error: any) {
            console.error('Export selected XML failed:', error);
            toast.error(`Gagal ekspor XML terpilih: ${error.message}`, { id: toastId });
        }
    };
    
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



    const handleSingleToggle = (row: InvoiceSalesOrder, checked: boolean) => {
        setStatusChanges(prev => {
            const next = { ...prev };
            if (!!row.status_faktur === checked) {
                delete next[row.fakture_id];
            } else {
                next[row.fakture_id] = checked;
            }
            return next;
        });
    };



    const columns: TableColumn<InvoiceSalesOrder>[] = [
        {
            name: 'Document Number',
            selector: row => row.tranid || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="font-medium text-gray-900">{row.tranid || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatDateTime(row.trandate || '-')}</div><div className="text-xs text-gray-500">
                        SI ID: {row.id || '-'}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: '180px',
            pinned: 'left',
        },
        {
            name: 'Import Status',
            selector: row => (statusChanges[row.fakture_id] ?? row.status_faktur) ? 'Imported' : 'Not Imported',
            cell: row => (
                <div className="items-center py-2">
                    {row.fakture_id ? (
                        <div onClick={e => e.stopPropagation()} className="flex flex-col mt-1">
                            <Switch
                                label=""
                                checked={statusChanges[row.fakture_id] ?? !!row.status_faktur}
                                onChange={(checked) => handleSingleToggle(row, checked)}
                                showStatusText={false}
                            />
                            <span className={`mt-1 ${(statusChanges[row.fakture_id] ?? row.status_faktur) ? 'text-green-600' : 'text-gray-500'} font-medium italic text-xs`}>
                                {(statusChanges[row.fakture_id] ?? row.status_faktur) ? 'Imported' : 'Not Imported'}
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 italic text-xs">No Faktur Data</span>
                    )}
                </div>
            ),
            wrap: true,
            minWidth: '170px',
        },
        {
            name: 'Subsidiary',
            selector: row => row.subsidiary_display || row.subsidiary || '-',
            wrap: true,
            width: '350px'
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
            width: '300px'
        },
        {
            name: 'Tx Date Faktur',
            selector: row => row.tanggal_faktur || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-500">
                        {formatDateTime(row.tanggal_faktur || '-')}
                    </div>
                </div>
            ),
            wrap: true,
            minWidth: '150px',
        },
        {
            name: 'Customer Name',
            selector: row => row.entityid || row.entity || '-',
            cell: row => {
                const isInvalid = !row.no_tax_buyer || row.no_tax_buyer === '0000000000000000';
                return (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-900">
                        {row.entityid || row.entity || '-'}
                    </div>
                     {isInvalid ? (
                            <span className="text-red-500 font-medium italic text-xs">
                                TKU ID not filled
                            </span>
                        ) : (
                            <span className="text-sm text-gray-500">{row.no_tax_buyer}</span>
                        )}
                </div>
                );
            },
            wrap: true,
            width: '350px'
        },
        {
            name: 'Status',
            selector: row => row.approvalstatus || '-',
            cell: row => {
                return (
                <div className="items-center capitalize">
                    {row.approvalstatus ? (
                        <StatusTypeBadge
                            type={Number(row.approvalstatus) as 1 | 2 | 3} 
                            label={row.approvalstatus_display || undefined}
                        />
                        ) : '-'}
                </div>
                );
            },
            center: true,
            minWidth: '160px',
        },
        {
            name: 'Total Amount',
            selector: row => {
                const amount = row.lines && row.lines.length > 0
                    ? row.lines.reduce((sum, line) => sum + (Number(line.netamount) || 0) + (Number(line.taxamount) || 0), 0)
                    : 0;
                const exRate = Number(row.exchangerate) || 1;
                return (amount * exRate).toString();
            },
            cell: row => {
                const amount = row.lines && row.lines.length > 0
                    ? row.lines.reduce((sum, line) => sum + (Number(line.netamount) || 0) + (Number(line.taxamount) || 0), 0)
                    : 0;

                const exRate = Number(row.exchangerate) || 1;
                const baseAmount = amount * exRate;

                return (
                    <div className="items-center py-2">
                        <div className="block text-sm text-gray-500 max-w-full">
                            {formatCurrencyID(baseAmount)}
                        </div>
                    </div>
                );
            },
            wrap: true,
            minWidth: '180px',
        },
        {
            name: 'Modified Date',
            selector: row => row.faktur_updated_at || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block capitalize font-medium text-gray-900">{row.faktur_updated_by_name || '-'}</div>
                    <div className="block text-sm text-gray-500">
                        {formatDateTime(row.faktur_updated_at || '-')}
                    </div>
                    <span className="text-xs text-gray-500">
                        SI ID: {row.id || '-'}
                    </span>
                </div>
            ),
            wrap: true,
            minWidth: '180px',
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: (row: InvoiceSalesOrder) => navigate(`/netsuite/invoice-sales-order/edit/${row.fakture_id}`),
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update',
            },
            {
                icon: BsFiletypeXml,
                onClick: (row: InvoiceSalesOrder) => exportRowAsXML(row),
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Download XML',
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
                                placeholder="Search Document No... (Press Enter)"
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
                    filterImportStatus={filterImportStatus}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearAllFilters}
                />
            )}
            </>
        );
    }, [searchValue, sortOrder, filterApprovalStatus, filterStartDate, filterEndDate, filterSubsidiary, filterImportStatus, activeFilterCount, showAdvancedFilters, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange, handleToggleFilter, handleClearAllFilters]);

    return (
        <>
            <PageMeta
                title="Sales Invoice - Motor Sights International"
                description="Manage Sales Invoice - Motor Sights International"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Header */}
                <PageHeaderManage
                    title="Sales Invoice"
                    subtitle="Manage Sales Invoice"
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
                            key: 'save_status',
                            element: (
                                <Button
                                    onClick={handleBulkUpdateStatus}
                                    variant="outline"
                                    className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                                    disabled={loading || Object.keys(statusChanges).length === 0}
                                >
                                    <MdDoneAll size={20} />
                                    Save Status ({Object.keys(statusChanges).length})
                                </Button>
                            )
                        },
                        {
                            key: 'download_xml',
                            element: (
                                <Button
                                    onClick={handleExportSelected}
                                    variant="outline"
                                    className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                                    disabled={loading || selectedRows.length === 0}
                                >
                                    <BsFiletypeXml size={20} />
                                    Download Selected (XML)
                                </Button>
                            )
                        }
                    ]}
                />

                {syncInfo && (
                    <span className="block text-xs text-green-600 pe-6 text-end mb-0">
                        Last Sync: {formatDateTime(syncInfo.created_at)} by {syncInfo.created_by_name}
                    </span>
                )}
                
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
                            data={invoiceSalesOrders}
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
                            selectableRows={true}
                            onSelectedRowsChange={(state) => setSelectedRows(state.selectedRows)}
                            clearSelectedRows={clearSelectedRows}
                            responsive
                            highlightOnHover
                            onRowClicked={(row) => navigate(`/netsuite/invoice-sales-order/view/${row.tranid}`)}
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
