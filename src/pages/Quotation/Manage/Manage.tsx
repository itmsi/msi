import React, { useMemo } from 'react';
import { MdAdd, MdEdit, MdSearch, MdClear, MdVisibility, MdDeleteOutline } from 'react-icons/md';
import { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { useQuotationManagement } from './hooks/useQuotationManagement';
import { ManageQuotationItem } from './types/quotation';
import CustomDataTable from '../../../components/ui/table/CustomDataTable';
import Input from '../../../components/form/input/InputField';
import CustomSelect from '../../../components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { createActionsColumn, createDateColumn } from '@/components/ui/table';
import { tableDateFormat } from '@/helpers/generalHelper';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

const ManageQuotations: React.FC = () => {
    const navigate = useNavigate();
    
    const {
        searchTerm,
        sortOrder,
        quotations,
        pagination,
        loading,
        error,
        confirmDelete,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleView,
        handleDelete,
        confirmDeleteQuotations,
        cancelDelete,
    } = useQuotationManagement();

    // Helper function to format currency
    const formatCurrency = (value: number | string): string => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numValue);
    };

    // Helper function to render status badge
    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
        };

        const config = statusConfig[status.toLowerCase()] || statusConfig.draft;
        
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Define columns
    const columns = useMemo<TableColumn<ManageQuotationItem>[]>(
        () => [
            {
                name: 'Quotation No',
                selector: (row) => row.manage_quotation_no,
                cell: (row) => (
                    <span className="font-medium text-[#0253a5]">{row.manage_quotation_no}</span>
                ),
            },
            // {
            //     name: 'Customer',
            //     selector: (row) => row.customer_id,
            //     cell: (row) => (
            //         <span className="text-sm">{row.customer_id.substring(0, 20)}...</span>
            //     ),
            // },
            createDateColumn('Quotation Date', 'manage_quotation_date', tableDateFormat),
            createDateColumn('Valid Until', 'manage_quotation_valid_date', tableDateFormat),
            {
                name: 'Grand Total',
                selector: (row) => row.manage_quotation_grand_total,
                right: true,
                cell: (row) => (
                    <span className="font-semibold">{formatCurrency(row.manage_quotation_grand_total)}</span>
                ),
            },
            {
                name: 'Status',
                selector: (row) => row.status,
                cell: (row) => getStatusBadge(row.status),
                center: true,
            },
            createDateColumn('Created At', 'created_at', tableDateFormat),
            createActionsColumn([
                // {
                //     icon: MdVisibility,
                //     onClick: handleView,
                //     className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                //     tooltip: 'View',
                //     permission: 'read',
                // },
                // {
                //     icon: MdEdit,
                //     onClick: handleEdit,
                //     className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                //     tooltip: 'Edit',
                //     permission: 'update',
                // },
                {
                    icon: MdDeleteOutline,
                    onClick: handleDelete,
                    className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                    tooltip: 'Delete',
                    permission: 'delete'
                }
            ]),
        ],
        [handleView, handleEdit, handleDelete]
    );

    const SearchAndFilters = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search by quotation number, customer ID..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleManualSearch();
                                }
                            }}
                            className={`pl-10 py-2 w-full rounded-r-none ${searchTerm ? 'pr-10' : 'pr-4'}`}
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearFilters}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                type="button"
                            >
                                <MdClear className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button
                        onClick={handleManualSearch}
                        className="rounded-l-none px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 border-l-0"
                        size="sm"
                    >
                        <MdSearch className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            
            {/* Sort Order */}
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
        </div>
    ), [searchTerm, sortOrder, loading, quotations.length, handleSearchChange, handleManualSearch, handleClearFilters, handleFilterChange]);
    
    return (
        <>
            <PageMeta 
                title="Manage Quotations - Motor Sights International" 
                description="Manage Quotations - Motor Sights International"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-white shadow rounded-lg">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Manage Quotations</h3>
                            <p className="mt-1 text-sm text-gray-500">Manage and organize your quotation database</p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={() => navigate('/quotations/manage/create')}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="h-4 w-4" />
                                Create Quotation
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200">
                    {SearchAndFilters}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Data Table */}
                <div className="p-6 font-secondary">
                    <CustomDataTable
                        columns={columns}
                        data={quotations}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handleRowsPerPageChange}
                        fixedHeader={true}
                        fixedHeaderScrollHeight="600px"
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        borderRadius="8px"
                        onRowClicked={handleEdit}
                    />
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={cancelDelete}
                onConfirm={confirmDeleteQuotations}
                title="Delete Quotation"
                message="Are you sure you want to delete this quotation? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
};

export default ManageQuotations;
