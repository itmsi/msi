import { useEffect, useState } from 'react';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useIupAreaSelections, type IupSelectOption} from '@/hooks/useIupAreaSelections';

interface IUPAreaSelectFieldProps {
    value: string;
    onChange: (iupId: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
}

export default function IUPAreaSelectField({
    value,
    onChange,
    label = 'IUP Selection',
    placeholder = 'Select IUP...',
    required = false,
    error,
    className = '',
}: IUPAreaSelectFieldProps) {
    const {
        iupOptions,
        pagination,
        inputValue: iupInputValue,
        handleInputChange: handleIupInputChange,
        handleMenuScrollToBottom: handleIupMenuScrollToBottom,
        initializeOptions: initializeIupOptions,
        getIupById,
    } = useIupAreaSelections();

    const [selectedIup, setSelectedIup] = useState<IupSelectOption | null>(null);

    useEffect(() => {
        initializeIupOptions();
    }, [initializeIupOptions]);

    useEffect(() => {
        let aktif = true;

        const syncSelectedIup = async () => {
            if (!value) {
                setSelectedIup(null);
                return;
            }

            if (selectedIup?.value === value) {
                return;
            }

            const opsiTersimpan = iupOptions.find((opsi) => opsi.value === value);
            if (opsiTersimpan) {
                setSelectedIup(opsiTersimpan);
                return;
            }

            const opsi = await getIupById(value);
            if (aktif) {
                setSelectedIup(opsi);
            }
        };

        syncSelectedIup();

        return () => {
            aktif = false;
        };
    }, [value, getIupById, iupOptions, selectedIup?.value]);

    const handleIupChange = (opsi: IupSelectOption | null) => {
        setSelectedIup(opsi);
        onChange(opsi?.value || '');
    };

    return (
        <div className={`md:col-span-2 ${className}`}>
            <Label>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <CustomAsyncSelect
                placeholder={placeholder}
                value={selectedIup}
                defaultOptions={iupOptions}
                loadOptions={handleIupInputChange}
                onMenuScrollToBottom={handleIupMenuScrollToBottom}
                isLoading={pagination.loading}
                inputValue={iupInputValue}
                onInputChange={handleIupInputChange}
                onChange={(opsi) => handleIupChange(opsi as IupSelectOption | null)}
                noOptionsMessage={() => 'No IUP found'}
                loadingMessage={() => 'Loading IUPs...'}
                className={`w-full md:col-span-2 ${
                    error ? 'border rounded-lg border-red-500' : ''
                }`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}