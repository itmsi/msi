import React, { useMemo } from 'react';
import { MdAdd, MdSearch, MdClear, MdDeleteOutline } from 'react-icons/md';
import { useCustomerManagement } from './hooks/useCustomerManagement';
import { CustomerUtilityService } from './services/customerUtilityService';
import { Customer } from './types/customer';
import CustomDataTable from '../../../components/ui/table/CustomDataTable';
import Input from '../../../components/form/input/InputField';
import CustomSelect from '../../../components/form/select/CustomSelect';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { createActionsColumn } from '@/components/ui/table';
import { useLocation, useNavigate } from 'react-router';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useConfirmation } from '@/hooks/useConfirmation';
import PageHeaderManage from '@/components/common/PageHeaderManage';

const ManageCustomers: React.FC<{ action?: boolean, urlPath?: string }> = ({ action = true, urlPath = `/quotations/administration/customers/edit/` }) => {
    const navigate = useNavigate();
    
    // Custom hook untuk semua state management dan handlers
    const {
        customers,
        loading,
        error,
        pagination,

        filters,
        searchValue,
        setSearchValue,

        // confirmDelete,

        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        refetch,

        deleteCustomer,
        handleKeyPress,
        handleClearSearch,

    } = useCustomerManagement();

    const location = useLocation();
    const { showConfirmation, modalProps } = useConfirmation();
    const handleDelete = async (customer: any) => {
        const typeLabel = customer.customer_name;
                
        const confirmed = await showConfirmation({
            title: `Delete ${typeLabel}`,
            message: (
                <>
                    Are you sure you want to delete <strong className="font-primary-bold">{customer.customer_name}?</strong>
                    <br />
                    This action cannot be undone.
                </>
            ),
            confirmText: `Delete ${typeLabel}`,
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            await deleteCustomer(customer.customer_id);
            refetch();
        }
    };
    // Definisi kolom untuk DataTable
    const columns: TableColumn<Customer>[] = [
        {
            name: 'Customer Name',
            selector: row => row.customer_name,
            cell: (row) => {
                return (<>
                    <a
                        href={`${urlPath}${row.customer_id}${location.search}`}
                        className="absolute inset-0"
                    />
                    <div className="py-2">
                        <div className="font-medium text-gray-900">
                            {row?.customer_name ?? '-'}
                        </div>
                        <div className="text-sm text-gray-500">{row?.contact_person ?? '-'}{row?.customer_code ? ` - ${row.customer_code}` : ''}</div>
                    </div>
                </>);
            }
        },
        {
            name: 'Phone',
            selector: row => row.customer_phone,
            cell: (row) => (
                <span className="text-sm text-gray-700">
                    {row.customer_phone ? CustomerUtilityService.formatPhoneNumber(row.customer_phone) : '-'}
                </span>
            )
        },
        {
            name: 'Address',
            selector: row => row.customer_address,
            sortable: false,
            cell: (row) => (
                <div className="max-w-xs truncate text-sm text-gray-700" title={row.customer_address}>
                    {row.customer_address}
                </div>
            )
        },
        {
            name: 'Updated By',
            selector: row => row.updated_at || '',
            sortable: false,
            cell: (row) => (
                <div className="flex flex-col py-2">
                    <span className="font-medium text-gray-900">
                        {row.updated_by_name || '-'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.updated_at ? new Date(row.updated_at).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '-'}
                    </span>
                </div>
            ),
            width: '200px'
        },
        // createDateColumn('Created At', 'created_at', tableDateFormat),
        ...(action) ? [createActionsColumn([
                // {
                //     icon: MdEdit,
                //     onClick: handleEdit,
                //     className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                //     tooltip: 'Edit',
                //     permission: 'update'
                // },
                {
                    icon: MdDeleteOutline,
                    onClick: handleDelete,
                    className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                    tooltip: 'Delete',
                    permission: 'delete'
                }
            ])] : []
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
                            placeholder="Search customers... (Press Enter to search)"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            
                            onKeyPress={handleKeyPress}
                            className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                        />
                        {searchValue && (
                            <button
                                onClick={() => {
                                    handleClearSearch();
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                type="button"
                            >
                                <MdClear className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
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
                        handleFilterChange({ sort_order: (selectedOption?.value as 'asc' | 'desc') || 'desc' })
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
    ), [filters, loading, customers.length, handleFilterChange]);
    return (
        <>
            <PageMeta
                title="Manage Customers - Motor Sights International"
                description="Manage Customers - Motor Sights International"
                image="/motor-sights-international.png"
            />
            <div className="space-y-3">
                <PageHeaderManage
                    title="Manage Customers"
                    subtitle="Manage and organize your customer database"
                    actions={[
                        {
                        key: 'create',
                        element: action && (
                            <PermissionGate permission="create">
                                <Button
                                    onClick={() => navigate('/quotations/administration/customers/create')}
                                    className="flex items-center gap-2"
                                    size="sm"
                                >
                                    <MdAdd className="h-4 w-4" />
                                    Add New Customer
                                </Button>
                            </PermissionGate>
                        )}
                    ]}
                />
                {/* Filters */}
                <div className="bg-white shadow rounded-lg px-6 py-4">
                    {SearchAndFilters}
                </div>

                {/* Error Message */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}
                        <CustomDataTable
                            columns={columns}
                            data={customers}
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
                            // onRowClicked={handleEdit}
                        />
                    </div>
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            <ConfirmationModal {...modalProps} />
        </>
    );
};

export default ManageCustomers;