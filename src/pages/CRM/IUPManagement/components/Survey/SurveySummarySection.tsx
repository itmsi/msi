import React, { useState, useCallback, useRef, useEffect } from "react";
import { LuSparkles } from "react-icons/lu";
// import { LuSparkles, LuCopy, LuCheck, LuLoaderCircle, LuChevronDown, LuMessageCircle } from "react-icons/lu";
// import { TypingText } from "@/components/assistant-ui/typing-text";
import SurveyChatHistory from "./SurveyChatHistory";
import toast from "react-hot-toast";
import moment from "moment";
import { IupSurveyItem } from "../../types/iupmanagement";
import { IupService } from "../../services/iupManagementService";
import { AiSummaryPanel } from "@/components/assistant-ui/Aisummarypanel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface SurveySummarySectionProps {
    surveys: IupSurveyItem[];
    iupId: string;
}

const SurveySummarySection: React.FC<SurveySummarySectionProps> = ({
    surveys,
    iupId,
}) => {
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryResponse, setSummaryResponse] = useState<string | null>(null);
    const [summaryPrompt, setSummaryPrompt] = useState<string>("");
    const [sessionId, setSessionId] = useState<string>("");
    const [showChatHistory, setShowChatHistory] = useState(false);
    const [copied, setCopied] = useState(false);
    const [summaryAiId, setSummaryAiId] = useState<string | null>(null);
    const [loadingInit, setLoadingInit] = useState(true);
    const abortRef = useRef<AbortController | null>(null);
    // const promptRef = useRef<HTMLTextAreaElement>(null);
    const hasEverGenerated = !!summaryResponse;
    const hasData = surveys.length > 0;

    // Load existing summary on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoadingInit(true);
                if (!iupId) {
                    if (!cancelled) setLoadingInit(false);
                    return;
                }
                const res = await IupService.getIupSummaryAi({
                    iup_id: iupId,
                    summary_type: 'survey',
                    page: 1,
                    limit: 1,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                });
                if (cancelled) return;
                const items = res?.data?.items || [];
                if (res?.success && items.length > 0) {
                    const item = items[0];
                    setSummaryResponse(item.summary_response_ai || null);
                    setSummaryPrompt(item.summary_prompt_ai || '');
                    setSessionId(item.session_id || '');
                    setSummaryAiId(item.iup_summary_ai_id);
                }
            } catch {
                // No existing summary
            } finally {
                if (!cancelled) setLoadingInit(false);
            }
        })();
        return () => { cancelled = true; };
    }, [iupId]);

    const buildSurveyDataMessage = useCallback(() => {
        let msg = "DATA SURVEY IUP:\n\n";
        surveys.forEach((s, i) => {
            msg += `[Survey ${i + 1}]\n`;
            msg += `Nama: ${s.user_name}\n`;
            msg += `Deskripsi: ${s.description || '(tidak ada deskripsi)'}\n`;
            msg += `Link File: ${s.source_link || '(tidak ada file)'}\n`;
            msg += `Tanggal: ${moment(s.chat_date).format("DD MMMM YYYY")}\n\n`;
        });
        return msg;
    }, [surveys]);

    // const resizePrompt = useCallback(() => {
    //     const el = promptRef.current;
    //     if (el) {
    //         el.style.height = "auto";
    //         el.style.height = el.scrollHeight + "px";
    //     }
    // }, []);

    const handleCopySummary = useCallback(() => {
        if (!summaryResponse) return;
        navigator.clipboard.writeText(summaryResponse).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            toast.error("Failed to copy");
        });
    }, [summaryResponse]);

    const handleGenerateSummary = useCallback(async () => {
        const dataMessage = buildSurveyDataMessage();
        const fullPrompt = summaryPrompt.trim() || "Buatkan ringkasan dari data survey IUP ini secara komprehensif.";
        const message = `${dataMessage}\nINSTRUKSI:\n${fullPrompt}\n\nBuatlah summary yang hanya berdasarkan data survey di atas, jangan menambahkan informasi dari luar data tersebut.`;

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
                buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const clean = line.replace(/\r$/, "");
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

            // Save to new iup_summary_ai endpoint
            try {
                const payload = {
                    iup_id: iupId,
                    session_id: newSessionId,
                    summary_type: 'survey',
                    summary_prompt_ai: summaryPrompt || fullPrompt,
                    summary_response_ai: accumulatedText,
                };
                if (summaryAiId) {
                    await IupService.updateIupSummaryAi(summaryAiId, payload);
                } else {
                    const createRes = await IupService.createIupSummaryAi(payload);
                    if (createRes?.data?.iup_summary_ai_id) {
                        setSummaryAiId(createRes.data.iup_summary_ai_id);
                    }
                }
            } catch {
                // Non-critical
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                toast.error(error.message || "Failed to generate summary");
            }
        } finally {
            setSummaryLoading(false);
            abortRef.current = null;
        }
    }, [buildSurveyDataMessage, summaryPrompt, sessionId, iupId, summaryAiId]);

    if (!hasData) return null;

    // Initial loading state
    if (loadingInit) {
        return (
            <div className="border-b border-slate-200">
                <div className="flex items-center justify-between px-5 py-3.5 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-sm shadow-primary/20 animate-pulse">
                            <LuSparkles size={16} />
                        </div>
                        <div>
                            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-24 mt-1.5 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            {/* ── Header ── */}
            {/* <div className="w-full flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 relative overflow-hidden">
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary to-blue-600" />
                
                <div className="flex items-center gap-3">
                    <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg shadow-primary/30">
                        <LuSparkles size={17} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-semibold font-secondary text-gray-800">
                            Survey Summary
                        </h3>
                        <p className="text-[11px] text-gray-400">
                            {surveys.length} surveys • AI-powered
                        </p>
                    </div>
                </div>
            </div> */}
            {(hasEverGenerated || summaryResponse || summaryLoading) && (
                <AiSummaryPanel
                    summary={summaryResponse || ''}
                    prompt={summaryPrompt}
                    setPrompt={setSummaryPrompt}
                    onGenerate={handleGenerateSummary}
                    isGenerating={summaryLoading}
                    copied={copied}
                    handleCopySummary={handleCopySummary}
                    sessionId={sessionId}
                    setShowChatHistory={setShowChatHistory}
                />
            )}
            {/* ── Empty State / Initial Generate ── */}
            {!hasEverGenerated && !summaryLoading && (
                <div className="relative text-center overflow-hidden"
                    style={{
                        position: 'absolute',
                        right: '1.3rem',
                        top: '2.6rem',
                    }}>
                    <button
                        onClick={handleGenerateSummary}
                        className="ai-generate-btn flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2.5 rounded-xl shrink-0 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <LuSparkles size={16} />
                        Generate Summary
                    </button>
                </div>
            )}

            {/* ── AI Chat History Panel ── */}
            {showChatHistory && sessionId && (
                <SurveyChatHistory
                    sessionId={sessionId}
                    surveyId={surveys[0]?.iup_survey_id || ''}
                    iupId={surveys[0]?.iup_id || ''}
                    surveyName={surveys[0]?.user_name || 'Survey IUP'}
                    iupName={surveys[0]?.iup_id?.slice(0, 8) || 'IUP'}
                    chatDate={surveys[0]?.chat_date || ''}
                    onClose={() => setShowChatHistory(false)}
                />
            )}
        </div>
    );
};

export default SurveySummarySection;
