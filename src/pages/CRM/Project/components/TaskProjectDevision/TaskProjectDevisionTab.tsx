import React, { useMemo, useState } from 'react';
import { MdAdd, MdEdit, MdDeleteOutline, MdSearch, MdClear } from 'react-icons/md';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { createActionsColumn } from '@/components/ui/table';
import { TableColumn } from 'react-data-table-component';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

import { useTaskProjectDevision } from '../../hooks/useTaskProjectDevision';
import { TaskProjectDevision, TaskProjectDevisionRequest } from '../../types/taskProjectDevision';
import TaskProjectDevisionModal from './TaskProjectDevisionModal';
import { createByDateColumn } from '@/components/ui/table/columnUtils';

interface TaskProjectDevisionTabProps {
    project_id: string;
    onGoToDivision?: () => void;
}

const TaskProjectDevisionTab: React.FC<TaskProjectDevisionTabProps> = ({ project_id, onGoToDivision }) => {
    const {
        tasks,
        loading,
        pagination,
        searchValue,
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch
    } = useTaskProjectDevision(project_id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<TaskProjectDevision | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id?: string; title?: string }>({ show: false });

    // Internal search value state to handle Enter key
    const [localSearch, setLocalSearch] = useState(searchValue);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(localSearch);
        }
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        handleSearch('');
    };

    const handleAddClick = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (row: TaskProjectDevision) => {
        setEditData(row);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (row: TaskProjectDevision) => {
        setConfirmDelete({ show: true, id: row.task_project_devision_id, title: row.title });
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete.id) return;
        const success = await handleDeleteTask(confirmDelete.id);
        if (success) {
            setConfirmDelete({ show: false });
        }
    };

    const handleModalSubmit = async (data: TaskProjectDevisionRequest) => {
        if (editData) {
            return await handleUpdateTask(editData.task_project_devision_id, data);
        } else {
            return await handleCreateTask(data);
        }
    };

    const columns: TableColumn<TaskProjectDevision>[] = [
        {
            name: 'Title',
            selector: row => row.title || '-',
            cell: row => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.title || '-'}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">{row.description || ''}</div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'PIC',
            selector: row => row.employee_name || '-',
            wrap: true,
        },
        {
            name: 'Date',
            selector: row => row.date_transaction || '-',
            cell: row => (
                <span>{row.date_transaction ? row.date_transaction.substring(0, 10) : '-'}</span>
            )
        },
        createByDateColumn('Updated By', 'updated_at', 'updated_by_name'),
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEditClick,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDeleteClick,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete'
            }
        ]),
    ];

    const SearchComponent = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">
            <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                    type="text"
                    placeholder="Search task... (Press Enter)"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`pl-10 py-2 w-full ${localSearch ? 'pr-10' : 'pr-4'}`}
                />
                {localSearch && (
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
    ), [localSearch, handleKeyPress, handleClearSearch]);

    return (
        <div className="space-y-6 mt-6">
            <div className="bg-white shadow rounded-lg px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {SearchComponent}
                <Button onClick={handleAddClick} className="flex items-center gap-2 flex-shrink-0">
                    <MdAdd size={20} />
                    <span className="whitespace-nowrap">Create Task</span>
                </Button>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="p-6 font-secondary">
                    <CustomDataTable
                        columns={columns}
                        data={tasks}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handleRowsPerPageChange}
                        fixedHeader={true}
                        fixedHeaderScrollHeight="500px"
                        responsive
                        highlightOnHover
                        noDataComponent={
                            <div className="text-center py-8">
                                <p className="text-gray-500">No tasks found</p>
                                <p className="text-sm text-gray-400">
                                    {searchValue ? 'Try adjusting your search' : 'Click "Create Task" to add one'}
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>

            <TaskProjectDevisionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                project_id={project_id}
                editData={editData}
                onGoToDivision={onGoToDivision}
            />

            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={handleDeleteConfirm}
                title="Delete Task"
                message={`Are you sure you want to delete task "${confirmDelete.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default TaskProjectDevisionTab;
