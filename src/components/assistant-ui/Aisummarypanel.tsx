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
            <style>{`
                .ai-border-wrapper {
                    position: relative;
                    padding: 1.5px;
                    overflow: hidden;
                }
                .ai-border-static {
                    background: #ede9fe; /* purple-100, garis diam saat idle */
                }
                .ai-border-spinning {
                    background: transparent;
                }
                .ai-border-spinning::before {
                    content: '';
                    position: absolute;
                    inset: -50%;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(
                        from 0deg,
                        transparent 0deg,
                        #c4b5fd 40deg,
                        #a78bfa 90deg,
                        #ec4899 140deg,
                        transparent 200deg,
                        transparent 360deg
                    );
                    animation: aiBorderSpin 1.6s linear infinite;
                }
                @keyframes aiBorderSpin {
                    to { transform: rotate(360deg); }
                }
                .ai-border-spinning .ai-summary-gradient {
                    position: relative;
                    z-index: 1;
                }
                .ai-summary-gradient {
                    background: linear-gradient(
                        120deg,
                        rgb(245, 243, 255) 0%,
                        rgb(237, 233, 254) 25%,
                        rgb(243, 232, 255) 50%,
                        rgb(237, 233, 254) 75%,
                        rgb(245, 243, 255) 100%
                    );
                    background-size: 300% 300%;
                    animation: aiGradientShift 8s ease-in-out infinite;
                }
                @keyframes aiGradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .ai-summary-gradient { animation: none; }
                    .ai-border-spinning::before { animation: none; }
                }
            `}</style>

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
                        <LuSparkles className="text-purple-600" size={15} />
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={1}
                            placeholder="Tulis instruksi untuk Mosa AI..."
                            className="flex-1 resize-none text-sm leading-relaxed text-gray-700 placeholder:text-gray-400 border-0 focus:ring-0 focus:outline-none py-1.5"
                        />
                        <button
                            type="button"
                            onClick={() => onGenerate(prompt)}
                            disabled={isGenerating || !prompt.trim()}
                            className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed px-3 py-1.5 rounded-md transition-colors shrink-0"
                        >
                            <LuSparkles size={14} />
                            {isGenerating ? "Membuat..." : "Generate"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AiSummaryPanel;