import { MdAdd, MdOutlineDescription, MdSearch, MdClear, MdFilterListAlt, MdExpandLess, MdExpandMore } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { motion } from 'framer-motion';
import { CandidateItem } from './types/Candidate';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { useCandidateManagement } from './hooks/Usecandidatemanagement';
import { CandidateCardSkeleton } from './components/Candidatecardskeleton';
import { CandidateCard } from './components/Candidatecard';
// import { OfferingSummaryCards } from './components/OfferingSummaryCards';
import FilterSection from './components/FilterSection';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import { candidateService } from './services/hrService';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { toast } from 'react-hot-toast';

export default function ManageCandidate() {
    const navigate = useNavigate();
    const { id, groupId } = useParams<{ id?: string; groupId?: string }>();

    const {
        candidates,
        loading,
        loadingMore,
        hasMore,
        pagination,
        // offeringCount,
        filters,
        searchValue,
        setSearchValue,
        fetchCandidates,
        loadMore,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
        handleClearFilters,
    } = useCandidateManagement();

    const [deletingCandidate, setDeletingCandidate] = useState<CandidateItem | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const handleToggleFilter = () => setShowAdvancedFilters((prev) => !prev);

    const handleView = (row: CandidateItem) => {
        navigate(`/hr/candidate/${row.candidate_id}`);
    };

    const handleEdit = (row: CandidateItem) => {
        navigate(`/hr/candidate/${row.candidate_id}/edit`);
    };

    const handleDelete = (row: CandidateItem) => {
        setDeletingCandidate(row);
        setShowDeleteConfirm(true);
    };

    const closeDeleteModal = () => {
        if (deleteLoading) return;
        setShowDeleteConfirm(false);
        setDeletingCandidate(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingCandidate) return;
        setDeleteLoading(true);
        try {
            await candidateService.delete(deletingCandidate.candidate_id);
            toast.success('Candidate deleted successfully!');
            setShowDeleteConfirm(false);
            setDeletingCandidate(null);
            fetchCandidates(1, true, filters);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete candidate';
            toast.error(message);
        } finally {
            setDeleteLoading(false);
        }
    };
    useEffect(() => {
        if ((groupId || '') !== filters.group_id) {
            handleFilterChange({ group_id: groupId || '' });
        }
    }, [groupId]);

    useEffect(() => {
        if (id) {
            navigate(groupId ? `/hr/candidate/${id}?groupId=${groupId}` : `/hr/candidate/${id}`, { replace: true });
        }
    }, [id, groupId]);

    // Sentinel di bawah grid — begitu terlihat di viewport, ambil halaman berikutnya
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    loadMore();
                }
            },
            { rootMargin: '200px' } // mulai fetch sebelum benar-benar mentok bawah
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, loadMore]);

    const searchAndFilters = (<>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search candidate... (Press Enter to search)"
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

            <div className="flex items-center w-full md:w-44">
                <CustomSelect
                    id="sort_order"
                    name="sort_order"
                    value={filters.sort_order ? {
                        value: filters.sort_order,
                        label: filters.sort_order === 'asc' ? 'Ascending' : 'Descending'
                    } : null}
                    onChange={(selectedOption) =>
                        handleFilterChange({ sort_order: (selectedOption?.value as 'asc' | 'desc') || 'desc' })
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
                <Button
                    onClick={handleToggleFilter}
                    variant="outline"
                    size="sm"
                    className="h-10.5"
                >
                    <MdFilterListAlt className="w-4 h-4 mr-2" />
                    Filter
                    {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                </Button>
            </div>
        </div>

        {showAdvancedFilters && (
            <FilterSection
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />
        )}
    </>);

    return (
        <>
            <PageMeta
                title="Candidates - Motor Sights International"
                description="Manage recruitment candidates - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-3">
                {/* Header */}
                <PageHeaderManage
                    title={'Candidates'}
                    subtitle={'Manage recruitment candidates'}
                    className="mb-3"
                    actions={[
                        {
                            key: 'create',
                            element: (
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate(`/hr/candidate/create${location.search}`)}
                                        className="flex items-center gap-2"
                                    >
                                        <MdAdd className="mr-2" size={20} />
                                        Add Candidate
                                    </Button>
                                </PermissionGate>
                            )
                        }
                    ]}
                />

                {/* Offering status summary */}
                {/* <OfferingSummaryCards counts={offeringCount} total={pagination?.total ?? candidates.length} /> */}


                <div className="bg-white shadow rounded-lg px-6 py-4 mt-3">
                    {/* Search & filters */}
                    {searchAndFilters}
                </div>

                {/* Card grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CandidateCardSkeleton key={i} />
                        ))}
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#E7E9F0] py-16 text-center">
                        <MdOutlineDescription size={28} className="mx-auto mb-2 text-[#C4C9DA]" />
                        <div className="text-[#3A4260] font-primary-bold mb-1">No candidates match your search</div>
                        <div className="text-[13px] text-[#9AA2BA]">Try a different name, email, or clear the status filter.</div>
                    </div>
                ) : (
                    // <AnimatePresence mode='sync'>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                        key="list"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                            exit: { opacity: 0, y: -20 }
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        {candidates.map((c, index) => (
                            <CandidateCard key={c.candidate_id} candidate={c} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} index={index} />
                        ))}
                        {loadingMore &&
                            Array.from({ length: 8 }).map((_, i) => <CandidateCardSkeleton key={`more-${i}`} />)}
                    </motion.div>
                    // </AnimatePresence>
                )}

                {/* Infinite scroll trigger */}
                {!loading && candidates.length > 0 && (
                    <div ref={sentinelRef} className="flex items-center justify-center py-6">
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-[13px] text-[#9AA2BA]">
                                <span className="w-4 h-4 rounded-full border-2 border-[#E7E9F0] border-t-[#5B6480] animate-spin" />
                                Loading more candidates...
                            </div>
                        )}
                        {!hasMore && (
                            <span className="text-[12px] text-[#C4C9DA]">
                                You've reached the end · {pagination?.total ?? candidates.length} candidates total
                            </span>
                        )}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Delete Candidate"
                message={<p className="text-sm text-gray-600">Are you sure you want to delete <strong>{deletingCandidate?.candidate_name}</strong>? This action cannot be undone.</p>}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                loading={deleteLoading}
                size="sm"
            />
        </>
    );
}