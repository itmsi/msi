import type { Candidate } from '../types/hr';
import { getBadgeVariant, onImageProfileError, placeholderProfileImage } from '../utils';
import { FaPencil, FaTrash } from 'react-icons/fa6';
import { VscDebugBreakpointData } from 'react-icons/vsc';

interface CandidateCardProps {
  candidate: Candidate;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CandidateCard = ({ candidate, onView, onEdit, onDelete }: CandidateCardProps) => {
  const badgeColor = getBadgeVariant(candidate.candidate_status);
  const assignRole = candidate.schedule_interview?.assign_role || '';
  const interviewers = assignRole ? assignRole.split(',').map(s => s.trim()) : [];
  const fotoUrl = candidate.candidate_foto?.startsWith('http')
    ? candidate.candidate_foto + '/download'
    : null;

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onView}
    >
      <div className="p-4 flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={fotoUrl || placeholderProfileImage}
            alt={candidate.candidate_name}
            width={48}
            height={48}
            loading="lazy"
            className="rounded-full object-cover w-12 h-12 bg-gray-100"
            onError={onImageProfileError}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{candidate.candidate_name}</h3>
            <p className="text-xs text-gray-500 truncate">{candidate.candidate_email}</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">ID</span>
            <span className="text-gray-700 font-medium">{candidate.candidate_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Position</span>
            <span className="text-gray-700 font-medium truncate ml-2">{candidate.title_name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Company</span>
            <span className="text-gray-700 font-medium">{candidate.company_name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Applied</span>
            <span className="text-gray-700 font-medium">{candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Status</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${badgeColor === 'success' ? 'bg-green-100 text-green-700' : ''}
                ${badgeColor === 'primary' ? 'bg-blue-100 text-blue-700' : ''}
                ${badgeColor === 'secondary' ? 'bg-gray-100 text-gray-700' : ''}
                ${badgeColor === 'info' ? 'bg-sky-100 text-sky-700' : ''}
              `}
            >
              <VscDebugBreakpointData className="w-3 h-3" />
              {candidate.candidate_status}
            </span>
          </div>
        </div>

        {/* Interviewer badges */}
        {interviewers.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {interviewers.map((role, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-100 divide-x divide-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 py-2 text-xs text-[#0253a5] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
        >
          <FaPencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-1 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
        >
          <FaTrash className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
