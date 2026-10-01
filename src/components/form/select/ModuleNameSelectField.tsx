import { useEffect } from 'react';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { ModuleNameSelectOption, useModuleNameSelect } from '@/hooks/useModuleNameSelect';

interface ModuleNameSelectFieldProps {
    value?: string | null;
    onChange: (option: ModuleNameSelectOption | null) => void;
    /** Isi dengan '' untuk menyembunyikan label, misalnya saat dipakai sebaris dengan filter lain. */
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    isClearable?: boolean;
    className?: string;
}

const ModuleNameSelectField = ({
    value,
    onChange,
    label = 'Module Name',
    placeholder = 'All Modules',
    error,
    disabled = false,
    isClearable = true,
    className = '',
}: ModuleNameSelectFieldProps) => {
    const {
        moduleNameOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
    } = useModuleNameSelect();

    useEffect(() => {
        initializeOptions();
    }, [initializeOptions]);

    // module_name sekaligus jadi labelnya, jadi nilai terpilih tidak perlu dicari ulang ke API.
    const selectedOption = value ? { value, label: value } : null;

    return (
        <div className={className}>
            {label !== '' && <Label htmlFor="module_name">{label}</Label>}
            <CustomAsyncSelect
                id="module_name"
                name="module_name"
                value={selectedOption}
                onChange={(option) => onChange(option as ModuleNameSelectOption | null)}
                defaultOptions={moduleNameOptions}
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
                noOptionsMessage={() => 'No modules found'}
                loadingMessage={() => 'Loading modules...'}
            />
        </div>
    );
};

export default ModuleNameSelectField;
