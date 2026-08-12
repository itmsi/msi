import React, { useState, useCallback, useRef, useEffect } from "react";
import { LuX, LuSend, LuMessageCircle, LuLoaderCircle } from "react-icons/lu";
import { AIAssistantService } from "@/services/aiAssistantService";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import type { ChatMessage } from "@/types/aiAssistant";
import toast from "react-hot-toast";
import { IconAIAtomOrbit } from "@/icons";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface SurveyChatHistoryProps {
    sessionId: string;
    surveyId: string;
    iupId: string;
    surveyName: string;
    iupName: string;
    chatDate: string;
    onClose: () => void;
}

const SurveyChatHistory: React.FC<SurveyChatHistoryProps> = ({
    sessionId,
    surveyId: _surveyId,
    iupId: _iupId,
    iupName,
    chatDate: _chatDate,
    onClose,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inputText, setInputText] = useState("");
    const [streamText, setStreamText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const currentSessionId = useRef(sessionId);

    // ─── Load History ───────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await AIAssistantService.getHistory(sessionId);
                if (cancelled) return;
                if (response.success && response.data?.conversationHistory) {
                    setMessages(response.data.conversationHistory);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || "Gagal memuat riwayat chat");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [sessionId]);

    // ─── Auto-scroll ────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamText]);

    // ─── Auto-resize input ──────────────────────────────────────
    useEffect(() => {
        const el = inputRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
        }
    }, [inputText]);

    // ─── Send Message (streaming) ──────────────────────────────
    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || sending) return;

        setSending(true);
        setStreamText("");
        setInputText("");

        const userMsg: ChatMessage = {
            role: "user",
            content: text,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        const abortController = new AbortController();
        abortRef.current = abortController;
        const token = localStorage.getItem("auth_token");
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
                    message: text,
                    sessionId: currentSessionId.current || undefined,
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
                        setStreamText(accumulatedText);
                    } else if (clean.startsWith("d:")) {
                        try {
                            JSON.parse(clean.slice(2).trim());
                        } catch { /* ignore */ }
                        break;
                    } else if (clean.startsWith("3:")) {
                        throw new Error("Stream error from server");
                    }
                }
            }

            abortRef.current = null;

            const assistantMsg: ChatMessage = {
                role: "assistant",
                content: accumulatedText,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setStreamText("");
        } catch (err: any) {
            if (err.name !== "AbortError") {
                toast.error(err.message || "Gagal mengirim pesan");
            }
        } finally {
            setSending(false);
            abortRef.current = null;
        }
    }, [inputText, sending]);

    // ─── Keyboard shortcut: Enter to send ──────────────────────
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/10" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col mt-[64px] md:mt-[77px] h-[92%] animate-slide-in-right">
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-primary/5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <IconAIAtomOrbit size={30} className="text-white" />
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold font-secondary text-gray-800 truncate">
                                Mosa AI Chat History
                            </h3>
                            <p className="text-[11px] text-gray-500 truncate">survey - {iupName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-all"
                    >
                        <LuX size={18} />
                    </button>
                </div>

                {/* ── Messages ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <LuLoaderCircle size={24} className="animate-spin text-primary" />
                                <span className="text-xs font-medium">Memuat riwayat chat...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center px-6">
                                <LuMessageCircle size={32} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-sm text-gray-500 mb-1">Gagal memuat riwayat</p>
                                <p className="text-xs text-gray-400">{error}</p>
                            </div>
                        </div>
                    ) : messages.length === 0 && !sending ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center px-6">
                                <LuMessageCircle size={32} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-sm text-gray-500">Belum ada percakapan</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Mulai diskusi dengan AI Assistant
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === "user"
                                                ? "bg-gradient-to-br from-primary via-blue-600 to-cyan-600 text-white rounded-br-md"
                                                : "bg-gray-100 text-gray-800 border border-gray-100 rounded-bl-md"
                                            }`}
                                    >
                                        {msg.role === "user" ? (
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                        ) : (
                                            <div className="prose prose-sm max-w-none overflow-x-hidden prose-p:text-gray-700 prose-headings:text-gray-800 prose-p:break-words prose-pre:overflow-x-auto">
                                                <MarkdownText content={msg.content} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Streaming message */}
                            {sending && streamText && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-gray-100 text-gray-800 border border-gray-100 rounded-bl-md break-words">
                                        <div className="prose prose-sm max-w-none overflow-x-hidden">
                                            <MarkdownText content={streamText} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Typing indicator */}
                            {sending && !streamText && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl px-4 py-3 bg-gray-100 border border-gray-100 rounded-bl-md">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* ── Input ── */}
                <div className="border-t border-gray-100 px-4 py-3 bg-white">
                    <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all px-3 py-2">
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder="Tanyakan sesuatu tentang survey ini..."
                            disabled={sending}
                            className="flex-1 text-sm bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-gray-400 disabled:opacity-50 max-h-32 py-0.5"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !inputText.trim()}
                            className="p-2 rounded-lg bg-gradient-to-r from-primary via-blue-600 to-cyan-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
                        >
                            {sending ? (
                                <LuLoaderCircle size={15} className="animate-spin" />
                            ) : (
                                <LuSend size={15} />
                            )}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                        Tekan Enter untuk kirim, Shift+Enter untuk baris baru
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SurveyChatHistory;
