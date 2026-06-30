import { useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const TINYMCE_CDN = '/tinymce/tinymce.min.js';

interface TinyMceEditorProps {
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

const EDITOR_INIT: any = {
    license_key: 'gpl',
    menubar: false,
    branding: false,
    promotion: false,
    statusbar: true,
    resize: true,
    elementpath: false,
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
        'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
        'fullscreen', 'insertdatetime', 'media', 'table',
        'wordcount', 'nonbreaking'
    ],
    toolbar:
        'undo redo | blocks fontfamily fontsize | ' +
        'bold italic underline strikethrough forecolor backcolor | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | ' +
        'table link image | ' +
        'removeformat fullscreen code',
    block_formats:
        'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Pre=pre',
    content_style: `
        body {
            font-family: Arial, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
            padding: 8px;
        }
        p { margin: 0 0 8px 0; }
    `,
    setup: (editor: any) => {
        editor.on('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                editor.insertContent('&emsp;');
            }
        });
    },
};

const TinyMceEditor: React.FC<TinyMceEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start typing...',
    minHeight = '400px',
    disabled = false,
    label,
    error,
    className = '',
    id = 'tinymce-editor'
}) => {
    const editorRef = useRef<any>(null);

    const handleEditorChange = useCallback(
        (content: string) => {
            onChange(content);
        },
        [onChange]
    );

    return (
        <div className={`tinymce-editor-wrapper ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700 mb-1 capitalize"
                >
                    {label}
                </label>
            )}

            <div
                className={`w-full border rounded-lg overflow-hidden ${
                    error ? 'border-red-500' : 'border-gray-300'
                } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
            >
                <Editor
                    id={id}
                    tinymceScriptSrc={TINYMCE_CDN}
                    value={value}
                    disabled={disabled}
                    onEditorChange={handleEditorChange}
                    onInit={(_evt, editor) => {
                        editorRef.current = editor;
                    }}
                    init={{
                        ...EDITOR_INIT,
                        height: parseInt(minHeight),
                        min_height: parseInt(minHeight),
                        placeholder: placeholder,
                    }}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default TinyMceEditor;
