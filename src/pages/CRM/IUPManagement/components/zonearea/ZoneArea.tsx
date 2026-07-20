import React from 'react';
import { LuPlus } from 'react-icons/lu';
import { EvidenceForm } from './EvidenceForm';
import { useIupZoneSIte } from '../../hooks/useIupZoneSIte';
import Zonecard from './Zonecard';

const ZoneArea: React.FC = () => {
    const {
        zones,
        // pagination,
        // page,
        // setPage,
        // loading,
        submitting,
        deletingId,
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

        submitForm,
    } = useIupZoneSIte();

    // if (loading) {
    //     return <div className="bg-white w-full rounded-2xl border border-slate-300 min-h-60 flex items-center justify-center relative">
    //         <LoadingSpinner />
    //     </div>;
    // }


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
                    Daftar area yang perlu disurvey oleh tim di lapangan sebagai acuan data
                    dan dokumentasi riset Izin Usaha Pertambangan (IUP).
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
                                form={form}
                                errors={errors}
                                submitting={submitting}
                                updateField={updateField}
                                updateFileLink={updateFileLink}
                                addFileLinkRow={addFileLinkRow}
                                removeFileLinkRow={removeFileLinkRow}
                                submitForm={submitForm}
                                closeForm={closeForm}
                            />
                        ) : (
                            <Zonecard
                                key={zone.iup_zona_site_id}
                                zone={zone}
                                onEdit={openEditForm}
                                onDelete={deleteZone}
                                isDeleting={deletingId === zone.iup_zona_site_id}
                            />
                        )
                    )}
                </div>
            )}

            {showForm && !editingId && (<></>
                // <EvidenceForm
                //     editingId={editingId}
                //     form={form}
                //     errors={errors}
                //     submitting={submitting}
                //     updateField={updateField}
                //     updateFileLink={updateFileLink}
                //     addFileLinkRow={addFileLinkRow}
                //     removeFileLinkRow={removeFileLinkRow}
                //     submitForm={submitForm}
                //     closeForm={closeForm}
                // />
            )}
            {!showForm && !editingId && (
            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl">
                <button
                    type="button"
                    onClick={openCreateForm}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Add Zona
                </button>
            </div>
            )}

            {/* Tambah zona */}
            {/* <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl ">
                {showAddZone ? (
                <div className="flex items-center gap-2">
                    <input
                        autoFocus
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addZone()}
                        placeholder="Nama zona baru..."
                        className="flex-1 bg-white border border-slate-500 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                    />
                    <Button
                        variant="outline"
                        onClick={addZone}
                        className="p-2 rounded-md text-sm font-medium transition-colors relative text-green-600 hover:text-green-700 hover:bg-red-50"
                    >
                        <LuCheck size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowAddZone(false);
                            setNewZoneName("");
                        }}
                        className="p-2 rounded-md text-sm font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <LuX size={16} />
                    </Button>
                </div>
                ) : (
                <button
                    type="button"
                    onClick={() => setShowAddZone(true)}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Tambah Zona
                </button>
                )}
            </div> */}

            {/* <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={handleConfirmDeleted}
                title={`Confirm delete ${confirmDelete.name ?? ''}`}
                message="Are you sure you want to delete this zone? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isSubmitting}
                size="md"
                showIcon={false}
            /> */}
        </div>
    );
};

export default ZoneArea;