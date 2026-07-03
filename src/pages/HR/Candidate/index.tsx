import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { candidateService } from './services/hrService';
import type { Candidate } from './types/hr';
import CandidateCard from './components/CandidateCard';
import CreateCandidateForm from './CreateCandidateForm';
import DetailCandidateOffcanvas from './components/DetailCandidateOffcanvas';
import PageMeta from '@/components/common/PageMeta';
import { toast } from 'react-hot-toast';
import { MdAdd, MdFilterListAlt, MdExpandLess, MdExpandMore, MdSearch, MdClear } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

const CandidatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    text: '',
    status: '',
    interviewer: '',
    company: '',
    department: '',
    position: '',
    sort: 'latest',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleToggleFilter = () => setShowAdvancedFilters(prev => !prev);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await candidateService.getList();
      setCandidates(result.data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Open detail if id param exists
  useEffect(() => {
    if (id && candidates.length > 0) {
      const found = candidates.find((c) => String(c.candidate_id) === id);
      if (found) {
        setSelectedCandidate(found);
        setShowDetail(true);
      }
    }
  }, [id, candidates]);

  const handleRetry = () => {
    fetchCandidates();
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    await fetchCandidates();
    setShowEdit(false);
    setShowDetail(false);
    setEditingCandidate(null);
  };

  const handleDelete = (candidate: Candidate) => {
    setDeletingCandidate(candidate);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCandidate) return;
    try {
      await candidateService.delete(deletingCandidate.candidate_id);
      await fetchCandidates();
      toast.success('Candidate deleted successfully!');
      setShowDeleteConfirm(false);
      setDeletingCandidate(null);
      setShowDetail(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete candidate';
      toast.error(message);
    }
  };

  const handleShowDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowDetail(true);
    navigate(`/hr/candidate/${candidate.candidate_id}`, { replace: true });
  };

  const handleCloseDetail = () => {
    fetchCandidates();
    setShowDetail(false);
    setSelectedCandidate(null);
    navigate('/hr/candidate', { replace: true });
  };

  // Pagination
  const pageSize = 24;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        const q = filters.text.toLowerCase();
        const assignRole = (c.schedule_interview && typeof c.schedule_interview.assign_role === 'string')
          ? c.schedule_interview.assign_role
          : '';
        const interviewerText = assignRole || '';
        const matchText = `${c.candidate_name} ${c.candidate_email} ${c.candidate_number} ${c.title_name || ''} ${c.candidate_status} ${interviewerText}`
          .toLowerCase()
          .includes(q);
        const matchStatus = filters.status ? c.candidate_status === filters.status : true;
        const matchInterviewer = filters.interviewer
          ? assignRole.split(',').map((s: string) => s.trim()).includes(filters.interviewer)
          : true;
        const matchCompany = filters.company ? c.company_name === filters.company : true;
        const matchDepartment = filters.department ? c.department_name === filters.department : true;
        const matchPosition = filters.position ? c.title_name === filters.position : true;
        return matchText && matchStatus && matchInterviewer && matchCompany && matchDepartment && matchPosition;
      })
      .sort((a, b) => {
        const dA = new Date(a.created_at).getTime();
        const dB = new Date(b.created_at).getTime();
        return filters.sort === 'latest' ? dB - dA : dA - dB;
      });
  }, [candidates, filters]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filteredCandidates.length / pageSize);
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage]);

  const uniqueCompanies = useMemo(
    () => [...new Set(candidates.map((c) => c.company_name).filter(Boolean) as string[])],
    [candidates]
  );

  const activeFilterCount = [filters.status, filters.interviewer, filters.company].filter(Boolean).length;

  return (
    <div>
      <PageMeta title="HR Candidates" description="Manage interview candidates" />

      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Candidate Management</h3>
              <p className="mt-1 text-sm text-gray-500">Manage interview candidates and their assessments</p>
            </div>
            <Button onClick={() => setShowAddForm(true)} size="sm" startIcon={<MdAdd className="w-4 h-4" />}>
              Add Candidate
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 font-secondary">
          <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <CreateCandidateForm
                  onSave={() => {
                    fetchCandidates();
                    setShowAddForm(false);
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
            {error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Failed to load candidates</p>
              <Button onClick={handleRetry} size="sm">Retry</Button>
            </div>
          ) : loading ? (
            <LoadingCandidates />
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
                <div className="flex-1">
                  <div className="relative flex">
                    <div className="relative flex-1">
                      <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        type="text"
                        placeholder="Search candidate..."
                        value={filters.text}
                        onChange={(e) => setFilters((f) => ({ ...f, text: e.target.value }))}
                        className={`pl-10 py-2 w-full ${filters.text ? 'pr-10' : 'pr-4'}`}
                      />
                      {filters.text && (
                        <Button
                          variant="transparent"
                          onClick={() => setFilters((f) => ({ ...f, text: '' }))}
                          className="absolute inset-y-0 right-0 pr-3! text-gray-400!"
                          type="button"
                        >
                          <MdClear className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CustomSelect
                    id="sort_order"
                    name="sort_order"
                    value={{ value: filters.sort, label: filters.sort === 'latest' ? 'Latest First' : 'Oldest First' }}
                    onChange={(opt) => setFilters((f) => ({ ...f, sort: opt?.value || 'latest' }))}
                    options={[
                      { value: 'latest', label: 'Latest First' },
                      { value: 'oldest', label: 'Oldest First' },
                    ]}
                    placeholder="Order by"
                    isClearable={false}
                    isSearchable={false}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleToggleFilter}
                    className="h-[42px]"
                    startIcon={<MdFilterListAlt className="w-4 h-4" />}
                    endIcon={showAdvancedFilters ? <MdExpandLess className="w-4 h-4" /> : <MdExpandMore className="w-4 h-4" />}
                  >
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-[#0253a5] text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Advanced Filters Collapse */}
              {showAdvancedFilters && (
                <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-48">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <CustomSelect
                      placeholder="All Status"
                      options={[
                        { value: 'Interviewed', label: 'Interviewed' },
                        { value: 'Scheduled', label: 'Scheduled' },
                        { value: 'Complete', label: 'Complete' },
                        { value: 'New', label: 'New' },
                      ]}
                      value={filters.status ? { value: filters.status, label: filters.status } : null}
                      onChange={(opt) => setFilters((f) => ({ ...f, status: opt?.value || '' }))}
                      isClearable
                      isSearchable={false}
                    />
                  </div>
                  <div className="w-48">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Interviewer</label>
                    <CustomSelect
                      placeholder="All Interviewers"
                      options={[
                        { value: 'HR', label: 'HR' },
                        { value: 'GM', label: 'GM' },
                        { value: 'VP', label: 'VP' },
                        { value: 'BOD', label: 'BOD' },
                        { value: 'PUB', label: 'PUB' },
                      ]}
                      value={filters.interviewer ? { value: filters.interviewer, label: filters.interviewer } : null}
                      onChange={(opt) => setFilters((f) => ({ ...f, interviewer: opt?.value || '' }))}
                      isClearable
                      isSearchable={false}
                    />
                  </div>
                  <div className="w-48">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
                    <CustomSelect
                      placeholder="All Companies"
                      options={uniqueCompanies.map((c) => ({ value: c, label: c }))}
                      value={filters.company ? { value: filters.company, label: filters.company } : null}
                      onChange={(opt) => setFilters((f) => ({ ...f, company: opt?.value || '' }))}
                      isClearable
                      isSearchable={false}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => setFilters((f) => ({ ...f, status: '', interviewer: '', company: '' }))}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span className="font-medium">{filteredCandidates.length}</span>
                <span className="mx-1">of</span>
                <span className="font-medium">{candidates.length}</span>
                <span className="ml-1">candidates</span>
              </div>

              {/* Candidate Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedCandidates.map((candidate) => (
                  <div key={candidate.candidate_id}>
                    <CandidateCard
                      candidate={candidate}
                      onView={() => handleShowDetail(candidate)}
                      onEdit={() => handleEdit(candidate)}
                      onDelete={() => handleDelete(candidate)}
                    />
                  </div>
                ))}
              </div>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-12 text-gray-500">No candidates found</div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredCandidates.length)} of{' '}
                    {filteredCandidates.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? 'primary' : 'outline'}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8! h-8! p-0! ${currentPage === pageNum ? '' : ''}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && editingCandidate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto px-6 pb-6">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-4 z-10 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Edit Candidate Profile</h2>
              <Button
                variant="transparent"
                onClick={() => { setShowEdit(false); setEditingCandidate(null); }}
                className="text-gray-400! text-xl"
              >
                &times;
              </Button>
            </div>
            <CreateCandidateForm
              initialData={editingCandidate}
              onSave={handleSaveEdit}
              onCancel={() => { setShowEdit(false); setEditingCandidate(null); }}
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingCandidate(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Candidate"
        message={<p className="text-sm text-gray-600">Are you sure you want to delete <strong>{deletingCandidate?.candidate_name}</strong>? This action cannot be undone.</p>}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        size="sm"
      />

      {/* Detail Offcanvas */}
      {showDetail && selectedCandidate && (
        <DetailCandidateOffcanvas
          candidate={selectedCandidate}
          onClose={handleCloseDetail}
          onEdit={() => { setEditingCandidate(selectedCandidate); setShowEdit(true); }}
          onDelete={() => handleDelete(selectedCandidate)}
          onUpdate={() => fetchCandidates()}
        />
      )}
    </div>
  );
};

const CandidateCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const LoadingCandidates = () => (
  <div>
    <p className="text-sm text-gray-400 mb-4">Loading candidates...</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <CandidateCardSkeleton />
        </div>
      ))}
    </div>
  </div>
);

export default CandidatePage;
