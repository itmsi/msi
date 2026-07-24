import React, { useMemo, useCallback, useState } from 'react';
import { Kanban } from 'react-kanban-kit';
import type { BoardItem } from 'react-kanban-kit';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { MdAdd, MdSearch, MdClear, MdBusiness, MdListAlt, MdAttachMoney, MdHandshake, MdTrendingUp, MdExpandLess, MdExpandMore, MdFilterListAlt } from 'react-icons/md';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { useSalesStage } from './hooks/useSalesStage';
import OpportunityModal from './components/OpportunityModal';
import StageDetailDrawer from './components/StageDetailDrawer';
import OpportunityCard from './components/OpportunityCard';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'react-hot-toast';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import StatCard, { StatCardProps } from '@/components/ui/summaryCard/Statcard';
import { stageStyles } from './constants/stageIupStyles';
import { fmtShort } from './utils/formatters';
import FilterSection from './components/FilterSection';

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
        fetchData,
        urlFilters,
        handleFilterChange,
        handleClearAllFilters,
    } = useSalesStage();

    const { canCreate, canUpdate, canDelete } = usePermissions();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    

    const handleClearFilters = () => {
        handleClearAllFilters();
        setLocalSearch(''); // biar search box ikut kereset juga
    };

    // Toggle filter collapse
    const handleToggleFilter = () => {
        setShowAdvancedFilters(prev => !prev);
    };

    // Enable/disable drag based on permission
    React.useEffect(() => {
        updateBoardWithDrag(canUpdate);
    }, [canUpdate, updateBoardWithDrag]);

    const [localSearch, setLocalSearch] = useState(urlFilters.search);

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

    // Refresh detail + board after sub-task/assignment/review changes
    const handleRefreshDetail = useCallback(() => {
        if (selectedTask) {
            fetchDetail(selectedTask.opportunity_id);
        }
        fetchData();
    }, [selectedTask, fetchDetail, fetchData]);

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
                render: ({ data }: CardRenderProps) => (
                    <OpportunityCard title={data.title} content={data.content || {}} />
                ),
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
        const style = stageStyles[column.id] ?? stageStyles.find;
        const stageCodes: Record<string, string> = {
            find: 'STAGE 01', survey: 'STAGE 02', pull: 'STAGE 03',
            deal: 'STAGE 04', hypercare: 'STAGE 05',
        };
        return (
            <div className={`pt-2.5 px-3 bg-white`}>
                <div className={`flex items-center justify-between ${style.text}`}>
                    <div>
                        <span className="text-[10px] opacity-70 font-mono">{stageCodes[column.id]}</span>
                        <h3 className="text-md font-primary-bold">{column.title}</h3>
                    </div>
                    <PermissionGate permission={["create", "update"]}>
                        <Tooltip content={`Create Task ${column.title}`} position="top">
                            <Button
                                variant="transparent"
                                onClick={() => openCreateModal(column.id)}
                                className={`p-1.5 hover:text-white ${style.hoverBg} transition-all duration-150`}
                            >
                                <MdAdd size={16} />
                            </Button>
                        </Tooltip>
                    </PermissionGate>
                </div>
            </div>
        );
    }, [openCreateModal]);

    // SUMMARY CARDS
    const StatsCards = useMemo(() => {
        if (!stats) return null;
        const cards: StatCardProps[] = [
            {
                icon: MdBusiness,
                label: "IUP",
                value: stats.total_iup.toString(),
                color: "blue",
            },
            {
                icon: MdListAlt,
                label: "Opportunity",
                value: stats.total_opportunity.toString(),
                color: "green",
            },
            {
                icon: MdAttachMoney,
                label: "Total nilai",
                value: `Rp ${fmtShort(stats.total_value)}`,
                color: "amber",
            },
            {
                icon: MdHandshake,
                label: "Deal",
                value: stats.deal_count.toString(),
                color: "purple",
            },
            {
                icon: MdTrendingUp,
                label: "Rata-rata progres",
                value: `${stats.avg_progress}%`,
                color: "gray",
            },
        ];
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {cards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>
        );
    }, [stats]);

    const SearchAndFilters = useMemo(() => (<>
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
            <div className="flex items-center gap-2">
                <Button
                    onClick={handleToggleFilter}
                    className="h-10.5 px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300"
                    size="sm"
                >
                    <MdFilterListAlt className="w-4 h-4 mr-2" />
                    Filter
                    {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                </Button>
            </div>
        </div>
        
        {/* Advanced Filters Collapse */}
        {showAdvancedFilters && (
            <FilterSection
                onFilterChange={(field, value) => handleFilterChange({ [field]: value })}
                onClearFilters={handleClearFilters}
                urlFilters={urlFilters}
            />
        )}
    </>), [
            localSearch, onSearchChange, onSearchKeyPress, onClearSearch,
            onSolutionChange, urlFilters.solution, showAdvancedFilters,
            handleToggleFilter, handleFilterChange, handleClearFilters,
        ]);
    

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
                    <div className="[&_.rkk-column-wrapper]:gap-0!">
                        <Kanban
                            dataSource={dataSource}
                            configMap={configMap}
                            onCardClick={handleCardClick}
                            onCardMove={canUpdate ? handleCardMove : undefined}
                            renderColumnHeader={renderColumnHeader}
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
                                gap: '15px',
                                padding: '0px'
                            }}
                            cardWrapperStyle={() => ({
                                gap: '0px',
                            })}
                            columnListContentStyle={() => ({
                                padding: '10px',
                            })}
                            columnStyle={() => ({
                                backgroundColor: '#ffffff',
                                boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 7px -2px',
                                padding: '0px',
                            })}
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