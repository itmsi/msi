import Button from "@/components/ui/button/Button";
import { useNavigate } from "react-router";
import { useEmployees } from "@/hooks/useAdministration";
import { MdEdit, MdDeleteOutline, MdAdd, MdSearch } from "react-icons/md";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import CustomSelect from "@/components/form/select/CustomSelect";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import Input from "@/components/form/input/InputField";
import { Employee } from "@/types/administration";
import { createActionsColumn, createSerialNumberColumn } from "@/components/ui/table";

export default function ManageEmployee() {
    const navigate = useNavigate();
    
    const {
        // State
        employees,
        pagination,
        isLoading,
        filters,
        confirmDelete,

        // Actions
        deleteEmployee,
        handleDelete,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        clearFilters,
        setConfirmDelete
    } = useEmployees();

    // Data table columns
    const columns: TableColumn<Employee>[] = [
        createSerialNumberColumn(pagination || { current_page: 1, per_page: 10 }),
        {
            name: 'Employee Name',
            selector: row => row.employee_name,
        },
        {
            name: 'Position',
            selector: row => row.title_name || 'N/A',
        },
        {
            name: 'Department',
            selector: row => row.department_name || 'N/A',
        },
        {
            name: 'Company',
            selector: row => row.company_name || 'N/A',
        },
        {
            name: 'Email',
            selector: row => row.employee_email || 'N/A',
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: (row) => navigate(`/employees/edit/${row.employee_id}`),
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
        { value: 'employee_name', label: 'Employee Name' },
        { value: 'title_name', label: 'Title' },
        { value: 'department_name', label: 'Department' },
        { value: 'company_name', label: 'Company' },
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
                                Manage Employee
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage Employee information and hierarchy
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/employees/create')}
                            className="flex items-center gap-2"
                            size="sm"
                        >
                            <MdAdd className="w-4 h-4" />
                            Add Employee
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
                                    placeholder="Search employees..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        
                        {/* Sort By */}
                        <div className="w-80 flex-none items-center gap-2">
                            <CustomSelect
                                options={sortByOptions}
                                value={sortByOptions.find(option => option.value === filters.sort_by) || null}
                                onChange={(option) => handleFilterChange('sort_by', option?.value || '')}
                                placeholder="Sort by"
                                isClearable={false}
                                isSearchable={false}
                                className="font-secondary"
                            />
                        </div>

                        {/* Sort Order */}
                        <div className="w-50 flex-none items-center gap-2">
                            <CustomSelect
                                options={sortOrderOptions}
                                value={sortOrderOptions.find(option => option.value === filters.sort_order) || null}
                                onChange={(option) => handleFilterChange('sort_order', (option?.value as 'asc' | 'desc') || 'asc')}
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
                    {(filters.search || filters.sort_by || filters.sort_order) && (
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
                                                filters.sort_by === 'employee_name' ? 'Employee Name' : 
                                                filters.sort_by === 'title_name' ? 'Position' : 
                                                filters.sort_by === 'department_name' ? 'Department Name' : 
                                                filters.sort_by === 'company_name' ? 'Company Name' : 
                                                'Employee Order'}
                                            {filters.sort_order && ` (${filters.sort_order === 'asc' ? 'Ascending' : 'Descending'})`}
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

                    <CustomDataTable
                        columns={columns}
                        data={employees}
                        loading={isLoading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination.total || 0}
                        paginationPerPage={pagination.per_page || 10}
                        paginationDefaultPage={pagination.current_page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            handleLimitChange(newPerPage);
                        }}
                    />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={() => {
                    if (confirmDelete.employeeId) {
                        deleteEmployee(confirmDelete.employeeId);
                    }
                }}
                title="Delete Employee"
                message="Are you sure you want to delete this employee? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
}