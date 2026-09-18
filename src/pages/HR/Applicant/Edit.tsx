import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import PageHeader from '@/components/common/PageHeader';
import { LoadingOverlay } from '@/components/common/Loading';
import Alert from '@/components/ui/alert/Alert';
import Button from '@/components/ui/button/Button';
import FormActions from '@/components/form/FormActions';
import { useHasPermission } from '@/hooks/usePermissions';
import { useLanguage } from '@/components/lang/useLanguage';
import { applicantLabels } from './language/applicantLabels';
import { useApplicantEdit } from './hooks/useApplicantEdit';
import ApplicantFields from './components/ApplicantFields';
import ApplicantSections from './components/ApplicantSections';
import ApplicantSummaryCard from './components/ApplicantSummaryCard';
import { DownloadButton } from '@/components/ui/button/DownloadButton';

export default function Edit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const { lang, langField, hasLangParam } = useLanguage(applicantLabels);

    const listParams = new URLSearchParams((location.state as { from?: string } | null)?.from || '');
    if (hasLangParam) listParams.set('lang', lang);
    const listQuery = listParams.toString();
    const listPath = `/hr/applicants${listQuery ? `?${listQuery}` : ''}`;

    const canUpdate = useHasPermission('update');
    const readOnly = !canUpdate;
    // const readOnly = true;

    const {
        summary,
        formData,
        errors,
        loading,
        error,
        isSubmitting,
        isExporting,
        handleExportPdf,
        handleFieldChange,
        handleDriverLicenseToggle,
        handleRowAdd,
        handleRowRemove,
        handleRowChange,
        handleSubmit,
    } = useApplicantEdit(id);

    if (loading && !summary) {
        return <LoadingOverlay message={langField('loadingApplicantForm')} />;
    }

    if (error || !summary) {
        return (
            <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-xl text-red-600 font-medium mb-4">{error || langField('applicantFormNotFound')}</h3>
                <Button onClick={() => navigate(listPath)} variant="outline">{langField('backToList')}</Button>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Applicant ${summary.name || ''} - Motor Sights International`}
                description="Applicant form detail - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-8">
                <PageHeader
                    title={langField(readOnly ? 'applicantFormDetail' : 'editApplicantForm')}
                    backPath={listPath}
                    subtitle={summary.name || '-'}
                    actions={
                        <PermissionGate permission="read">
                            <DownloadButton
                                fileName="Download PDF"
                                variant="secondary"
                                onClick={handleExportPdf}
                                loading={isExporting}
                            />
                        </PermissionGate>
                    }
                />

                {!summary.is_completed && (
                    <Alert variant="warning" title={langField('formNotCompletedTitle')}>
                        <p className="text-sm text-gray-500">{langField('formNotCompletedDescription')}</p>
                    </Alert>
                )}

                <ApplicantSummaryCard summary={summary} />

                <div className="grid grid-cols-1 gap-8">
                    <ApplicantFields
                        values={formData}
                        errors={errors}
                        readOnly={readOnly}
                        onChange={handleFieldChange}
                        onDriverLicenseToggle={handleDriverLicenseToggle}
                    />
                    <ApplicantSections
                        values={formData}
                        readOnly={readOnly}
                        onRowAdd={handleRowAdd}
                        onRowRemove={handleRowRemove}
                        onRowChange={handleRowChange}
                    />
                </div>


                {!readOnly && (
                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute={listPath}
                        cancelText={langField('cancel')}
                        submitText={langField('saveChanges')}
                        submittingText={langField('saving')}
                    />
                )}
            </div>
        </>
    );
}
