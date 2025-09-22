import Button from "@/components/ui/button/Button";
import { useRole } from "@/hooks/useAdministration";
import { MdEdit, MdDeleteOutline, MdAdd, MdSearch } from "react-icons/md";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import CustomSelect from "@/components/form/select/CustomSelect";
import { Modal } from "@/components/ui/modal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Role } from "@/types/administration";
import { useEffect, useState } from "react";
import { createActionsColumn, createDateColumn, createSerialNumberColumn } from "@/components/ui/table";
import { tableDateFormat } from "@/helpers/generalHelper";

export default function ManageRole() {
    const {
        // State
        roles,
        pagination,
        isLoading,
        formData,
        filters,
        validationErrors,
        confirmDelete,
        showForm,
        editingRole,

        // Actions
        setFormData,
        deleteRole,
        handleEdit,
        handleDelete,
        handleSubmit,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        clearFilters,
        handleAddRole,
        closeForm,
        setConfirmDelete,
        clearValidationError
    } = useRole();

    // State for parent role dropdown options
    const [parentRoleOptions, setParentRoleOptions] = useState<Array<{value: string, label: string}>>([]);

    // Update parent role options when roles data changes
    useEffect(() => {
        const options = [
            { value: '', label: 'No Parent Role' },
            ...roles
                .filter(role => !editingRole || role.role_id !== editingRole.role_id) // Exclude self from parent options
                .map(role => ({
                    value: role.role_id,
                    label: role.role_name
                }))
        ];
        setParentRoleOptions(options);
    }, [roles, editingRole]);

    // Form input handlers with validation
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === '' ? null : value
        }));
        
        // Clear validation error when user starts typing
        if (validationErrors[field as keyof typeof validationErrors]) {
            clearValidationError(field as keyof typeof validationErrors);
        }
    };

    // Data table columns
    const columns: TableColumn<Role>[] = [
        createSerialNumberColumn(pagination || { current_page: 1, per_page: 10 }),
        {
            name: 'Role Name',
            selector: row => row.role_name,
        },
        {
            name: 'Parent Role',
            selector: row => {
                const parentRole = roles.find(r => r.role_id === row.role_parent_id);
                return parentRole ? parentRole.role_name : 'No Parent';
            },
        },
        createDateColumn(
            'Created', 
            'created_at', 
            tableDateFormat
        ),
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEdit,
                className: "text-primary hover:text-blue-600",
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDelete,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
            }
        ]),
    ];

    // Filter section options
    const sortByOptions = [
        { value: 'role_name', label: 'Role Name' },
        { value: 'created_at', label: 'Created Date' }
    ];

    const sortOrderOptions = [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' }
    ];

    // Active filters count
    const activeFiltersCount = Object.values(filters).filter(value => 
        value !== '' && value !== 'role_name' && value !== 'asc'
    ).length;

    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Manage Role
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage Role information and hierarchy
                            </p>
                        </div>
                        <Button
                            onClick={handleAddRole}
                            className="flex items-center gap-2"
                            size="sm"
                        >
                            <MdAdd className="w-4 h-4" />
                            Add Role
                        </Button>
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
                                    placeholder="Search roles..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
                            </div>
                        </div>

                        {/* Sort By Filter */}
                        <div className="flex items-center gap-2">
                            <CustomSelect
                                id="sort_by"
                                name="sort_by"
                                value={filters.sort_by ? { 
                                    value: filters.sort_by, 
                                    label: sortByOptions.find(opt => opt.value === filters.sort_by)?.label || filters.sort_by
                                } : null}
                                onChange={(selectedOption) => 
                                    handleFilterChange('sort_by', selectedOption?.value || '')
                                }
                                options={sortByOptions}
                                placeholder="Sort By"
                                isClearable={false}
                                isSearchable={false}
                                className="w-70"
                            />
                        </div>

                        {/* Sort Order */}
                        <div className="flex items-center gap-2">
                            <CustomSelect
                                id="sort_order"
                                name="sort_order"
                                value={filters.sort_order ? { 
                                    value: filters.sort_order, 
                                    label: sortOrderOptions.find(opt => opt.value === filters.sort_order)?.label || filters.sort_order
                                } : null}
                                onChange={(selectedOption) => 
                                    handleFilterChange('sort_order', selectedOption?.value || '')
                                }
                                options={sortOrderOptions}
                                placeholder="Order by"
                                isClearable={false}
                                isSearchable={false}
                                className="w-70"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 font-secondary">
                    {/* Active Filters Display */}
                    {activeFiltersCount > 0 && (
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
                                    {filters.sort_by && filters.sort_by !== 'role_name' && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Sort: {sortByOptions.find(opt => opt.value === filters.sort_by)?.label}
                                        </span>
                                    )}
                                    {filters.sort_order && filters.sort_order !== 'asc' && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Order: {sortOrderOptions.find(opt => opt.value === filters.sort_order)?.label}
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    size="sm"
                                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                                >
                                    Clear all
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Results Summary */}
                    <div className="mb-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {isLoading ? (
                                <span>Loading...</span>
                            ) : pagination ? (
                                <span>
                                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                    {pagination.total} results
                                    {activeFiltersCount > 0 && ' (filtered)'}
                                </span>
                            ) : (
                                <span>No results found</span>
                            )}
                        </div>
                    </div>

                    <CustomDataTable
                        columns={columns}
                        data={roles}
                        loading={isLoading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.per_page || 10}
                        paginationDefaultPage={pagination?.current_page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handleLimitChange}
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        headerBackground="rgba(2, 83, 165, 0.1)"
                        hoverBackground="rgba(223, 232, 242, 0.3)"
                        borderRadius="8px"
                    />
                </div>
            </div>

            {/* Add/Edit Role Modal */}
            <Modal
                isOpen={showForm}
                onClose={closeForm}
                className="max-w-xl"
                title={`${editingRole ? 'Edit Role' : 'Add New Role'}`}
                description={editingRole ? 'Update role information' : 'Fill in the details to create a new role'}
            >
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error Message */}
                        {validationErrors.general && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">
                                    {validationErrors.general}
                                </p>
                            </div>
                        )}

                        {/* Role Name */}
                        <div>
                            <Label htmlFor="role_name">Role Name *</Label>
                            <Input
                                id="role_name"
                                name="role_name"
                                type="text"
                                value={formData.role_name}
                                onChange={(e) => handleInputChange('role_name', e.target.value)}
                                placeholder="Enter role name"
                                className={validationErrors.role_name ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.role_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.role_name}
                                </p>
                            )}
                        </div>

                        {/* Parent Role */}
                        <div>
                            <Label htmlFor="role_parent_id">Parent Role</Label>
                            <CustomSelect
                                id="role_parent_id"
                                name="role_parent_id"
                                value={formData.role_parent_id ? {
                                    value: formData.role_parent_id,
                                    label: parentRoleOptions.find(opt => opt.value === formData.role_parent_id)?.label || ''
                                } : null}
                                onChange={(selectedOption) => 
                                    handleInputChange('role_parent_id', selectedOption?.value || '')
                                }
                                options={parentRoleOptions}
                                placeholder="Select parent role"
                                isClearable={true}
                                isSearchable={true}
                                className={validationErrors.role_parent_id ? 'border-red-500' : ''}
                            />
                            {validationErrors.role_parent_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.role_parent_id}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <Button
                                variant="outline"
                                onClick={closeForm}
                                disabled={isLoading}
                                className="rounded-[50px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={isLoading}
                                className={`rounded-[50px] ${
                                    Object.keys(validationErrors).length > 0 
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                            >
                                {isLoading ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={() => {
                    if (confirmDelete.role) {
                        deleteRole(confirmDelete.role);
                    }
                }}
                title="Delete Role"
                message="Are you sure you want to delete this role? This action cannot be undone."
                confirmText="Delete Role"
                cancelText="Cancel"
                type="danger"
                loading={isLoading}
            />
        </>
    );
}