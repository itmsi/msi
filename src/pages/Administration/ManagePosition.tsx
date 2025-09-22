import Button from "@/components/ui/button/Button";
import { usePosition, useDepartment } from "@/hooks/useAdministration";
import { MdEdit, MdDeleteOutline, MdAdd, MdSearch } from "react-icons/md";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import CustomSelect from "@/components/form/select/CustomSelect";
import { Modal } from "@/components/ui/modal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Position } from "@/types/administration";
import { useEffect, useState } from "react";
import { createActionsColumn, createDateColumn, createSerialNumberColumn } from "@/components/ui/table";
import { tableDateFormat } from "@/helpers/generalHelper";

export default function ManagePosition() {
    const {
        // State
        positions,
        pagination,
        isLoading,
        formData,
        filters,
        validationErrors,
        confirmDelete,
        isModalOpen,
        editingPosition,

        // Actions
        deletePosition,
        handleEdit,
        handleDelete,
        handleSubmit,
        handleAddPosition,
        handleCloseModal,
        handleInputChange,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        resetFilters,
        setConfirmDelete
    } = usePosition();

    // Department hook for dropdown options  
    const {
        departments,
        fetchDepartments
    } = useDepartment();

    // State for dropdown options
    const [departmentOptions, setDepartmentOptions] = useState<Array<{value: string, label: string}>>([]);

    // Load departments when modal opens
    useEffect(() => {
        if (isModalOpen) {
            fetchDepartments(1, 100); // Fetch first 100 departments for dropdown
        }
    }, [isModalOpen, fetchDepartments]);

    // Update department options when departments data changes
    useEffect(() => {
        const options = [
            { value: '', label: 'Select Department' },
            ...departments.map(dept => ({
                value: dept.department_id,
                label: dept.department_name
            }))
        ];
        setDepartmentOptions(options);
    }, [departments]);

    // Data table columns
    const columns: TableColumn<Position>[] = [
        createSerialNumberColumn(pagination || { current_page: 1, per_page: 10 }),
        {
            name: 'Position Name',
            selector: row => row.title_name,
        },
        {
            name: 'Department',
            selector: row => row.department_name || 'N/A',
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
        { value: 'title_name', label: 'Position Name' },
        { value: 'department_name', label: 'Department' },
        { value: 'created_at', label: 'Created Date' }
    ];

    const sortOrderOptions = [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' }
    ];

    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Position Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage system positions and their configurations
                            </p>
                        </div>
                        <Button
                            onClick={handleAddPosition}
                            className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                            size="sm"
                        >
                            <MdAdd className="w-4 h-4 mr-2" />
                            Add Position
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
                                    placeholder="Search positions..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
                            </div>
                        </div>

                        {/* Sort Filter */}
                        <div className="flex items-center gap-2">
                            <CustomSelect
                                id="sort_by"
                                name="sort_by"
                                value={filters.sort_by ? { 
                                    value: filters.sort_by, 
                                    label: sortByOptions.find(option => option.value === filters.sort_by)?.label || 'Sort By' 
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
                                    label: filters.sort_order === 'asc' ? 'Ascending' : 'Descending' 
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
                    {(filters.search || filters.department_id || filters.sort_by || filters.sort_order) && (
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
                                    {filters.department_id && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Department: {departments.find(d => d.department_id === filters.department_id)?.department_name}
                                        </span>
                                    )}
                                    {filters.sort_by && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Sort: {sortByOptions.find(option => option.value === filters.sort_by)?.label}
                                        </span>
                                    )}
                                    {filters.sort_order && ` (${filters.sort_order === 'asc' ? 'Ascending' : 'Descending'})`}
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
                    )}

                    <CustomDataTable
                        columns={columns}
                        data={positions}
                        loading={isLoading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.per_page || 10}
                        paginationDefaultPage={pagination?.current_page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            handleLimitChange(newPerPage);
                        }}
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

            {/* Add/Edit Position Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                className="max-w-xl"
                title={`${editingPosition ? 'Edit Position' : 'Add New Position'}`}
                description={editingPosition ? 'Update position information' : 'Fill in the details to create a new position'}
            >
                <div className="p-6">
                    {/* Show general error message if exists */}
                    {validationErrors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{validationErrors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Position Name */}
                        <div>
                            <Label htmlFor="title_name">Position Name *</Label>
                            <Input
                                id="title_name"
                                name="title_name"
                                type="text"
                                value={formData.title_name}
                                onChange={handleInputChange}
                                placeholder="Enter position name"
                                className={validationErrors.title_name ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.title_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.title_name}
                                </p>
                            )}
                        </div>

                        {/* Department */}
                        <div>
                            <Label htmlFor="department_id">Department *</Label>
                            <CustomSelect
                                id="department_id"
                                name="department_id"
                                value={formData.department_id ? { 
                                    value: formData.department_id, 
                                    label: departments.find(d => d.department_id === formData.department_id)?.department_name || 'Select Department'
                                } : null}
                                onChange={(selectedOption) => {
                                    handleInputChange({
                                        target: {
                                            name: 'department_id',
                                            value: selectedOption?.value || ''
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>);
                                }}
                                options={departmentOptions}
                                placeholder="Select Department"
                                isClearable={false}
                                isSearchable
                                className={validationErrors.department_id ? 'border-red-500' : ''}
                            />
                            {validationErrors.department_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.department_id}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
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
                                {isLoading ? 'Saving...' : (editingPosition ? 'Update Position' : 'Create Position')}
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
                    if (confirmDelete.position) {
                        deletePosition(confirmDelete.position);
                    }
                }}
                title="Delete Position"
                message="Are you sure you want to delete this position? This action cannot be undone."
                confirmText="Delete Position"
                cancelText="Cancel"
                type="danger"
                loading={isLoading}
            />
        </>
    );
}