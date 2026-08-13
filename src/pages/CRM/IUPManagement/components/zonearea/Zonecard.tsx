import React, { useState, useCallback, useRef } from "react";
import { LuLink2, LuLoaderCircle, LuChevronDown, LuChevronRight, LuSparkles, LuEyeOff, LuBookOpen } from "react-icons/lu";
import Button from "@/components/ui/button/Button";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import moment from "moment";
import { IupZonaSiteItem, ZonaSitePayload } from "../../types/iupmanagement";
import type { MasterZoneSiteSection } from "../../types/iupSurvey";
import { IupService } from "../../services/iupManagementService";
import toast from "react-hot-toast";
import { PermissionGate } from "@/components/common/PermissionComponents";
// Survey Data table is currently disabled (see commented block below) — re-enable both together.
// import { parseSurveyTableFromHtml } from "./data/Parsesurveytablefromhtml";
// import { getMasterZoneSiteForName } from "./data/zoneSurveySchemaMap";
import DOMPurify from "dompurify";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import { AiSummaryPanel } from "@/components/assistant-ui/Aisummarypanel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ZonecardProps {
    zone: IupZonaSiteItem;
    onEdit: (zone: IupZonaSiteItem, showGuideInitially?: boolean) => void;
    onDelete: (zone: IupZonaSiteItem) => void;
    isDeleting?: boolean;
    zoneSiteTemplates: MasterZoneSiteSection[];
}

