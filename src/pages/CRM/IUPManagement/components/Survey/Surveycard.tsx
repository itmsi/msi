import React, { useState, useCallback, useRef, useEffect } from "react";
import { LuLink2, LuLoaderCircle, LuChevronDown, LuChevronRight, LuSparkles } from "react-icons/lu";
import Button from "@/components/ui/button/Button";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import moment from "moment";
import { IupSurveyItem } from "../../types/iupmanagement";
import { IupService } from "../../services/iupManagementService";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SurveyCardProps {
    survey: IupSurveyItem;
    onEdit: (survey: IupSurveyItem) => void;
    onDelete: (survey: IupSurveyItem) => void;
    isDeleting?: boolean;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ 
    survey, 
    onEdit, 
    onDelete, 
    isDeleting = false
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryResponse, setSummaryResponse] = useState<string | null>(survey.summary_response_ai ?? null);
    const [summaryPrompt, setSummaryPrompt] = useState<string>(
        survey.summary_prompt_ai ?? `Buatkan summary dari data survey berikut:

Nama: ${survey.user_name}
Deskripsi: ${survey.description || '(tidak ada deskripsi)'}
Link File: ${survey.source_link || '(tidak ada file)'}
Tanggal: ${moment(survey.chat_date).format("DD MMMM YYYY")}

Buatlah ringkasan yang informatif tentang survey ini saja.`
    );
    const [sessionId, setSessionId] = useState<string>(survey.session_id ?? '');
    const abortRef = useRef<AbortController | null>(null);
    const promptRef = useRef<HTMLTextAreaElement>(null);
    const hasEverGenerated = !!survey.summary_response_ai;
    const isSurveyDataEmpty = !survey.description && !survey.source_link;

    const toggleSurvey = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const isOpen = !!expanded[survey.iup_survey_id];

    const resizePrompt = useCallback(() => {
        const el = promptRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    }, []);

    useEffect(() => {
        if (isOpen && (hasEverGenerated || summaryLoading || summaryResponse)) {
            resizePrompt();
        }
    }, [isOpen, summaryPrompt, resizePrompt, hasEverGenerated, summaryLoading, summaryResponse]);

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
        } catch {}

        const message = `DATA SURVEY:
Nama: ${survey.user_name}
Deskripsi: ${survey.description || '(tidak ada deskripsi)'}
Link File: ${survey.source_link || '(tidak ada file)'}
Tanggal: ${moment(survey.chat_date).format("DD MMMM YYYY")}

INSTRUKSI:
${summaryPrompt}

Buatlah summary yang hanya berdasarkan data survey di atas, jangan menambahkan informasi dari luar data tersebut.`;

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
            try {
                await IupService.updateIupSurvey(survey.iup_survey_id, {
                    iup_id: survey.iup_id,
                    user_phone: survey.user_phone,
                    user_name: survey.user_name,
                    chat_date: moment(survey.chat_date).format("YYYY-MM-DD"),
                    source_type: survey.source_type,
                    source_link: survey.source_link,
                    file_name: survey.file_name,
                    description: survey.description,
                    summary_prompt_ai: summaryPrompt,
                    summary_response_ai: accumulatedText,
                    session_id: newSessionId,
                });
            } catch {
                // Non-critical
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                toast.error(error.message || "Gagal membuat summary");
            }
        } finally {
            setSummaryLoading(false);
            abortRef.current = null;
        }
    }, [summaryPrompt, sessionId, survey]);

    return (
        <div className={`${
            isDeleting ? 'border-red-300 bg-red-50' : ''
        }`}>
            <div
                onClick={() => toggleSurvey(survey.iup_survey_id)}
                className={`pointer flex items-center justify-between gap-2 px-5 py-3 ${isOpen ? 'bg-primary hover:bg-primary text-white ' : ''} group hover:bg-primary transition-colors hover:*:text-white cursor-pointer`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                        <LuChevronDown size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`} />
                    ) : (
                        <LuChevronRight size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`}  />
                    )}
                    <div className={`min-w-0 group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'}`}>
                        <p className="flex-1 text-sm font-primary-bold">{survey.user_name}</p>
                        <p className="flex-1 text-xs font-secondary">{moment(survey.chat_date).format("DD MMMM YYYY")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onEdit(survey);
                        }}
                        className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-slate-800 text-slate-500 hover:text-slate-200 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                    >
                        <MdEdit size={15} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (!isDeleting) onDelete(survey);
                        }}
                        className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-red-500/10 text-slate-500 hover:text-red-400 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                    >
                        {isDeleting ? <LuLoaderCircle size={15} className="animate-spin" /> : <MdDeleteOutline size={15} />}
                    </Button>
                </div>
            </div>
            {/* Detail — hanya tampil saat accordion terbuka */}
            {isOpen && (
                <div className="px-10 py-4 space-y-3">
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-md text-slate-600">
                        <span className="flex items-center gap-1 text-gray-800 font-primary-bold text-md">
                            {survey.user_name || '-'}
                        </span>
                        {!hasEverGenerated && !summaryResponse && (
                            <button
                                onClick={handleGenerateSummary}
                                disabled={summaryLoading || isSurveyDataEmpty}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-sm shadow-purple-200 hover:shadow-md hover:shadow-purple-300 hover:scale-105 active:scale-95 transition-all duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {summaryLoading ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <LuSparkles size={13} className="animate-pulse" />
                                        <span>Summary by Mosa AI</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="w-full min-h-25 p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none text-gray-700 reset-content">
                        {survey.description && <div dangerouslySetInnerHTML={{ __html: survey.description }}></div>}
                    </div>
                    {survey.source_link && (
                        <a
                            href={survey.source_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-blue-200 border rounded-md font-medium "
                        >
                            <LuLink2 size={11} /> Link File
                        </a>
                    )}

                    {/* ── Prompt & Summary (hanya jika sudah pernah generate) ── */}
                    {(hasEverGenerated || summaryResponse || summaryLoading) && (
                    <div className="relative mt-6 pt-6">
                        {/* Gradient divider */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />

                        {/* ── AI Summary Card ── */}
                        {(summaryResponse || summaryLoading) && (
                            <div className="relative group mb-5">
                                {/* Glow effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/20 via-indigo-400/20 to-purple-400/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                {/* Card with glassmorphism */}
                                <div className="relative bg-white/80 backdrop-blur-sm border border-purple-100/60 rounded-xl p-5 shadow-sm shadow-purple-100/50 transition-all duration-300">
                                    {/* Header badge */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100/50 rounded-full">
                                            <LuSparkles size={13} className="text-purple-600" />
                                            <span className="text-[11px] font-semibold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                                                AI Summary
                                            </span>
                                        </div>
                                        {summaryResponse && (
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                Generated by Mosa AI
                                            </span>
                                        )}
                                    </div>

                                    {/* Content / Loading skeleton */}
                                    {summaryLoading && !summaryResponse ? (
                                        <div className="space-y-2.5 animate-pulse">
                                            <div className="h-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full w-3/4" />
                                            <div className="h-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full w-1/2" />
                                            <div className="h-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full w-5/6" />
                                            <div className="h-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full w-2/3" />
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm max-w-none prose-headings:text-purple-900 prose-a:text-purple-600 transition-all duration-500">
                                            <MarkdownText content={summaryResponse || ''} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Prompt Editor ── */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Prompt
                                </label>
                                <span className="text-[10px] text-gray-400">{summaryPrompt.length} characters</span>
                            </div>
                            <div className="relative">
                                <textarea
                                    ref={promptRef}
                                    value={summaryPrompt}
                                    onChange={(e) => {
                                        setSummaryPrompt(e.target.value);
                                        // Recalculate height after state updates
                                        requestAnimationFrame(resizePrompt);
                                    }}
                                    onInput={resizePrompt}
                                    rows={1}
                                    placeholder="Masukkan prompt untuk summary..."
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white/60 backdrop-blur-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all duration-200 placeholder:text-gray-300 resize-none overflow-hidden"
                                />
                            </div>
                        </div>

                        {/* ── Generate Button ── */}
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleGenerateSummary}
                                disabled={summaryLoading || isSurveyDataEmpty}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-sm shadow-purple-200 hover:shadow-md hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {summaryLoading ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <LuSparkles size={14} />
                                        <span>Generate Summary</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SurveyCard;