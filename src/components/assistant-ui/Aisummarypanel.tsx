import { useEffect, useRef } from "react";
import { LuCheck, LuCopy, LuLoaderCircle, LuMessageCircle, LuSparkles } from "react-icons/lu";
import { MarkdownText } from "./markdown-text";

interface AiSummaryPanelProps {
    summary: string;
    suggestions?: string[];
    prompt?: string;
    setPrompt: (value: string) => void;
    onGenerate: (prompt: string) => void;
    onSuggestionClick?: (suggestion: string) => void;
    isGenerating?: boolean;
    sessionId?: string;
    setShowChatHistory?: (value: boolean) => void;
    copied?: boolean;
    handleCopySummary?: () => void;
}

export function AiSummaryPanel({
    summary,
    suggestions = [],
    prompt = "Buatkan ringkasan singkat dan informatif dari data zone site ini saja.",
    setPrompt,
    onGenerate,
    onSuggestionClick,
    isGenerating = false,
    sessionId,
    setShowChatHistory,
    copied = false,
    handleCopySummary
}: AiSummaryPanelProps) {
    // const [prompt, setPrompt] = useState(textPrompt || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [prompt]);

    const borderStateClass = isGenerating ? "ai-border-spinning" : "";

    return (
        <div className={`ai-border-wrapper ai-border-static ${borderStateClass} rounded-lg`} style={{background: '#dbeafe'}}>
            <div className="ai-summary-gradient rounded-[7px] overflow-hidden">
                {/* Header AI Summary */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200/60 rounded-lg shadow-xs">
                            <LuSparkles className="text-primary" size={15} />
                            <span className="text-sm font-primary-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent">MOSA Ai Summary</span>
                        </div>
                        {isGenerating && (
                            <span className="text-xs text-primary">· Membuat ringkasan...</span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {(sessionId || !isGenerating) && (
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200/60 rounded-lg shadow-xs">
                                    <button
                                        onClick={() => setShowChatHistory?.(true)}
                                        className="text-sm font-primary-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-1.5"
                                    >
                                        <LuMessageCircle size={13} className="text-primary" />
                                        <span className="hidden sm:inline">Chat History</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        {!isGenerating && (
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-blue-200/60 rounded-lg shadow-xs">
                                    <button
                                        onClick={handleCopySummary}
                                        className="text-sm font-primary-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-1.5"
                                        title="Copy"
                                    >
                                        {copied ? <LuCheck size={16} className="text-green-500" /> : <LuCopy size={16} className="text-primary" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* <button
                        type="button"
                        onClick={() => onGenerate(prompt)}
                        className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 transition-colors"
                    >
                        <LuRefreshCw size={12} />
                        Regenerate
                    </button> */}
                </div>

                {/* Isi ringkasan */}
                <div className="pt-3">
                    <div className={`bg-white rounded-t-2xl overflow-auto max-h-[55vh] transition-all`}>
                        
                        {/* ── Loading State ── */}
                        {isGenerating && (
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
                        <div className="px-4 pt-3">
                            <MarkdownText content={summary} />
                        </div>
                    </div>
                </div>

                {/* Suggestion chips — pengganti kalimat saran pasif */}
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-4 pb-3">
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => onSuggestionClick?.(s)}
                                className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Prompt input — jadi satu composer, bukan blok terpisah */}
                
                <div className="border-t border-purple-100 bg-white/70 backdrop-blur-sm px-3 py-2.5">
                    <div className="flex items-start gap-2">
                            <div className="flex items-center justify-center w-6 h-11.25 ">
                                <LuSparkles className="text-primary" size={16} />
                            </div>
                        
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={1}
                                placeholder="Tulis instruksi untuk Mosa AI..."
                                className={"flex-1 resize-none text-sm leading-relaxed text-gray-700 placeholder:text-gray-400 focus:ring-0 focus:outline-none px-3.5 py-2.5 max-h-[120px] overflow-y-auto border border-blue-300/60 rounded-xl bg-white"}
                                style={{ opacity: isGenerating ? 0 : 1 }}
                                disabled={isGenerating}
                            />
                            <button
                                type="button"
                                onClick={() => onGenerate(prompt)}
                                disabled={isGenerating || !prompt.trim()}
                                className="ai-generate-btn flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2.5 rounded-xl shrink-0 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                <LuSparkles size={14} className={isGenerating ? "animate-pulse" : ""} />
                                {isGenerating ? "Membuat..." : "Generate"}
                            </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AiSummaryPanel;