import CreateCandidateForm from './CreateCandidateForm';
import { useNavigate } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import useGoBack from '@/hooks/useGoBack';

const CreatePage = () => {
    const navigate = useNavigate();
    const goBack = useGoBack();

    return (<>

        <PageMeta
            title="Create Candidate - HR"
            description="Create new candidate entry"
            image="/motor-sights-international.png"
        />

        <CreateCandidateForm
            onSave={() => navigate('/hr/candidate')}
            onCancel={() => navigate('/hr/candidate')}
        />
    </>);
};

export default CreatePage;
