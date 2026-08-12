import React from 'react';
import { LuPlus } from 'react-icons/lu';
import { EvidenceForm } from './EvidenceForm';
import { useIupZoneSIte } from '../../hooks/useIupZoneSIte';
import Zonecard from './Zonecard';
import GuideModal from './GuideModal';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import LoadingSpinner from '@/components/common/Loading';
import { PermissionGate } from '@/components/common/PermissionComponents';

interface ZoneAreaProps {
    segmentasion: string;
}

const ZoneArea: React.FC<ZoneAreaProps> = ({ segmentasion }) => {
    const {
        zones,
        // pagination,
        // page,
        // setPage,
        // loading,
        submitting,
        deletingId,
        loading,
        handleConfirmDeleted,
        deleteZone,

        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,
        updateFileLink,
        addFileLinkRow,
        removeFileLinkRow,
        confirmDelete,
        setConfirmDelete,

        submitForm,

        guideZone,
        guideValue,
        setGuideValue,
        guideSubmitting,
        openGuideForm,
        closeGuideForm,
        submitGuide,
        createZoneAndOpenGuide,

        zoneSiteTemplates,
        initialShowGuide,
    } = useIupZoneSIte({ segmentasion });

    if (loading) {
        return <div className="bg-white w-full rounded-2xl border border-slate-300 min-h-60 flex items-center justify-center relative">
            <LoadingSpinner />
        </div>;
    }

    return (
        <div className="w-full rounded-2xl border border-slate-300 bg-white">
            <div className="px-5 py-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide">Zona &amp; Evidence</h2>
                    </div>
                    {/* <span className="text-xs text-slate-500">{zones.length} zona</span> */}
                </div>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                    List of areas that need to be surveyed by the field team as a reference for data collection and documentation for Mining Business Permit (IUP) research.
                </p>
            </div>

            {(!zones || zones.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    No zona area available. Click &ldquo;Add zone&rdquo; to add one.
                </div>
            ) : (
                <div className="divide-y divide-slate-300">
                    {zones.map((zone) =>
                        showForm && editingId === zone.iup_zona_site_id ? (
                            <EvidenceForm
                                key={zone.iup_zona_site_id}
                                editingId={editingId}
                                zone={zone}
                                form={form}
                                errors={errors}
                                submitting={submitting}
                                updateField={updateField}
                                updateFileLink={updateFileLink}
                                addFileLinkRow={addFileLinkRow}
                                removeFileLinkRow={removeFileLinkRow}
                                submitForm={submitForm}
                                closeForm={closeForm}
                                onCreateGuide={openGuideForm}
                                onCreateGuideForNewZone={createZoneAndOpenGuide}
                                zoneSiteTemplates={zoneSiteTemplates}
                                initialShowGuide={initialShowGuide}
                            />
                        ) : (
                            <Zonecard
                                key={zone.iup_zona_site_id}
                                zone={zone}
                                onEdit={openEditForm}
                                onDelete={deleteZone}
                                isDeleting={deletingId === zone.iup_zona_site_id}
                                zoneSiteTemplates={zoneSiteTemplates}
                            />
                        )
                    )}
                </div>
            )}

            {showForm && !editingId && (
                <EvidenceForm
                    editingId={editingId}
                    form={form}
                    errors={errors}
                    submitting={submitting}
                    updateField={updateField}
                    updateFileLink={updateFileLink}
                    addFileLinkRow={addFileLinkRow}
                    removeFileLinkRow={removeFileLinkRow}
                    submitForm={submitForm}
                    closeForm={closeForm}
                    onCreateGuide={openGuideForm}
                    onCreateGuideForNewZone={createZoneAndOpenGuide}
                    zoneSiteTemplates={zoneSiteTemplates}
                />
            )}
            {!showForm && !editingId && (
                <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl">
                    <PermissionGate permission="create">
                        <button
                            type="button"
                            onClick={openCreateForm}
                            className="flex items-center gap-1.5 text-sm font-medium"
                        >
                            <LuPlus size={16} className="text-primary" />
                            Add Zona
                        </button>
                    </PermissionGate>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={handleConfirmDeleted}
                title={`Confirm delete ${confirmDelete.name ?? ''}`}
                message="Are you sure you want to delete this zone? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                loading={submitting}
                size="md"
                showIcon={false}
            />

            <GuideModal
                zone={guideZone}
                value={guideValue}
                onChange={setGuideValue}
                onClose={closeGuideForm}
                onSave={submitGuide}
                submitting={guideSubmitting}
                zoneSiteTemplates={zoneSiteTemplates}
            />
        </div>
    );
};

export default ZoneArea;