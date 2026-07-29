import React, { useState, useCallback, useRef, useEffect } from "react";
import { LuSparkles, LuCopy, LuCheck, LuLoaderCircle, LuChevronDown, LuMessageCircle } from "react-icons/lu";
import { TypingText } from "@/components/assistant-ui/typing-text";
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
            {/* ── Header (clickable to toggle) ── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={`w-full flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 group hover:bg-primary transition-all duration-300 cursor-pointer relative overflow-hidden`}
            >
                {/* Subtle decorative gradient line on left */}
                <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary to-blue-600 transition-all duration-300 ${
                    !collapsed ? 'opacity-100 scale-y-100' : 'opacity-0 group-hover:opacity-60 scale-y-0 group-hover:scale-y-100'
                }`} />
                
                <div className="flex items-center gap-3">
                    <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                        !collapsed 
                            ? 'bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg shadow-primary/30'
                            : 'bg-gradient-to-br from-primary to-blue-700 text-white shadow-sm shadow-primary/20 group-hover:shadow-md group-hover:scale-105'
                    }`}>
                        <LuSparkles size={17} className={!collapsed ? 'animate-pulse' : ''} />
                        {/* Small glow dot */}
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors duration-200">
                            Survey Summary
                        </h3>
                        <p className="text-[11px] text-gray-400 group-hover:text-white/80 transition-colors duration-200">
                            {surveys.length} surveys • AI-powered
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-gray-400 group-hover:text-white transition-all duration-300 ${
                        !collapsed ? 'rotate-180' : ''
                    }`}>
                        <LuChevronDown size={18} className="transition-transform duration-300" />
                    </span>
                </div>
            </button>

            {/* ── Expandable Content ── */}
            {!collapsed && (
                <div className="animate-fadeIn">
                    {/* ── Empty State / Initial Generate ── */}
                    {!hasEverGenerated && !summaryLoading && (
                        <div className="relative px-6 py-8 text-center overflow-hidden">
                            <div className="relative">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg shadow-primary/30 mb-4">
                                    <LuSparkles size={24} />
                                </div>
                                <p className="text-sm font-semibold text-gray-800 mb-1.5">
                                    No summary yet
                                </p>
                                <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto leading-relaxed">
                                    Generate a summary for <span className="font-medium text-gray-500">{surveys.length}</span> IUP survey data using AI.
                                </p>
                                <button
                                    onClick={handleGenerateSummary}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary via-blue-600 to-blue-700 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                >
                                    <LuSparkles size={16} />
                                    Generate Summary
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Loading State ── */}
                    {summaryLoading && !summaryResponse && (
                        <div className="px-6 py-8">
                            <div className="max-w-md mx-auto space-y-5">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="relative">
                                        <LuLoaderCircle size={22} className="animate-spin text-primary" />
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">Analyzing survey data...</span>
                                </div>
                                <div className="space-y-2.5">
                                    {[75, 50, 85].map((w, i) => (
                                        <div key={i} className={`h-3 rounded-full relative overflow-hidden bg-slate-100 mx-auto`} style={{ width: `${w}%` }}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent animate-shimmer" 
                                                style={{ animationDelay: `${i * 0.15}s` }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Prompt Input ── */}
                    {hasEverGenerated && (
                        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/50 to-primary/5 border-b border-primary/10">
                            <div className="flex items-center gap-2.5">
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
                                        className="w-full px-3.5 py-2.5 text-sm border border-blue-200/60 rounded-xl bg-white/80 backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 placeholder:text-gray-300 resize-none overflow-hidden pr-10"
                                    />
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={summaryLoading}
                                    className="shrink-0 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary via-blue-600 to-blue-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-1.5"
                                >
                                    {summaryLoading ? (
                                        <LuLoaderCircle size={15} className="animate-spin" />
                                    ) : (
                                        <LuSparkles size={15} />
                                    )}
                                    <span className="hidden sm:inline">Generate</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Result ── */}
                    {(summaryResponse || (summaryLoading && summaryResponse !== null)) && (
                        <div className="px-5 py-4">
                            <div className="relative group">
                                {/* Glow effect behind card */}
                                <div className={`absolute -inset-1 bg-gradient-to-r from-primary/10 via-blue-400/15 to-primary/10 rounded-2xl blur-md transition-opacity duration-500 ${
                                    summaryLoading ? 'opacity-60' : ''
                                }`} />
                                
                                {/* Main card */}
                                <div className="relative bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                    {/* Card header */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50/80 via-white to-primary/5 border-b border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200/60 rounded-lg shadow-xs">
                                                <div className="relative">
                                                    <LuSparkles size={12} className="text-primary" />
                                                </div>
                                                <span className="text-[10px] font-semibold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                    AI Generated
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {sessionId && !summaryLoading && (
                                                <button
                                                    onClick={() => setShowChatHistory(true)}
                                                    className="inline-flex border-1 border-gray-300 items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-gray-500 hover:text-white hover:bg-primary rounded-lg transition-all"
                                                >
                                                    <LuMessageCircle size={13} />
                                                    <span className="hidden sm:inline">Chat History</span>
                                                </button>
                                            )}
                                            {!summaryLoading && (
                                                <button
                                                    onClick={handleCopySummary}
                                                    className="p-1.5 border-1 border-gray-300 rounded-lg text-gray-400 hover:text-white hover:bg-primary active:scale-90 transition-all"
                                                    title="Copy"
                                                >
                                                    {copied ? <LuCheck size={14} className="text-green-500" /> : <LuCopy size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="px-4 py-4">
                                        {summaryLoading ? (
                                            <div className="space-y-2.5">
                                                {[100, 92, 85, 78].map((w, i) => (
                                                    <div key={i} className={`h-3 rounded relative overflow-hidden bg-slate-100`} style={{ width: `${w}%` }}>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/40 to-transparent animate-shimmer"
                                                            style={{ animationDelay: `${i * 0.2}s` }} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                        <TypingText content={summaryResponse || ''} isRunning={summaryLoading} />
                                        )}
                                    </div>

                                    {/* Card footer for AI attribution */}
                                    {!summaryLoading && summaryResponse && (
                                        <div className="px-4 py-2 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent border-t border-slate-100/50">
                                            <p className="text-[10px] text-gray-400 text-center">
                                                Powered by Mosa AI
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
