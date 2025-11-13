import React, { useState } from 'react';
import { MdArrowBack, MdSave } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/button/Button';
import Input from '../../../components/form/input/InputField';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { TermConditionService } from './services/termconditionService';

const CreateTermCondition: React.FC = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        term_content_title: '',
        term_content_directory: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



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

        try {
            setLoading(true);
            setError(null);
            
            const response = await TermConditionService.createTermCondition(formData);
            
            if (response.success) {
                navigate('/quotation/term-condition');
            } else {
                setError(response.message || 'Failed to create term condition template');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Create Term & Condition - Motor Sights International"
                description="Create new term & condition template"
                image="/motor-sights-international.png"
            />
            <div className="bg-white shadow rounded-lg">
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
                                Create Term & Condition Template
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Create a new term & condition template
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

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

                    <div className="flex items-center gap-4 pt-6">
                        <PermissionGate permission="create">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <MdSave className="h-4 w-4" />
                                {loading ? 'Creating...' : 'Create Template'}
                            </Button>
                        </PermissionGate>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/quotation/term-condition')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateTermCondition;