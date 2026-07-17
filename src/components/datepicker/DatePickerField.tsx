import React, { useEffect, useRef, useState } from 'react';
import { Calendar } from 'react-date-range'; // sesuaikan dengan import Calendar yang kamu pakai
import Label from '../form/Label';

interface DatePickerFieldProps {
    name: string;
    label: string;
    value?: string | null;
    required?: boolean;
    placeholder?: string;
    error?: string;
    readOnly?: boolean;
    minDate?: Date;
    onChange?: (name: string, value: string) => void;

    // fungsi konversi, biar komponen tetap generic dan tidak terikat 1 format
    parseValueToDate: (value: string) => Date | null;
    convertDateToValue: (date: Date) => string;
    formatDisplayValue: (value: string) => string;   // format saat mode edit (input)
    formatReadOnlyValue?: (date: Date) => string;     // format saat mode readOnly (opsional, default pakai formatDisplayValue)
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
    name,
    label,
    value,
    required,
    placeholder,
    error,
    readOnly = false,
    minDate,
    onChange,
    parseValueToDate,
    convertDateToValue,
    formatDisplayValue,
    formatReadOnlyValue,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const currentDate = value ? parseValueToDate(String(value)) : null;

    const handleDateChange = (date: Date | any) => {
        setShowDatePicker(false);
        const selectedDate = date instanceof Date ? date : new Date(date);
        if (onChange) {
            onChange(name, convertDateToValue(selectedDate));
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div>
            <Label>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            {readOnly ? (
                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">
                    {currentDate
                        ? (formatReadOnlyValue ? formatReadOnlyValue(currentDate) : formatDisplayValue(String(value)))
                        : (placeholder || '-')}
                </p>
            ) : (
                <>
                    <div className="relative" ref={datePickerRef}>
                        <div
                            className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500 ${
                                error ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <span className={currentDate ? 'text-gray-700' : 'text-gray-400'}>
                                {currentDate ? formatDisplayValue(String(value)) : (placeholder || `Select ${label.toLowerCase()}`)}
                            </span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        {showDatePicker && (
                            <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                <Calendar
                                    date={currentDate || new Date()}
                                    onChange={handleDateChange}
                                    color="#3b82f6"
                                    minDate={minDate}
                                />
                            </div>
                        )}
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </>
            )}
        </div>
    );
};