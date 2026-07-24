import React, { useState, useCallback } from 'react';
import { Offcanvas } from '@/components/ui/offcanvas';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
import { MdDelete, MdClose, MdAttachFile } from 'react-icons/md';
import type {
    SalesStageOpportunity,
    OpportunitySubTask,
    OpportunityAssignmentSolution,
    OpportunityReviewHypercare,
} from '../types/salesStage';
import { SOLUTION_COLORS } from '../types/salesStage';
import { SalesStageServices } from '../services/salesStageService';
import { toast } from 'react-hot-toast';
import { LoadingOverlay } from '@/components/common/Loading';

const fmt = (v: string | null) => {
    const n = parseInt((v || '').replace(/\D/g, ''), 10);
    return isNaN(n) ? (v || '-') : `Rp ${n.toLocaleString('id-ID')}`;
};

const STAGE_CODE: Record<string, string> = {
    find: 'STAGE 01', survey: 'STAGE 02', pull: 'STAGE 03',
    deal: 'STAGE 04', hypercare: 'STAGE 05',
};
const STAGE_LABEL: Record<string, string> = {
    find: 'Find', survey: 'Survey', pull: 'Pull', deal: 'Deal', hypercare: 'Hypercare',
};

const checkSvg = '<svg viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

interface OpportunityDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    opportunity: SalesStageOpportunity | null;
    onEdit: (opp: SalesStageOpportunity) => void;
    onAdvance: (opp: SalesStageOpportunity) => void;
    onDelete: (id: string) => void;
    canUpdate?: boolean;
    canDelete?: boolean;
    // detail data
    subTasks: OpportunitySubTask[];
    assignments: OpportunityAssignmentSolution[];
    reviews: OpportunityReviewHypercare[];
    detailLoading: boolean;
    onRefresh: () => void;
}

