import Button from "@/components/ui/button/Button";
import { useDepartment, useCompany } from "@/hooks/useAdministration";
import { useConfirmation } from "@/hooks/useConfirmation";
import { MdEdit, MdDeleteOutline, MdAdd, MdSearch } from "react-icons/md";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import CustomSelect from "@/components/form/select/CustomSelect";
import { Modal } from "@/components/ui/modal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Department } from "@/types/administration";
import { createActionsColumn, createDateColumn } from "@/components/ui/table/columnUtils";
import { useEffect, useState } from "react";
import { PermissionGate } from "@/components/common/PermissionComponents";

export default function ManageDepartment() {
    const {
        // State
        loading,
        departments,
        pagination,
        filters,
        isModalOpen,
        editingDepartment,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddDepartment,
        handleEditDepartment,
        handleDeleteDepartment,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchDepartments,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
    } = useDepartment();

    // Company hook for dropdown options
    const {
        companies,
        fetchCompanies
    } = useCompany();

    // State for company options
    const [companyOptions, setCompanyOptions] = useState<Array<{value: string, label: string}>>([]);

    // Load companies when modal opens
    useEffect(() => {
        if (isModalOpen) {
            fetchCompanies(1, 100); // Fetch first 100 companies for dropdown
        }
    }, [isModalOpen, fetchCompanies]);

    // Update company options when companies data changes
    useEffect(() => {
        if (companies.length > 0) {
            const options = companies.map(company => ({
                value: company.company_id,
                label: company.company_name
            }));
            setCompanyOptions(options);
        }
    }, [companies]);

    // Confirmation modal for delete operations
    const { showConfirmation, ...confirmationState } = useConfirmation();

    // Enhanced delete handler with confirmation
    const handleDeleteWithConfirmation = async (department: Department) => {
        const confirmed = await showConfirmation({
            title: 'Delete Department',
            message: `Are you sure you want to delete the department "${department.department_name}"? This action cannot be undone.`,
            confirmText: 'Delete Department',
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            await handleDeleteDepartment(department.department_id);
        }
    };

    const tableDateFormat = {
        day: '2-digit' as const,
        month: 'short' as const,
        year: 'numeric' as const
    }

    // Department columns for DataTable
    const departmentColumns: TableColumn<Department>[] = [
        {
            name: 'Department Name',
            selector: (row: Department) => row.department_name,
        },
        {
            name: 'Company',
            selector: (row: Department) => row.company_name,
            center: true,
        },
        createDateColumn('Created At', 'created_at', tableDateFormat),
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEditDepartment,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDeleteWithConfirmation,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];

    // Get sort options
    const sortOptions = [
        { value: 'created_at', label: 'Created Date' },
        { value: 'department_name', label: 'Department Name' },
        { value: 'company_name', label: 'Company Name' },
    ];

    const sortOrderOptions = [
        { value: 'desc', label: 'Descending' },
        { value: 'asc', label: 'Ascending' }
    ];

    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Department Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage department information and hierarchy
                            </p>
                        </div>

                        <PermissionGate permission="create">
                            <Button
                                onClick={handleAddDepartment}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="w-5 h-5" />
                                Add Department
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Search departments or company..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="w-80 flex-none items-center gap-2">
                            <CustomSelect
                                options={sortOptions}
                                value={sortOptions.find(option => option.value === filters.sort_by) || null}
                                onChange={(option) => handleFilterChange('sort_by', option?.value || '')}
                                placeholder="Sort by"
                                isClearable={false}
                                isSearchable={false}
                                className="font-secondary"
                            />
                        </div>
                        <div className="w-50 flex-none items-center gap-2">
                            <CustomSelect
                                options={sortOrderOptions}
                                value={sortOrderOptions.find(option => option.value === filters.sort_order) || null}
                                onChange={(option) => handleFilterChange('sort_order', option?.value || '')}
                                placeholder="Sort order"
                                isClearable={false}
                                isSearchable={false}
                                className="font-secondary"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="p-6 font-secondary">
                    {/* {(filters.search || filters.sort_by || filters.sort_order) && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-blue-700">
                                    <MdSearch className="w-4 h-4" />
                                    <span className="font-medium">Active filters:</span>
                                    {filters.search && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Search: "{filters.search}"
                                        </span>
                                    )}
                                    {filters.sort_by && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Sort: {filters.sort_by === 'company_name' ? 'Company Name' : 
                                                filters.sort_by === 'created_at' ? 'Created Date' : 
                                                filters.sort_by === 'department_name' ? 'Department Name' : 
                                                'Company Order'}
                                            {filters.sort_order && ` (${filters.sort_order === 'asc' ? 'Ascending' : 'Descending'})`}
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    size="sm"
                                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                                >
                                    Clear all
                                </Button>
                            </div>
                        </div>
                    )} */}

                    <CustomDataTable
                        columns={departmentColumns}
                        data={departments}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.per_page || 10}
                        paginationDefaultPage={pagination?.current_page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            // Fetch departments with new per_page limit and reset to page 1
                            fetchDepartments(1, newPerPage);
                        }}
                        responsive
                        highlightOnHover
                        striped
                    />
                </div>
            </div>

            {/* Department Modal */}
            <Modal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                className="max-w-xl"
                title={`${editingDepartment ? 'Edit Department' : 'Add New Department'}`}
                description={editingDepartment ? 'Update department information' : 'Fill in the details to create a new department'}
            >
                <div className="p-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        {/* Department Name */}
                        <div className="mb-4">
                            <Label htmlFor="department_name">Department Name*</Label>
                            <Input
                                id="department_name"
                                type="text"
                                value={formData.department_name}
                                onChange={(e) => handleInputChange('department_name', e.target.value)}
                                error={!!validationErrors.department_name}
                                placeholder="Enter department name"
                            />
                            {validationErrors.department_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.department_name}
                                </p>
                            )}
                        </div>

                        {/* Company Selection */}
                        <div className="mb-4">
                            <Label htmlFor="company_id">Company*</Label>
                            <CustomSelect
                                options={companyOptions}
                                value={companyOptions.find(option => option.value === formData.company_id) || null}
                                onChange={(option) => handleInputChange('company_id', option?.value || '')}
                                placeholder="Select a company..."
                                isLoading={loading}
                                isClearable={false}
                            />
                            {validationErrors.company_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.company_id}
                                </p>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                disabled={loading}
                                className="rounded-[50px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                className={`min-w-[100px] rounded-[50px] ${
                                    Object.keys(validationErrors).length > 0 
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                            >
                                {loading ? 'Saving...' : editingDepartment ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal {...confirmationState.modalProps} />
        </>
    );
}