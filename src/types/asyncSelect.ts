
export interface SelectOption {
    value: string | number;
    label: string;
}

export interface AsyncSelectConfig {
    isSearchable?: boolean;
    isClearable?: boolean;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    error?: string;
    success?: boolean;
    isLoading?: boolean;
}

export interface AsyncSelectCallbacks {
    onChange?: (selectedOption: { value: string; label: string; } | null) => void;
    onInputChange?: (value: string) => void;
    onMenuScrollToBottom?: () => Promise<void> | void;
}

export interface AsyncSelectData {
    defaultOptions?: SelectOption[];
    loadOptions?: (search: string) => Promise<SelectOption[]>;
    inputValue?: string;
}

export interface CustomAsyncSelectProps extends AsyncSelectConfig, AsyncSelectCallbacks, AsyncSelectData {
    name?: string;
    value?: SelectOption | null;
    noOptionsMessage?: () => string;
    loadingMessage?: () => string;
}

// Pagination-related types
export interface PaginationState {
    currentPage: number;
    pageSize: number;
    hasMore: boolean;
    loading: boolean;
}

export interface PaginatedSelectOptions {
    options: SelectOption[];
    pagination: PaginationState;
}