const StageDetailDrawer: React.FC<OpportunityDetailDrawerProps> = ({
    isOpen,
    onClose,
    opportunity,
    onEdit,
    onAdvance,
    onDelete,
    canUpdate = true,
    canDelete = true,
    subTasks,
    assignments,
    reviews,
    detailLoading,
    onRefresh,
}) => {
    const [expandedSubTask, setExpandedSubTask] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [evidenceInput, setEvidenceInput] = useState<Record<string, string>>({});
    const [pendingEvidence, setPendingEvidence] = useState<Record<string, string[]>>({});
    const [removedEvidence, setRemovedEvidence] = useState<Record<string, Set<number>>>({});
    const [subtaskNotes, setSubtaskNotes] = useState<Record<string, string>>({});
    const [savingSubTask, setSavingSubTask] = useState<string | null>(null);
    const [newReviewImpact, setNewReviewImpact] = useState('positive');
    const [newReviewDesc, setNewReviewDesc] = useState('');
    const [newReviewDate, setNewReviewDate] = useState(new Date().toISOString().split('T')[0]);
    const [editActualValue, setEditActualValue] = useState('');
    const [expandedReview, setExpandedReview] = useState<string | null>(null);
    const [editReviewData, setEditReviewData] = useState<Record<string, {
        reviewer: string;
        date: string;
        impact: string;
        description: string;
    }>>({});

    // ─── ALL HOOKS MUST BE BEFORE EARLY RETURN ───
    const handleToggleSubTask = useCallback(async (st: OpportunitySubTask) => {
        const newStatus = st.opportunity_sub_task_status === 'done' ? 'pending' : 'done';
        try {
            await SalesStageServices.updateSubTask(st.opportunity_sub_task_id, { opportunity_sub_task_status: newStatus } as any);
            toast.success(newStatus === 'done' ? 'Sub-task selesai' : 'Sub-task dibatalkan');
            onRefresh();
        } catch { toast.error('Gagal update sub-task'); }
    }, [onRefresh]);

    const handleLocalAddEvidence = useCallback((stId: string) => {
        const val = (evidenceInput[stId] || '').trim();
        if (!val) return;
        setPendingEvidence(prev => ({ ...prev, [stId]: [...(prev[stId] || []), val] }));
        setEvidenceInput(prev => ({ ...prev, [stId]: '' }));
    }, [evidenceInput]);

    const handleLocalRemoveEvidence = useCallback((stId: string, savedLen: number, idx: number) => {
        const pendingIdx = idx - savedLen;
        if (pendingIdx >= 0) {
            // Remove from pending
            setPendingEvidence(prev => ({
                ...prev,
                [stId]: (prev[stId] || []).filter((_, i) => i !== pendingIdx)
            }));
        } else {
            // Mark saved evidence for removal
            setRemovedEvidence(prev => {
                const set = new Set(prev[stId] || []);
                set.add(idx);
                return { ...prev, [stId]: set };
            });
        }
    }, []);

    const handleSaveSubTask = useCallback(async (st: OpportunitySubTask) => {
        setSavingSubTask(st.opportunity_sub_task_id);
        try {
            const savedFiles: string[] = Array.isArray(st.opportunity_sub_task_file) ? st.opportunity_sub_task_file : [];
            const removedSet = removedEvidence[st.opportunity_sub_task_id] || new Set();
            const filteredSaved = savedFiles.filter((_, i) => !removedSet.has(i));
            const pending = pendingEvidence[st.opportunity_sub_task_id] || [];
            const mergedFiles = [...filteredSaved, ...pending];
            const note = subtaskNotes[st.opportunity_sub_task_id];

            const updateData: Record<string, any> = {};
            updateData.opportunity_sub_task_file = mergedFiles;
            if (note !== undefined) {
                updateData.opportunity_sub_task_description = note;
            }

            await SalesStageServices.updateSubTask(st.opportunity_sub_task_id, updateData as any);
            setPendingEvidence(prev => ({ ...prev, [st.opportunity_sub_task_id]: [] }));
            setRemovedEvidence(prev => ({ ...prev, [st.opportunity_sub_task_id]: new Set() }));
            toast.success('Sub-task disimpan');
            onRefresh();
        } catch { toast.error('Gagal menyimpan sub-task'); }
        finally { setSavingSubTask(null); }
    }, [pendingEvidence, removedEvidence, subtaskNotes, onRefresh]);

    const handleAddSubTask = useCallback(async () => {
        if (!newTaskTitle.trim() || !opportunity) return;
        const currentStage = opportunity.stage;
        try {
            await SalesStageServices.createSubTask({
                opportunity_id: opportunity.opportunity_id,
                opportunity_stage: currentStage,
                opportunity_sub_task_title: newTaskTitle.trim(),
            });
            setNewTaskTitle('');
            toast.success('Sub-task ditambahkan');
            onRefresh();
        } catch { toast.error('Gagal tambah sub-task'); }
    }, [newTaskTitle, opportunity, onRefresh]);

    const handleDeleteSubTask = useCallback(async (id: string) => {
        try {
            await SalesStageServices.deleteSubTask(id);
            toast.success('Sub-task dihapus');
            onRefresh();
        } catch { toast.error('Gagal hapus sub-task'); }
    }, [onRefresh]);

    // ─── ASSIGNMENT HANDLERS ───
    const [newAssContractor, setNewAssContractor] = useState('');
    const [newAssSolution, setNewAssSolution] = useState('');
    const [newAssSales, setNewAssSales] = useState('');

    const handleAddAssignment = useCallback(async () => {
        if (!newAssContractor.trim() || !opportunity) return;
        try {
            await SalesStageServices.createAssignment({
                opportunity_id: opportunity.opportunity_id,
                customer_id: newAssContractor.trim(),
                opportunity_assignment_solution: newAssSolution || undefined,
                employee_id: newAssSales || undefined,
            });
            setNewAssContractor('');
            setNewAssSolution('');
            setNewAssSales('');
            toast.success('Assignment ditambahkan');
            onRefresh();
        } catch { toast.error('Gagal tambah assignment'); }
    }, [newAssContractor, newAssSolution, newAssSales, opportunity, onRefresh]);

    const handleDeleteAssignment = useCallback(async (id: string) => {
        try {
            await SalesStageServices.deleteAssignment(id);
            toast.success('Assignment dihapus');
            onRefresh();
        } catch { toast.error('Gagal hapus assignment'); }
    }, [onRefresh]);

    // ─── REVIEW HANDLERS ───
    const handleAddReview = useCallback(async () => {
        if (!opportunity) return;
        try {
            await SalesStageServices.createReview({
                opportunity_id: opportunity.opportunity_id,
                opportunity_review_hypercare_date: newReviewDate || new Date().toISOString().split('T')[0],
                opportunity_review_hypercare_impact: newReviewImpact,
                opportunity_review_hypercare_description: newReviewDesc || undefined,
            });
            setNewReviewDesc('');
            setNewReviewDate(new Date().toISOString().split('T')[0]);
            setNewReviewImpact('positive');
            toast.success('Review ditambahkan');
            onRefresh();
        } catch { toast.error('Gagal tambah review'); }
    }, [newReviewImpact, newReviewDesc, newReviewDate, opportunity, onRefresh]);

    const handleDeleteReview = useCallback(async (id: string) => {
        try {
            await SalesStageServices.deleteReview(id);
            toast.success('Review dihapus');
            onRefresh();
        } catch { toast.error('Gagal hapus review'); }
    }, [onRefresh]);

    const handleUpdateReview = useCallback(async (rv: OpportunityReviewHypercare) => {
        const editData = editReviewData[rv.opportunity_review_hypercare_id];
        if (!editData) return;
        try {
            await SalesStageServices.updateReview(rv.opportunity_review_hypercare_id, {
                opportunity_review_hypercare_date: editData.date || undefined,
                opportunity_review_hypercare_impact: editData.impact,
                opportunity_review_hypercare_description: editData.description || undefined,
            });
            toast.success('Review diupdate');
            setExpandedReview(null);
            onRefresh();
        } catch { toast.error('Gagal update review'); }
    }, [editReviewData, onRefresh]);

    // Sync actual value when opportunity changes
    React.useEffect(() => {
        if (opportunity) {
            setEditActualValue(opportunity.actual_value || '');
        }
    }, [opportunity]);

    // ─── ACTUAL VALUE ───
    const handleSaveActual = useCallback(async () => {
        if (!opportunity) return;
        try {
            await SalesStageServices.update(opportunity.opportunity_id, { actual_value: editActualValue || '' } as any);
            toast.success('Revenue aktual diupdate');
            onRefresh();
        } catch { toast.error('Gagal update revenue'); }
    }, [editActualValue, opportunity, onRefresh]);

    // ─── EARLY RETURN IF NO OPPORTUNITY ───
    if (!opportunity) return null;

    const isHypercare = opportunity.stage === 'hypercare';
    const isSurvey = opportunity.stage === 'survey';
    const isDeal = opportunity.stage === 'deal';
    const stage = opportunity.stage;
    const nextStageMap: Record<string, string> = { find: 'Survey', survey: 'Pull', pull: 'Deal', deal: 'Hypercare' };
    const nextStageLabel = nextStageMap[stage];
    const isLastStage = stage === 'hypercare';
    const stageSubTasks = subTasks.filter(st => st.opportunity_stage === stage);

    // ─── RENDER HELPERS ───
    const renderSubTask = (st: OpportunitySubTask) => {
        const taskId = st.opportunity_sub_task_id;
        const isOpen = expandedSubTask === taskId;
        const isDone = st.opportunity_sub_task_status === 'done';
        const savedFiles: string[] = Array.isArray(st.opportunity_sub_task_file) ? st.opportunity_sub_task_file : [];
        const removedSet = removedEvidence[taskId] || new Set();
        const filteredSaved = savedFiles.filter((_, i) => !removedSet.has(i));
        const pending = pendingEvidence[taskId] || [];
        const allFiles = [...filteredSaved, ...pending];
        const noteVal = subtaskNotes[taskId] ?? st.opportunity_sub_task_description ?? '';
        const isSaving = savingSubTask === taskId;
        const isCustom = st.is_custom;
        return (
            <div key={taskId} className="border-b border-gray-100 py-2.5 last:border-0">
                <div className="flex items-start gap-2.5 p-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleToggleSubTask(st); }}
                        className={`w-[18px] h-[18px] rounded mt-0.5 flex-none flex items-center justify-center border-2 transition-all ${
                            isDone ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'
                        }`}
                    >
                        {isDone && <span dangerouslySetInnerHTML={{ __html: checkSvg }} />}
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 rounded px-1 -mx-1 py-0.5 cursor-pointer hover:bg-blue-50" onClick={() => setExpandedSubTask(isOpen ? null : taskId)}>
                            <span className={`text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {st.opportunity_sub_task_title}
                                {isCustom && <span className="mfc-custom-tag ml-1.5 text-[9px] uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-bold">Custom</span>}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 ml-auto flex-none">
                                {isOpen ? 'TUTUP ▲' : 'DETAIL ▼'}
                            </span>
                            {canDelete && isCustom && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSubTask(taskId); }}
                                    className="text-red-500 hover:text-red-700 flex-none"
                                    title="Hapus sub-task"
                                >
                                    <MdDelete size={14} />
                                </button>
                            )}
                        </div>
                        {isOpen && (
                            <div className="mt-2.5 ml-0.5 bg-gray-50 rounded-lg p-3 space-y-2.5">
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 mb-1">Evidence</p>
                                    {allFiles.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {allFiles.map((f, fi) => {
                                                const isSaved = fi < filteredSaved.length;
                                                return (
                                                <span key={fi} className="inline-flex items-center gap-1">
                                                    <Badge color={isSaved ? 'primary' : 'success'} variant="outline" size="sm">
                                                        <MdAttachFile size={12} className="mr-0.5 inline" />
                                                        {f}
                                                        <button onClick={() => handleLocalRemoveEvidence(taskId, filteredSaved.length, fi)} className="text-red-400 hover:text-red-600 ml-1">
                                                            <MdClose size={12} />
                                                        </button>
                                                    </Badge>
                                                </span>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Belum ada evidence.</p>
                                    )}
                                    <div className="flex gap-1.5 mt-1.5">
                                        <div className="flex-1">
                                            <Input
                                                type="text"
                                                placeholder="Nama file / link evidence..."
                                                value={evidenceInput[taskId] || ''}
                                                onChange={(e) => setEvidenceInput(prev => ({ ...prev, [taskId]: e.target.value }))}
                                                className="w-full text-xs"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleLocalAddEvidence(taskId)}
                                            className="text-xs text-blue-600 font-medium whitespace-nowrap hover:text-blue-800 self-center"
                                        >
                                            + Tambah
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 mb-1.5">Keterangan</p>
                                    <textarea
                                        rows={2}
                                        placeholder="Tulis catatan untuk sub-activity ini..."
                                        value={noteVal}
                                        onChange={(e) => setSubtaskNotes(prev => ({ ...prev, [taskId]: e.target.value }))}
                                        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-400 resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                    {isCustom && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteSubTask(taskId)}
                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                        >
                                            <MdDelete size={12} className="mr-1" />
                                            Hapus
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => handleSaveSubTask(st)}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const impactBadge = (impact: string | null) => {
        if (impact === 'positive') return <Badge color="success" variant="light" size="sm">Positif</Badge>;
        if (impact === 'followup') return <Badge color="warning" variant="light" size="sm">Perlu Tindak Lanjut</Badge>;
        return <Badge color="dark" variant="light" size="sm">Netral</Badge>;
    };

    const solutionColor = opportunity.solution ? SOLUTION_COLORS[opportunity.solution] || 'info' : 'dark';

    return (
        <Offcanvas 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Detail Opportunity" 
            position="right" 
            width="xl"
        >
            {detailLoading ? <LoadingOverlay /> : (
            <div className="p-4 space-y-4 text-sm">
                {/* Header */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{opportunity.contractor || opportunity.iup_name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{opportunity.iup_name} · {opportunity.province || '-'}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                        <Badge color="primary" variant="light" size="sm">{STAGE_CODE[stage]}</Badge>
                        <span className="text-xs font-semibold text-gray-600">{STAGE_LABEL[stage]}</span>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3">
                    <div><p className="text-[10px] uppercase text-gray-400">RKAB</p><p className="text-xs font-semibold">-</p></div>
                    <div><p className="text-[10px] uppercase text-gray-400">Unit Existing</p><p className="text-xs font-semibold">-</p></div>
                    <div><p className="text-[10px] uppercase text-gray-400">Kontak</p><p className="text-xs">{opportunity.contact || '-'}</p></div>
                    <div><p className="text-[10px] uppercase text-gray-400">Sales Kami</p><p className="text-xs">{opportunity.sales_name || '-'}</p></div>
                    <div><p className="text-[10px] uppercase text-gray-400">Estimasi Nilai</p><p className="text-xs font-semibold">{fmt(opportunity.value)}</p></div>
                    <div><p className="text-[10px] uppercase text-gray-400">Stage Saat Ini</p><p className="text-xs font-semibold">{STAGE_LABEL[stage]}</p></div>
                </div>
                {opportunity.solution && (
                    <div><Badge color={solutionColor as any} variant="light">{opportunity.solution}</Badge></div>
                )}

                {/* ─── DEAL: Actual Value ─── */}
                {isDeal && (
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase text-gray-400 whitespace-nowrap">Revenue Aktual</label>
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Rp 0 — isi setelah deal"
                                value={editActualValue}
                                onChange={(e) => setEditActualValue(e.target.value.replace(/\D/g, ''))}
                                onBlur={handleSaveActual}
                                className="w-full text-xs"
                            />
                        </div>
                    </div>
                )}

                {/* ─── HYPERCARE REVIEWS ─── */}
                {isHypercare && (
                    <div className="border-t border-gray-200 pt-3 space-y-3">
                        <div>
                            <p className="text-sm font-semibold">Review Log Hypercare</p>
                            <p className="text-xs text-gray-400">Pantau dampak solusi terhadap IUP ini secara berkala pasca-deal.</p>
                        </div>
                        {detailLoading ? (
                            <p className="text-xs text-gray-400 italic">Loading...</p>
                        ) : reviews.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Belum ada review dampak.</p>
                        ) : (
                            reviews.slice().sort((a, b) => ((b.opportunity_review_hypercare_date || '') > (a.opportunity_review_hypercare_date || '') ? 1 : -1)).map((rv) => {
                                const revId = rv.opportunity_review_hypercare_id;
                                const isOpen = expandedReview === revId;
                                const reviewerName = rv.created_by_name || rv.employee_id?.slice(0, 8) || '-';
                                const rvDate = rv.opportunity_review_hypercare_date || '';
                                const rvDesc = rv.opportunity_review_hypercare_description || '';
                                const preview = rvDesc.length > 60 ? rvDesc.slice(0, 60) + '…' : rvDesc;
                                const editData = editReviewData[revId] || {
                                    reviewer: reviewerName,
                                    date: rvDate,
                                    impact: rv.opportunity_review_hypercare_impact || 'positive',
                                    description: rvDesc,
                                };
                                const currentImpact = editData.impact || rv.opportunity_review_hypercare_impact || 'positive';
                                return (
                                    <div key={revId} className="border border-gray-100 rounded-lg overflow-hidden">
                                        <div className="flex items-center gap-2 px-3 py-2.5">
                                            <span className="text-xs text-gray-500">📅 {rvDate || '-'}</span>
                                            <span className="text-xs font-medium text-gray-800 whitespace-nowrap">· {reviewerName}</span>
                                            {impactBadge(rv.opportunity_review_hypercare_impact)}
                                            {!isOpen && preview && (
                                                <span className="text-[11px] text-gray-400 truncate flex-1 min-w-0 ml-1">— {preview}</span>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (isOpen) {
                                                        setExpandedReview(null);
                                                    } else {
                                                        setEditReviewData(prev => ({
                                                            ...prev,
                                                            [revId]: {
                                                                reviewer: reviewerName,
                                                                date: rvDate,
                                                                impact: rv.opportunity_review_hypercare_impact || 'positive',
                                                                description: rvDesc,
                                                            }
                                                        }));
                                                        setExpandedReview(revId);
                                                    }
                                                }}
                                                className="text-[10px] font-mono text-gray-400 hover:text-blue-600 flex-none"
                                            >
                                                {isOpen ? 'TUTUP ▲' : 'DETAIL ▼'}
                                            </button>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDeleteReview(revId)}
                                                    className="text-red-400 hover:text-red-600 flex-none"
                                                    title="Hapus review"
                                                >
                                                    🗑
                                                </button>
                                            )}
                                        </div>
                                        {isOpen && (
                                            <div className="border-t border-gray-100 bg-gray-50 px-3 py-3 space-y-2.5">
                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <div>
                                                        <p className="text-[10px] uppercase text-gray-400 mb-1">Reviewer</p>
                                                        <p className="text-xs font-medium text-gray-700 py-1.5">{editData.reviewer}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-gray-400 mb-1">Tanggal Review</p>
                                                        <Input
                                                            type="date"
                                                            value={editData.date}
                                                            onChange={(e) => setEditReviewData(prev => ({
                                                                ...prev,
                                                                [revId]: { ...prev[revId], date: e.target.value }
                                                            }))}
                                                            className="w-full text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase text-gray-400 mb-1">Dampak</p>
                                                    <CustomSelect
                                                        options={[
                                                            { value: 'positive', label: 'Positif' },
                                                            { value: 'neutral', label: 'Netral' },
                                                            { value: 'followup', label: 'Perlu Tindak Lanjut' },
                                                        ]}
                                                        value={{
                                                            value: currentImpact,
                                                            label: currentImpact === 'positive' ? 'Positif' : currentImpact === 'neutral' ? 'Netral' : 'Perlu Tindak Lanjut'
                                                        }}
                                                        onChange={(val) => setEditReviewData(prev => ({
                                                            ...prev,
                                                            [revId]: { ...prev[revId], impact: val?.value || 'positive' }
                                                        }))}
                                                        isSearchable={false}
                                                        isClearable={false}
                                                        placeholder="Pilih impact..."
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase text-gray-400 mb-1">Keterangan</p>
                                                    <textarea
                                                        rows={3}
                                                        placeholder="Deskripsi hasil review..."
                                                        value={editData.description}
                                                        onChange={(e) => setEditReviewData(prev => ({
                                                            ...prev,
                                                            [revId]: { ...prev[revId], description: e.target.value }
                                                        }))}
                                                        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-400 resize-none"
                                                    />
                                                </div>
                                                <div className="flex justify-end pt-1">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateReview(rv)}
                                                    >
                                                        Simpan
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                        {canUpdate && (
                            <div className="border-t border-dashed border-gray-200 pt-3 space-y-2.5">
                                <p className="text-xs font-semibold text-gray-700">Tambah Review Baru</p>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 mb-1">Tanggal Review</p>
                                        <Input
                                            type="date"
                                            value={newReviewDate}
                                            onChange={(e) => setNewReviewDate(e.target.value)}
                                            className="w-full text-xs"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 mb-1">Dampak</p>
                                        <CustomSelect
                                            options={[
                                                { value: 'positive', label: 'Positif' },
                                                { value: 'neutral', label: 'Netral' },
                                                { value: 'followup', label: 'Perlu Tindak Lanjut' },
                                            ]}
                                            value={{ value: newReviewImpact, label: newReviewImpact === 'positive' ? 'Positif' : newReviewImpact === 'neutral' ? 'Netral' : 'Perlu Tindak Lanjut' }}
                                            onChange={(val) => setNewReviewImpact(val?.value || 'positive')}
                                            isSearchable={false}
                                            isClearable={false}
                                            placeholder="Pilih impact..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 mb-1">Keterangan</p>
                                    <TextArea
                                        rows={2}
                                        placeholder="Deskripsi hasil review..."
                                        value={newReviewDesc}
                                        onChange={(e) => setNewReviewDesc(e.target.value)}
                                        className="w-full text-xs resize-none"
                                    />
                                </div>
                                <Button size="sm" onClick={handleAddReview}>+ Tambah Review</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── NON-HYPERCARE: Sub-Tasks ─── */}
                {!isHypercare && (
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-mono text-blue-700">{STAGE_CODE[stage]}</span>
                                <span className="text-xs text-gray-400 ml-2">— {STAGE_LABEL[stage]}</span>
                            </div>
                            <span className="text-[11px] text-gray-400">
                                {stageSubTasks.filter(s => s.opportunity_sub_task_status === 'done').length}/{stageSubTasks.length} selesai
                            </span>
                        </div>
                        {detailLoading ? (
                            <p className="text-xs text-gray-400 italic">Loading...</p>
                        ) : stageSubTasks.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Belum ada sub-task.</p>
                        ) : (
                            stageSubTasks.map(renderSubTask)
                        )}
                        {canUpdate && (
                            <div className="flex gap-2 pt-2 border-t border-dashed border-gray-200">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Tambah sub-task baru untuk stage ini..."
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        className="w-full text-xs"
                                    />
                                </div>
                                <button
                                    onClick={handleAddSubTask}
                                    className="text-xs text-blue-600 font-semibold whitespace-nowrap hover:text-blue-800 border border-blue-600 rounded px-3 py-1.5"
                                >+ Tambah Sub-task</button>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── SURVEY: Assignment Solutions ─── */}
                {isSurvey && (
                    <div className="border-t border-gray-200 pt-3 space-y-3">
                        <div>
                            <p className="text-sm font-semibold">Assignment Solusi per Kontraktor</p>
                            <p className="text-xs text-gray-400">Tentukan kontraktor mana ditawarkan solusi apa, dan sales yang pegang.</p>
                        </div>
                        {detailLoading ? (
                            <p className="text-xs text-gray-400 italic">Loading...</p>
                        ) : assignments.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Belum ada assignment kontraktor.</p>
                        ) : (
                            assignments.map((a) => (
                                <div key={a.opportunity_assignment_solution_id} className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <span className="text-xs flex-1">{a.customer_id || '-'}</span>
                                    <Badge color="primary" variant="light" size="sm">{a.opportunity_assignment_solution || '-'}</Badge>
                                    <span className="text-xs text-gray-500">{a.employee_id?.slice(0, 8) || '-'}</span>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDeleteAssignment(a.opportunity_assignment_solution_id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Hapus assignment"
                                        >
                                            <MdDelete size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                        {canUpdate && (
                            <div className="space-y-2 pt-1">
                                <Input
                                    type="text"
                                    placeholder="Nama kontraktor..."
                                    value={newAssContractor}
                                    onChange={(e) => setNewAssContractor(e.target.value)}
                                    className="w-full text-xs"
                                />
                                <Input
                                    type="text"
                                    placeholder="Solusi (VHS, KIT OH, dll)..."
                                    value={newAssSolution}
                                    onChange={(e) => setNewAssSolution(e.target.value)}
                                    className="w-full text-xs"
                                />
                                <Button size="sm" onClick={handleAddAssignment}>+ Tambah Assignment</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── ACTIONS ─── */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                    {canUpdate && (
                        <Button variant="outline" onClick={() => { onEdit(opportunity); onClose(); }} className="text-xs">
                            Edit
                        </Button>
                    )}
                    {!isLastStage && canUpdate && (
                        <Button onClick={() => onAdvance(opportunity)} className="flex-1 text-xs">
                            Pindah ke {nextStageLabel}
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            variant="outline"
                            onClick={() => { if (window.confirm('Yakin ingin menghapus?')) onDelete(opportunity.opportunity_id); }}
                            className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                        >
                            Hapus
                        </Button>
                    )}
                </div>
            </div>
            )}
        </Offcanvas>
    );
};

export default StageDetailDrawer;
