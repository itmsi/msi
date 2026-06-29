import { useState, useEffect } from 'react';
import type { Candidate, CandidateNote, CandidatePersonalInfo, CandidateAddressInfo } from '../types/hr';
import { notesService } from '../services/hrService';
import { formatDate, onImageProfileError, placeholderProfileImage } from '../utils';
import { FaPencil, FaTrash, FaXmark, FaPlus } from 'react-icons/fa6';
import { MdOutlineFileDownload } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import BackgroundCheckTab from './BackgroundCheckTab';
import DocumentTab from './DocumentTab';
import DateInterviewTab from './DateInterviewTab';
import FormInterviewTab from './FormInterviewTab';

interface DetailCandidateOffcanvasProps {
  candidate: Candidate;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

type TabName = 'profile' | 'assigned' | 'interview' | 'form' | 'background' | 'document' | 'notes';

const DetailCandidateOffcanvas = ({
  candidate,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
}: DetailCandidateOffcanvasProps) => {
  const [activeTab, setActiveTab] = useState<TabName>('profile');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notes, setNotes] = useState<CandidateNote[]>([]);

  const personalInfo = Array.isArray(candidate.personal_information)
    ? candidate.personal_information[0]
    : candidate.personal_information;
  const addressInfo = Array.isArray(candidate.address_information)
    ? candidate.address_information[0]
    : candidate.address_information;

  // Fetch data when tab changes
  const fetchNotes = async () => {
    if (!candidate.id) return;
    setLoadingNotes(true);
    try {
      const result = await notesService.getList(candidate.id);
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
  }, [activeTab, candidate.id]);

  const tabs: { key: TabName; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'interview', label: 'Date Interview' },
    { key: 'form', label: 'Form' },
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
              src={candidate.image || placeholderProfileImage}
              alt={candidate.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={onImageProfileError}
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{candidate.name}</h2>
              <p className="text-xs text-gray-500">{candidate.id_candidate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[#0253a5] text-white rounded-lg hover:bg-[#003061] transition-colors"
            >
              <FaPencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash className="w-3 h-3" /> Delete
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaXmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Card — like cum-web's HeaderInformationProfile */}
        <div className="px-6 pt-4">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Candidate Name</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Company</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.company || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Department</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Applied Role</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.position}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Age</p>
                  <p className="text-sm font-medium text-gray-800">{candidate.age || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Gender</p>
                  <p className="text-sm font-medium text-gray-800">
                    {candidate.personal_information?.[0]?.candidate_gender || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Recruiter</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(candidate.interviewer) && candidate.interviewer.length > 0
                      ? candidate.interviewer.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {name}
                          </span>
                        ))
                      : <span className="text-xs text-gray-400">-</span>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date of Interview</p>
                  <p className="text-sm font-medium text-gray-800">
                    {candidate.date_schedule && candidate.date_schedule.length > 0
                      ? [...candidate.date_schedule].sort(
                          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                        )[0].date
                      : '-'}
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
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#0253a5] text-[#0253a5]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileTab personalInfo={personalInfo} addressInfo={addressInfo} resume={candidate.resume} />
          )}
          {activeTab === 'assigned' && <AssignedTab data={candidate.referred} />}
          {activeTab === 'interview' && (
            <DateInterviewTab candidateId={candidate.id} isActive={activeTab === 'interview'} candidateName={candidate.name} />
          )}
          {activeTab === 'form' && (
            <FormInterviewTab candidateId={candidate.id} candidateName={candidate.name} />
          )}
          {activeTab === 'background' && (
            <BackgroundCheckTab candidateId={candidate.id} isActive={activeTab === 'background'} />
          )}
          {activeTab === 'document' && (
            <DocumentTab candidateId={candidate.id} isActive={activeTab === 'document'} />
          )}
          {activeTab === 'notes' && <NotesTab notes={notes} loading={loadingNotes} candidateId={candidate.id} onRefresh={fetchNotes} />}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Tab Components
// ============================================================

const ProfileTab = ({
  personalInfo,
  addressInfo,
  resume,
}: {
  personalInfo?: CandidatePersonalInfo;
  addressInfo?: CandidateAddressInfo;
  resume?: string | null;
}) => {
  const fields = [
    { label: 'Candidate Name', value: personalInfo?.candidate_name || 'n/a' },
    { label: 'Phone', value: personalInfo?.candidate_phone || '-' },
    { label: 'Gender', value: personalInfo?.candidate_gender || 'n/a' },
    { label: 'Date of Birth', value: personalInfo?.candidate_date_birth || 'n/a' },
    { label: 'Email', value: personalInfo?.candidate_email || 'n/a' },
    { label: 'Nationality', value: personalInfo?.candidate_nationality || '-' },
    { label: 'Religion', value: personalInfo?.candidate_religion || '-' },
    { label: 'Marital Status', value: personalInfo?.candidate_marital_status || '-' },
  ];

  const addressFields = [
    { label: 'Address', value: addressInfo?.candidate_address || '-' },
    { label: 'City', value: addressInfo?.candidate_city || '-' },
    { label: 'State', value: addressInfo?.candidate_state || '-' },
    { label: 'Country', value: addressInfo?.candidate_country || '-' },
  ];

  return (
    <div className="space-y-6">
      {/* Personal Information */}
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

      {/* Address Information */}
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

      {/* Resume */}
      {resume && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Resume</h3>
          </div>
          <div className="p-4">
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <MdOutlineFileDownload className="w-4 h-4" />
              Download Resume
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const AssignedTab = ({ data }: { data?: { name: string; email: string; role: string; role_alias: string }[] }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500">No referred data available.</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Role Alias</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((ref, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-3">{ref.name}</td>
              <td className="px-4 py-3 text-gray-500">{ref.email}</td>
              <td className="px-4 py-3">{ref.role}</td>
              <td className="px-4 py-3">{ref.role_alias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const NotesTab = ({ notes, loading, candidateId, onRefresh }: { notes: CandidateNote[]; loading: boolean; candidateId: string; onRefresh: () => void }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await notesService.create({
        candidate_id: candidateId,
        notes: text.trim(),
        create_by: 'User',
        assigned_data: [],
      });
      toast.success('Note added!');
      setText('');
      onRefresh();
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Write a note..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAdd}
            disabled={submitting || !text.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#0253a5] text-white rounded-lg hover:bg-[#003061] disabled:opacity-50"
          >
            <FaPlus className="w-3 h-3" />
            {submitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-500">No notes available.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{note.name || note.create_by || '-'}</span>
                  {note.role_alias && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{note.role_alias}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{note.date_created || formatDate(note.create_at)}</span>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailCandidateOffcanvas;
