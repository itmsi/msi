import { MdAdd, MdEdit, MdSearch, MdDeleteOutline, MdClear } from 'react-icons/md';
import CustomDataTable from '../../../components/ui/table/CustomDataTable';
import Input from '../../../components/form/input/InputField';
import CustomSelect from '../../../components/form/select/CustomSelect';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { createActionsColumn } from '@/components/ui/table';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useDivisionManagement } from './hooks/useDivisionManagement';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import { useConfirmation } from '@/hooks/useConfirmation';
import { Division } from './types/division';
import { createByDateColumn } from '@/components/ui/table/columnUtils';

export default function ManageDivision() {
    const {
        // State
        loading,
        divisions,
        pagination,
        filters,
        isModalOpen,
        editingDivision,
        formData,
        validationErrors,

        // Actions
        handleClearFilters,
        handleInputChange,
        handleAddDivision,
        handleEditDivision,
        handleDeleteDivision,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchDivisions,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
    } = useDivisionManagement();
    
    const { showConfirmation, modalProps } = useConfirmation();

    // Handler untuk delete division dengan konfirmasi
    const handleDelete = async (division: Division) => {
        const typeLabel = "Division";
                
        const confirmed = await showConfirmation({
            title: `Delete ${typeLabel}`,
            message: `Are you sure you want to delete the division "${division.devision_project_name}"?\n\nThis action cannot be undone and may affect related data.`,
            confirmText: `Delete ${typeLabel}`,
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            handleDeleteDivision(division);
        }
    };

    // Definisi kolom untuk DataTable
    const divisionColumns: TableColumn<Division>[] = [
        {
            name: 'Division',
            selector: row => row.devision_project_name,
        },
        createByDateColumn('Created By', 'created_at', 'created_by_name'),
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEditDivision,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDelete,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];

    return (
        <>
            <PageMeta 
                title="Manage Divisions - Motor Sights International" 
                description="Manage Divisions - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Division Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage system divisions and their configurations
                            </p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleAddDivision}
                                className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="w-4 h-4 mr-2" />
                                Add Division
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
                                    placeholder="Search divisions..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
                                {filters.search && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        type="button"
                                    >
                                        <MdClear className="h-4 w-4" />
                                    </button>
                                )}
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
                        columns={divisionColumns}
                        data={divisions}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            fetchDivisions(1, newPerPage);
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

            {/* Add/Edit Division Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                className="max-w-xl"
                title={`${editingDivision ? 'Edit Division' : 'Add New Division'}`}
                description={editingDivision ? 'Update division information' : 'Fill in the details to create a new division'}
            >
                <div className="p-6">
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        {/* Division Name */}
                        <div>
                            <Label htmlFor="devision_project_name">Division Name *</Label>
                            <Input
                                id="devision_project_name"
                                name="devision_project_name"
                                type="text"
                                value={formData.devision_project_name}
                                onChange={handleInputChange}
                                placeholder="Enter division name"
                                className={validationErrors.devision_project_name ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.devision_project_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.devision_project_name}
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
                            
                            <PermissionGate permission={["create", "update"]}>
                                <Button
                                    type="submit"
                                    onClick={() => {
                                        const tipu = { preventDefault: () => {} } as React.FormEvent;
                                        handleSubmit(tipu);
                                    }}
                                    disabled={loading}
                                    className={`rounded-full`}
                                >
                                    {loading ? 'Saving...' : (editingDivision ? 'Update Division' : 'Create Division')}
                                </Button>
                            </PermissionGate>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal {...modalProps} />
        </>
    );
};