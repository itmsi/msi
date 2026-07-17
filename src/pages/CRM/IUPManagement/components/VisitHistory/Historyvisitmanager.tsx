import { useIupVisit } from "../../hooks/useIupVisit";
import { 
    LuPlus
} from "react-icons/lu";
import VisitCard from "./Visitcard";
import VisitForm from "./Visitform";

// const formatDate = (iso: string): string => {
//     if (!iso) return "-";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return iso;
//     return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
// };

export interface HistoryVisitManagerProps {
    iupId: string;
    limit?: number;
}

const HistoryVisitManager = () => {
    const {
        visits,
        // pagination,
        // page,
        // setPage,
        // loading,
        submitting,
        deletingId,
        deleteVisit,

        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,
        updateImageLink,
        addImageLinkRow,
        removeImageLinkRow,
        fillCurrentLocation,

        submitForm,
    } = useIupVisit();

    // const inputCls =
    //     "w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 placeholder:text-slate-600";
    // const errorInputCls =
    //     "w-full bg-slate-950 border border-red-500/60 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 placeholder:text-slate-600";
    // const fieldCls = (hasError?: string) => (hasError ? errorInputCls : inputCls);

    return (<>
        <div className="w-full rounded-2xl border border-slate-300 bg-white">
            <div className="px-5 py-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide">History Visit</h2>
                    </div>
                    {/* <span className="text-xs text-slate-500">{visits.length} kunjungan</span> */}
                </div>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                    Catatan riwayat kunjungan tim ke lokasi IUP, lengkap dengan penanggung
                    jawab, kontak, koordinat, dan dokumentasi setiap kunjungan.
                </p>
            </div>

            {(!visits || visits.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    No visit history available. Click &ldquo;Add Visit&rdquo; to add one.
                </div>
            ) : (
                <div className="divide-slate-300 divide-y">
                    {visits.map((visit) =>
                        showForm && editingId === visit.iup_visit_history_id ? (
                            <VisitForm
                                key={visit.iup_visit_history_id}
                                editingId={editingId}
                                form={form}
                                errors={errors}
                                submitting={submitting}
                                updateField={updateField}
                                updateImageLink={updateImageLink}
                                addImageLinkRow={addImageLinkRow}
                                removeImageLinkRow={removeImageLinkRow}
                                fillCurrentLocation={fillCurrentLocation}
                                submitForm={submitForm}
                                closeForm={closeForm}
                            />
                        ) : (
                            <VisitCard
                                key={visit.iup_visit_history_id}
                                visit={visit}
                                onEdit={openEditForm}
                                onDelete={deleteVisit}
                                isDeleting={deletingId === visit.iup_visit_history_id}
                            />
                        )
                        )}
                    
                </div>
            )}

            {showForm && !editingId && (
                <VisitForm
                    editingId={editingId}
                    form={form}
                    errors={errors}
                    submitting={submitting}
                    updateField={updateField}
                    updateImageLink={updateImageLink}
                    addImageLinkRow={addImageLinkRow}
                    removeImageLinkRow={removeImageLinkRow}
                    fillCurrentLocation={fillCurrentLocation}
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
                    Add Visit
                </button>
            </div>
            )}
        </div>



      {/* Pagination */}
      {/* {pagination && pagination.totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <LuChevronLeft size={14} />
            Sebelumnya
          </button>
          <span className="text-xs text-slate-500">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page >= pagination.totalPages || loading}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Selanjutnya
            <LuChevronRight size={14} />
          </button>
        </div>
      )} */}
  </>);
};

export default HistoryVisitManager;