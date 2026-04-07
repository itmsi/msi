import { useCallback, useMemo, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { useInvoiceSalesOrder } from './hooks/useInvoiceSalesOrder';
import Badge from '@/components/ui/badge/Badge';
import { formatCurrencyID } from '@/helpers/generalHelper';
import { MdClear, MdSearch, MdVisibility, MdEdit, MdFileDownload } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { InvoiceSalesOrder } from './types/invoiceSalesOrder';
import { FakturService } from './services/fakturService';
import toast from 'react-hot-toast';
import Button from '@/components/ui/button/Button';

import { generateFakturXML } from './utils/fakturExportUtils';

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
    const {
        invoiceSalesOrders,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
    } = useInvoiceSalesOrder();

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

    const columns: TableColumn<InvoiceSalesOrder>[] = [
        {
            name: 'SiId',
            selector: row => row.id || '-',
            wrap: true,
            width: '100px',
        },
        {
            name: 'Subsidiary',
            selector: row => row.subsidiary_display || row.subsidiary || '-',
            wrap: true,
            width: '180px',
        },
        {
            name: 'Document Number',
            selector: row => row.tranid || '-',
            wrap: true,
            width: '180px',
        },
        {
            name: 'Customer Name',
            selector: row => row.entityid || row.entity || '-',
            wrap: true,
            width: '200px',
        },
        {
            name: 'Status',
            selector: row => row.approvalstatus || '-',
            cell: row => {
                let statusLabel = row.approvalstatus;
                let color: 'info' | 'success' | 'warning'| 'error' | 'ghost' = 'info';
                
                if (row.approvalstatus === '1') { statusLabel = 'Paid In Full'; color = 'success'; }
                if (row.approvalstatus === '2') { statusLabel = 'Pending Approval'; color = 'warning'; }
                if (row.approvalstatus === '3') { statusLabel = 'Rejected'; color = 'error'; }

                return (
                    <div className="items-center capitalize">
                        <Badge color={color} variant="light">
                            {statusLabel || '-'}
                        </Badge>
                    </div>
                );
            },
            width: '160px',
        },
        {
            name: 'Invoice Date',
            selector: row => row.trandate || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-500">{row.trandate || '-'}</div>
                </div>
            ),
            wrap: true,
            width: '120px',
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
            width: '180px',
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
            width: '200px',
        },
        {
            name: 'Modified Date',
            selector: row => row.lastmodifieddate || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-500">
                        {row.lastmodifieddate || '-'}
                    </div>
                </div>
            ),
            wrap: true,
            width: '180px',
        },
        {
            name: 'Modified By',
            selector: row => row.lastmodifiedby_display || row.lastmodifiedby || '-',
            wrap: true,
            width: '180px',
        },
        createActionsColumn([
            {
                icon: MdVisibility,
                onClick: (row: InvoiceSalesOrder) => navigate(`/netsuite/invoice-sales-order/view/${row.tranid}`),
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'View Detail',
                permission: 'read',
            },
            {
                icon: MdEdit,
                onClick: (row: InvoiceSalesOrder) => navigate(`/netsuite/invoice-sales-order/edit/${row.fakture_id}`),
                className: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
                tooltip: 'Edit',
                permission: 'update',
            },
            {
                icon: MdFileDownload,
                onClick: (row: InvoiceSalesOrder) => exportRowAsXML(row),
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Export XML',
                permission: 'read',
            },
        ])
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
                        id="sort_by"
                        name="sort_by"
                        value={{ value: 'trandate', label: 'Date' }} // Static for now, can implement state similar to sortOrder
                        onChange={(selectedOption) => handleFilterChange('sort_by', selectedOption?.value || '')}
                        options={[{ value: 'trandate', label: 'Date' }, { value: 'tranid', label: 'Document ID' }]}
                        placeholder="Sort column"
                        isClearable={false}
                        isSearchable={false}
                        className="w-40"
                    />
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
                        className="w-40"
                    />
                </div>
            </div>
        );
    }, [searchValue, sortOrder, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange]);

    return (
        <>
            <PageMeta
                title="Invoice Sales Orders - Motor Sights International"
                description="Manage Invoice Sales Orders - Motor Sights International"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Invoice Sales Orders
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage Invoice Sales Orders and related information
                                </p>
                            </div>
                            <Button
                                onClick={handleExportSelected}
                                variant="outline"
                                className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                                disabled={loading || selectedRows.length === 0}
                            >
                                <MdFileDownload size={20} />
                                Export Selected (XML)
                            </Button>
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
