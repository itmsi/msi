import { useMemo } from "react";
import { IupSurveyItem } from "../../types/iupmanagement";
import moment from "moment";
import { classifyEntry, formatDateHeading, TYPE_CONFIG } from "../Survey/Surveyutils";
import SurveyEntryCard from "../Survey/Surveyentrycard";

interface SurveyLogListProps {
    logs: IupSurveyItem[];
}

export function SurveyLogList({ logs }: SurveyLogListProps) {
    const groupedSurveys = useMemo(() => {
        const map = new Map<string, IupSurveyItem[]>();
        for (const entry of logs) {
            const key = moment(entry.chat_date).format('YYYY-MM-DD');
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(entry);
        }
        return Array.from(map.entries()).sort(
            ([dateA], [dateB]) => moment(dateB).valueOf() - moment(dateA).valueOf()
        );
    }, [logs]);

    if (logs.length === 0) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-gray-500">
                Belum ada log survei/percakapan sumber lapangan.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {groupedSurveys.map(([dateKey, dayEntries]) => (
                <div key={dateKey} className="mb-8">
                    <div className="sticky top-0 z-10 mb-3 inline-flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1 text-xs font-secondary font-medium text-white">
                        {formatDateHeading(dayEntries[0].chat_date)}
                    </div>
                    <div className="relative pl-6">
                        <div className="absolute bottom-1 left-[7px] top-1 w-0.5 bg-slate-300" />
                        <div className="space-y-4">
                            {dayEntries.map((entry) => {
                                const cfg = TYPE_CONFIG[classifyEntry(entry)];
                                return (
                                    <div key={entry.iup_survey_id} className="relative">
                                        <div
                                            className={`absolute left-[-21px] top-4 h-[10px] w-[10px] rounded-full border-2 border-white shadow ring-1 ring-slate-300 ${cfg.dot}`}
                                        />
                                        <SurveyEntryCard entry={entry} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))
            }
        </div>
    );
}
