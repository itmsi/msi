import React, { useMemo, useCallback, useState } from 'react';
import { Kanban } from 'react-kanban-kit';
import type { BoardItem } from 'react-kanban-kit';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { MdAdd, MdSearch, MdClear } from 'react-icons/md';

import { PermissionGate } from '@/components/common/PermissionComponents';
import { useDailyTasks } from './hooks/useDailyTasks';
import TaskFormModal from './components/TaskFormModal';
import TaskDetailDrawer from './components/TaskDetailDrawer';
import HistoryTimeline from './components/HistoryTimeline';
import Badge from '@/components/ui/badge/Badge';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'react-hot-toast';
import { PRIORITY_OPTIONS } from './types/dailyTask';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import { ButtonSwitcher } from '@/components/ui/button/ButtonSwitcher';
import Avatar from '@/components/common/Avatar';
import moment from 'moment';

// ConfigMap type - defined locally because it's not re-exported from react-kanban-kit
interface CardRenderProps {
    data: BoardItem;
    column: BoardItem;
    index: number;
    isDraggable: boolean;
}

type ConfigMap = {
    [type: string]: {
        render: (props: CardRenderProps) => React.ReactNode;
        isDraggable?: boolean;
    };
};

const DailyTaskActivity: React.FC = () => {
    const {
        dataSource,
        initialLoading,
        tasks,
        history,
        historyLoading,
        drawerHistory,
        drawerHistoryLoading,
        formModalOpen,
        editingTask,
        defaultStatus,
        drawerOpen,
        selectedTask,
        setSearchValue,
        setFormModalOpen,
        handleSearch,
        handlePriorityChange,
        priorityValue,
        handleCardMove,
        openCreateModal,
        openDetailDrawer,
        closeDrawer,
        handleSubmitForm,
        handleUpdateTask,
        handleDeleteTask,
        loadMoreTasks,
    } = useDailyTasks();

    const { canCreate, canUpdate, canDelete } = usePermissions();

    // Permission-guarded handlers
    const guardedSubmitForm = useCallback(
        async (data: import('./types/dailyTask').DailyTaskFormData) => {
            if (!canCreate && !editingTask) {
                toast.error('You do not have permission to create tasks');
                return;
            }
            if (!canUpdate && editingTask) {
                toast.error('You do not have permission to update tasks');
                return;
            }
            await handleSubmitForm(data);
        },
        [handleSubmitForm, canCreate, canUpdate, editingTask]
    );

    const guardedUpdateTask = useCallback(
        async (id: string, data: import('./types/dailyTask').DailyTaskFormData) => {
            if (!canUpdate) {
                toast.error('You do not have permission to update tasks');
                return;
            }
            await handleUpdateTask(id, data);
        },
        [handleUpdateTask, canUpdate]
    );

    const [localSearch, setLocalSearch] = useState('');
    const [prioritySearch, setPrioritySearch] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    // Infinite scroll load more — per column
    const handleLoadMore = useCallback(
        (columnId: string) => {
            loadMoreTasks(columnId);
        },
        [loadMoreTasks]
    );

    // Handle search input change
    const onSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setLocalSearch(e.target.value);
        },
        []
    );

    // Handle search on Enter
    const onSearchKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSearch(localSearch);
            }
        },
        [handleSearch, localSearch]
    );

    // Clear search
    const onClearSearch = useCallback(() => {
        setLocalSearch('');
        setPrioritySearch('');
        setSearchValue('');
        handlePriorityChange('');
        handleSearch('');
    }, [handleSearch, handlePriorityChange, setSearchValue]);

    // Handle priority dropdown filter
    const onPriorityChange = useCallback(
        (val: { value: string; label: string } | null) => {
            const value = val?.value || '';
            setPrioritySearch(value);
            handlePriorityChange(value);
        },
        [handlePriorityChange]
    );

    // ConfigMap for card renderer
    const configMap: ConfigMap = useMemo(
        () => ({
            card: {
                render: ({ data }: CardRenderProps) => {
                    const priority = data.content?.priority || 'medium';
                    const priorityColor = priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success';
                    const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
                    const borderLeftColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#eab308' : '#22c55e';

                    // const colors: Record<string, string> = {
                    //     hold: 'border-gray-300 border-t-4',
                    //     open: 'border-blue-600 border-t-4',
                    //     progress: 'border-yellow-600 border-t-4',
                    //     done: 'border-green-600 border-t-4',
                    // };
                    // const colorClass = colors[data.parentId || 'hold'];
                    return (
                        <div
                            className={`bg-white rounded-lg p-3 cursor-pointer transition-colors duration-150 `}
                            style={{ backgroundColor: `${borderLeftColor}1A`, boxShadow: '0px 3px 10px -9px #6c6c6c' }}
                        >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h4 className="text-md font-medium text-gray-900 leading-snug line-clamp-2 flex-1">
                                    {data.title}
                                </h4>
                                <Badge color={priorityColor} variant="light" size="sm">
                                    {priorityLabel}
                                </Badge>
                            </div>
                            {data.content?.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                    {data.content.description}
                                </p>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Avatar
                                        src={null}
                                        nama={(data.content?.created_by_name || 'gak')}
                                        size={25}
                                        fontSize={9}
                                        alt="Profile Preview"
                                    />
                                    <span className="text-xs text-gray-400 truncate">
                                        {data.content?.created_by_name || data.content?.created_by?.substring(0, 6) || 'User'}
                                    </span>
                                </div>
                                {data.content?.status === 'done' && data.content?.done_date ? (
                                    <span className="text-xs text-gray-400">
                                        {moment(data.content.done_date).format('D MMMM YYYY')}
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        {data.content?.updated_at
                                            ? moment(data.content.updated_at).format('D MMMM YYYY')
                                            : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                },
                isDraggable: canUpdate,
            },
        }),
        [canUpdate]
    );

    // Handle card click to open detail drawer
    const handleCardClick = useCallback(
        (_e: React.MouseEvent<HTMLDivElement>, card: BoardItem) => {
            const task = tasks.find((t) => t.daily_task_activitity_id === card.id);
            if (task) {
                openDetailDrawer(task);
            }
        },
        [tasks, openDetailDrawer]
    );

    // Handle card move — dengan permission guard + toast
    const onCardMove = useCallback(
        (move: { cardId: string; fromColumnId: string; toColumnId: string }) => {
            if (!canUpdate) {
                toast.error('You do not have permission to move tasks');
                return;
            }
            if (move.fromColumnId === move.toColumnId) return;
            handleCardMove(move);
        },
        [handleCardMove, canUpdate]
    );

    // Column header renderer — simple like demo
    const renderColumnHeader = useCallback((column: BoardItem) => {
        const colors: Record<string, string> = {
            hold: 'bg-[#6B7280] border-[#6B7280] font-primary-bold text-white',
            open: 'bg-[#4F46E5] border-[#4F46E5] font-primary-bold text-white',
            progress: 'bg-[#F59E0B] border-[#F59E0B] font-primary-bold text-white',
            done: 'bg-[#22C55E] border-[#22C55E] font-primary-bold text-white',
        };
        const colorClass = colors[column.id] || colors.hold;

        return (
            <div 
                className={`px-3 py-2.5 rounded-lg ${colorClass} border border-${colorClass.split(' ')[2]}`}
                style={{ boxShadow: '0px 3px 6px -3px #6c6c6c' }}
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{column.title}</h3>
                    <span className="text-xs font-medium opacity-60">{column.totalChildrenCount}</span>
                </div>
            </div>
        );
    }, []);

    // Column footer — floating add button di luar scroll area
    const renderColumnFooter = useCallback(
        (column: BoardItem) => (
            <div className="px-3 py-3 border-t border-gray-200">
                <button
                    onClick={() => openCreateModal(column.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                >
                    <MdAdd size={16} />
                    Add Task
                </button>
            </div>
        ),
        [openCreateModal]
    );

    const SearchAndFilters = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search tasks... (Press Enter)"
                            value={localSearch}
                            onChange={onSearchChange}
                            onKeyPress={onSearchKeyPress}
                            className={`pl-10 py-2 w-full ${localSearch ? 'pr-10' : 'pr-4'}`}
                        />
                        {localSearch && (
                            <button
                                onClick={onClearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                type="button"
                            >
                                <MdClear className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
                <ButtonSwitcher
                    options={[
                        { value: '', label: 'All Priority' },
                        ...PRIORITY_OPTIONS.map((p) => ({ value: p.value, label: p.label, color: p.color })),
                    ]}
                    value={prioritySearch || priorityValue || ''}
                    onChange={(opt) => onPriorityChange({ value: opt.value, label: opt.label })}
                />
        </div>
    ), [localSearch, onSearchChange, onSearchKeyPress, onClearSearch]);

    return (
        <>
            <PageMeta
                title="Daily Task Activity"
                description="Manage and track your daily tasks with Kanban board"
                image="/motor-sights-international.png"
            />

            <div className="space-y-3">
                {/* Header */}
                <PageHeaderManage
                    title={'Daily Task Activity'}
                    subtitle={'Manage and track your daily tasks with Kanban board'}
                    className="mb-3"
                    actions={[
                        {
                        key: 'create',
                        element: (
                            <PermissionGate permission="create">
                                <Button
                                onClick={() => openCreateModal('open')}
                                    className="flex items-center gap-2"
                                >
                                    <MdAdd className="mr-2" size={20} />
                                    Create Task
                                </Button>
                            </PermissionGate>
                        )}
                    ]}
                />

                {/* Search & Filter */}
                <div className="bg-white shadow rounded-lg px-6 py-4">
                    {SearchAndFilters}
                </div>

                {/* Kanban Board */}
                {initialLoading || !dataSource ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                    </div>
                ) : (
                    <Kanban
                        dataSource={dataSource}
                        configMap={configMap}
                        onCardMove={onCardMove}
                        onCardClick={handleCardClick}
                        renderColumnHeader={renderColumnHeader}
                        renderColumnFooter={canCreate ? renderColumnFooter : undefined}
                        cardsGap={8}
                        virtualization={true}
                        loadMore={handleLoadMore}
                        renderSkeletonCard={() => (
                            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-3 animate-pulse">
                                <div className="h-4 bg-white rounded w-3/4 mb-2" />
                                <div className="h-3 bg-white rounded w-1/2" />
                            </div>
                        )}
                        rootStyle={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '0px',
                        }}
                        columnStyle={() => ({
                            backgroundColor: "#ffffff",
                            boxShadow: "rgba(0, 0, 0, 0.2) 5px 5px 7px -5px",
                        })}
                        columnWrapperStyle={() => ({
                            flex: '1',
                            width: '100%',
                            maxWidth: '100%',
                            maxHeight: '60vh',
                            overflow: 'auto',
                            padding: "10px" 
                        })}
                    />
                )}

                {/* History Section */}
                <div className="flex items-center gap-3 hidden"> {/* jika ingin memunculkan tabel, hapus aja "hidden" ini*/}
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <svg className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        History List
                    </button>
                </div>

                {showHistory && (
                    <HistoryTimeline history={history} loading={historyLoading} tasks={tasks} />
                )}
            </div>

            {/* Task Form Modal */}
            <TaskFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={guardedSubmitForm}
                editingTask={editingTask}
                defaultStatus={defaultStatus}
            />

            {/* Task Detail Drawer */}
            <TaskDetailDrawer
                isOpen={drawerOpen}
                onClose={closeDrawer}
                task={selectedTask}
                history={drawerHistory}
                historyLoading={drawerHistoryLoading}
                onSave={guardedUpdateTask}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onDelete={(id) => {
                    if (window.confirm('Are you sure you want to delete this task?')) {
                        handleDeleteTask(id);
                    }
                }}
            />
        </>
    );
};

export default DailyTaskActivity;
