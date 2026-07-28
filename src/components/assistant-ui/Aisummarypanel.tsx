import { useState } from "react";
import { LuSparkles, LuRefreshCw } from "react-icons/lu";

interface AiSummaryPanelProps {
    summary: string;
    suggestions?: string[];
    textPrompt?: string;
    onGenerate: (prompt: string) => void;
    onSuggestionClick?: (suggestion: string) => void;
    isGenerating?: boolean;
}

export function AiSummaryPanel({
    summary,
    suggestions = [],
    textPrompt = "Buatkan ringkasan singkat dan informatif dari data zone site ini saja.",
    onGenerate,
    onSuggestionClick,
    isGenerating = false,
}: AiSummaryPanelProps) {
    const [prompt, setPrompt] = useState(textPrompt || '');

    return (
        <div className="ai-summary-gradient rounded-lg border border-purple-100 overflow-hidden">
            <style>{`
                .ai-summary-gradient {
                    background: linear-gradient(
                        120deg,
                        rgba(245, 243, 255, 0.9) 0%,
                        rgba(237, 233, 254, 0.9) 25%,
                        rgba(243, 232, 255, 0.9) 50%,
                        rgba(237, 233, 254, 0.9) 75%,
                        rgba(245, 243, 255, 0.9) 100%
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
                    .ai-summary-gradient {
                        animation: none;
                    }
                }
            `}</style>

            {/* Header AI Summary */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-1.5">
                    <LuSparkles className="text-purple-600" size={15} />
                    <span className="text-sm font-semibold text-purple-700">AI Summary</span>
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
                <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
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
                <div className="flex items-end gap-2">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={1}
                        placeholder="Tulis instruksi untuk Mosa AI..."
                        className="flex-1 resize-none text-sm text-gray-700 placeholder:text-gray-400 border-0 focus:ring-0 focus:outline-none py-1.5"
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
    );
}

export default AiSummaryPanel;