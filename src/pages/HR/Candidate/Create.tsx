import CreateCandidateForm from './CreateCandidateForm';
import { useNavigate } from 'react-router';
import PageMeta from '@/components/common/PageMeta';

const CreatePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageMeta title="Create Candidate" description="Add a new interview candidate" />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Create New Candidate</h3>
            <p className="mt-1 text-sm text-gray-500">Fill in the candidate information below</p>
          </div>
          <div className="p-6 font-secondary">
            <CreateCandidateForm
              onSave={() => navigate('/hr/candidate')}
              onCancel={() => navigate('/hr/candidate')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
