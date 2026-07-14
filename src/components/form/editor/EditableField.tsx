import { useState, useRef } from 'react';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import TinyMceEditor from './TinyMceEditor';
import Label from '../Label';

interface EditableFieldProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
    minHeight?: string;
    disabled?: boolean;
    error?: string;
    id: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Start typing...',
    minHeight = '500px',
    disabled = false,
    error,
    id,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const snapshotRef = useRef<string>('');

    const handleEdit = () => {
        snapshotRef.current = value;
        setIsEditing(true);
    };

    // DEV_LOG: tag with [DEV_LOG] for easy removal
    const handleDone = () => {
        console.log(`[DEV_LOG] EditableField "${label}" (id: ${id}) value to save:`, value);
        setIsEditing(false);
    };

    const handleCancel = () => {
        onChange(snapshotRef.current);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <Label>
                        {label}
                    </Label>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-800 transition-colors"
                        >
                            <FaPencilAlt className="w-3 h-3" />
                            Edit
                        </button>
                    )}
                </div>
                <div className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-lg prose prose-sm max-w-none text-gray-700">
                    {value ? (
                        <div dangerouslySetInnerHTML={{ __html: value }} />
                    ) : (
                        <span className="text-gray-400 italic">No content yet</span>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm text-gray-700 font-medium">
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <FaTimes className="w-3 h-3" />
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDone}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                    >
                        <FaCheck className="w-3 h-3" />
                        Done
                    </button>
                </div>
            </div>
            <TinyMceEditor
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                minHeight={minHeight}
                disabled={disabled}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default EditableField;
