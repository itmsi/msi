
import { useState } from "react";
import { MdAdd, MdEdit, MdDeleteOutline, MdSearch } from "react-icons/md";
import { TableColumn } from 'react-data-table-component';
import { PowerBICategory } from "@/types/powerbi";
import Input from "@/components/form/input/InputField";
import { Modal } from "@/components/ui/modal";
import CustomDataTable, { createActionsColumn } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { useDashboard } from "@/hooks/powerbi/usePowerBI";
import PageMeta from "@/components/common/PageMeta";
import { PermissionGate } from "@/components/common/PermissionComponents";

export default function CategoryPowerBi() {
    const {
        loading,
        categories,
        categoryFilters,
        categoryPagination,
        handleCategorySearchChange,
        handleCategoryPageChange,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useDashboard();

    // State for modals and forms
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<PowerBICategory | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // Handle Create
    const handleCreate = () => {
        setIsEditMode(false);
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: ''
        });
        setShowFormModal(true);
    };

    // Handle Edit
    const handleEdit = (category: PowerBICategory) => {
        setIsEditMode(true);
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description
        });
        setShowFormModal(true);
    };

    // Handle Delete
    const handleDelete = (category: PowerBICategory) => {
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    // Submit handlers
    const handleSubmitForm = async () => {
        if (isEditMode && selectedCategory) {
            const result = await updateCategory(selectedCategory.category_id, {
                name: formData.name,
                description: formData.description
            });
            
            if (result.success) {
                setShowFormModal(false);
            }
        } else {
            const result = await createCategory({
                name: formData.name,
                description: formData.description
            });
            
            if (result.success) {
                setShowFormModal(false);
            }
        }
    };

    const handleSubmitDelete = async (id: string) => {
        const result = await deleteCategory(id);
        
        if (result.success) {
            setShowDeleteModal(false);
            setSelectedCategory(null);
        }
    };

    // Table columns configuration
    const columns: TableColumn<PowerBICategory>[] = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Description',
            selector: row => row.description,
            wrap: true,
        },
        {
            name: 'Created At',
            selector: row => new Date(row.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            sortable: true,
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: (row: PowerBICategory) => handleEdit(row),
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: (row: PowerBICategory) => handleDelete(row),
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];

    return (
        <>
            <PageMeta
                title="Categories Power BI - Motor Sights International"
                description="Categories Power BI - Motor Sights International"
                image="/motor-sights-international.png"
            />
            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Manage Categories</h3>
                            <p className="mt-1 text-sm text-gray-500">Create, edit, and manage PowerBI dashboard categories</p>
                        </div>
                        
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleCreate}
                                className="rounded-md w-full md:w-50 font-secondary font-medium flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="h-4 w-4" />
                                Add New Category
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    placeholder="Search by name or description..."
                                    value={categoryFilters.search}
                                    onChange={(e) => handleCategorySearchChange(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="p-6 font-secondary">
                    {/* Active Filters Display */}
                    {categoryFilters.search && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-blue-700">
                                    <MdSearch className="w-4 h-4" />
                                    <span className="font-medium">Active filters:</span>
                                    <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                        Search: "{categoryFilters.search}"
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => handleCategorySearchChange('')}
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
                        data={categories}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={categoryPagination?.total || 0}
                        paginationPerPage={categoryPagination?.limit || 10}
                        paginationDefaultPage={categoryPagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handleCategoryPageChange}
                        onChangeRowsPerPage={(_newPerPage) => {
                            // Handle rows per page change for categories
                        }}
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        headerBackground="rgba(2, 83, 165, 0.1)"
                        hoverBackground="rgba(223, 232, 242, 0.3)"
                        borderRadius="8px"
                        fixedHeader={true}
                        fixedHeaderScrollHeight={'500px'}
                    />
                </div>
            </div>

            {/* Form Modal (Create/Edit) */}
            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={isEditMode ? "Edit Category" : "Create New Category"}
                className="max-w-xl"
            >
                <div className="p-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmitForm(); }} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Category name"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Category description"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowFormModal(false)}
                                className="px-5 py-3.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[50px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!formData.name || loading}
                                className="rounded-[50px]"
                            >
                                {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (selectedCategory) {
                        handleSubmitDelete(selectedCategory.category_id);
                    }
                }}
                title="Delete Category"
                message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
                confirmText="Delete Category"
                cancelText="Cancel"
                type="danger"
                loading={loading}
            />
        </>
    );
}