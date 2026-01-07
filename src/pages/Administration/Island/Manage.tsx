import { MdAdd, MdEdit, MdSearch, MdDeleteOutline } from 'react-icons/md';
import CustomDataTable from '../../../components/ui/table/CustomDataTable';
import Input from '../../../components/form/input/InputField';
import CustomSelect from '../../../components/form/select/CustomSelect';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { formatDateTime, tableDateFormat } from '@/helpers/generalHelper';
import { createActionsColumn, createDateColumn } from '@/components/ui/table';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useIslandManagement } from './hooks/useIslandManagement';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import { useConfirmation } from '@/hooks/useConfirmation';
import { Island } from './types/island';

export default function ManageIsland() {
    const {
        // State
        loading,
        islands,
        pagination,
        filters,
        isModalOpen,
        editingIsland,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddIsland,
        handleEditIsland,
        handleDeleteIsland,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchIslands,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
    } = useIslandManagement();
    
    const { showConfirmation, ...confirmationState } = useConfirmation();

    // Definisi kolom untuk DataTable
    const islandColumns: TableColumn<Island>[] = [
        {
            name: 'Island',
            selector: row => row.island_name,
        },
        createDateColumn('Created At', 'created_at', tableDateFormat),
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
                        {row.updated_at ? formatDateTime(row.updated_at) : '-'}
                    </span>
                </div>
            ),
            width: '200px'
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEditIsland,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDeleteIsland,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];

    return (
        <>
            <PageMeta 
                title="Manage Islands - Motor Sights International" 
                description="Manage Islands - Motor Sights International"
                image="/motor-sights-international.png"
            />

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
                                onClick={handleAddIsland}
                                className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="w-4 h-4 mr-2" />
                                Add Island
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
                        columns={islandColumns}
                        data={islands}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            fetchIslands(1, newPerPage);
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
                title={`${editingIsland ? 'Edit Island' : 'Add New Island'}`}
                description={editingIsland ? 'Update island information' : 'Fill in the details to create a new island'}
            >
                <div className="p-6">
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        {/* Island Name */}
                        <div>
                            <Label htmlFor="island_name">Island Name *</Label>
                            <Input
                                id="island_name"
                                name="island_name"
                                type="text"
                                value={formData.island_name}
                                onChange={handleInputChange}
                                placeholder="Enter company name"
                                className={validationErrors.island_name ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.island_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.island_name}
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
                                    className={`rounded-[50px] ${
                                        Object.keys(validationErrors).length > 0 
                                                ? 'bg-red-600 hover:bg-red-700' 
                                                : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                                >
                                    {loading ? 'Saving...' : (editingIsland ? 'Update Island' : 'Create Island')}
                                </Button>
                            </PermissionGate>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmationModal {...confirmationState.modalProps} />
        </>
    );
};