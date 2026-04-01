import { useCallback, useMemo } from 'react';
import { TableColumn } from 'react-data-table-component';
import { useInvoiceSalesOrder } from './hooks/useInvoiceSalesOrder';
import Badge from '@/components/ui/badge/Badge';
import { formatCurrencyID, formatCurrencyZH, parseNetsuiteDate, formatDateTime} from '@/helpers/generalHelper';
import { MdClear, MdSearch } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable from '@/components/ui/table';
import { InvoiceSalesOrder } from './types/invoiceSalesOrder';

export default function Manage() {
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
            name: 'Date',
            selector: row => row.trandate || '-',
            cell: row => (
                <div className="items-center py-2">
                    <div className="block text-sm text-gray-500">{formatDateTime(parseNetsuiteDate(row.trandate))}</div>
                </div>
            ),
            wrap: true,
            width: '120px',
        },
        {
            name: 'Document Number',
            selector: row => row.tranid || '-',
            wrap: true,
            width: '180px',
        },
        {
            name: 'Name',
            selector: row => row.entityid || row.entity || '-',
            wrap: true,
            width: '200px',
        },
        {
            name: 'Account',
            selector: row => row.account_display || row.account || '-',
            wrap: true,
            width: '150px',
        },
        {
            name: 'PO/Check Number',
            selector: row => row.otherrefnum || '-',
            wrap: true,
            width: '180px',
        },
        {
            name: 'Status',
            selector: row => row.approvalstatus || '-',
            cell: row => {
                let statusLabel = row.approvalstatus;
                let color: 'info' | 'success' | 'warning'| 'error' | 'ghost' = 'info';
                
                if (row.approvalstatus === '1') { statusLabel = 'Paid In Full'; color = 'success'; }
                if (row.approvalstatus === '2') { statusLabel = 'Pending Approval / Open'; color = 'warning'; }
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
            name: 'Memo',
            selector: row => row.memo || '-',
            wrap: true,
            width: '200px',
        },
        {
            name: 'Currency',
            selector: row => row.currency_display || row.currency || '-',
            wrap: true,
            width: '100px',
        },
        {
            name: 'Amount (Foreign Currency)',
            selector: row => {
                const amount = row.lines && row.lines.length > 0
                    ? row.lines.reduce((sum, line) => sum + (line.grossamt || 0), 0)
                    : 0;
                return amount.toString();
            },
            cell: row => {
                const amount = row.lines && row.lines.length > 0
                    ? row.lines.reduce((sum, line) => sum + (line.grossamt || 0), 0)
                    : 0;

                return (
                    <div className="items-center py-2">
                        <div className="block text-sm text-gray-500 max-w-full">
                            {row.currency === 'CNY' || row.currency === 'Yuan' || row.currency_display === 'CNY' || row.currency_display === 'Yuan' ? formatCurrencyZH(amount) : formatCurrencyID(amount)}
                        </div>
                    </div>
                );
            },
            wrap: true,
            width: '220px',
        },
        {
            name: 'Amount',
            selector: row => {
                const amount = row.lines && row.lines.length > 0
                    ? row.lines.reduce((sum, line) => sum + (line.grossamt || 0), 0)
                    : 0;
                return amount.toString();
            },
            cell: row => {
                const amount = row.lines && row.lines.length > 0
                    ? row.lines.reduce((sum, line) => sum + (line.grossamt || 0), 0)
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
            width: '200px',
        },
        {
            name: 'ME - Related Invoice',
            selector: row => row.custbody_me_related_fulfillment || '-',
            wrap: true,
            width: '200px',
        },
        {
            name: 'MSI - Bank Payment',
            selector: row => row.custbody_msi_bank_payment_so_display || row.custbody_msi_bank_payment_so || '-',
            wrap: true,
            width: '200px',
        },
        {
            name: 'Created By',
            selector: row => row.custbody_me_wf_created_by_display || row.custbody_me_wf_created_by || '-',
            wrap: true,
            width: '150px',
        }
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
