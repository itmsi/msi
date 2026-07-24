import { useEffect, useState } from 'react';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useEmployeeCRM, type EmployeeSelectOption } from '@/hooks/useEmployeeCRM';

interface IUPEmployeeCRMSelectFieldProps {
    value: string;
    onChange: (employeeId: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
}

export default function IUPEmployeeCRMSelectField({
    value,
    onChange,
    label = 'Employee Selection',
    placeholder = 'Select Employee...',
    required = false,
    error,
    className = '',
}: IUPEmployeeCRMSelectFieldProps) {
    const {
        employeeOptions,
        pagination,
        inputValue: employeeInputValue,
        handleInputChange: handleEmployeeInputChange,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions,
        getEmployeeById,
    } = useEmployeeCRM();

    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSelectOption | null>(null);

    useEffect(() => {
        initializeEmployeeOptions();
    }, [initializeEmployeeOptions]);

    useEffect(() => {
        let aktif = true;

        const syncSelectedEmployee = async () => {
            if (!value) {
                setSelectedEmployee(null);
                return;
            }

            if (selectedEmployee?.value === value) {
                return;
            }

            const opsiTersimpan = employeeOptions.find((opsi) => opsi.value === value);
            if (opsiTersimpan) {
                setSelectedEmployee(opsiTersimpan);
                return;
            }

            const opsi = await getEmployeeById(value);
            if (aktif) {
                setSelectedEmployee(opsi);
            }
        };

        syncSelectedEmployee();

        return () => {
            aktif = false;
        };
    }, [value, getEmployeeById, employeeOptions, selectedEmployee?.value]);

    const handleEmployeeChange = (opsi: EmployeeSelectOption | null) => {
        setSelectedEmployee(opsi);
        onChange(opsi?.value || '');
    };

    return (
        <div className={`md:col-span-2 ${className}`}>
            <Label>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <CustomAsyncSelect
                placeholder={placeholder}
                value={selectedEmployee}
                defaultOptions={employeeOptions}
                loadOptions={handleEmployeeInputChange}
                onMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                isLoading={pagination.loading}
                inputValue={employeeInputValue}
                onInputChange={handleEmployeeInputChange}
                onChange={(opsi) => handleEmployeeChange(opsi as EmployeeSelectOption | null)}
                noOptionsMessage={() => 'No employee found'}
                loadingMessage={() => 'Loading employees...'}
                className={`w-full md:col-span-2 ${
                    error ? 'border rounded-lg border-red-500' : ''
                }`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}