const Zonecard: React.FC<ZonecardProps> = ({
    zone,
    onEdit,
    onDelete,
    isDeleting = false,
    zoneSiteTemplates, // kept for when Survey Data (below) is re-enabled
}) => {
    void zoneSiteTemplates;
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [showGuide, setShowGuide] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryResponse, setSummaryResponse] = useState<string | null>(zone.summary_response_ai ?? null);
    const [summaryPrompt, setSummaryPrompt] = useState<string>(
        zone.summary_prompt_ai ?? `Buatkan summary dari data zone site berikut:

Nama Zone: ${zone.iup_zona_site_name}
Deskripsi: ${zone.iup_zona_site_description || '(tidak ada deskripsi)'}
File: ${zone.iup_zona_site_file?.length ? zone.iup_zona_site_file.map(f => f.file_link).join(', ') : '(tidak ada file)'}
Tanggal Survey: ${zone.iup_zona_site_date_last_survey || '-'}

Buatlah ringkasan yang informatif tentang zone ini saja.`
    );
    const [sessionId, setSessionId] = useState<string>(zone.session_id ?? '');
    const abortRef = useRef<AbortController | null>(null);
    const hasEverGenerated = !!zone.summary_response_ai;
    const isZoneDataEmpty = !zone.iup_zona_site_description && (!zone.iup_zona_site_file || zone.iup_zona_site_file.length === 0);

    const toggleZone = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const isOpen = !!expanded[zone.iup_zona_site_id];

    // const matchedSection = getMasterZoneSiteForName(zone.iup_zona_site_name, zoneSiteTemplates);
    // const surveyValues = parseSurveyTableFromHtml(zone.iup_zona_site_description ?? "");
    // const filledSurveyFields = matchedSection
    //     ? matchedSection.field_data.filter((f) => (surveyValues[f.key] ?? "").trim() !== "")
    //     : [];

    const handleGenerateSummary = useCallback(async () => {
        if (!summaryPrompt.trim()) {
            toast.error("Prompt summary tidak boleh kosong");
            return;
        }
        setSummaryLoading(true);
        setSummaryResponse("");

        const abortController = new AbortController();
        abortRef.current = abortController;
        const token = localStorage.getItem("auth_token");
        let newSessionId = sessionId;
        let accumulatedText = "";
        let employeeId: string | undefined;
        try {
            const authUser = localStorage.getItem("auth_user");
            if (authUser) {
                const parsed = JSON.parse(authUser);
                employeeId = parsed.employee_id;
            }
        } catch { }

        // Build message dengan data zone sesungguhnya
        const fileList = zone.iup_zona_site_file?.length
            ? zone.iup_zona_site_file.map(f => f.file_link).join('\n')
            : '(tidak ada file)';
        const message = `DATA ZONE SITE:
            Nama Zone: ${zone.iup_zona_site_name}
            Deskripsi: ${zone.iup_zona_site_description || '(tidak ada deskripsi)'}
            Tanggal Survey: ${zone.iup_zona_site_date_last_survey || '-'}
            File Terkait:
            ${fileList}

            INSTRUKSI:
            ${summaryPrompt}

            Buatlah summary yang hanya berdasarkan data zone site di atas, jangan menambahkan informasi dari luar data tersebut.`;

        try {
            const response = await fetch(`${API_BASE_URL}/mosa/ai-assistant/chat/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: sessionId || undefined,
                    system: ["CRM"],
                    userId: employeeId,
                }),
                signal: abortController.signal,
            });

            if (!response.ok || !response.body) throw new Error("Stream request failed");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (abortController.signal.aborted) break;

                buffer += decoder.decode(value, { stream: true });
                buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const clean = line.replace(/\r$/, '');
                    if (clean.startsWith("0:")) {
                        let raw = clean.slice(2).trim();
                        if (raw.startsWith('"') && raw.endsWith('"')) {
                            try { raw = JSON.parse(raw); } catch { raw = raw.replace(/^"|"$/g, ""); }
                        }
                        accumulatedText += String(raw);
                        setSummaryResponse(accumulatedText);
                    } else if (clean.startsWith("d:")) {
                        try {
                            const doneData = JSON.parse(clean.slice(2).trim());
                            if (doneData.sessionId) newSessionId = doneData.sessionId;
                        } catch { /* ignore */ }
                        break;
                    } else if (clean.startsWith("3:")) {
                        throw new Error("Stream error from server");
                    }
                }
            }

            abortRef.current = null;
            setSessionId(newSessionId);

            // Save summary back to API when stream completes
            const toPayload = (): Omit<ZonaSitePayload, "iup_zona_site_id"> => {
                return {
                    iup_id: zone.iup_id,
                    iup_zona_site_name: zone.iup_zona_site_name,
                    iup_zona_site_date_last_survey: zone?.iup_zona_site_date_last_survey ? moment(zone.iup_zona_site_date_last_survey).format("YYYY-MM-DD") : null,
                    iup_zona_site_description: zone.iup_zona_site_description,
                    iup_zona_site_file: zone.iup_zona_site_file ? zone.iup_zona_site_file
                        .map((l) => l.file_link)
                        .filter(Boolean)
                        .map((file_link) => ({ file_link })) : [],
                    summary_prompt_ai: summaryPrompt,
                    summary_response_ai: accumulatedText,
                    session_id: newSessionId,
                    guide: zone.guide,
                };
            };
            try {
                const payload = toPayload();
                await IupService.updateIupZonaSite(zone.iup_zona_site_id, { ...payload, iup_zona_site_id: zone.iup_zona_site_id });
            } catch (err) {
                console.error('[handleGenerateSummary] failed to save summary:', err);
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                toast.error(error.message || "Gagal membuat summary");
            }
        } finally {
            setSummaryLoading(false);
            abortRef.current = null;
        }
    }, [summaryPrompt, sessionId, zone]);
    return (
        <div className={`${isDeleting ? 'border-red-300 bg-red-50' : ''
            }`}>
            <div
                onClick={() => toggleZone(zone.iup_zona_site_id)}
                className={`pointer flex items-center justify-between gap-2 px-5 py-3 ${isOpen ? 'bg-primary hover:bg-primary text-white ' : ''} group hover:bg-primary transition-colors hover:*:text-white cursor-pointer`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                        <LuChevronDown size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`} />
                    ) : (
                        <LuChevronRight size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`} />
                    )}
                    <div className={`min-w-0 group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'}`}>
                        <p className="flex-1 text-sm font-primary-bold">{zone.iup_zona_site_name}</p>
                        <p className="flex-1 text-xs font-secondary">{moment(zone.iup_zona_site_date_last_survey).format("DD MMMM YYYY")}</p>
                    </div>


                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {zone?.guide && (
                        <Tooltip content={showGuide ? `Hide the step Instructions for ${zone.iup_zona_site_name}` : `Show the step Instructions for ${zone.iup_zona_site_name}`}>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-slate-800 text-slate-500 hover:text-slate-200 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                                onClick={() => {
                                    if (!isOpen) {
                                        toggleZone(zone.iup_zona_site_id);
                                        setShowGuide(true);
                                    } else {
                                        setShowGuide((prev) => !prev);
                                    }
                                }}
                            >
                                {showGuide ? <LuEyeOff size={15} /> : <LuBookOpen size={15} />}
                            </Button>
                        </Tooltip>
                    )}
                    <PermissionGate permission={["create", "update"]}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(zone, showGuide)}
                            className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-slate-800 text-slate-500 hover:text-slate-200 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                        >
                            <MdEdit size={15} />
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="delete">
                        <Button
                            variant="outline"
                            onClick={() => { if (!isDeleting) onDelete(zone); }}
                            className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-red-500/10 text-slate-500 hover:text-red-400 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                        >
                            {isDeleting ? <LuLoaderCircle size={15} className="animate-spin" /> : <MdDeleteOutline size={15} />}
                        </Button>
                    </PermissionGate>
                </div>
            </div>
            {/* Detail — hanya tampil saat accordion terbuka */}
            {isOpen && (
                <div className="px-10 py-4 space-y-3">
                    {(summaryResponse || summaryLoading) && (
                        <AiSummaryPanel
                            summary={summaryResponse || ''}
                            prompt={summaryPrompt}
                            setPrompt={setSummaryPrompt}
                            onGenerate={handleGenerateSummary}
                            isGenerating={summaryLoading || isZoneDataEmpty}
                            showCopyButton={false}
                            showChatHistory={false}
                        />
                    )}
                    {!hasEverGenerated && !summaryResponse && (
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                onClick={handleGenerateSummary}
                                disabled={summaryLoading || isZoneDataEmpty}
                                className="ai-generate-btn flex items-center gap-1.5 text-sm font-medium text-white px-3.5 py-1.5 rounded-full shrink-0 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {summaryLoading ? <LuLoaderCircle size={13} className="animate-spin" /> : <LuSparkles size={13} />}
                                {summaryLoading ? 'Generating...' : 'Summary by Mosa AI'}
                            </Button>
                        </div>
                    )}
                    {zone.guide && showGuide && (
                        <div className="border-l-2 border-blue-light-400 pl-3">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-primary-bold text-slate-500 uppercase tracking-wide">
                                <LuBookOpen size={12} />
                                Guide — reference for filling in Remarks below
                            </p>
                            <div className="relative ">
                                <div
                                    className="reset-content text-sm text-slate-600"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(zone.guide, {
                                            ADD_ATTR: ["style", "data-field-key", "data-survey-section", "contenteditable"],
                                        }),
                                    }}
                                ></div>
                                {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"></div> */}
                            </div>
                            {/* <button
                                type="button"
                                onClick={() => onViewGuide(zone)}
                                className="mt-1.5 text-xs font-medium text-primary hover:underline"
                            >
                                View full guide →
                            </button> */}
                        </div>
                    )}
                    <div className="p-5 rounded-lg border border-gray-200 shadow-[1px_2px_5px_0px_#9e9e9e]">
                        {/* <p className="mb-1.5 text-xs font-primary-bold text-slate-500 uppercase tracking-wide">
                            Remarks
                        </p> */}
                        <div className="prose max-w-none text-gray-700 reset-content">
                            {zone.iup_zona_site_description && (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(zone.iup_zona_site_description, {
                                            ADD_ATTR: ["style", "data-field-key", "data-survey-section", "contenteditable"],
                                        }),
                                    }}
                                ></div>
                            )}
                        </div>
                    </div>
                    {zone.iup_zona_site_file?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {zone.iup_zona_site_file.map((img, i) => (
                                <a
                                    key={i}
                                    href={img.file_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-blue-200 border rounded-md font-medium"
                                >
                                    <LuLink2 size={11} />
                                    File {i + 1}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Zonecard;