import React, { useRef, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaListOl, FaListUl, FaQuoteLeft } from "react-icons/fa";

interface WysiwygEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    disabled?: boolean;
    label?: string;
    error?: string;
    className?: string;
    id?: string;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start typing...',
    minHeight = '200px',
    disabled = false,
    label,
    error,
    className = '',
    id = 'wysiwyg-editor'
}) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Update editor content when value changes externally
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML && !editorRef.current.contains(document.activeElement)) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const content = e.currentTarget.innerHTML;
        onChange(content);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const executeCommand = (command: string, value?: string) => {
        const editor = editorRef.current;
        if (editor && !disabled) {
            editor.focus();
            document.execCommand(command, false, value || '');
        }
    };

    const insertHTML = (html: string) => {
        const editor = editorRef.current;
        if (editor && !disabled) {
            editor.focus();
            document.execCommand('insertHTML', false, html);
        }
    };

    return (
        <div className={`wysiwyg-editor-wrapper ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            
            <div className={`w-full border rounded-lg bg-gray-50 ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <div className="flex flex-wrap items-center divide-gray-200 sm:divide-x rtl:divide-x-reverse">
                        
                        {/* Format buttons group */}
                        <div className="flex items-center space-x-1 rtl:space-x-reverse sm:px-4">
                            <button
                                type="button"
                                className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => executeCommand('bold')}
                                title="Bold"
                                disabled={disabled}
                            >
                                <FaBold />
                            </button>
                            <button
                                type="button"
                                className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => executeCommand('italic')}
                                title="Italic"
                                disabled={disabled}
                            >
                                <FaItalic />
                            </button>
                            <button
                                type="button"
                                className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => executeCommand('underline')}
                                title="Underline"
                                disabled={disabled}
                            >
                                <FaUnderline />
                            </button>
                            <button
                                type="button"
                                className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => executeCommand('strikeThrough')}
                                title="Strikethrough"
                                disabled={disabled}
                            >
                                <FaStrikethrough />
                            </button>
                        </div>
                        
                        {/* List buttons group */}
                        <div className="flex items-center space-x-1 rtl:space-x-reverse sm:px-4">
                            <button
                                type="button"
                                className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => executeCommand('insertUnorderedList')}
                                title="Bullet List"
                                disabled={disabled}
                            >
                                <FaListUl />
                            </button>
                            <button
                                type="button"
                                className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => executeCommand('insertOrderedList')}
                                title="Numbered List"
                                disabled={disabled}
                            >
                                <FaListOl />
                            </button>
                        </div>

                        {/* Insert elements group */}
                        <div className="flex items-center space-x-1 rtl:space-x-reverse sm:ps-4">
                            <button
                                type="button"
                                className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => executeCommand('insertHorizontalRule')}
                                title="Insert Horizontal Rule"
                                disabled={disabled}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => insertHTML('<blockquote style="border-left: 4px solid #d1d5db; margin: 1rem 0; padding-left: 1rem; color: #6b7280; font-style: italic;">Quote text here...</blockquote>')}
                                title="Insert Quote"
                                disabled={disabled}
                            >
                                <FaQuoteLeft />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content editable area */}
                <div className="px-4 py-2 bg-white rounded-b-lg">
                    <div
                        id={id}
                        ref={editorRef}
                        contentEditable={!disabled}
                        className="block w-full px-0 text-sm text-gray-800 bg-white border-0 focus:ring-0 outline-none wysiwyg-editor"
                        style={{ minHeight }}
                        suppressContentEditableWarning={true}
                        onInput={handleInput}
                        onPaste={handlePaste}
                        data-placeholder={placeholder}
                    />
                </div>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default WysiwygEditor;
