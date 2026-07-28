import { useEffect, useRef } from "react";
import { LuSparkles } from "react-icons/lu";
import { MarkdownText } from "./markdown-text";

interface AiSummaryPanelProps {
    summary: string;
    suggestions?: string[];
    prompt?: string;
    setPrompt: (value: string) => void;
    onGenerate: (prompt: string) => void;
    onSuggestionClick?: (suggestion: string) => void;
    isGenerating?: boolean;
}

export function AiSummaryPanel({
    summary,
    suggestions = [],
    prompt = "Buatkan ringkasan singkat dan informatif dari data zone site ini saja.",
    setPrompt,
    onGenerate,
    onSuggestionClick,
    isGenerating = false,
}: AiSummaryPanelProps) {
    // const [prompt, setPrompt] = useState(textPrompt || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }, [prompt]);

    const borderStateClass = isGenerating ? "ai-border-spinning" : "ai-border-static";

    return (
        <div className={`ai-border-wrapper ${borderStateClass} rounded-lg`}>
            <div className="ai-summary-gradient rounded-[7px] overflow-hidden">
                {/* Header AI Summary */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <div className="flex items-center gap-1.5">
                        <LuSparkles className="text-purple-600" size={15} />
                        <span className="text-sm font-semibold text-purple-700">AI Summary</span>
                        {isGenerating && (
                            <span className="text-xs text-purple-500">· Membuat ringkasan...</span>
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
                <div className="px-4 pb-3">
                    <MarkdownText content={summary} />
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
                        <div className="flex items-center justify-centerw-6 h-9 ">
                        <LuSparkles className="text-purple-600" size={15} />
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={1}
                            placeholder="Tulis instruksi untuk Mosa AI..."
                            className="flex-1 resize-none text-sm leading-relaxed text-gray-700 placeholder:text-gray-400 border-0 focus:ring-0 focus:outline-none py-1.5 max-h-[120px] overflow-y-auto"
                        />
                        <button
                            type="button"
                            onClick={() => onGenerate(prompt)}
                            disabled={isGenerating || !prompt.trim()}
                            className="ai-generate-btn flex items-center gap-1.5 text-sm font-medium text-white px-3.5 py-1.5 rounded-full shrink-0 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
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