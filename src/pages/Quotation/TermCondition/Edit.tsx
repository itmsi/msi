import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { MdArrowBack, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { PermissionGate } from "@/components/common/PermissionComponents";
import { TermConditionService } from "./services/termconditionService";
import { TermConditionFormData } from "./types/termcondition";

const EditTermCondition: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // State for form data
    const [formData, setFormData] = useState<TermConditionFormData>({
        term_content_title: '',
        term_content_directory: ''
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
            
            if (response.data?.success && response.data.data) {
                const termCondition = response.data.data;
                setFormData({
                    term_content_title: termCondition.term_content_title || '',
                    term_content_directory: termCondition.term_content_directory || ''
                });
            } else {
                setError('Term condition not found');
                navigate('/quotation/term-condition');
            }
        } catch (error: any) {
            console.error('Error loading term condition:', error);
            setError('Failed to load term condition data');
            navigate('/quotation/term-condition');
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

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.term_content_title.trim()) {
            setError('Title is required');
            return;
        }

        if (!formData.term_content_directory.trim()) {
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
            navigate('/quotation/term-condition');
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

    return (
        <>
            <PageMeta
                title="Edit Term & Condition - Motor Sights International"
                description="Edit term & condition template"
                image="/motor-sights-international.png"
            />

            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate('/quotation/term-condition')}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <MdArrowBack className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Edit Term & Condition Template
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Update term & condition template
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

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
                    <div>
                        <label htmlFor="term_content_directory" className="block text-sm font-medium text-gray-700 mb-2">
                            Content *
                        </label>
                        <textarea
                            id="term_content_directory"
                            name="term_content_directory"
                            value={formData.term_content_directory}
                            onChange={handleTextareaChange}
                            placeholder="Enter HTML content (e.g., <p>Your terms and conditions content here</p>)"
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            You can use HTML tags to format your content
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-6">
                        <PermissionGate permission="update">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2"
                            >
                                <MdSave className="h-4 w-4" />
                                {saving ? 'Updating...' : 'Update Template'}
                            </Button>
                        </PermissionGate>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/quotation/term-condition')}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditTermCondition;