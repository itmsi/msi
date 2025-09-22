import Button from "@/components/ui/button/Button";
import { useEmployees, useCompany, useDepartment } from "@/hooks/useAdministration";
import { MdEdit, MdDeleteOutline, MdAdd, MdSearch } from "react-icons/md";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import CustomSelect from "@/components/form/select/CustomSelect";
import { Modal } from "@/components/ui/modal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Employee } from "@/types/administration";
import { useEffect, useState } from "react";
import { createActionsColumn, createDateColumn, createSerialNumberColumn } from "@/components/ui/table";
import { tableDateFormat } from "@/helpers/generalHelper";

export default function ManageEmployee() {
    const {
        // State
        employees,
        pagination,
        isLoading,
        formData,
        filters,
        validationErrors,
        confirmDelete,
        showForm,
        editingEmployee,

        // Actions
        setFormData,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        handleEdit,
        handleDelete,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        clearFilters,
        handleAddEmployee,
        closeForm,
        setConfirmDelete
    } = useEmployees();

    // Company hook for dropdown options
    const {
        companies,
        fetchCompanies
    } = useCompany();

    // Department hook for dropdown options  
    const {
        departments,
        fetchDepartments
    } = useDepartment();

    // State for dropdown options
    const [companyOptions, setCompanyOptions] = useState<Array<{value: string, label: string}>>([]);
    const [departmentOptions, setDepartmentOptions] = useState<Array<{value: string, label: string}>>([]);

    // Load companies and departments when modal opens
    useEffect(() => {
        if (showForm) {
            fetchCompanies(1, 100); // Fetch first 100 companies for dropdown
            fetchDepartments(1, 100); // Fetch first 100 departments for dropdown
        }
    }, [showForm, fetchCompanies, fetchDepartments]);

    // Update company options when companies data changes
    useEffect(() => {
        const options = [
            { value: '', label: 'Select Company' },
            ...companies.map(company => ({
                value: company.company_id.toString(),
                label: company.company_name
            }))
        ];
        setCompanyOptions(options);
    }, [companies]);

    // Update department options when departments data changes
    useEffect(() => {
        const options = [
            { value: '', label: 'Select Department' },
            ...departments.map(dept => ({
                value: dept.department_id.toString(),
                label: dept.department_name
            }))
        ];
        setDepartmentOptions(options);
    }, [departments]);

    // Form input handlers
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const success = editingEmployee 
            ? await updateEmployee(editingEmployee.employee_id.toString(), formData)
            : await createEmployee(formData);

        if (success) {
            console.log(editingEmployee ? 'Employee updated successfully' : 'Employee created successfully');
        }
    };

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

    // Active filters count
    const activeFiltersCount = Object.values(filters).filter(value => 
        value !== '' && value !== 'employee_name' && value !== 'asc'
    ).length;

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
                            onClick={handleAddEmployee}
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

                {/* Form Modal */}
                <Modal
                    isOpen={showForm}
                    onClose={closeForm}
                    className="max-w-xl"
                    title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
                    description={editingEmployee ? 'Update employee information' : 'Fill in the details to create a new employee'}
                >
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                                {/* Employee Name */}
                                <div>
                                    <Label htmlFor="employee_name">Employee Name *</Label>
                                    <Input
                                        id="employee_name"
                                        type="text"
                                        value={formData.employee_name}
                                        onChange={(e) => handleInputChange('employee_name', e.target.value)}
                                        placeholder="Enter employee name"
                                        error={!!validationErrors.employee_name}
                                    />
                                    {validationErrors.employee_name && (
                                        <span className="text-sm text-red-500">{validationErrors.employee_name}</span>
                                    )}
                                </div>

                                {/* Department */}
                                <div>
                                    <Label htmlFor="department_id">Department *</Label>
                                    <CustomSelect
                                        options={departmentOptions}
                                        value={departmentOptions.find(option => option.value === formData.department_id) || null}
                                        onChange={(option) => handleInputChange('department_id', option?.value || '')}
                                        placeholder="Select Department"
                                        isClearable={true}
                                        isSearchable={true}
                                    />
                                    {validationErrors.department_id && (
                                        <span className="text-sm text-red-500">{validationErrors.department_id}</span>
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={closeForm}
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
                                    {isLoading ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Create Employee'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
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