import { useEffect } from 'react';
import Label from '@/components/form/Label';
import CustomSelect from '@/components/form/select/CustomSelect';
import { GroupSelectOption, useGroupSelect } from '@/hooks/useGroupSelect';

interface GroupSelectFieldProps {
    value?: string | null;
    valueLabel?: string | null;
    onChange: (option: GroupSelectOption | null) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    isClearable?: boolean;
    className?: string;
}

const GroupSelectField = ({
    value,
    valueLabel,
    onChange,
    label = 'Group',
    placeholder = '-- Choose Group --',
    required = false,
    error,
    disabled = false,
    isClearable = true,
    className = '',
}: GroupSelectFieldProps) => {
    const { groupOptions, loading, initializeOptions } = useGroupSelect();

    useEffect(() => {
        initializeOptions();
    }, [initializeOptions]);

    const selectedOption = value
        ? groupOptions.find(option => option.value === value) || (valueLabel ? { value, label: valueLabel } : null)
        : null;

    return (
        <div className={className}>
            {label !== '' && (
                <Label htmlFor="group_id">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
            )}
            <CustomSelect
                id="group_id"
                name="group_id"
                value={selectedOption}
                onChange={onChange}
                options={groupOptions}
                placeholder={loading ? 'Loading groups...' : placeholder}
                isLoading={loading}
                disabled={disabled || loading}
                error={error}
                isSearchable
                isClearable={isClearable}
                noOptionsMessage={() => 'No groups found'}
            />
        </div>
    );
};

export default GroupSelectField;
