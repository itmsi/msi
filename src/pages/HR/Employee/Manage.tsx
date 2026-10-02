import { MdAdd, MdOutlineDescription } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { motion } from 'framer-motion';
import { CandidateItem } from './types/Candidate';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
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
        activeFilterCount,
        setSearchValue,
        fetchCandidates,
        loadMore,
        handleFilterChange,
        handleSearch,
        handleClearSearch,
        handleClearFilters,
    } = useCandidateManagement();

    const [deletingCandidate, setDeletingCandidate] = useState<CandidateItem | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

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
                    <FilterSection
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        onSearch={handleSearch}
                        onClearSearch={handleClearSearch}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        defaultOpen={activeFilterCount !== 0}
                    />
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