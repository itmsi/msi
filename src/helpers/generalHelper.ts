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

// Parse decimal input - handles both comma and dot as decimal separator
// Examples: "12.5" -> 12.5, "20,1" -> 20.1, "100" -> 100
export const parseDecimalInput = (value: string | number | undefined | null, defaultVal: number = 0): number => {
    if (!value && value !== 0) return defaultVal;
    
    if (typeof value === 'number') {
        return isNaN(value) ? defaultVal : value;
    }

    const str = value.toString().trim();
    if (!str) return defaultVal;

    // Keep only digits, dots, and commas
    const cleaned = str.replace(/[^\d,.]/g, '');
    if (!cleaned) return defaultVal;

    // Replace comma with dot for JS parsing
    let normalized = cleaned.replace(',', '.');
    
    // Handle multiple dots (e.g., "1.000.5" -> "1000.5")
    const dots = (normalized.match(/\./g) || []).length;
    if (dots > 1) {
        const lastDotIdx = normalized.lastIndexOf('.');
        const beforeLastDot = normalized.substring(0, lastDotIdx).replace(/\./g, '');
        const afterLastDot = normalized.substring(lastDotIdx);
        normalized = beforeLastDot + afterLastDot;
    }
    
    const result = parseFloat(normalized);
    return isNaN(result) ? defaultVal : result;
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
    if (isNaN(numValue)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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

export const formatDecimalValue = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2);
};

export const formatIntegerValue = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return Math.round(numValue).toString();
};

export const formatPercentageValue = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2);
};