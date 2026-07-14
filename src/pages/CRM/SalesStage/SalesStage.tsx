import React, { useMemo, useCallback, useState } from 'react';
import { Kanban } from 'react-kanban-kit';
import type { BoardItem } from 'react-kanban-kit';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { MdAdd, MdSearch, MdClear, MdBusiness, MdListAlt, MdAttachMoney, MdHandshake, MdTrendingUp } from 'react-icons/md';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { useSalesStage } from './hooks/useSalesStage';
import OpportunityModal from './components/OpportunityModal';
import StageDetailDrawer from './components/StageDetailDrawer';
import Badge from '@/components/ui/badge/Badge';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'react-hot-toast';
import { SOLUTION_OPTIONS, SOLUTION_COLORS } from './types/salesStage';
import PageHeaderManage from '@/components/common/PageHeaderManage';

const fmtCard = (v: string | null) => {
    const n = parseInt((v || '').replace(/\D/g, ''), 10);
    return isNaN(n) ? (v || '-') : `Rp ${fmtShort(n)}`;
};

const fmtShort = (v: number) => {
    if (v >= 1_000_000_000_000) return `${(v / 1_000_000_000_000).toFixed(v % 1_000_000_000_000 === 0 ? 0 : 1)} T`;
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(v % 1_000_000_000 === 0 ? 0 : 1)} M`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)} Jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)} Rb`;
    return v.toString();
};

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

