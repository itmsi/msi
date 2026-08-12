import DOMPurify from "dompurify";
import { LuLink2, LuMapPin } from "react-icons/lu";
import Avatar from "@/components/common/Avatar";

import type { IupVisitHistory } from "../../types/iupDashboard";
import { formatDate } from "./dashboardUtils";

interface VisitHistoryTimelineProps {
    visits: IupVisitHistory[];
}

export function VisitHistoryTimeline({ visits }: VisitHistoryTimelineProps) {
    if (visits.length === 0) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-gray-500">
                Belum ada riwayat kunjungan ke site ini.
            </div>
        );
    }

    const sorted = [...visits].sort(
        (a, b) => new Date(b.iup_visit_history_date).getTime() - new Date(a.iup_visit_history_date).getTime()
    );

    return (
        <div>
            {sorted.map((visit, i) => {
                const hasCoords = visit.iup_visit_history_latitude && visit.iup_visit_history_longitude;
                const mapsUrl = hasCoords
                    ? `https://www.google.com/maps?q=${visit.iup_visit_history_latitude},${visit.iup_visit_history_longitude}`
                    : null;

                return (
                    <div key={visit.iup_visit_history_id} className="flex gap-3 pb-4 last:pb-0">
                        <div className="flex flex-col items-center shrink-0">
                            <Avatar nama={visit.employee_name || "?"} size={32} fontSize={12} />
                            {i < sorted.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1.5" />}
                        </div>
                        <div className="min-w-0 flex-1 bg-gray-100 rounded-lg border border-gray-200 p-3.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-sm font-semibold font-secondary">{visit.iup_visit_history_title}</span>
                                <span className="text-xs text-gray-500">{formatDate(visit.iup_visit_history_date)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {visit.employee_name ?? "Petugas tidak tercatat"}
                                {visit.iup_visit_history_phone_number ? ` · ${visit.iup_visit_history_phone_number}` : ""}
                            </div>
                            {visit.iup_visit_history_description && (
                                <div
                                    className="reset-content text-sm mt-1.5 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(visit.iup_visit_history_description) }}
                                />
                            )}
                            {mapsUrl && (
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold font-secondary text-primary mt-1.5"
                                >
                                    <LuMapPin size={12} />
                                    Lihat lokasi
                                </a>
                            )}
                            {visit.iup_visit_history_file && visit.iup_visit_history_file.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-2">
                                    {visit.iup_visit_history_file.map((file, fi) => (
                                        <a
                                            key={fi}
                                            href={file.file_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 bg-white border border-blue-200 rounded-md font-medium"
                                        >
                                            <LuLink2 size={11} />
                                            File {fi + 1}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
