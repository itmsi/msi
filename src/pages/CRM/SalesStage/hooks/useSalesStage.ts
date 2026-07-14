import { useState, useEffect, useCallback } from 'react';
import type { BoardData } from 'react-kanban-kit';
import { SalesStageServices } from '../services/salesStageService';
import type {
    SalesStageOpportunity,
    SalesStageStats,
    SalesStageCreateRequest,
} from '../types/salesStage';
import { STAGE_STATUSES } from '../types/salesStage';
import { toast } from 'react-hot-toast';

type ColumnState = {
    tasks: SalesStageOpportunity[];
};

const initialColumnState = (): ColumnState => ({
    tasks: [],
});

export const useSalesStage = () => {
    const [dataSource, setDataSource] = useState<BoardData | null>(null);
    const [initialLoading, setInitialLoading] = useState(false);
    const [stats, setStats] = useState<SalesStageStats | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [solutionFilter, setSolutionFilter] = useState('');
    const [columns, setColumns] = useState<Record<string, ColumnState>>({
        pull: initialColumnState(),
        survey: initialColumnState(),
        pitch: initialColumnState(),
        deal: initialColumnState(),
        hypercare: initialColumnState(),
    });
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<SalesStageOpportunity | null>(null);
    const [defaultStage, setDefaultStage] = useState<string>('pull');
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<SalesStageOpportunity | null>(null);
    const [allOpportunities, setAllOpportunities] = useState<SalesStageOpportunity[]>([]);

    const buildBoardData = useCallback((_cols: Record<string, ColumnState>, opps: SalesStageOpportunity[], canDrag: boolean = false): BoardData => {
        const colsMap: Record<string, string[]> = {
            pull: [], survey: [], pitch: [], deal: [], hypercare: []
        };
        const boardItems: Record<string, any> = {};

        opps.forEach((task) => {
            const s = task.stage || 'pull';
            if (colsMap[s]) colsMap[s].push(task.opportunity_id);
            boardItems[task.opportunity_id] = {
                id: task.opportunity_id,
                title: task.contractor || task.iup_name,
                parentId: s,
                children: [],
                totalChildrenCount: 0,
                type: 'card',
                content: {
                    ...task,
                },
                isDraggable: canDrag,
            };
        });

        const columnItems: Record<string, any> = {};
        STAGE_STATUSES.forEach((col) => {
            const ids = colsMap[col.id] || [];
            columnItems[col.id] = {
                id: col.id,
                title: col.title,
                children: ids,
                totalChildrenCount: ids.length,
                type: 'column',
                meta: { subtitle: col.subtitle, color: col.color },
            };
        });

        return {
            root: { id: 'root', title: 'Root', parentId: null, children: ['pull', 'survey', 'pitch', 'deal', 'hypercare'], totalChildrenCount: 5 },
            ...columnItems,
            ...boardItems,
        } as any;
    }, []);

    // Fetch all data
    const fetchData = useCallback(async (search = searchTerm, solution = solutionFilter) => {
        setInitialLoading(true);
        try {
            const response = await SalesStageServices.getList({
                page: 1,
                limit: 100,
                search: search,
                solution: solution,
                sort_by: 'created_at',
                sort_order: 'desc',
            });

            const allOpps: SalesStageOpportunity[] = [];
            Object.values(response.stages).forEach((group: any) => {
                if (group.items) allOpps.push(...group.items);
            });

            setAllOpportunities(allOpps);
            setStats(response.stats);

            const newCols: Record<string, ColumnState> = {
                pull: initialColumnState(),
                survey: initialColumnState(),
                pitch: initialColumnState(),
                deal: initialColumnState(),
                hypercare: initialColumnState(),
            };

            allOpps.forEach((opp) => {
                const s = opp.stage || 'pull';
                if (newCols[s]) {
                    newCols[s].tasks.push(opp);
                }
            });

            setColumns(newCols);
            setDataSource(buildBoardData(newCols, allOpps, false));
        } catch (error: any) {
            console.error('[SalesStage] Error fetching data:', error);
            toast.error(error?.message || 'Gagal memuat data');
        } finally {
            setInitialLoading(false);
        }
    }, [buildBoardData, searchTerm, solutionFilter]);

    useEffect(() => {
        fetchData('', '');
    }, []);

    // Search handler
    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        fetchData(value, solutionFilter);
    }, [fetchData, solutionFilter]);

    // Solution filter handler
    const handleSolutionChange = useCallback((value: string) => {
        setSolutionFilter(value);
        fetchData(searchTerm, value);
    }, [fetchData, searchTerm]);

    // Open create modal
    const openCreateModal = useCallback((stage: string) => {
        setDefaultStage(stage);
        setEditingTask(null);
        setFormModalOpen(true);
    }, []);

    // Close drawer
    const closeDetailDrawer = useCallback(() => {
        setDetailDrawerOpen(false);
        setSelectedTask(null);
        setDetailSubTasks([]);
        setDetailAssignments([]);
        setDetailReviews([]);
    }, []);

    // Submit form (create or update)
    const handleSubmitForm = useCallback(async (data: SalesStageCreateRequest) => {
        try {
            if (editingTask) {
                await SalesStageServices.update(editingTask.opportunity_id, data);
                toast.success('Opportunity berhasil diupdate');
            } else {
                await SalesStageServices.create(data);
                toast.success('Opportunity berhasil dibuat');
            }
            setFormModalOpen(false);
            setEditingTask(null);
            await fetchData(searchTerm, solutionFilter);
        } catch (error: any) {
            console.error('[SalesStage] Error submitting form:', error);
            toast.error(error?.message || 'Gagal menyimpan data');
        }
    }, [editingTask, fetchData, searchTerm, solutionFilter]);

    // Advance stage (move to next stage) — used from detail drawer
    const handleAdvanceStage = useCallback(async (opportunity: SalesStageOpportunity) => {
        const stageOrder = ['pull', 'survey', 'pitch', 'deal', 'hypercare'];
        const currentIdx = stageOrder.indexOf(opportunity.stage);
        if (currentIdx >= stageOrder.length - 1) {
            toast.error('Already at final stage');
            return;
        }
        const nextStage = stageOrder[currentIdx + 1];
        await moveToStage(opportunity, nextStage);
    }, [selectedTask]);

    // Drag & drop: pindahkan ke stage tujuan manapun
    const handleCardMove = useCallback(async (move: { cardId: string; fromColumnId: string; toColumnId: string }) => {
        const { cardId, toColumnId } = move;
        const opp = allOpportunities.find(o => o.opportunity_id === cardId);
        if (!opp || opp.stage === toColumnId) return;
        await moveToStage(opp, toColumnId);
    }, [allOpportunities, selectedTask]);

    // Helper: panggil API update stage + refresh
    const moveToStage = useCallback(async (opp: SalesStageOpportunity, targetStage: string) => {
        try {
            await SalesStageServices.update(opp.opportunity_id, { stage: targetStage } as any);
            toast.success(`Pindah ke ${targetStage}`);
            await fetchData(searchTerm, solutionFilter);
            if (selectedTask?.opportunity_id === opp.opportunity_id) {
                setSelectedTask({ ...opp, stage: targetStage as any });
            }
        } catch (error: any) {
            toast.error(error?.message || 'Gagal pindah stage');
        }
    }, [fetchData, searchTerm, solutionFilter, selectedTask]);

    // Delete opportunity
    const handleDeleteTask = useCallback(async (id: string) => {
        try {
            await SalesStageServices.delete(id);
            toast.success('Opportunity berhasil dihapus');
            closeDetailDrawer();
            await fetchData(searchTerm, solutionFilter);
        } catch (error: any) {
            toast.error(error?.message || 'Gagal menghapus data');
        }
    }, [fetchData, searchTerm, solutionFilter, closeDetailDrawer]);

    const updateBoardWithDrag = useCallback((canDrag: boolean) => {
        if (columns && allOpportunities.length > 0) {
            setDataSource(buildBoardData(columns, allOpportunities, canDrag));
        }
    }, [buildBoardData, columns, allOpportunities]);

    // ─── DETAIL STATE ───
    const [detailSubTasks, setDetailSubTasks] = useState<any[]>([]);
    const [detailAssignments, setDetailAssignments] = useState<any[]>([]);
    const [detailReviews, setDetailReviews] = useState<any[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchDetail = useCallback(async (opportunityId: string) => {
        setDetailLoading(true);
        try {
            const res = await SalesStageServices.getDetail({ opportunity_id: opportunityId });
            if (res.success) {
                setDetailSubTasks(res.data.opportunity_sub_tasks || []);
                setDetailAssignments(res.data.opportunity_assignment_solutions || []);
                setDetailReviews(res.data.opportunity_review_hypercares || []);
            }
        } catch (e: any) {
            console.error('[SalesStage] Error fetching detail:', e);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    // Open detail drawer — also fetch detail
    const openDetailDrawer = useCallback((task: SalesStageOpportunity) => {
        setSelectedTask(task);
        setDetailDrawerOpen(true);
        fetchDetail(task.opportunity_id);
    }, [fetchDetail]);

    return {
        dataSource,
        initialLoading,
        stats,
        allOpportunities,
        updateBoardWithDrag,
        columns,
        formModalOpen,
        editingTask,
        defaultStage,
        detailDrawerOpen,
        selectedTask,
        detailSubTasks,
        detailAssignments,
        detailReviews,
        detailLoading,
        searchValue,
        solutionFilter,
        setSearchValue,
        setFormModalOpen,
        setEditingTask,
        handleSearch,
        handleSolutionChange,
        openCreateModal,
        openDetailDrawer,
        closeDetailDrawer,
        handleSubmitForm,
        handleAdvanceStage,
        handleCardMove,
        handleDeleteTask,
        fetchDetail,
        setDetailSubTasks,
        setDetailAssignments,
        setDetailReviews,
    };
};
