import { useState, useEffect } from 'react';
import type { Candidate, NoteItem } from '../types/hr';
import { notesService } from '../services/hrService';
import { onImageProfileError, placeholderProfileImage } from '../utils/utils';
import { FaPencil, FaTrash, FaXmark, FaPlus } from 'react-icons/fa6';
import { MdOutlineFileDownload } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import formatIndonesianDate from '../utils/date';
import BackgroundCheckTab from './BackgroundCheckTab';
import DocumentTab from './DocumentTab';
import DateInterviewTab from './DateInterviewTab';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/form/input/TextArea';
interface DetailCandidateOffcanvasProps {
  candidate: Candidate;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

type TabName = 'profile' | 'interview' | 'background' | 'document' | 'notes';

const DetailCandidateOffcanvas = ({
  candidate,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
}: DetailCandidateOffcanvasProps) => {
  const [activeTab, setActiveTab] = useState<TabName>('profile');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Fetch data when tab changes
  const fetchNotes = async () => {
    if (!candidate.candidate_id) return;
    setLoadingNotes(true);
    try {
      const result = await notesService.getList(candidate.candidate_id);
      const rawData = result?.data;
      setNotes(Array.isArray(rawData) ? rawData : []);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notes') {
      fetchNotes();
    }
  }, [activeTab, candidate.candidate_id]);

  const tabs: { key: TabName; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'interview', label: 'Date Interview' },
    { key: 'background', label: 'Background Check' },
    { key: 'document', label: 'Documents' },
    { key: 'notes', label: 'Notes' },
  ];

  const handleClose = () => {
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Panel */}
      <div className="relative w-full max-w-5xl bg-white shadow-xl h-full overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mt-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={candidate.candidate_foto?.startsWith('http') ? candidate.candidate_foto + '/download' : placeholderProfileImage}
              alt={candidate.candidate_name}
              className="w-10 h-10 rounded-full object-cover bg-gray-100"
              onError={onImageProfileError}
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{candidate.candidate_name}</h2>
              <p className="text-xs text-gray-500">{candidate.candidate_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" startIcon={<FaPencil className="w-3 h-3" />} onClick={onEdit}>Edit</Button>
            <Button size="sm" startIcon={<FaTrash className="w-3 h-3" />} onClick={onDelete} className="bg-red-600 hover:bg-red-700! text-white">Delete</Button>
            <Button variant="transparent" onClick={handleClose} className="text-gray-400!"><FaXmark className="w-5 h-5" /></Button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="px-6 pt-4">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Candidate Name</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.candidate_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Group</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.group_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Company</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.company_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Department</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.department_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Applied Role</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.title_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Age</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.candidate_age ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Gender</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.candidate_gender || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Recruiter</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.schedule_interview?.assign_role
                      ? candidate.schedule_interview.assign_role.split(',').map((name, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{name.trim()}</span>
                      ))
                      : <span className="text-xs text-gray-400">-</span>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date of Interview</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatIndonesianDate(candidate.schedule_interview?.schedule_interview_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 mt-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant="transparent"
                className={`whitespace-nowrap border-b-2 rounded-none! ${activeTab === tab.key
                  ? 'border-[#0253a5] text-[#0253a5]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileTab candidate={candidate} />}
          {activeTab === 'interview' && (
            <DateInterviewTab candidateId={candidate.candidate_id} isActive={activeTab === 'interview'} />
          )}
          {activeTab === 'background' && <BackgroundCheckTab candidateId={candidate.candidate_id} isActive={activeTab === 'background'} />}
          {activeTab === 'document' && <DocumentTab candidateId={candidate.candidate_id} isActive={activeTab === 'document'} />}
          {activeTab === 'notes' && <NotesTab notes={notes} loading={loadingNotes} candidateId={candidate.candidate_id} onRefresh={fetchNotes} />}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Tab Components
// ============================================================

const ProfileTab = ({ candidate }: { candidate: Candidate }) => {
  const fields = [
    { label: 'Candidate Name', value: candidate.candidate_name || 'n/a' },
    { label: 'Phone', value: candidate.candidate_phone || '-' },
    { label: 'Gender', value: candidate.candidate_gender || 'n/a' },
    { label: 'Date of Birth', value: formatIndonesianDate(candidate.candidate_date_birth) === '-' ? 'n/a' : formatIndonesianDate(candidate.candidate_date_birth) },
    { label: 'PTK Date', value: formatIndonesianDate(candidate.ptk_date) === '-' ? 'n/a' : formatIndonesianDate(candidate.ptk_date) },
    { label: 'Offering Letter Date', value: formatIndonesianDate(candidate.offering_letter) === '-' ? 'n/a' : formatIndonesianDate(candidate.offering_letter) },
    { label: 'Group', value: candidate.group_name || 'n/a' },
    { label: 'Remark', value: candidate.remark || '-' },
    { label: 'Email', value: candidate.candidate_email || 'n/a' },
    { label: 'Nationality', value: candidate.candidate_nationality || '-' },
    { label: 'Religion', value: candidate.candidate_religion || '-' },
    { label: 'Marital Status', value: candidate.candidate_marital_status || '-' },
  ];

  const addressFields = [
    { label: 'Address', value: candidate.candidate_address || '-' },
    { label: 'City', value: candidate.candidate_city || '-' },
    { label: 'State', value: candidate.candidate_state || '-' },
    { label: 'Country', value: candidate.candidate_country || '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-xs text-gray-400 mb-1">{f.label}</p>
              <p className="text-sm font-medium text-gray-800">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Address Information</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {addressFields.map((f) => (
            <div key={f.label}>
              <p className="text-xs text-gray-400 mb-1">{f.label}</p>
              <p className="text-sm font-medium text-gray-800">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
      {candidate.candidate_resume && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Resume</h3>
          </div>
          <div className="p-4">
            <a href={candidate.candidate_resume} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
              <MdOutlineFileDownload className="w-4 h-4" /> Download Resume
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const NotesTab = ({ notes, loading, candidateId, onRefresh }: { notes: NoteItem[]; loading: boolean; candidateId: string; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await notesService.create({
        candidate_id: candidateId,
        notes: text.trim(),
        created_by: 'User',
      });
      toast.success('Note added!');
      setText('');
      setShowForm(false);
      onRefresh();
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await notesService.delete(deleteId);
      toast.success('Note deleted');
      setDeleteId(null);
      onRefresh();
    } catch {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex w-full justify-center">
        <Button
          onClick={() => setShowForm(prev => !prev)}
          className="w-full justify-center!"
          startIcon={showForm ? <FaXmark className="w-3 h-3" /> : <FaPlus className="w-3 h-3" />}
        >
          {showForm ? 'Cancel' : 'Add Note'}
        </Button>
      </div>

      {/* Add Note Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write a note..."
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleAdd}
              disabled={submitting || !text.trim()}
              startIcon={<FaPlus className="w-3 h-3" />}
            >
              {submitting ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </div>
      )}
      {loading ? (
        <p className="text-sm text-gray-400">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-500">No notes available.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.note_id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{note.created_by_name || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatIndonesianDate(note.created_at)}</span>
                  <Button
                    size="sm"
                    variant="transparent"
                    onClick={() => setDeleteId(note.note_id)}
                    className="text-red-400!"
                  >
                    <FaTrash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.notes}</p>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="Delete this note?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        size="sm"
      />
    </div>);
};

export default DetailCandidateOffcanvas;
