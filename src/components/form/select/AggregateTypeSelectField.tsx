import { useEffect } from 'react';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { AggregateTypeSelectOption, useAggregateTypeSelect } from '@/hooks/useAggregateTypeSelect';

interface AggregateTypeSelectFieldProps {
    value?: string | null;
    onChange: (option: AggregateTypeSelectOption | null) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    isClearable?: boolean;
    className?: string;
}

const AggregateTypeSelectField = ({
    value,
    onChange,
    label = 'Aggregate Type',
    placeholder = 'All Aggregate Types',
    error,
    disabled = false,
    isClearable = true,
    className = '',
}: AggregateTypeSelectFieldProps) => {
    const {
        aggregateTypeOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
    } = useAggregateTypeSelect();

    useEffect(() => {
        initializeOptions();
    }, [initializeOptions]);

    const selectedOption = value ? { value, label: value } : null;

    return (
        <div className={className}>
            {label !== '' && <Label htmlFor="aggregate_type">{label}</Label>}
            <CustomAsyncSelect
                id="aggregate_type"
                name="aggregate_type"
                value={selectedOption}
                onChange={(option) => onChange(option as AggregateTypeSelectOption | null)}
                defaultOptions={aggregateTypeOptions}
                loadOptions={handleInputChange}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onMenuScrollToBottom={handleMenuScrollToBottom}
                isLoading={pagination.loading}
                placeholder={placeholder}
                error={error}
                disabled={disabled}
                isClearable={isClearable}
                isSearchable
                noOptionsMessage={() => 'No aggregate types found'}
                loadingMessage={() => 'Loading aggregate types...'}
            />
        </div>
    );
};

export default AggregateTypeSelectField;
