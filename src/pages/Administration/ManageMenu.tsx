import Button from "@/components/ui/button/Button";
import { useAdministration } from "@/hooks/useAdministration";
import { useConfirmation } from "@/hooks/useConfirmation";
import { MdEdit, MdDeleteOutline, MdOutlineShield, MdAdd, MdSearch } from "react-icons/md";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import CustomSelect from "@/components/form/select/CustomSelect";
import { Modal } from "@/components/ui/modal";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Menu } from "@/types/administration";
import { createActionsColumn, createSerialNumberColumn } from "@/components/ui/table/columnUtils";

export default function ManageMenu() {
    const {
        // State
        loading,
        menus,
        pagination,
        filters,
        isModalOpen,
        editingMenu,
        formData,
        validationErrors,
        
        // Permission states
        isPermissionModalOpen,
        selectedMenuForPermission,
        menuPermissions,
        permissionLoading,

        // Actions
        handleInputChange,
        handleSelectChange,
        handleAddMenu,
        handleEditMenu,
        handleDeleteMenu,
        handlePermissionMenu,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchMenus,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,
        
        // Permission actions
        handlePermissionStatusChange,
        handleClosePermissionModal,
    } = useAdministration();

    // Confirmation modal for delete operations
    const { showConfirmation, ...confirmationState } = useConfirmation();

    // Enhanced delete handler with confirmation
    const handleDeleteWithConfirmation = async (menu: Menu) => {
        const confirmed = await showConfirmation({
            title: 'Delete Menu',
            message: `Are you sure you want to delete the menu "${menu.menu_name}"? This action cannot be undone.`,
            confirmText: 'Delete Menu',
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            await handleDeleteMenu(menu);
        }
    };

    // Remove this useEffect to prevent double API calls - hook already handles debouncing
    // useEffect(() => {
    //     const timeoutId = setTimeout(() => {
    //         fetchMenus(1, pagination?.per_page || 10);
    //     }, 500); // Debounce for 500ms

    //     return () => clearTimeout(timeoutId);
    // }, [filters.search, filters.menu_name, filters.sort_by, filters.sort_order, fetchMenus, pagination?.per_page]);

    // Menu columns for DataTable - Updated for new Menu interface
    const menuColumns: TableColumn<Menu>[] = [
        createSerialNumberColumn(pagination || { current_page: 1, per_page: 10 }),
        {
            name: 'Menu Name',
            selector: row => row.menu_name,
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEditMenu,
                className:"text-primary hover:text-blue-600",
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDeleteWithConfirmation,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
            },
            {
                icon: MdOutlineShield,
                onClick: handlePermissionMenu,
                className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
            }
        ]),

    ];
    return (
    <>
        <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                            Menu Management
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage system menus and their configurations
                        </p>
                    </div>
                    <Button
                        onClick={handleAddMenu}
                        className="items-center gap-2"
                        size="sm"
                    >
                        <MdAdd className="w-4 h-4 mr-2" />
                        Add Menu
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
                                placeholder="Search menus..."
                                value={filters.search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full"
                            />
                        </div>
                    </div>

                    {/* Sort Filter */}
                    <div className="w-80 flex-none items-center gap-2">
                        <CustomSelect
                            id="sort_by"
                            name="sort_by"
                            value={filters.sort_by ? { 
                                value: filters.sort_by, 
                                label: filters.sort_by === 'menu_name' ? 'Menu Name' : 'Created Date' 
                            } : null}
                            onChange={(selectedOption) => 
                                handleFilterChange('sort_by', selectedOption?.value || '')
                            }
                            options={[
                                { value: 'menu_name', label: 'Menu Name' },
                                { value: 'created_at', label: 'Created Date' },
                            ]}
                            placeholder="Sort by..."
                            isClearable={false}
                            isSearchable={false}
                        />
                    </div>

                    {/* Sort Order */}
                    <div className="w-50 flex-none items-center gap-2">
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
                            placeholder="Sort order..."
                            isClearable={false}
                            isSearchable={false}
                            className="font-secondary"
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
                                {filters.sort_by && (
                                    <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                        Sort: {filters.sort_by === 'menu_name' ? 'Menu Name' : 
                                               filters.sort_by === 'created_at' ? 'Created Date' : 'Menu Order'}
                                        {filters.sort_order && ` (${filters.sort_order === 'asc' ? 'Ascending' : 'Descending'})`}
                                    </span>
                                )}
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
                    columns={menuColumns}
                    data={menus}
                    loading={loading}
                    pagination
                    paginationServer
                    paginationTotalRows={pagination?.total || 0}
                    paginationPerPage={pagination?.per_page || 10}
                    paginationDefaultPage={pagination?.current_page || 1}
                    paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={(newPerPage) => {
                        // Fetch menus with new per_page limit and reset to page 1
                        fetchMenus(1, newPerPage);
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

        {/* Add/Edit Menu Modal */}
        <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            className="max-w-xl"
            title={`${editingMenu ? 'Edit Menu' : 'Add New Menu'}`}
            description={editingMenu ? 'Update menu information' : 'Fill in the details to create a new menu'}
        >
            <div className="p-6">

                <form onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 md:grid-cols-1 mb-6">
                        <div>
                            <Label htmlFor="menu_name">Menu Name *</Label>
                            <Input
                                id="menu_name"
                                name="menu_name"
                                type="text"
                                value={formData.menu_name}
                                onChange={handleInputChange}
                                placeholder="Enter menu name"
                                className={validationErrors.menu_name ? 'border-red-500 focus:border-red-500' : ''}
                            />
                            {validationErrors.menu_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.menu_name}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                        <div className="hidden">
                            <Label htmlFor="menu_url">URL (Auto-generated)</Label>
                            <Input
                                id="menu_url"
                                name="menu_url"
                                type="text"
                                value={formData.menu_url}
                                disabled={true}
                                placeholder="Auto-generated slug from menu name"
                                className="bg-gray-50 text-gray-600"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Generated automatically as slug from menu name
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="menu_parent_id">Parent Menu</Label>
                            <CustomSelect
                                id="menu_parent_id"
                                name="menu_parent_id"
                                isClearable={false}
                                value={formData.menu_parent_id ? { value: formData.menu_parent_id, label: menus.find(m => m.menu_id === formData.menu_parent_id)?.menu_name || '' } : null}
                                onChange={handleSelectChange('menu_parent_id')}
                                options={[
                                    { value: '', label: 'No Parent' },
                                    ...menus.filter(menu => !menu.is_delete).map(menu => ({
                                        value: menu.menu_id,
                                        label: menu.menu_name
                                    }))
                                ]}
                                placeholder="Select parent menu"
                                error={validationErrors.menu_parent_id}
                                disabled={loading}
                            />
                            {validationErrors.menu_parent_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {validationErrors.menu_parent_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={loading}
                            className="rounded-[50px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            className={`rounded-[50px] ${
                                Object.keys(validationErrors).length > 0 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                            disabled={loading}
                            onClick={handleSubmit}
                        >
                            {loading ? 'Saving...' : (editingMenu ? 'Update Menu' : 'Create Menu')}
                            {Object.keys(validationErrors).length > 0 && (
                                <span className="ml-2 text-xs">
                                    ({Object.keys(validationErrors).length} error{Object.keys(validationErrors).length > 1 ? 's' : ''})
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>

        {/* Permission Management Modal */}
        <Modal
            isOpen={isPermissionModalOpen}
            onClose={handleClosePermissionModal}
            className="max-w-lg"
        >
            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Manage Permissions
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {selectedMenuForPermission ? `Configure permissions for "${selectedMenuForPermission.menu_name}"` : 'Configure menu permissions'}
                    </p>
                </div>

                {permissionLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {menuPermissions.length > 0 ? (
                            menuPermissions.map((item) => (
                                <div key={item.permission_id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <MdOutlineShield className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {item.permission_name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={item.has_status}
                                            onChange={(e) => handlePermissionStatusChange(item.permission_id, e.target.checked, item.mhp_id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={permissionLoading}
                                        />
                                        <span className={`text-sm font-medium ${
                                            item.has_status ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {item.has_status ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No permissions found for this menu
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClosePermissionModal}
                        disabled={permissionLoading}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>

        <ConfirmationModal {...confirmationState.modalProps} />
    </>
  )
}