import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { MdKeyboardArrowLeft,MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { PermissionGate } from "@/components/common/PermissionComponents";
import { TermConditionService } from "./services/termconditionService";
import { TermConditionFormDataEdit } from "./types/termcondition";
import { FaBold, FaItalic, FaListOl, FaListUl, FaQuoteLeft, FaStrikethrough, FaUnderline } from "react-icons/fa6";

const EditTermCondition: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // State for form data
    const [formData, setFormData] = useState<TermConditionFormDataEdit>({
        term_content_title: '',
        term_content_payload: ''
    });

    // Load term condition data when component mounts
    useEffect(() => {
        if (id) {
            loadTermConditionData(id);
        }
    }, [id]);

    const loadTermConditionData = async (termConditionId: string) => {
        try {
            setLoading(true);
            const response = await TermConditionService.getTermConditionById(termConditionId);
            console.log({
                response
            });
            
            if (response.status && response.data) {
                const termCondition = response.data;
                setFormData({
                    term_content_title: termCondition.term_content_title || '',
                    term_content_payload: termCondition.term_content_payload || ''
                });
            } else {
                setError('Term condition not found');
                // navigate('/quotations/term-condition');
            }
        } catch (error: any) {
            console.error('Error loading term condition:', error);
            setError('Failed to load term condition data');
            // navigate('/quotations/term-condition');
        } finally {
            setLoading(false);
        }
    };

    // Form input handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const updateEditorContent = (content: string) => {
        setFormData(prev => ({ ...prev, term_content_payload: content }));
        setError(null);
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.term_content_title.trim()) {
            setError('Title is required');
            return;
        }

        if (!formData.term_content_payload.trim()) {
            setError('Content is required');
            return;
        }

        if (!id) {
            setError('Term condition ID is missing');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            
            await TermConditionService.updateTermCondition(id, formData);
            navigate('/quotations/term-condition');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading term condition data...</div>
                </div>
            </div>
        );
    }
console.log({
    error
});

    return (
        <>
            <PageMeta
                title="Edit Term & Condition - Motor Sights International"
                description="Edit term & condition template"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/quotations/term-condition">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Term & Condition Template</h1>
                        </div>
                    </div>
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        {/* Error Message */}
                        {/* {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )} */}
                        <div className="md:col-span-3 p-8 relative">
                            <div className="space-y-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-4">Terms & Conditions</h2>

                                {/* Template Title */}
                                <div>
                                    <label htmlFor="term_content_title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Template Title *
                                    </label>
                                    <Input
                                        id="term_content_title"
                                        name="term_content_title"
                                        type="text"
                                        value={formData.term_content_title}
                                        onChange={handleInputChange}
                                        placeholder="Enter template title"
                                        className="w-full"
                                    />
                                </div>

                                {/* Content */}
                                <div className="border border-gray-300 rounded-lg bg-gray-50">
                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                                        <div className="flex flex-wrap items-center divide-gray-200 sm:divide-x rtl:divide-x-reverse">
                                            
                                            {/* Format buttons group */}
                                            <div className="flex items-center space-x-1 rtl:space-x-reverse sm:px-4">
                                                <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100" 
                                                    onClick={() => {
                                                        const editor = document.getElementById('wysiwyg-editor');
                                                        if (editor) {
                                                            editor.focus();
                                                            document.execCommand('bold', false, '');
                                                        }
                                                    }}
                                                    title="Bold">
                                                    <FaBold />
                                                </button>
                                                <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
                                                    onClick={() => {
                                                        const editor = document.getElementById('wysiwyg-editor');
                                                        if (editor) {
                                                            editor.focus();
                                                            document.execCommand('italic', false, '');
                                                        }
                                                    }}
                                                    title="Italic">
                                                    <FaItalic />
                                                </button>
                                                <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
                                                    onClick={() => {
                                                        const editor = document.getElementById('wysiwyg-editor');
                                                        if (editor) {
                                                            editor.focus();
                                                            document.execCommand('underline', false, '');
                                                        }
                                                    }}
                                                    title="Underline">
                                                    <FaUnderline />
                                                </button>
                                                <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
                                                    onClick={() => {
                                                        const editor = document.getElementById('wysiwyg-editor');
                                                        if (editor) {
                                                            editor.focus();
                                                            document.execCommand('strikeThrough', false, '');
                                                        }
                                                    }}
                                                    title="Strikethrough">
                                                    <FaStrikethrough />
                                                </button>
                                            </div>
                                            
                                            {/* List buttons group */}
                                            <div className="flex items-center space-x-1 rtl:space-x-reverse sm:px-4">
                                                <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
                                                    onClick={() => {
                                                        const editor = document.getElementById('wysiwyg-editor');
                                                        if (editor) {
                                                            editor.focus();
                                                            document.execCommand('insertUnorderedList', false, '');
                                                        }
                                                    }}
                                                    title="Bullet List">
                                                    <FaListUl />
                                                </button>
                                                <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
                                                    onClick={() => {
                                                        const editor = document.getElementById('wysiwyg-editor');
                                                        if (editor) {
                                                            editor.focus();
                                                            document.execCommand('insertOrderedList', false, '');
                                                        }
                                                    }}
                                                    title="Numbered List">
                                                    <FaListOl />
                                                </button>
                                            </div>

                                            {/* Insert elements group */}
                                            <div className="flex items-center space-x-1 rtl:space-x-reverse sm:ps-4">
                                                <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
                                                    onClick={() => {
                                                        const editor = document.getElementById('wysiwyg-editor');
                                                        if (editor) {
                                                            editor.focus();
                                                            document.execCommand('insertHorizontalRule', false, '');
                                                        }
                                                    }}
                                                    title="Insert Horizontal Rule">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                                                    </svg>
                                                </button>
                                                <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
                                                    onClick={() => {
                                                        const editor = document.getElementById('wysiwyg-editor');
                                                        if (editor) {
                                                            editor.focus();
                                                            document.execCommand('insertHTML', false, '<blockquote style="border-left: 4px solid #d1d5db; margin: 1rem 0; padding-left: 1rem; color: #6b7280; font-style: italic;">Quote text here...</blockquote>');
                                                        }
                                                    }}
                                                    title="Insert Quote">
                                                        <FaQuoteLeft />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Content editable area */}
                                    <div className="px-4 py-2 bg-white rounded-b-lg">
                                        <div
                                            id="wysiwyg-editor"
                                            contentEditable
                                            className="block w-full px-0 text-sm text-gray-800 bg-white border-0 focus:ring-0 min-h-[200px] outline-none wysiwyg-editor"
                                            suppressContentEditableWarning={true}
                                            dangerouslySetInnerHTML={{ __html: formData.term_content_payload }}
                                            onInput={(e) => {
                                                const content = e.currentTarget.innerHTML;
                                                updateEditorContent(content);
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault();
                                                const text = e.clipboardData.getData('text/plain');
                                                document.execCommand('insertText', false, text);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/quotations/term-condition')}
                                disabled={saving}
                                className="px-6 rounded-full"
                            >
                                Cancel
                            </Button>
                            <PermissionGate permission="update">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    <MdSave className="h-4 w-4" />
                                    {saving ? 'Updating...' : 'Update Template'}
                                </Button>
                            </PermissionGate>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditTermCondition;