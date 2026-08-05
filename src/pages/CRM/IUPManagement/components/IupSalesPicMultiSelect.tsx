import { useEffect, useRef, useState } from 'react';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useEmployeeCRM, type EmployeeSelectOption } from '@/hooks/useEmployeeCRM';

interface IupSalesPicMultiSelectProps {
    value: string[]; // array of employee_id (payload format: [id1, id2])
    onChange: (ids: string[]) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
}

/**
 * Multi-select field untuk Sales PIC pada IUP Management.
 * Menggunakan useEmployeeCRM (data employee dari gate_sso via dblink),
 * pola yang sama dengan field "Bank Payment" multi-select di Sales Orders.
 * - Payload: array of employee_id, contoh: ["uuid1","uuid2"]
 * - Response: array of { id, name }
 */
export default function IupSalesPicMultiSelect({
    value,
    onChange,
    label = 'PIC',
    placeholder = 'Select PIC...',
    required = false,
    error,
    className = '',
}: IupSalesPicMultiSelectProps) {
    const {
        employeeOptions,
        pagination,
        inputValue: employeeInputValue,
        handleInputChange: handleEmployeeInputChange,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions,
        getEmployeeById,
    } = useEmployeeCRM();

    const [selectedPics, setSelectedPics] = useState<EmployeeSelectOption[]>([]);
    const selectedRef = useRef<EmployeeSelectOption[]>([]);

    useEffect(() => {
        initializeEmployeeOptions();
    }, [initializeEmployeeOptions]);

    // Sync selected values dari formData (array of employee ids)
    useEffect(() => {
        let aktif = true;
        const ids = Array.isArray(value) ? value : [];

        const syncSelected = async () => {
            const matched: EmployeeSelectOption[] = [];
            const missingIds: string[] = [];

            ids.forEach((id) => {
                const found = employeeOptions.find((opt) => opt.value === id);
                if (found) {
                    matched.push(found);
                } else {
                    missingIds.push(id);
                }
            });

            // Pertahankan opsi yang sudah pernah dimuat (misal hasil search yang tidak ada di options saat ini)
            selectedRef.current.forEach((opt) => {
                if (ids.includes(opt.value) && !matched.some((m) => m.value === opt.value)) {
                    matched.push(opt);
                }
            });

            // Fetch id yang belum dikenal satu per satu
            for (const id of missingIds) {
                const opt = await getEmployeeById(id);
                if (aktif && opt) {
                    matched.push(opt);
                }
            }

            if (aktif) {
                // Pertahankan urutan sesuai array ids
                const orderMap = new Map(ids.map((id, idx) => [id, idx]));
                matched.sort((a, b) => (orderMap.get(a.value) ?? 0) - (orderMap.get(b.value) ?? 0));
                setSelectedPics(matched);
                selectedRef.current = matched;
            }
        };

        syncSelected();
        return () => {
            aktif = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, getEmployeeById, employeeOptions]);

    const handleChange = (opts: EmployeeSelectOption[] | null) => {
        const newOptions = opts || [];
        setSelectedPics(newOptions);
        selectedRef.current = newOptions;
        onChange(newOptions.map((o) => o.value));
    };

    return (
        <div className={className}>
            <Label>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <CustomAsyncSelect
                placeholder={placeholder}
                value={selectedPics}
                defaultOptions={employeeOptions}
                loadOptions={handleEmployeeInputChange}
                onMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                isLoading={pagination.loading}
                inputValue={employeeInputValue}
                onInputChange={handleEmployeeInputChange}
                onChangeMulti={(opts) => handleChange(opts as EmployeeSelectOption[])}
                noOptionsMessage={() => 'No employee found'}
                loadingMessage={() => 'Loading employees...'}
                isMulti={true}
                isClearable={true}
                className={`w-full ${error ? 'border rounded-lg border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
