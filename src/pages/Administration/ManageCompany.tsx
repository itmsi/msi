import Button from "@/components/ui/button/Button";
import { useCompany } from "@/hooks/useAdministration";
import { useConfirmation } from "@/hooks/useConfirmation";
import { MdEdit, MdDeleteOutline, MdAdd, MdSearch } from "react-icons/md";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import CustomSelect from "@/components/form/select/CustomSelect";
import { Modal } from "@/components/ui/modal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Company } from "@/types/administration";
import { createActionsColumn, createDateColumn } from "@/components/ui/table/columnUtils";
import { tableDateFormat } from "@/helpers/generalHelper";
import { PermissionGate } from "@/components/common/PermissionComponents";

export default function ManageCompany() {
    const {
        // State
        loading,
        companies,
        pagination,
        filters,
        isModalOpen,
        editingCompany,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddCompany,
        handleEditCompany,
        handleDeleteCompany,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchCompanies,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,
    } = useCompany();

    // Confirmation modal for delete operations
    const { showConfirmation, ...confirmationState } = useConfirmation();

    // Enhanced delete handler with confirmation
    const handleDeleteWithConfirmation = async (company: Company) => {
        const confirmed = await showConfirmation({
            title: 'Delete Company',
            message: `Are you sure you want to delete the company "${company.company_name}"? This action cannot be undone.`,
            confirmText: 'Delete Company',
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            await handleDeleteCompany(company);
        }
    };

    // Company columns for DataTable
    const companyColumns: TableColumn<Company>[] = [
        {
            name: 'Company Name',
            selector: row => row.company_name,
        },
        {
            name: 'Email',
            selector: row => row.company_email || '-',
        },
        {
            name: 'Address',
            selector: row => row.company_address || '-',
        },
        createDateColumn(
            'Created', 
            'created_at', 
            tableDateFormat
        ),
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEditCompany,
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

    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Company Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage system companies and their configurations
                            </p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleAddCompany}
                                className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="w-4 h-4 mr-2" />
                                Add Company
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
                                    placeholder="Search companies..."
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
                                    label: filters.sort_by === 'company_name' ? 'Company Name' : 'Created Date' 
                                } : null}
                                onChange={(selectedOption) => 
                                    handleFilterChange('sort_by', selectedOption?.value || '')
                                }
                                options={[
                                    { value: 'company_name', label: 'Company Name' },
                                    { value: 'created_at', label: 'Created Date' }
                                ]}
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
                                options={[
                                    { value: 'asc', label: 'Ascending' },
                                    { value: 'desc', label: 'Descending' }
                                ]}
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
                                    {filters.sort_by ? (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Sort: {filters.sort_by === 'company_name' ? 'Company Name' : 'Created Date'}
                                        </span>
                                    ) : 'Created Date'}
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
                        columns={companyColumns}
                        data={companies}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.per_page || 10}
                        paginationDefaultPage={pagination?.current_page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            // Fetch companies with new per_page limit and reset to page 1
                            fetchCompanies(1, newPerPage);
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

            {/* Add/Edit Company Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                className="max-w-xl"
                title={`${editingCompany ? 'Edit Company' : 'Add New Company'}`}
                description={editingCompany ? 'Update company information' : 'Fill in the details to create a new company'}
            >
                <div className="p-6">
                    {/* Show general error message if exists */}
                    {validationErrors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{validationErrors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Name */}
                        <div>
                            <Label htmlFor="company_name">Company Name *</Label>
                            <Input
                                id="company_name"
                                name="company_name"
                                type="text"
                                value={formData.company_name}
                                onChange={handleInputChange}
                                placeholder="Enter company name"
                                className={validationErrors.company_name ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.company_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.company_name}
                                </p>
                            )}
                        </div>

                        {/* Company Email */}
                        <div>
                            <Label htmlFor="company_email">Company Email</Label>
                            <Input
                                id="company_email"
                                name="company_email"
                                type="email"
                                value={formData.company_email || ''}
                                onChange={handleInputChange}
                                placeholder="Enter company email"
                                className={validationErrors.company_email ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.company_email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.company_email}
                                </p>
                            )}
                        </div>

                        {/* Company Address */}
                        <div>
                            <Label htmlFor="company_address">Company Address</Label>
                            <Input
                                id="company_address"
                                name="company_address"
                                type="text"
                                value={formData.company_address || ''}
                                onChange={handleInputChange}
                                placeholder="Enter company address"
                                className={validationErrors.company_address ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.company_address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.company_address}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
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
                                className={`rounded-[50px] ${
                                    Object.keys(validationErrors).length > 0 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                            >
                                {loading ? 'Saving...' : (editingCompany ? 'Update Company' : 'Create Company')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmationModal {...confirmationState.modalProps} />
        </>
    );
}