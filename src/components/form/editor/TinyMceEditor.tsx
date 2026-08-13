import { useRef, useCallback, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FaSpinner } from 'react-icons/fa';

const TINYMCE_CDN = '/tinymce/tinymce.min.js';

function normalizeImageUrl(url: string): string {
    if (!url.includes('drive.google.com')) return url;
    const fileId = url.match(/\/file\/d\/([-\w]+)/)?.[1] ?? url.match(/[?&]id=([-\w]+)/)?.[1];
    if (!fileId) return url;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
}

function fixDriveImages(editor: any) {
    const imgs: HTMLImageElement[] = editor.dom.select('img');
    imgs.forEach((img) => {
        if (img.hasAttribute('data-mce-object')) return;
        const src = img.getAttribute('src') || '';
        const fixed = normalizeImageUrl(src);
        if (fixed !== src) {
            editor.dom.setAttrib(img, 'src', fixed);
        }
    });
}

function getNodeName(node: unknown): string | undefined {
    const n = node as { nodeName?: string; name?: string } | null | undefined;
    return (n?.nodeName ?? n?.name)?.toLowerCase();
}
const mediaUrlResolver = (data: { url: string }): Promise<{ html: string }> => {
    if (!data.url.includes('drive.google.com')) {
        return Promise.resolve({ html: '' });
    }

    const fileId = data.url.match(/\/file\/d\/([-\w]+)/)?.[1] ?? data.url.match(/[?&]id=([-\w]+)/)?.[1];
    // const fileId = extractDriveFileId(data.url);
    if (fileId) {
        return Promise.resolve({
            html: `<iframe src="https://drive.google.com/file/d/${fileId}/preview" width="640" height="360" allow="autoplay" style="border:0;"></iframe>`,
        });
    }
    return Promise.resolve({ html: '' });
};

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
    sandbox_iframes_exclusions: ['drive.google.com'],
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'media', 'charmap',
        'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
        'fullscreen', 'insertdatetime', 'media', 'table',
        'wordcount', 'nonbreaking'
    ],
    toolbar:
        'undo redo | blocks fontfamily fontsize | ' +
        'bold italic underline strikethrough forecolor backcolor | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | ' +
        'table link image media | ' +
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
    urlconverter_callback: (url: string, node: unknown, _onSave: boolean, name: string) => {
        return name === 'src' && getNodeName(node) === 'img' ? normalizeImageUrl(url) : url;
    },
    media_url_resolver: mediaUrlResolver,
    setup: (editor: any) => {
        editor.on('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                editor.insertContent('&emsp;');
            }
        });
        editor.on('SetContent', () => fixDriveImages(editor));
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
    const [isLoading, setIsLoading] = useState(true);

    const handleEditorChange = useCallback(
        (content: string) => {
            onChange(content);
        },
        [onChange]
    );

    const handleInit = useCallback((_evt: any, editor: any) => {
        editorRef.current = editor;
        setIsLoading(false);
    }, []);

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
                className={`w-full border rounded-lg overflow-hidden relative ${error ? 'border-red-500' : 'border-gray-300'
                    } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
                style={{ minHeight: parseInt(minHeight) }}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="flex flex-col items-center gap-2">
                            <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
                            <span className="text-sm text-gray-500">Loading editor...</span>
                        </div>
                    </div>
                )}
                <Editor
                    id={id}
                    tinymceScriptSrc={TINYMCE_CDN}
                    value={value}
                    disabled={disabled}
                    onEditorChange={handleEditorChange}
                    onInit={handleInit}
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
