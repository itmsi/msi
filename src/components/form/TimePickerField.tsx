import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { MdAccessTime } from 'react-icons/md';
import Label from './Label';

interface TimePickerFieldProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

const TIME_FORMAT = 'H:i';

const TimePickerField = ({
    id,
    value,
    onChange,
    label,
    placeholder = 'HH:mm',
    disabled = false,
}: TimePickerFieldProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<flatpickr.Instance | null>(null);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);

    valueRef.current = value;
    onChangeRef.current = onChange;

    useEffect(() => {
        if (!inputRef.current) return;

        const picker = flatpickr(inputRef.current, {
            enableTime: true,
            noCalendar: true,
            dateFormat: TIME_FORMAT,
            time_24hr: true,
            minuteIncrement: 1,
            defaultDate: valueRef.current || undefined,
            // Nilai diterapkan saat popup ditutup, bukan di setiap klik panah jam/menit,
            // supaya satu pilihan waktu hanya memicu satu perubahan di pemanggil.
            onClose: (_selectedDates, dateStr) => {
                if (dateStr && dateStr !== valueRef.current) onChangeRef.current(dateStr);
            },
        });

        pickerRef.current = picker;

        return () => {
            picker.destroy();
            pickerRef.current = null;
        };
    }, []);

    // Pemanggil adalah sumber kebenaran: nilai dari URL, hasil koreksi otomatis, atau reset
    // harus tampil di input tanpa memicu onChange lagi (triggerChange = false).
    useEffect(() => {
        const picker = pickerRef.current;
        if (!picker || !value || picker.input.value === value) return;

        picker.setDate(value, false, TIME_FORMAT);
    }, [value]);

    return (
        <div>
            {label && <Label htmlFor={id}>{label}</Label>}

            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    name={id}
                    autoComplete="off"
                    placeholder={placeholder}
                    disabled={disabled}
                    className="h-11 w-full rounded-lg border appearance-none cursor-pointer pl-4 pr-11 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-80"
                />

                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                    <MdAccessTime size={20} />
                </span>
            </div>
        </div>
    );
};

export default TimePickerField;
