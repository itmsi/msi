import { MdAdd, MdEdit, MdSearch, MdPeople, MdDeleteOutline, MdRefresh } from 'react-icons/md';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { createActionsColumn } from '@/components/ui/table';
import { useNavigate } from 'react-router';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { UsersManage } from '@/types/administration';
import { useUsersManage } from '@/hooks/useAdministration';
import { ActiveStatusBadge } from '@/components/ui/badge';

const ManageUsers = () => {
    const navigate = useNavigate();

    const {
        // State
        users,
        pagination,
        isLoading,
        filters,
        confirmDelete,
        confirmResetPassword,

        // Actions
        deleteUsers,
        handleDelete,
        resetUserPassword,
        handleResetPassword,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        clearFilters,
        setConfirmDelete,
        setConfirmResetPassword
    } = useUsersManage(true, { is_customer: '' });

    // Data table columns
    const columns: TableColumn<UsersManage>[] = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email || 'N/A',
        },
        {
            name: 'Position',
            selector: row => row.position || 'N/A',
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
            name: 'User Type',
            selector: row => row.is_customer ? 'Customer' : 'Employee',
        },
        {
            name: 'Status',
            selector: row => row.status,
            cell: (row) => <ActiveStatusBadge status={(row?.status as 'active' | 'inactive') || 'inactive'}  />,
            width: '120px',
            center: true,
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: (row) => {!row.is_customer ? navigate(`/employees/edit/${row.id}`) : navigate(`/users/edit/${row.id}`)},
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: (row) => handleDelete(row.id),
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            },
            {
                icon: MdRefresh,
                onClick: (row) => handleResetPassword(row),
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
                tooltip: 'Reset Password',
                permission: 'update'
            }
        ])
    ];

    // Filter section options
    const sortByOptions = [
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'created_at', label: 'Created Date' }
    ];

    const sortOrderOptions = [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' }
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
    ];

    const userTypeOptions = [
        { value: '', label: 'All User Types' },
        { value: 'true', label: 'Customer' },
        { value: 'false', label: 'Employee' }
    ];

    // Active filters count
    const activeFiltersCount = [
        filters.search,
        filters.sort_by,
        filters.sort_order,
        filters.status,
        filters.is_customer !== '' ? 'filtered' : ''
    ].filter(Boolean).length;

    return (
        <>
            <PageMeta
                title="Manage Users - Motor Sights International"
                description="Manage Users - Motor Sights International"
                image="/motor-sights-international.png"
            />
            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Manage Users</h3>
                            <p className="mt-1 text-sm text-gray-500">Manage and organize your user database</p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={() => navigate('/employees/create')}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="h-4 w-4" />
                                Add New User
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
                                    placeholder="Search users..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="w-40 flex-none">
                            <CustomSelect
                                options={statusOptions}
                                value={statusOptions.find(option => option.value === filters.status) || statusOptions[0]}
                                onChange={(option) => handleFilterChange('status', option?.value || '')}
                                placeholder="Status"
                                isClearable={false}
                                isSearchable={false}
                                className="font-secondary"
                            />
                        </div>

                        {/* User Type Filter */}
                        <div className="w-40 flex-none">
                            <CustomSelect
                                options={userTypeOptions}
                                value={userTypeOptions.find(option => option.value === filters.is_customer) || userTypeOptions[0]}
                                onChange={(option) => handleFilterChange('is_customer', option?.value || '')}
                                placeholder="User Type"
                                isClearable={false}
                                isSearchable={false}
                                className="font-secondary"
                            />
                        </div>
                        
                        {/* Sort By */}
                        <div className="w-40 flex-none">
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
                        <div className="w-40 flex-none">
                            <CustomSelect
                                options={sortOrderOptions}
                                value={sortOrderOptions.find(option => option.value === filters.sort_order) || null}
                                onChange={(option) => handleFilterChange('sort_order', option?.value || '')}
                                placeholder="Order"
                                isClearable={false}
                                isSearchable={false}
                                className="font-secondary"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
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
                                    {filters.status && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Status: {filters.status === 'true' ? 'Active' : 'Inactive'}
                                        </span>
                                    )}
                                    {filters.is_customer !== '' && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Type: {filters.is_customer === 'true' ? 'Customer' : 'Employee'}
                                        </span>
                                    )}
                                    {filters.sort_by && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Sort: {sortByOptions.find(opt => opt.value === filters.sort_by)?.label}
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
                        data={users}
                        loading={isLoading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => handleLimitChange(newPerPage)}
                        responsive
                        highlightOnHover
                        striped={false}
                        noDataComponent={
                            <div className="text-center py-8">
                                <MdPeople className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No users found</p>
                                <p className="text-sm text-gray-400">
                                    {filters.search ? 'Try adjusting your search' : 'Start by adding your first user'}
                                </p>
                            </div>
                        }
                        persistTableHead
                        headerBackground="rgba(2, 83, 165, 0.1)"
                        hoverBackground="rgba(223, 232, 242, 0.3)"
                        borderRadius="8px"
                    />
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={() => {
                    if (confirmDelete.user_id) {
                        deleteUsers(confirmDelete.user_id);
                    }
                }}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />

            {/* Reset Password Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmResetPassword.show}
                onClose={() => setConfirmResetPassword({ show: false })}
                onConfirm={() => {
                    if (confirmResetPassword.user) {
                        resetUserPassword();
                    }
                }}
                title="Reset Password"
                message="Are you sure you want to reset the password for this user? A new password will be generated and sent to their email."
                confirmText="Reset Password"
                cancelText="Cancel"
            />
        </>
    );
};

export default ManageUsers;