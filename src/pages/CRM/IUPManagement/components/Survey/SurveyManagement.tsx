import React from 'react';
import { LuPlus } from 'react-icons/lu';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import LoadingSpinner from '@/components/common/Loading';
import SurveyCard from './Surveycard';
import { useIupSurvey } from '../../hooks/useIupSurvey';
import { SurveyForm } from './SurveyForm';

const SurveyManagement: React.FC = () => {
    const {
        surveys,
        submitting,
        deletingId,
        loading,
        handleConfirmDeleted,
        deleteSurvey,

        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,
        confirmDelete,
        setConfirmDelete,

        submitForm,
    } = useIupSurvey();

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
                        <h2 className="font-primary-bold text-md tracking-wide">Activity</h2>
                    </div>
                    {/* <span className="text-xs text-slate-500">{zones.length} zona</span> */}
                </div>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                    Daftar activity yang telah dilakukan oleh kontraktor terkait IUP ini. Anda dapat menambahkan, mengedit, atau menghapus activity sesuai kebutuhan.
                </p>
            </div>

            {(!surveys || surveys.length === 0) ? (
                <>
                {!showForm && (
                <div className="p-8">
                    <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                        No activity available. Click &ldquo;Add Activity&rdquo; to add one.
                    </div>
                </div>
                )}
                </>
            ) : (
                <div className="divide-y divide-slate-300">
                    {surveys.map((survey) =>
                        showForm && editingId === survey.iup_survey_id ? (
                            <SurveyForm
                                key={survey.iup_survey_id}
                                editingId={editingId}
                                form={form}
                                errors={errors}
                                submitting={submitting}
                                updateField={updateField}
                                // updateFileLink={updateFileLink}
                                // addFileLinkRow={addFileLinkRow}
                                // removeFileLinkRow={removeFileLinkRow}
                                submitForm={submitForm}
                                closeForm={closeForm}
                            />
                        ) : (
                            <SurveyCard
                                key={survey.iup_survey_id}
                                survey={survey}
                                onEdit={openEditForm}
                                onDelete={deleteSurvey}
                                isDeleting={deletingId === survey.iup_survey_id}
                            />
                        )
                    )}
                </div>
            )}

            {/* <CustomDataTable
                columns={columns}
                data={surveys}
                loading={loading}
                pagination={false}
                noDataComponent={
                    <div className="py-8 text-center text-gray-500">
                        <FaMapMarkerAlt className="mx-auto text-4xl mb-4 text-gray-300" />
                        <p>No territory data available</p>
                    </div>
                }
                responsive
                highlightOnHover
                striped={false}
                persistTableHead
                headerBackground="rgba(2, 83, 165, 0.1)"
                hoverBackground="rgba(223, 232, 242, 0.3)"
                borderRadius="8px"
                
                expandableRows
                expandableRowsComponent={ExpandedRow}
                // expandableRowDisabled={disableLocked ? r => r.locked : undefined}
            /> */}

            {showForm && !editingId && (
                <SurveyForm
                    editingId={editingId}
                    form={form}
                    errors={errors}
                    submitting={submitting}
                    updateField={updateField}
                    // updateFileLink={updateFileLink}
                    // addFileLinkRow={addFileLinkRow}
                    // removeFileLinkRow={removeFileLinkRow}
                    submitForm={submitForm}
                    closeForm={closeForm}
                />
            )}
            {!showForm && !editingId && (
            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl">
                <button
                    type="button"
                    onClick={openCreateForm}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Add Activity
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

            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false })}
                onConfirm={handleConfirmDeleted}
                title={`Confirm delete ${confirmDelete.name ?? ''}`}
                message="Are you sure you want to delete this survey? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                loading={submitting}
                size="md"
                showIcon={false}
            />
        </div>
    );
};

export default SurveyManagement;