import { useParams, useNavigate } from 'react-router-dom';
import { useCandidateDetail } from './hooks/UsecandidateDetail';
import CreateCandidateForm from './CreateCandidateForm';
import type { Candidate } from './types/hr';

export default function EmployeeCandidateEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { candidate } = useCandidateDetail(id);

    const backToDetail = () => navigate(`/hr/candidate/${id}`);

    return (
        <CreateCandidateForm
            initialData={candidate as unknown as Candidate}
            onSave={backToDetail}
            onCancel={backToDetail}
        />
    );
}
