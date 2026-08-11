
interface VisitHistoryTimelineProps {
    visits: IupVisitHistory[];
}

export function VisitHistoryTimeline({ visits }: VisitHistoryTimelineProps) {
    if (visits.length === 0) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                Belum ada riwayat kunjungan ke site ini.
            </div>
        );
    }

    const sorted = [...visits].sort(
        (a, b) => new Date(b.iup_visit_history_date).getTime() - new Date(a.iup_visit_history_date).getTime()
    );

    return (
        <div className="space-y-0">
            {sorted.map((visit, i) => {
                const hasCoords = visit.iup_visit_history_latitude && visit.iup_visit_history_longitude;
                const mapsUrl = hasCoords
                    ? `https://www.google.com/maps?q=${visit.iup_visit_history_latitude},${visit.iup_visit_history_longitude}`
                    : null;

                return (
                    <div key={visit.iup_visit_history_id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1.5 flex-shrink-0" />
                            {i < sorted.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                        </div>
                        <div className="pb-5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold">{visit.iup_visit_history_title}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(visit.iup_visit_history_date)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {visit.employee_name ?? "Petugas tidak tercatat"}
                                {visit.iup_visit_history_phone_number ? ` · ${visit.iup_visit_history_phone_number}` : ""}
                            </div>
                            {visit.iup_visit_history_description && (
                                <div
                                    className="text-sm mt-1.5 prose prose-sm max-w-none"
                                    // eslint-disable-next-line react/no-danger -- same raw-HTML decision as zona site descriptions
                                    dangerouslySetInnerHTML={{ __html: visit.iup_visit_history_description }}
                                />
                            )}
                            {mapsUrl && (
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-1.5"
                                >
                                    <MapPin className="h-3 w-3" />
                                    Lihat lokasi
                                </a>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
