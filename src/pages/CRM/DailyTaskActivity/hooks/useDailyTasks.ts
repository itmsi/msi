import { useState, useEffect, useCallback } from 'react';
import type { BoardData } from 'react-kanban-kit';
import { DailyTaskServices } from '../services/dailyTaskServices';
import {
    DailyTask,
    DailyTaskHistory,
    DailyTaskFormData,
    TASK_STATUSES,
} from '../types/dailyTask';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 5;

type ColumnState = {
    tasks: DailyTask[];
    page: number;
    totalPages: number;
};

const initialColumnState = (): ColumnState => ({
    tasks: [],
    page: 1,
    totalPages: 1,
});

export const useDailyTasks = () => {
    const [dataSource, setDataSource] = useState<BoardData | null>(null);
    const [initialLoading, setInitialLoading] = useState(false);
    const [loadingColumns, setLoadingColumns] = useState<Record<string, boolean>>({});
    const [searchValue, setSearchValue] = useState('');
    const [priorityValue, setPriorityValue] = useState('');
    const [columns, setColumns] = useState<Record<string, ColumnState>>({
        hold: initialColumnState(),
        open: initialColumnState(),
        progress: initialColumnState(),
        done: initialColumnState(),
    });
    const [history, setHistory] = useState<DailyTaskHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [drawerHistory, setDrawerHistory] = useState<DailyTaskHistory[]>([]);
    const [drawerHistoryLoading, setDrawerHistoryLoading] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
    const [defaultStatus, setDefaultStatus] = useState<string>('open');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);

    const buildBoardData = useCallback((cols: Record<string, ColumnState>): BoardData => {
        const allTasks: DailyTask[] = [];
        Object.values(cols).forEach((col) => allTasks.push(...col.tasks));
        const colsMap: Record<string, string[]> = { hold: [], open: [], progress: [], done: [] };
        const boardItems: Record<string, any> = {};

        allTasks.forEach((task) => {
            const s = task.status || 'open';
            if (colsMap[s]) colsMap[s].push(task.daily_task_activitity_id);
            boardItems[task.daily_task_activitity_id] = {
                id: task.daily_task_activitity_id,
                title: task.daily_task,
                parentId: s,
                children: [],
                totalChildrenCount: 0,
                type: 'card',
                content: {
                    priority: task.priority,
                    created_by_name: task.created_by_name,
                    status: task.status,
                    updated_at: task.updated_at,
                    done_date: task.daily_task_activity_done_date,
                    created_at: task.created_at,
                    description: task.daily_task_activity_description,
                },
                isDraggable: true,
            };
        });

        const columnItems: Record<string, any> = {};
        TASK_STATUSES.forEach((col) => {
            const cs = cols[col.id];
            const ids = colsMap[col.id] || [];
            columnItems[col.id] = {
                id: col.id,
                title: col.title,
                parentId: 'root',
                children: ids,
                totalChildrenCount: Math.max(ids.length, cs && cs.page < cs.totalPages ? ids.length + 1 : ids.length),
            };
        });

        return {
            root: { id: 'root', title: 'Root', parentId: null, children: ['hold', 'open', 'progress', 'done'], totalChildrenCount: 4 },
            ...columnItems,
            ...boardItems,
        };
    }, []);

    const fetchColumn = useCallback(async (status: string, append: boolean = false, search?: string) => {
        try {
            setLoadingColumns((prev) => ({ ...prev, [status]: true }));
            const col = columns[status];
            const page = append ? col.page + 1 : 1;
            const res = await DailyTaskServices.getTasks({ page, limit: PAGE_SIZE, search: search ?? searchValue, priority: priorityValue, status });
            const taskList = res.data || [];
            const total = res.pagination?.totalPages || 1;
            setColumns((prev) => {
                const existing = prev[status];
                const updated: ColumnState = { page: append ? existing.page + 1 : 1, totalPages: total, tasks: append ? [...existing.tasks, ...taskList] : taskList };
                const newCols = { ...prev, [status]: updated };
                setDataSource(buildBoardData(newCols));
                return newCols;
            });
        } catch (err: any) {
            console.error('Error fetching ' + status + ':', err);
            toast.error('Failed to load tasks');
        } finally {
            setLoadingColumns((prev) => ({ ...prev, [status]: false }));
        }
    }, [columns, searchValue, priorityValue, buildBoardData]);

    // Refresh columns without initialLoading spinner (for filters)
    const refreshColumns = useCallback(async (search: string, priority: string) => {
        const fresh: Record<string, ColumnState> = { hold: initialColumnState(), open: initialColumnState(), progress: initialColumnState(), done: initialColumnState() };
        setColumns(fresh);
        setDataSource(buildBoardData(fresh));
        await Promise.all(TASK_STATUSES.map((col) =>
            DailyTaskServices.getTasks({ page: 1, limit: PAGE_SIZE, search, priority, status: col.id })
                .then((res) => {
                    setColumns((prev) => {
                        const updated: ColumnState = { page: 1, totalPages: res.pagination?.totalPages || 1, tasks: res.data || [] };
                        const nc = { ...prev, [col.id]: updated };
                        setDataSource(buildBoardData(nc));
                        return nc;
                    });
                }).catch((e) => console.error(e))
        ));
    }, [buildBoardData]);

    const fetchTasks = useCallback(async (search?: string, priority?: string) => {
        setInitialLoading(true);
        setSearchValue(search || '');
        const p = priority ?? priorityValue;
        if (priority !== undefined) setPriorityValue(priority);
        await refreshColumns(search || '', p);
        setInitialLoading(false);
    }, [buildBoardData, priorityValue, refreshColumns]);

    const fetchHistory = useCallback(async () => {
        try {
            setHistoryLoading(true);
            const res = await DailyTaskServices.getHistory({ daily_task_activitity_id: '', page: 1, limit: 50 });
            setHistory(res.data || []);
        } catch { } finally { setHistoryLoading(false); }
    }, []);

    const fetchDrawerHistory = useCallback(async (taskId: string) => {
        try {
            setDrawerHistoryLoading(true);
            const res = await DailyTaskServices.getHistory({ daily_task_activitity_id: taskId, page: 1, limit: 50 });
            setDrawerHistory(res.data || []);
        } catch { } finally { setDrawerHistoryLoading(false); }
    }, []);

    useEffect(() => { fetchTasks(); fetchHistory(); }, []);

    const handleSearch = useCallback((v: string) => fetchTasks(v), [fetchTasks]);
    const handlePriorityChange = useCallback((v: string) => {
        setPriorityValue(v);
        refreshColumns(searchValue, v);
    }, [refreshColumns, searchValue]);

    const loadMoreTasks = useCallback((columnId: string) => {
        const col = columns[columnId];
        if (!col || col.page >= col.totalPages || loadingColumns[columnId]) return;
        fetchColumn(columnId, true);
    }, [columns, loadingColumns, fetchColumn]);

    const handleCardMove = useCallback((move: { cardId: string; fromColumnId: string; toColumnId: string }) => {
        const { cardId, fromColumnId, toColumnId } = move;

        // Optimistic update: pindahkan card ke kolom tujuan
        setColumns((prev) => {
            const sourceCol = prev[fromColumnId];
            const targetCol = prev[toColumnId];
            if (!sourceCol || !targetCol) return prev;

            const card = sourceCol.tasks.find((t) => t.daily_task_activitity_id === cardId);
            if (!card) return prev;

            const updatedCard = { ...card, status: toColumnId as DailyTask['status'] };
            const newSource = { ...sourceCol, tasks: sourceCol.tasks.filter((t) => t.daily_task_activitity_id !== cardId) };
            const newTarget = { ...targetCol, tasks: [...targetCol.tasks, updatedCard] };
            const newCols = { ...prev, [fromColumnId]: newSource, [toColumnId]: newTarget };
            setDataSource(buildBoardData(newCols));
            return newCols;
        });

        DailyTaskServices.updateTask(cardId, { status: toColumnId } as DailyTaskFormData)
            .then(() => {
                toast.success('Task moved successfully');
                if (selectedTask?.daily_task_activitity_id === cardId) {
                    fetchDrawerHistory(cardId);
                }
            }).catch((_err) => {
                toast.error('Failed to update task status');
                fetchTasks(searchValue);
            });
    }, [fetchTasks, fetchHistory, searchValue, selectedTask, buildBoardData]);

    const openCreateModal = useCallback((status: string = 'open') => { setEditingTask(null); setDefaultStatus(status); setFormModalOpen(true); }, []);
    const openEditModal = useCallback((task: DailyTask) => { setEditingTask(task); setDefaultStatus(task.status); setFormModalOpen(true); }, []);
    const openDetailDrawer = useCallback((task: DailyTask) => { setSelectedTask(task); setDrawerOpen(true); fetchDrawerHistory(task.daily_task_activitity_id); }, [fetchDrawerHistory]);
    const closeDrawer = useCallback(() => { setDrawerOpen(false); setSelectedTask(null); }, []);

    const handleDeleteTask = useCallback(async (id: string) => {
        try { await DailyTaskServices.deleteTask(id); toast.success('Task deleted successfully'); fetchTasks(searchValue); if (selectedTask?.daily_task_activitity_id === id) closeDrawer(); }
        catch (err: any) { toast.error('Failed to delete task'); }
    }, [fetchTasks, searchValue, selectedTask, closeDrawer]);

    const handleSubmitForm = useCallback(async (data: DailyTaskFormData) => {
        try { editingTask ? await DailyTaskServices.updateTask(editingTask.daily_task_activitity_id, data) : await DailyTaskServices.createTask(data); toast.success(editingTask ? 'Task updated' : 'Task created'); setFormModalOpen(false); setEditingTask(null); fetchTasks(searchValue); }
        catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to save task'); }
    }, [editingTask, fetchTasks, searchValue]);

    const handleUpdateTask = useCallback(async (id: string, data: DailyTaskFormData) => { await DailyTaskServices.updateTask(id, data); toast.success('Task updated'); fetchTasks(searchValue); }, [fetchTasks, searchValue]);

    const tasks = Object.values(columns).flatMap((c) => c.tasks);

    return { tasks, dataSource, initialLoading, searchValue, priorityValue, history, historyLoading, drawerHistory, drawerHistoryLoading, formModalOpen, editingTask, defaultStatus, drawerOpen, selectedTask, setSearchValue, setFormModalOpen, handleSearch, handlePriorityChange, handleCardMove, openCreateModal, openEditModal, openDetailDrawer, closeDrawer, handleSubmitForm, handleUpdateTask, handleDeleteTask, loadMoreTasks, fetchTasks };
};
