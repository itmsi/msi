import { ENUM_MONTH } from './constants';

export const buildLabel = (...parts: (string | undefined | null)[]) => {
    return parts.filter(Boolean).join(' - ');
};

export function formatMonthYear(monthYear?: string): string {
    if (!monthYear) return '-';

    const [year, monthNum] = monthYear.split('-');
    const monthOption = ENUM_MONTH.find((m) => m.value === monthNum);

    return monthOption ? `${monthOption.label}/${year}` : '-';
}

export function extractMonthFromDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = (date.getUTCMonth() + 1).toString(); // getUTCMonth 0-based
    return month.padStart(2, '0'); // jadi "09"
}

export function formatFloatingValue(value: number | string | null | undefined, decimals: number = 2): number {
    if (value === null || value === undefined || value === '') return 0;

    const num = Number(value);
    if (isNaN(num)) return 0;

    return parseFloat(num.toFixed(decimals));
}

export const allowOnlyNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (
        !/[0-9.,]/.test(e.key) && // hanya angka, koma, titik
        !allowedKeys.includes(e.key)
    ) {
        e.preventDefault();
    }
};

export const parseNumberInput = (value: string | undefined | null, isZero?: boolean) => {
    if (!value && isZero) return 0;
    if (!value) return undefined;

    if (typeof value === 'string') {
        return Number(value?.replace(',', '.'));
    }
    return value;
};

export const formatNumberInput = (value: string | number | undefined | null): string => {
    if (!value && value !== 0) return '';
    const cleanFormatValue = value.toString().replace(/[^\d]/g, '');
    if (!cleanFormatValue) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(cleanFormatValue));
};

export const parseFormatNumber = (formatValue: string): string => {
    if (!formatValue) return '';
    return formatValue.replace(/\./g, '');
};

export const resetFormatNumbers = (
    formData: any, 
    numericFields: string[] = []
): any => {
    const resetData = { ...formData };
    const fieldsToReset = numericFields.length > 0 
        ? numericFields 
        : Object.keys(resetData).filter(key => {
            const value = resetData[key];
            return typeof value === 'string' && /^\d{1,3}(\.\d{3})*$/.test(value);
        });
    
    fieldsToReset.forEach(field => {
        if (resetData[field]) {
            resetData[field] = parseFormatNumber(resetData[field].toString());
        }
    });
    
    return resetData;
};
export const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
        [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)
    ) {
        return;
    }
    if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
};
export const handlePercentageInput = (
    inputValue: string, 
    min: number = 0, 
    max: number = 100
): string => {
    const numericValue = inputValue.replace(/[^\d]/g, '');
    const percentage = parseInt(numericValue) || 0;
    const validatedPercentage = Math.min(max, Math.max(min, percentage));
    return validatedPercentage.toString();
};

export const hasChanged = <T extends object>(oldData: T, newData: Partial<T>, keys: (keyof T)[]): boolean => {
    return keys.some((key) => oldData[key] !== newData[key]);
};

export const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numValue);
};

export const tableDateFormat = {
    day: '2-digit' as const,
    month: 'short' as const,
    year: 'numeric' as const
}

export const formatDate = (dateString: string, includeTime: boolean = false) => {
    const date = new Date(dateString);
    
    if (includeTime) {
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Fungsi tambahan untuk format DateTime yang lebih spesifik
export const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// Fungsi untuk format waktu saja
export const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};