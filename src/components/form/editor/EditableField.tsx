import { useState, useRef } from 'react';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import TinyMceEditor from './TinyMceEditor';
import Label from '../Label';
import Button from '@/components/ui/button/Button';

interface EditableFieldProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
    minHeight?: string;
    disabled?: boolean;
    error?: string;
    id: string;
    showAction?: boolean;
    editing?: boolean;
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
    showAction = true,
    editing = false
}) => {
    const [isEditing, setIsEditing] = useState(editing);
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
                        <Button
                            variant="outline"
                            onClick={handleEdit}
                            className="gap-2 px-2.5 py-1 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary/20 transition-colors"
                        >
                            <FaPencilAlt className="w-3 h-3" />
                            Edit
                        </Button>
                    )}
                </div>
                <div className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none text-gray-700 reset-content">
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
            {showAction && (
            <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm text-gray-700 font-medium">
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="gap-2 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-800 transition-colors"
                    >
                        <FaTimes className="w-3 h-3" />
                        Cancel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDone}
                        className="gap-2 px-2.5 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-800 transition-colors"
                    >
                        <FaCheck className="w-3 h-3" />
                        Done
                    </Button>
                </div>
            </div>
            )}
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
