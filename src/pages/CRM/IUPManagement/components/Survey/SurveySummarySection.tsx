import React, { useState, useCallback, useRef, useEffect } from "react";
import { LuSparkles, LuCopy, LuCheck, LuLoaderCircle, LuChevronUp, LuChevronDown, LuMessageCircle } from "react-icons/lu";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import SurveyChatHistory from "./SurveyChatHistory";
import toast from "react-hot-toast";
import moment from "moment";
import { IupSurveyItem } from "../../types/iupmanagement";
import { IupService } from "../../services/iupManagementService";

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
    const [collapsed, setCollapsed] = useState(true);
    const [copied, setCopied] = useState(false);
    const [summaryAiId, setSummaryAiId] = useState<string | null>(null);
    const [loadingInit, setLoadingInit] = useState(true);
    const abortRef = useRef<AbortController | null>(null);
    const promptRef = useRef<HTMLTextAreaElement>(null);
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

    const resizePrompt = useCallback(() => {
        const el = promptRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
        }
    }, []);

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
        } catch {}

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
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-200 animate-pulse">
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
        <div>
            {/* ── Header (clickable to toggle) ── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 group hover:bg-primary transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-200">
                        <LuSparkles size={16} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors">
                            Survey Summary
                        </h3>
                        <p className="text-[11px] text-gray-400 group-hover:text-white/80 transition-colors">
                            {surveys.length} surveys • AI-powered
                        </p>
                    </div>
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors">
                    {collapsed ? <LuChevronDown size={18} /> : <LuChevronUp size={18} />}
                </span>
            </button>

            {/* ── Empty State / Initial Generate ── */}
            {!hasEverGenerated && !summaryLoading && (
                <div className="px-5 py-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 mb-3">
                        <LuSparkles size={22} className="text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        No summary yet
                    </p>
                    <p className="text-sm text-gray-400 mb-4 max-w-xs mx-auto leading-relaxed">
                        Generate a summary for {surveys.length} IUP survey data using AI.
                    </p>
                    <button
                        onClick={handleGenerateSummary}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-sm shadow-purple-200 hover:shadow-md hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                        <LuSparkles size={15} />
                        Generate Summary
                    </button>
                </div>
            )}

            {/* ── Loading State ── */}
            {summaryLoading && !summaryResponse && (
                <div className="px-5 py-6">
                    <div className="max-w-xl mx-auto space-y-4">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <LuLoaderCircle size={20} className="animate-spin text-purple-600" />
                            <span className="text-sm text-gray-500 font-medium">Analyzing survey data...</span>
                        </div>
                        <div className="space-y-2.5">
                            <div className="h-3 rounded-full w-3/4 mx-auto relative overflow-hidden bg-slate-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                            </div>
                            <div className="h-3 rounded-full w-1/2 mx-auto relative overflow-hidden bg-slate-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                            </div>
                            <div className="h-3 rounded-full w-5/6 mx-auto relative overflow-hidden bg-slate-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Prompt Input (above result, always visible when not collapsed) ── */}
            {!collapsed && hasEverGenerated && (
                <div className="px-5 py-3 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2">
                        <textarea
                            ref={promptRef}
                            value={summaryPrompt}
                            onChange={(e) => {
                                setSummaryPrompt(e.target.value);
                                requestAnimationFrame(resizePrompt);
                            }}
                            onInput={resizePrompt}
                            rows={1}
                            placeholder="Set custom instructions for the summary (optional)..."
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all duration-200 placeholder:text-gray-300 resize-none overflow-hidden"
                        />
                        <button
                            onClick={handleGenerateSummary}
                            disabled={summaryLoading}
                            className="shrink-0 px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {summaryLoading ? (
                                <LuLoaderCircle size={15} className="animate-spin" />
                            ) : (
                                <LuSparkles size={15} />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Result ── */}
            {(summaryResponse || (summaryLoading && summaryResponse !== null)) && !collapsed && (
                <div className="px-5 py-4 border-b border-slate-100">
                    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                        {/* Result Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50/40 border-b border-slate-100">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-purple-200 rounded-md shadow-xs">
                                <LuSparkles size={11} className="text-purple-600" />
                                <span className="text-[10px] font-semibold text-gray-700">AI</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {sessionId && (
                                    <button
                                        onClick={() => setShowChatHistory(true)}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all"
                                    >
                                        <LuMessageCircle size={11} />
                                        Chat History
                                    </button>
                                )}
                                <button
                                    onClick={handleCopySummary}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 active:scale-90 transition-all"
                                    title="Copy"
                                >
                                    {copied ? <LuCheck size={13} className="text-green-500" /> : <LuCopy size={13} />}
                                </button>
                            </div>
                        </div>

                        {/* Result Body */}
                        <div className="px-4 py-3.5">
                            {summaryLoading ? (
                                <div className="space-y-2">
                                    <div className="h-3 rounded w-full relative overflow-hidden bg-slate-200">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                                    </div>
                                    <div className="h-3 rounded w-11/12 relative overflow-hidden bg-slate-200">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                                    </div>
                                    <div className="h-3 rounded w-4/5 relative overflow-hidden bg-slate-200">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                                    </div>
                                    <div className="h-3 rounded w-3/4 relative overflow-hidden bg-slate-200">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                                    </div>
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-purple-600 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 leading-relaxed">
                                    <MarkdownText content={summaryResponse || ''} />
                                </div>
                            )}
                        </div>
                    </div>
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
