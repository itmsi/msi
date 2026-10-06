import { memo, useEffect, useMemo, useState } from 'react';
import { MdCheck, MdContentCopy } from 'react-icons/md';
import { formatJson, JsonTokenType, tokenizeJson } from '../utils/activityFormat';

const TOKEN_CLASS: Record<JsonTokenType, string> = {
    key: 'text-sky-700',
    string: 'text-emerald-700',
    number: 'text-amber-700',
    boolean: 'text-purple-700',
    null: 'text-gray-400',
    plain: 'text-gray-600',
};

const HIGHLIGHT_LIMIT = 30000;

interface JsonHighlightProps {
    json: string;
    highlight: boolean;
}

const JsonHighlight = memo(({ json, highlight }: JsonHighlightProps) => {
    const tokens = useMemo(() => (highlight ? tokenizeJson(json) : null), [json, highlight]);

    if (!json) return <span className="text-gray-400 italic">No data</span>;
    if (!tokens) return <>{json}</>;

    return (
        <>
            {tokens.map((token, index) => (
                <span key={index} className={TOKEN_CLASS[token.type]}>{token.text}</span>
            ))}
        </>
    );
});

JsonHighlight.displayName = 'JsonHighlight';

interface JsonPanelProps {
    title: string;
    summary?: string;
    value: unknown;
    copyLabel: string;
}

const JsonPanel = ({ title, summary, value, copyLabel }: JsonPanelProps) => {
    const [copied, setCopied] = useState(false);
    const json = useMemo(() => formatJson(value), [value]);
    const isLarge = json.length > HIGHLIGHT_LIMIT;

    useEffect(() => {
        if (!copied) return;

        const timer = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(json || '');
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="flex flex-col min-w-0 rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">{title}</span>
                    {summary && <span className="text-xs text-gray-500 whitespace-nowrap">{summary}</span>}
                </div>

                <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors ${copied
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    {copied ? <MdCheck size={13} /> : <MdContentCopy size={13} />}
                    {copied ? 'Copied!' : copyLabel}
                </button>
            </div>

            <pre className="max-h-96 overflow-auto p-3 text-[11px] leading-5 font-mono whitespace-pre">
                <JsonHighlight json={json} highlight={!isLarge} />
            </pre>
        </div>
    );
};

export default memo(JsonPanel);
