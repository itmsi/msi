import React, { useMemo, useCallback, useState } from 'react';
import { Kanban } from 'react-kanban-kit';
import type { BoardItem } from 'react-kanban-kit';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { MdAdd, MdSearch, MdClear } from 'react-icons/md';
import CustomSelect from '@/components/form/select/CustomSelect';

import { useDailyTasks } from './hooks/useDailyTasks';
import TaskFormModal from './components/TaskFormModal';
import TaskDetailDrawer from './components/TaskDetailDrawer';
import HistoryTimeline from './components/HistoryTimeline';
import Badge from '@/components/ui/badge/Badge';
import { PRIORITY_OPTIONS } from './types/dailyTask';

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

    const [localSearch, setLocalSearch] = useState('');
    const [prioritySearch, setPrioritySearch] = useState('');

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

                    return (
                        <div
                            className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-blue-300 transition-colors duration-150"
                            style={{ borderLeft: `4px solid ${borderLeftColor}` }}
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
                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-[10px] font-medium text-gray-500">
                                            {(data.content?.created_by || '?')[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400 truncate max-w-[100px]">
                                        {data.content?.created_by_name || data.content?.created_by?.substring(0, 6) || 'User'}
                                    </span>
                                </div>
                                {data.content?.status === 'done' && data.content?.done_date ? (
                                    <span className="text-xs text-gray-400">
                                        {new Date(data.content.done_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        {data.content?.updated_at
                                            ? new Date(data.content.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                },
                isDraggable: true,
            },
        }),
        []
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

    // Handle card move — delegasikan ke hook untuk optimistic update
    const onCardMove = useCallback(
        (move: { cardId: string; fromColumnId: string; toColumnId: string }) => {
            if (move.fromColumnId === move.toColumnId) return;
            handleCardMove(move);
        },
        [handleCardMove]
    );

    // Column header renderer — simple like demo
    const renderColumnHeader = useCallback((column: BoardItem) => {
        const colors: Record<string, string> = {
            hold: 'bg-gray-100 text-gray-700 border-gray-300',
            open: 'bg-blue-50 text-blue-700 border-blue-200',
            progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            done: 'bg-green-50 text-green-700 border-green-200',
        };
        const colorClass = colors[column.id] || colors.hold;

        return (
            <div className={`px-3 py-2.5 rounded-lg ${colorClass} border border-${colorClass.split(' ')[2]}`}>
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

    return (
        <>
            <PageMeta
                title="Daily Task Activity"
                description="Manage and track your daily tasks with Kanban board"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daily Task Activity</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and track your daily tasks with Kanban board
                        </p>
                    </div>
                    <Button onClick={() => openCreateModal('open')} className="flex items-center gap-2">
                        <MdAdd size={18} />
                        New Task
                    </Button>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search tasks... (Press Enter)"
                            value={localSearch}
                            onChange={onSearchChange}
                            onKeyPress={onSearchKeyPress}
                            className="pl-10"
                        />
                        {localSearch && (
                            <button
                                onClick={onClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <MdClear size={18} />
                            </button>
                        )}
                    </div>
                    <div className="w-full sm:w-44">
                        <CustomSelect
                            options={[
                                { value: '', label: 'All Priority' },
                                ...PRIORITY_OPTIONS.map((p) => ({ value: p.value, label: p.label })),
                            ]}
                            value={
                                [
                                    { value: '', label: 'All Priority' },
                                    ...PRIORITY_OPTIONS.map((p) => ({ value: p.value, label: p.label })),
                                ].find((o) => o.value === (prioritySearch || priorityValue)) || null
                            }
                            onChange={onPriorityChange}
                            isClearable={false}
                        />
                    </div>
                </div>

                {/* Kanban Board */}
                {initialLoading || !dataSource ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                    </div>
                ) : (
                    <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-3">
                        <Kanban
                            dataSource={dataSource}
                            configMap={configMap}
                            onCardMove={onCardMove}
                            onCardClick={handleCardClick}
                            renderColumnHeader={renderColumnHeader}
                            renderColumnFooter={renderColumnFooter}
                            cardsGap={8}
                            virtualization={true}
                            loadMore={handleLoadMore}
                            renderSkeletonCard={() => (
                                <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-3 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            )}
                            rootStyle={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '12px',
                            }}
                            columnWrapperStyle={() => ({
                                flex: '1',
                                width: '100%',
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                overflow: 'auto',
                            })}
                        />
                    </div>
                )}

                {/* History Section */}
                <HistoryTimeline history={history} loading={historyLoading} tasks={tasks} />
            </div>

            {/* Task Form Modal */}
            <TaskFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleSubmitForm}
                editingTask={editingTask}
                defaultStatus={defaultStatus}
            />

            {/* Task Detail Drawer */}
            <TaskDetailDrawer
                isOpen={drawerOpen}
                onClose={closeDrawer}
                task={selectedTask}
                history={history}
                historyLoading={historyLoading}
                onSave={handleUpdateTask}
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
