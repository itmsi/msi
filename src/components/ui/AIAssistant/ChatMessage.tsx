import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/aiAssistant';
import { formatTime } from '@/helpers/generalHelper';

interface ChatMessageProps {
    message: ChatMessageType;
}

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string): React.ReactElement => {
    // Split by lines first
    const lines = text.split('\n');
    
    const elements: React.ReactElement[] = [];
    let tableLines: string[] = [];
    let inTable = false;
    
    const processTable = (tableLines: string[]) => {
        if (tableLines.length < 2) return null;
        
        // Parse table
        const rows = tableLines.map(line => 
            line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
        );
        
        // Skip separator row (row with ---)
        const headerRow = rows[0];
        const bodyRows = rows.slice(2); // Skip header and separator
        
        return (
            <div className="overflow-x-auto my-2">
                <table className="min-w-full border border-gray-300 text-xs">
                    <thead className="bg-gray-200">
                        <tr>
                            {headerRow.map((cell, idx) => (
                                <th key={idx} className="border border-gray-300 px-2 py-1 text-left font-semibold">
                                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bodyRows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-gray-50">
                                {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="border border-gray-300 px-2 py-1">
                                        <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    
    lines.forEach((line, lineIndex) => {
        // Check if it's a table row (contains | characters)
        const isTableRow = line.trim().startsWith('|') || (line.includes('|') && line.split('|').length > 2);
        
        if (isTableRow) {
            inTable = true;
            tableLines.push(line);
            return;
        }
        
        // If we were in a table and now we're not, process the table
        if (inTable && !isTableRow) {
            const tableElement = processTable(tableLines);
            if (tableElement) {
                elements.push(<div key={`table-${lineIndex}`}>{tableElement}</div>);
            }
            tableLines = [];
            inTable = false;
        }
        
        // Check if it's a numbered list item
        const numberedListMatch = line.match(/^(\d+)\.\s+(.+)/);
        // Check if it's a bullet list item (starts with -, *, or •)
        const bulletListMatch = line.match(/^[-*•]\s+(.+)/);
        // Check if it's an indented item (starts with spaces)
        const indentMatch = line.match(/^(\s{2,})(.+)/);
        
        let content: string;
        let element: React.ReactElement;
        
        if (numberedListMatch) {
            // Numbered list item
            content = numberedListMatch[2];
            element = (
                <div key={lineIndex} className="flex gap-2 mb-1">
                    <span className="font-semibold min-w-[20px]">{numberedListMatch[1]}.</span>
                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
                </div>
            );
        } else if (bulletListMatch) {
            // Bullet list item
            content = bulletListMatch[1];
            element = (
                <div key={lineIndex} className="flex gap-2 mb-1">
                    <span className="min-w-[10px]">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
                </div>
            );
        } else if (indentMatch) {
            // Indented item (sub-item)
            content = indentMatch[2];
            element = (
                <div key={lineIndex} className="ml-6 mb-1">
                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
                </div>
            );
        } else if (line.trim() === '') {
            // Empty line - add spacing
            element = <div key={lineIndex} className="h-2" />;
        } else {
            // Regular line
            element = (
                <div key={lineIndex} className="mb-1">
                    <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
                </div>
            );
        }
        
        elements.push(element);
    });
    
    // Process any remaining table at the end
    if (inTable && tableLines.length > 0) {
        const tableElement = processTable(tableLines);
        if (tableElement) {
            elements.push(<div key="table-end">{tableElement}</div>);
        }
    }
    
    return <>{elements}</>;
};

// Format inline markdown (bold, italic, code, links)
const formatInlineMarkdown = (text: string): string => {
    // Links: [text](url) - make clickable
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline hover:no-underline">$1</a>');
    
    // Auto-detect URLs (http://, https://, www.)
    text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline hover:no-underline">$1</a>');
    text = text.replace(/(www\.[^\s<]+)/g, '<a href="http://$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline hover:no-underline">$1</a>');
    
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_ (but not if it's part of **)
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    text = text.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
    
    // Inline code: `code`
    text = text.replace(/`(.+?)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
    
    return text;
};

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                <div
                    className={`rounded-lg px-4 py-2.5 ${
                        isUser
                            ? 'bg-[#0253a5] text-white'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                >
                    <div className="text-sm font-secondary">
                        {parseMarkdown(message.content)}
                    </div>
                </div>
                <div className={`mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    <span className="text-xs text-gray-400">
                        {formatTime(message.timestamp)}
                    </span>
                </div>
            </div>
        </div>
    );
}
