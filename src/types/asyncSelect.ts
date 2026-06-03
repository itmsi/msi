
export interface SelectOption {
    value: string;
    label: string;
}

export interface AsyncSelectConfig {
    isMulti?: boolean;
    isSearchable?: boolean;
    isClearable?: boolean;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    error?: string;
    success?: boolean;
    isLoading?: boolean;
    id?: string;
}

export interface AsyncSelectCallbacks {
    onChange?: (selectedOption: SelectOption | null) => void;
    onChangeMulti?: (selectedOptions: SelectOption[]) => void;
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
    value?: SelectOption | SelectOption[] | null;
    menuPortalTarget?: HTMLElement | null;
    menuPosition?: 'absolute' | 'fixed';
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