const SalesStage: React.FC = () => {
    const {
        dataSource,
        initialLoading,
        stats,
        updateBoardWithDrag,
        allOpportunities,
        formModalOpen,
        editingTask,
        defaultStage,
        detailDrawerOpen,
        selectedTask,
        detailSubTasks,
        detailAssignments,
        detailReviews,
        detailLoading,
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
        solutionFilter,
    } = useSalesStage();

    const { canCreate, canUpdate, canDelete } = usePermissions();

    // Enable/disable drag based on permission
    React.useEffect(() => {
        updateBoardWithDrag(canUpdate);
    }, [canUpdate, updateBoardWithDrag]);

    const [localSearch, setLocalSearch] = useState('');

    const guardedSubmitForm = useCallback(
        async (data: import('../SalesStage/types/salesStage').SalesStageCreateRequest) => {
            if (!canCreate && !editingTask) {
                toast.error('You do not have permission to create');
                return;
            }
            if (!canUpdate && editingTask) {
                toast.error('You do not have permission to update');
                return;
            }
            await handleSubmitForm(data);
        },
        [handleSubmitForm, canCreate, canUpdate, editingTask]
    );

    const guardedDelete = useCallback(
        (id: string) => {
            if (!canDelete) {
                toast.error('You do not have permission to delete');
                return;
            }
            handleDeleteTask(id);
        },
        [handleDeleteTask, canDelete]
    );

    const guardedAdvance = useCallback(
        (opp: any) => {
            if (!canUpdate) {
                toast.error('You do not have permission to move');
                return;
            }
            handleAdvanceStage(opp);
        },
        [handleAdvanceStage, canUpdate]
    );

    // Refresh detail after sub-task/assignment/review changes
    const handleRefreshDetail = useCallback(() => {
        if (selectedTask) {
            fetchDetail(selectedTask.opportunity_id);
        }
    }, [selectedTask, fetchDetail]);

    // Open edit modal from drawer
    const handleEditOpportunity = useCallback(
        (opp: any) => {
            setEditingTask(opp);
            setFormModalOpen(true);
        },
        [setEditingTask, setFormModalOpen]
    );

    // Handle search on Enter
    const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearch(e.target.value);
    }, []);

    const onSearchKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSearch(localSearch);
            }
        },
        [handleSearch, localSearch]
    );

    const onClearSearch = useCallback(() => {
        setLocalSearch('');
        handleSearch('');
    }, [handleSearch]);

    const onSolutionChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            handleSolutionChange(e.target.value);
        },
        [handleSolutionChange]
    );

    // ConfigMap for card renderer
    const configMap: ConfigMap = useMemo(
        () => ({
            card: {
                render: ({ data }: CardRenderProps) => {
                    const content = data.content || {};
                    const stage = content.stage || 'pull';
                    const borderColors: Record<string, string> = {
                        pull: '#6B7280', survey: '#4F46E5', pitch: '#F59E0B',
                        deal: '#22C55E', hypercare: '#BE185D',
                    };
                    const borderColor = borderColors[stage] || borderColors.pull;
                    const secondary = content.contractor ? `IUP: ${content.iup_name}` : (content.province || '');

                    return (
                        <div
                            className="bg-white rounded-lg p-3 cursor-pointer transition-all duration-150 hover:shadow-md"
                            style={{ borderLeft: `4px solid ${borderColor}`, boxShadow: '0px 3px 10px -9px #6c6c6c' }}
                        >
                            {/* Top: nama utama + commodity chip */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 flex-1">
                                    {data.title}
                                </h4>
                                {content.commodity === 'nikel' ? (
                                    <Badge color="indigo" variant="light" size="sm">NIKEL</Badge>
                                ) : content.commodity === 'batubara' ? (
                                    <Badge color="dark" variant="light" size="sm">BATUBARA</Badge>
                                ) : null}
                            </div>
                            {/* Secondary: IUP name or location */}
                            <p className="text-[11px] text-gray-400 mb-1">{secondary}</p>
                            {/* Sales name with dot */}
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"></span>
                                <span className="text-[10.5px] text-gray-500">{content.sales_name || '-'}</span>
                            </div>
                            {/* Solution tag */}
                            {content.solution && (
                                <div className="mb-1.5">
                                    <Badge
                                        color={(SOLUTION_COLORS[content.solution] || 'info') as any}
                                        variant="light"
                                        size="sm"
                                    >
                                        {content.solution}
                                    </Badge>
                                </div>
                            )}
                            {!content.solution && stage !== 'pull' && stage !== 'survey' && (
                                <div className="mb-1.5">
                                    <Badge color="warning" variant="light" size="sm">
                                        <MdSearch size={12} className="inline mr-0.5" />
                                        Analyzing...
                                    </Badge>
                                </div>
                            )}
                            {!content.solution && (stage === 'pull' || stage === 'survey') && (
                                <div className="mb-1.5">
                                    <Badge color="dark" variant="light" size="sm">
                                        Pending
                                    </Badge>
                                </div>
                            )}
                            {/* Footer: value + progress or hypercare info */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                {stage === 'hypercare' ? (
                                    <>
                                        <span className="text-[11px] text-gray-400">{content.total_reviews || 0} review</span>
                                        <Badge color="success" variant="light" size="sm">Positif</Badge>
                                    </>
                                ) : stage === 'deal' && content.actual_value ? (
                                    <>
                                        <span className="text-[11px] font-semibold text-green-600">{fmtCard(content.actual_value)}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] text-gray-400">{fmtCard(content.value)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[11px] text-gray-500 font-medium">{fmtCard(content.value)}</span>
                                        <div className="w-8 h-8 rounded-full relative flex-none"
                                            style={{
                                                background: `conic-gradient(var(--primary-600, #1E4FA0) ${content.progress_pct || 0}%, #e5e7eb 0)`
                                            }}
                                        >
                                            <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
                                                <span className="text-[8px] font-mono font-bold">{content.progress_pct || 0}%</span>
                                            </div>
                                        </div>
                                    </>
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

    // Handle card click
    const handleCardClick = useCallback(
        (_e: React.MouseEvent<HTMLDivElement>, card: BoardItem) => {
            const task = allOpportunities.find((t) => t.opportunity_id === card.id);
            if (task) {
                openDetailDrawer(task);
            }
        },
        [allOpportunities, openDetailDrawer]
    );

    // Column header renderer
    const renderColumnHeader = useCallback((column: BoardItem) => {
        const colors: Record<string, string> = {
            pull: 'bg-[#6B7280]',
            survey: 'bg-[#4F46E5]',
            pitch: 'bg-[#F59E0B]',
            deal: 'bg-[#22C55E]',
            hypercare: 'bg-[#BE185D]',
        };
        const colorClass = colors[column.id] || colors.pull;

        const stageCodes: Record<string, string> = {
            pull: 'STAGE 01', survey: 'STAGE 02', pitch: 'STAGE 03',
            deal: 'STAGE 04', hypercare: 'STAGE 05',
        };

        return (
            <div className={`px-3 py-2.5 rounded-lg ${colorClass} text-white`}
                style={{ boxShadow: '0px 3px 6px -3px #6c6c6c' }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] opacity-70 font-mono">{stageCodes[column.id]}</span>
                        <h3 className="text-sm font-semibold">{column.title}</h3>
                    </div>
                    <span className="text-xs font-medium opacity-60">{column.totalChildrenCount}</span>
                </div>
            </div>
        );
    }, []);

    // Column footer — add button
    const renderColumnFooter = useCallback(
        (column: BoardItem) => (
            <div className="px-3 py-3 border-t border-gray-200">
                <button
                    onClick={() => openCreateModal(column.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                >
                    <MdAdd size={16} />
                    Add Opportunity
                </button>
            </div>
        ),
        [openCreateModal]
    );

    // Stats cards
    const StatsCards = useMemo(() => {
        if (!stats) return null;
        const cards = [
            { icon: <MdBusiness size={20} />, label: 'IUP', value: stats.total_iup.toString(), color: 'primary' },
            { icon: <MdListAlt size={20} />, label: 'Opportunity', value: stats.total_opportunity.toString(), color: 'success' },
            { icon: <MdAttachMoney size={20} />, label: 'Total nilai', value: `Rp ${fmtShort(stats.total_value)}`, color: 'warning' },
            { icon: <MdHandshake size={20} />, label: 'Deal', value: stats.deal_count.toString(), color: 'purple' },
            { icon: <MdTrendingUp size={20} />, label: 'Rata-rata progres', value: `${stats.avg_progress}%`, color: 'dark' },
        ];

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {cards.map((card, idx) => {
                    const colorMap: Record<string, string> = {
                        primary: 'bg-blue-50 text-blue-700',
                        success: 'bg-green-50 text-green-700',
                        warning: 'bg-amber-50 text-amber-700',
                        purple: 'bg-purple-50 text-purple-700',
                        dark: 'bg-gray-100 text-gray-700',
                    };
                    return (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${colorMap[card.color]}`}>
                                {card.icon}
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">{card.value}</div>
                                <div className="text-xs text-gray-500">{card.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [stats]);

    const SearchAndFilters = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Cari IUP, kontraktor, solusi... (Tekan Enter)"
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
            <select
                value={solutionFilter}
                onChange={onSolutionChange}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
                {SOLUTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    ), [localSearch, onSearchChange, onSearchKeyPress, onClearSearch, onSolutionChange, solutionFilter]);

    return (
        <>
            <PageMeta
                title="Sales Stage"
                description="Monitor sales pipeline from Find to Deal"
            />

            <div className="space-y-3">
                {/* Header */}
                <PageHeaderManage
                    title="Sales Stage"
                    subtitle="Monitor tahapan sales dari Find sampai Deal"
                    className="mb-3"
                    actions={[
                        {
                            key: 'create',
                            element: (
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => openCreateModal('pull')}
                                        className="flex items-center gap-2"
                                    >
                                        <MdAdd className="mr-2" size={20} />
                                        Tambah Opportunity
                                    </Button>
                                </PermissionGate>
                            ),
                        },
                    ]}
                />

                {/* Stats Cards */}
                {StatsCards}

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
                        onCardClick={handleCardClick}
                        onCardMove={canUpdate ? handleCardMove : undefined}
                        renderColumnHeader={renderColumnHeader}
                        renderColumnFooter={canCreate ? renderColumnFooter : undefined}
                        cardsGap={8}
                        virtualization={true}
                        renderSkeletonCard={() => (
                            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-3 animate-pulse">
                                <div className="h-4 bg-white rounded w-3/4 mb-2" />
                                <div className="h-3 bg-white rounded w-1/2" />
                            </div>
                        )}
                        rootStyle={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '0px',
                        }}
                        columnStyle={() => ({
                            backgroundColor: '#ffffff',
                            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 7px -2px',
                        })}
                        columnWrapperStyle={() => ({
                            flex: '1',
                            width: '100%',
                            maxWidth: '100%',
                            maxHeight: '60vh',
                            overflow: 'auto',
                            padding: '10px',
                        })}
                    />
                )}

                {/* Modals */}
                <OpportunityModal
                    isOpen={formModalOpen}
                    onClose={() => {
                        setFormModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSubmit={guardedSubmitForm}
                    editingTask={editingTask}
                    defaultStage={defaultStage}
                />

                <StageDetailDrawer
                    isOpen={detailDrawerOpen}
                    onClose={closeDetailDrawer}
                    opportunity={selectedTask}
                    onEdit={handleEditOpportunity}
                    onAdvance={guardedAdvance}
                    onDelete={guardedDelete}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    subTasks={detailSubTasks}
                    assignments={detailAssignments}
                    reviews={detailReviews}
                    detailLoading={detailLoading}
                    onRefresh={handleRefreshDetail}
                />
            </div>
        </>
    );
};

export default SalesStage;
