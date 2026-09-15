import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import PageHeader from '@/components/common/PageHeader';
import { LoadingOverlay } from '@/components/common/Loading';
import Alert from '@/components/ui/alert/Alert';
import Button from '@/components/ui/button/Button';
import FormActions from '@/components/form/FormActions';
import { useHasPermission } from '@/hooks/usePermissions';
import { useApplicantEdit } from './hooks/useApplicantEdit';
import ApplicantFields from './components/ApplicantFields';
import ApplicantSections from './components/ApplicantSections';
import ApplicantSummaryCard from './components/ApplicantSummaryCard';

export default function Edit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const listSearch = (location.state as { from?: string } | null)?.from || '';
    const listPath = `/hr/applicants${listSearch}`;

    const canUpdate = useHasPermission('update');
    const readOnly = !canUpdate;

    const {
        summary,
        formData,
        errors,
        loading,
        error,
        isSubmitting,
        handleFieldChange,
        handleRowAdd,
        handleRowRemove,
        handleRowChange,
        handleSubmit,
    } = useApplicantEdit(id);

    if (loading && !summary) {
        return <LoadingOverlay message="Memuat formulir pelamar..." />;
    }

    if (error || !summary) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || 'Formulir pelamar tidak ditemukan'}</h3>
                <Button onClick={() => navigate(listPath)} variant="outline">Kembali ke List</Button>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Applicant ${summary.name || ''} - Motor Sights International`}
                description="Detail formulir pelamar - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-6">
                <PageHeader
                    title={readOnly ? 'Detail Formulir Pelamar' : 'Edit Formulir Pelamar'}
                    backPath={listPath}
                    subtitle={summary.name || '-'}
                />

                {!summary.is_completed && (
                    <Alert variant="warning" title="Formulir Belum Selesai">
                        <p className="text-sm text-gray-500">Pelamar belum menyelesaikan pengisian formulir ini.</p>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <ApplicantFields
                            values={formData}
                            errors={errors}
                            readOnly={readOnly}
                            onChange={handleFieldChange}
                        />
                        <ApplicantSections
                            values={formData}
                            readOnly={readOnly}
                            onRowAdd={handleRowAdd}
                            onRowRemove={handleRowRemove}
                            onRowChange={handleRowChange}
                        />
                    </div>

                    <div className="lg:sticky lg:top-0 self-start">
                        <ApplicantSummaryCard summary={summary} />
                    </div>
                </div>

                {!readOnly && (
                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute={listPath}
                        submitText="Simpan Perubahan"
                        submittingText="Menyimpan"
                    />
                )}
            </div>
        </>
    );
}
