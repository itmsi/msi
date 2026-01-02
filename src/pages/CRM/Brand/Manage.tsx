import { MdAdd, MdEdit, MdSearch, MdDeleteOutline } from 'react-icons/md';
import CustomDataTable from '../../../components/ui/table/CustomDataTable';
import Input from '../../../components/form/input/InputField';
import CustomSelect from '../../../components/form/select/CustomSelect';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { tableDateFormat } from '@/helpers/generalHelper';
import { createActionsColumn, createDateColumn } from '@/components/ui/table';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useBrandManagement } from './hooks/useBrandManagement';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import { useConfirmation } from '@/hooks/useConfirmation';
import { Brand } from './types/brand';

export default function ManageBrand() {
    const {
        // State
        loading,
        brands,
        pagination,
        filters,
        isModalOpen,
        editingBrand,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddBrand,
        handleEditBrand,
        handleDeleteBrand,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchBrands,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
    } = useBrandManagement();
    
    const { showConfirmation, ...confirmationState } = useConfirmation();

    // Definisi kolom untuk DataTable
    const brandColumns: TableColumn<Brand>[] = [
        {
            name: 'Brand',
            selector: row => row.brand_name_en,
        },
        createDateColumn('Created At', 'created_at', tableDateFormat),
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEditBrand,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDeleteBrand,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];

    return (
        <>
            <PageMeta 
                title="Manage Brands - Motor Sights International" 
                description="Manage Brands - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Brand Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage system brands and their configurations
                            </p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleAddBrand}
                                className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="w-4 h-4 mr-2" />
                                Add Brand
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
                                    placeholder="Search brands..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
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

                    <CustomDataTable
                        columns={brandColumns}
                        data={brands}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            fetchBrands(1, newPerPage);
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
                title={`${editingBrand ? 'Edit Brand' : 'Add New Brand'}`}
                description={editingBrand ? 'Update brand information' : 'Fill in the details to create a new brand'}
            >
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Brand Name */}
                        <div>
                            <Label htmlFor="brand_name">Brand Name *</Label>
                            <Input
                                id="brand_name"
                                name="brand_name"
                                type="text"
                                value={formData.brand_name_en}
                                onChange={handleInputChange}
                                placeholder="Enter brand name"
                                className={validationErrors.brand_name_en ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.brand_name_en && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.brand_name_en}
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
                                {loading ? 'Saving...' : (editingBrand ? 'Update Brand' : 'Create Brand')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmationModal {...confirmationState.modalProps} />
        </>
    );
};