import { useDashboard } from "@/hooks/powerbi/usePowerBI";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdEdit, MdDeleteOutline, MdSearch } from "react-icons/md";
import { TableColumn } from 'react-data-table-component';
import { PowerBIDashboard } from "@/types/powerbi";
import Input from "@/components/form/input/InputField";
import CustomDataTable, { createActionsColumn } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import CustomSelect from "@/components/form/select/CustomSelect";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { ActiveStatusBadge, CategoryBadge } from "@/components/ui/badge";
import PageMeta from "@/components/common/PageMeta";
import { PermissionGate } from "@/components/common/PermissionComponents";

export default function ManagePowerBi() {
    const navigate = useNavigate();
    
    const {
        loading,
        dashboards,
        categoryOptions,
        filters,
        pagination,
        handleSearchChange,
        handleCategoryChange,
        handlePageChange,
        handleLimitChange,
        clearFilters,
        deleteDashboard,
    } = useDashboard();

    // State for delete modal only
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDashboard, setSelectedDashboard] = useState<PowerBIDashboard | null>(null);

    // Handle Create - navigate to create page
    const handleCreate = () => {
        navigate('/power-bi/manage/create');
    };

    // Handle Edit - navigate to edit page
    const handleEdit = (dashboard: PowerBIDashboard) => {
        navigate(`/power-bi/manage/edit/${dashboard.powerbi_id}`);
    };

    // Handle Delete
    const handleDelete = (dashboard: PowerBIDashboard) => {
        setSelectedDashboard(dashboard);
        setShowDeleteModal(true);
    };

    const handleSubmitDelete = async (id: string) => {
        const result = await deleteDashboard(id);
        
        if (result.success) {
            setShowDeleteModal(false);
            setSelectedDashboard(null);
        }
    };

    // Table columns configuration
    const columns: TableColumn<PowerBIDashboard>[] = [
        {
            name: 'Title',
            selector: row => row.title,
        },
        {
            name: 'Category',
            selector: row => row.category_name,
            cell: (row: PowerBIDashboard) => <CategoryBadge category={row.category_name} showText={true} size="sm" />,
        },
        {
            name: 'Description',
            selector: row => row.description,
            cell: (row: PowerBIDashboard) => (
                <div className="max-w-xs truncate" title={row.description}>
                    {row.description}
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.status,
            cell: (row: PowerBIDashboard) => (
                <ActiveStatusBadge status={row.status} variant="with-icon" size="sm" />
            ),
            center: true,
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: (row: PowerBIDashboard) => handleEdit(row),
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: (row: PowerBIDashboard) => handleDelete(row),
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];

    const controlHeight = 1.75; // Adjust based on actual control height
    return (
        <>
            <PageMeta
                title="Manage Power BI - Motor Sights International"
                description="Manage Power BI - Motor Sights International"
                image="/motor-sights-international.png"
            />
            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Manage PowerBI Dashboards</h3>
                            <p className="mt-1 text-sm text-gray-500">Create, edit, and manage your PowerBI dashboards</p>
                        </div>
                        
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleCreate}
                                className="rounded-md w-full md:w-50 font-secondary font-medium flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="h-4 w-4" />
                                Add New Power BI
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
                                    placeholder="Search by title or description..."
                                    value={filters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <CustomSelect
                                id="category"
                                name="category"
                                value={filters.category_id ? { 
                                    value: filters.category_id, 
                                    label: categoryOptions.find(option => option.value === filters.category_id)?.label || 'Category' 
                                } : null}
                                onChange={(selectedOption) => 
                                    handleCategoryChange(selectedOption?.value || '')
                                }
                                options={categoryOptions}
                                placeholder="All Categories"
                                isClearable={false}
                                isSearchable={false}
                                className="w-70"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="p-6 font-secondary">
                    {/* Active Filters Display */}
                    {(filters.search || filters.category_id) && (
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
                                    {filters.category_id && (
                                        <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
                                            Category: {categoryOptions.find(c => c.value === filters.category_id)?.label}
                                        </span>
                                    )}
                                    {filters.sort_order && ` (${filters.sort_order === 'asc' ? 'Ascending' : 'Descending'})`}
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
                        data={dashboards}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            handleLimitChange(newPerPage);
                        }}
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        borderRadius="8px"
                        fixedHeader={true}
                        fixedHeaderScrollHeight={`calc(100vh/${controlHeight})`}
                    />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (selectedDashboard) {
                        handleSubmitDelete(selectedDashboard.powerbi_id);
                    }
                }}
                title="Delete Dashboard"
                message={`Are you sure you want to delete "${selectedDashboard?.title}"? This action cannot be undone.`}
                confirmText="Delete Dashboard"
                cancelText="Cancel"
                type="danger"
                loading={loading}
            />
        </>
    );
}