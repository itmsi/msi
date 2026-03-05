import { MdAdd, MdClear, MdSearch, MdDeleteOutline } from 'react-icons/md';
import CustomDataTable from '../../../components/ui/table/CustomDataTable';
import Input from '../../../components/form/input/InputField';
import CustomSelect from '../../../components/form/select/CustomSelect';
import { TableColumn } from 'react-data-table-component';
import PageMeta from '@/components/common/PageMeta';
import { useProjectManagement } from './hooks/useProjectManagement';
import { ProjectItem } from './types/project';
import { FaProjectDiagram } from 'react-icons/fa';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { useNavigate } from 'react-router';
import { formatDateTime } from '@/helpers/generalHelper';
import { useMemo, useState, useCallback } from 'react';
import { ProjectService } from './services/projectService';
import toast from 'react-hot-toast';
import { createActionsColumn } from '@/components/ui/table';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { ActivityTypeBadge } from '../Contractors/components/ContractorBadges';



export default function ManageCRMProject() {
    const navigate = useNavigate();

    // Delete state
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; projectId?: string; projectName?: string }>({ show: false });

    const {
        projects,
        loading,
        error,
        pagination,
        searchValue,
        sortOrder,
        statusFilter,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
        fetchProjects,
    } = useProjectManagement();

    const handleDelete = (row: ProjectItem) => {
        setConfirmDelete({ show: true, projectId: row.project_id, projectName: row.project_name || row.project_id });
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete.projectId) return;
        try {
            await ProjectService.deleteProject(confirmDelete.projectId);
            toast.success('Project deleted successfully');
            setConfirmDelete({ show: false });
            fetchProjects();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete project');
        }
    };

    const handleEdit = (row: ProjectItem) => {
        navigate(`/crm/project/edit/${row.project_id}`);
    };

    const handlePageChangeAman = useCallback((halamanBaru: number) => {
        const halamanSaatIni = pagination?.page || 1;
        if (halamanBaru === halamanSaatIni) return;
        handlePageChange(halamanBaru);
    }, [pagination?.page, handlePageChange]);

    const handleRowsPerPageAman = useCallback((limitBaru: number, halamanBaru: number) => {
        const halamanSaatIni = pagination?.page || 1;
        const limitSaatIni = pagination?.limit || 10;
        if (limitBaru === limitSaatIni && halamanBaru === halamanSaatIni) return;
        handleRowsPerPageChange(limitBaru, halamanBaru);
    }, [pagination?.page, pagination?.limit, handleRowsPerPageChange]);

    const columns: TableColumn<ProjectItem>[] = [
        {
            name: 'Project Name',
            selector: row => row.project_name || '-',
            cell: row => (<>
                <a
                    href={`/crm/project/edit/${row.project_id}`}
                    className="absolute inset-0"
                />
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.project_name || '-'}</div>
                    <div className="text-sm text-gray-500">{row.customer_name || ''}</div>
                </div>
            </>),
            wrap: true,
        },
        {
            name: 'Sales',
            selector: row => row.employee_name || '-',
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.status || '-',
            cell: row => (
                <ActivityTypeBadge
                    type={(row.status as 'Not Started' | 'Find' | 'Pull' | 'Survey' | 'BAST') || 'Not Started'}
                />
            ),
        },
        {
            name: 'Updated By',
            selector: row => row.updated_by_name || '-',
            cell: row => (
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.updated_by_name || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatDateTime(row.updated_at)}</div>
                </div>
            ),
        },
        createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: handleDelete,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ]),
    ];

    const SearchAndFilters = useMemo(() => {
        return (
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Search project... (Press Enter)"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                            />
                            {searchValue && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    type="button"
                                >
                                    <MdClear className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={sortOrder ? { 
                            value: sortOrder, 
                            label: sortOrder === 'asc' ? 'Ascending' : 'Descending' 
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
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <CustomSelect
                        id="status_filter"
                        name="status_filter"
                        value={statusFilter ? {
                            value: statusFilter,
                            label: statusFilter
                        } : null}
                        onChange={(opt) => handleFilterChange('status', opt?.value || '')}
                        options={[
                            { value: 'Not Started', label: 'Not Started' },
                            { value: 'Find', label: 'Find' },
                            { value: 'Pull', label: 'Pull' },
                            { value: 'Survey', label: 'Survey' },
                            { value: 'BAST', label: 'BAST' },
                        ]}
                        placeholder="Filter by status"
                        isClearable={true}
                        isSearchable={false}
                        className="w-44"
                    />
                </div>
            </div>
        );
    }, [searchValue, sortOrder, statusFilter, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange]);

    return (
        <>
            <PageMeta
                title="CRM Projects - Motor Sights International"
                description="Manage CRM Projects - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Projects
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage CRM projects and customer opportunities
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate('/crm/project/create')}
                                        className="flex items-center gap-2"
                                    >
                                        <MdAdd size={20} />
                                        <span>Add Project</span>
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white shadow rounded-lg px-6 py-4">
                    {SearchAndFilters}
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}

                        <CustomDataTable
                            columns={columns}
                            data={projects}
                            loading={loading}
                            pagination
                            paginationServer
                            paginationTotalRows={pagination?.total || 0}
                            paginationPerPage={pagination?.limit || 10}
                            paginationDefaultPage={pagination?.page || 1}
                            paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                            onChangePage={handlePageChangeAman}
                            onChangeRowsPerPage={handleRowsPerPageAman}
                            fixedHeader={true}
                            fixedHeaderScrollHeight="625px"
                            responsive
                            highlightOnHover
                            striped={false}
                            noDataComponent={
                                <div className="text-center py-8">
                                    <FaProjectDiagram className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No project data found</p>
                                    <p className="text-sm text-gray-400">
                                        {searchValue ? 'Try adjusting your search' : 'Start by adding your first project'}
                                    </p>
                                </div>
                            }
                            persistTableHead
                            borderRadius="8px"
                            onRowClicked={handleEdit}
                        />
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={handleDeleteConfirm}
                title="Delete Project"
                message={`Are you sure you want to delete project "${confirmDelete.projectName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
}
