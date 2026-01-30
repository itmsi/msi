import Button from "@/components/ui/button/Button";
import { useNavigate } from "react-router";
import { useEmployees } from "@/hooks/useAdministration";
import { MdEdit, MdDeleteOutline, MdAdd, MdSearch, MdRefresh } from "react-icons/md";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import CustomSelect from "@/components/form/select/CustomSelect";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import Input from "@/components/form/input/InputField";
import { Employee } from "@/types/administration";
import { createActionsColumn } from "@/components/ui/table";
import { PermissionGate } from "@/components/common/PermissionComponents";

export default function ManageEmployee() {
    const navigate = useNavigate();

    
    const {
        // State
        employees,
        pagination,
        isLoading,
        filters,
        confirmDelete,
        confirmResetPassword,

        // Actions
        deleteEmployee,
        handleDelete,
        resetEmployeePassword,
        handleResetPassword,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        setConfirmDelete,
        setConfirmResetPassword
    } = useEmployees(true, { employee_status: 'all' });

    // Data table columns dengan permission-based actions
    const columns: TableColumn<Employee>[] = [
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
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: (row) => handleDelete(row.employee_id),
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            },
            {
                icon: MdRefresh,
                onClick: (row) => handleResetPassword(row.employee_id),
                className: 'text-green-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Reset Password',
                permission: 'update'
            }
        ])
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
                        <PermissionGate permission="create">
                            <Button
                                onClick={() => navigate('/employees/create')}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="w-4 h-4" />
                                Add Employee
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

                    <CustomDataTable
                        columns={columns}
                        data={employees}
                        loading={isLoading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination.total || 0}
                        paginationPerPage={pagination.limit || 10}
                        paginationDefaultPage={pagination.page || 1}
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

            {/* Reset Password Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmResetPassword.show}
                onClose={() => setConfirmResetPassword({ show: false })}
                onConfirm={() => {
                    if (confirmResetPassword.employeeId) {
                        resetEmployeePassword(confirmResetPassword.employeeId);
                    }
                }}
                title="Reset Employee Password"
                message="Are you sure you want to reset the password for this employee?"
                confirmText="Reset Password"
                cancelText="Cancel"
            />
        </>
    );
}