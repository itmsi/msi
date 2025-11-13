import React, { useMemo } from 'react';
import { MdAdd, MdEdit, MdSearch, MdPeople, MdClear, MdDeleteOutline } from 'react-icons/md';
import CustomDataTable from '../../../components/ui/table/CustomDataTable';
import Input from '../../../components/form/input/InputField';
import CustomSelect from '../../../components/form/select/CustomSelect';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { tableDateFormat } from '@/helpers/generalHelper';
import { createActionsColumn, createDateColumn } from '@/components/ui/table';
import { useNavigate } from 'react-router';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { TermCondition } from './types/termcondition';
import { useTermConditionManagement } from './hooks/useTermConditionManagement';

const ManageTermCondition: React.FC = () => {
    const navigate = useNavigate();
    // Custom hook untuk semua state management dan handlers
    const {
        searchTerm,
        sortOrder,
        termConditions,
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
        handleDelete,
        confirmDeleteTermConditions,
        cancelDelete
    } = useTermConditionManagement();

    // Definisi kolom untuk DataTable
    const columns: TableColumn<TermCondition>[] = [
        {
            name: 'Title',
            selector: row => row.term_content_title,
            cell: (row) => {
                return (
                    <div className="max-w-xs truncate text-sm text-gray-700" title={row.term_content_title}>
                        {row.term_content_title}
                    </div>
                );
            },
            wrap: true,
            sortable: true,
        },
        createDateColumn('Created At', 'created_at', tableDateFormat),
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEdit,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDelete,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];

    // Search and filter component
    const SearchAndFilters = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search term conditions..."
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
    ), [searchTerm, sortOrder, loading, termConditions.length, handleSearchChange, handleManualSearch, handleClearFilters, handleFilterChange]);
    return (
        <>
            <PageMeta
                title="Manage Accessories - Motor Sights International"
                description="Manage Accessories - Motor Sights International"
                image="/motor-sights-international.png"
            />
            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Manage Term & Conditions</h3>
                            <p className="mt-1 text-sm text-gray-500">Manage and organize your term & conditions templates</p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={() => navigate('/quotation/term-condition/create')}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="h-4 w-4" />
                                Create New Template
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
                        data={termConditions}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.per_page || 10}
                        paginationDefaultPage={pagination?.current_page || 1}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handleRowsPerPageChange}
                        fixedHeader={true}
                        fixedHeaderScrollHeight="600px"
                        responsive
                        highlightOnHover
                        striped={false}
                        noDataComponent={
                            <div className="text-center py-8">
                                <MdPeople className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No term conditions found</p>
                                <p className="text-sm text-gray-400">
                                    {searchTerm ? 'Try adjusting your search' : 'Start by adding your first template'}
                                </p>
                            </div>
                        }
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
                onConfirm={confirmDeleteTermConditions}
                title="Delete Term Condition"
                message="Are you sure you want to delete this term condition template? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
};

export default ManageTermCondition;