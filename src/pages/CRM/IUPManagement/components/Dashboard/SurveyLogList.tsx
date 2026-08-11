import { useState } from "react";
import { MessageCircle, Mic, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { IupSurveyLog } from "../types/iup.types";
import { formatDate } from "../utils/format";

interface SurveyLogListProps {
    logs: IupSurveyLog[];
}

const sourceIcon: Record<string, typeof MessageCircle> = {
    WhatsApp: MessageCircle,
    Voice: Mic,
};

export function SurveyLogList({ logs }: SurveyLogListProps) {
    if (logs.length === 0) {
        return (
            <div className="border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                Belum ada log survei/percakapan sumber lapangan.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {logs.map((log) => (
                <SurveyLogItem key={log.iup_survey_id} log={log} />
            ))}
        </div>
    );
}

function SurveyLogItem({ log }: { log: IupSurveyLog }) {
    const [expanded, setExpanded] = useState(false);
    const Icon = sourceIcon[log.source_type] ?? FileText;

    // Prefer the AI summary when available — raw transcripts (esp. Voice) can be
    // long and messy; only show the raw description on explicit expand.
    const hasSummary = Boolean(log.summary_response_ai);
    const bodyText = hasSummary ? log.summary_response_ai! : log.description ?? "";
    const isLong = bodyText.length > 280;
    const displayText = expanded || !isLong ? bodyText : `${bodyText.slice(0, 280)}…`;

    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{log.user_name}</span>
                    <Badge variant="outline" className="text-[10px]">
                        {log.source_type}
                    </Badge>
                    {hasSummary && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            AI Summary
                        </Badge>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(log.chat_date)}</span>
            </div>

            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {displayText || <span className="italic">Tidak ada isi tercatat.</span>}
            </p>

            {isLong && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="text-xs font-semibold text-emerald-700 mt-2"
                >
                    {expanded ? "Tampilkan lebih sedikit" : "Tampilkan selengkapnya"}
                </button>
            )}

            {log.source_link && (
                <a
                    href={log.source_link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs font-semibold text-emerald-700 mt-2"
                >
                    Buka sumber asli →
                </a>
            )}
        </div>
    );
}
