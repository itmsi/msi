import React from 'react';
import { MdClear, MdSearch } from 'react-icons/md';
import Input from '@/components/form/input/InputField';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    onClear?: () => void;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
    className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    onSearch,
    onClear,
    placeholder = 'Search...',
    id = 'search',
    disabled = false,
    className = '',
}) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;

        e.preventDefault();
        onSearch();
    };

    const handleClear = () => {
        if (onClear) {
            onClear();
            return;
        }

        onChange('');
    };

    return (
        <div className={`flex items-center gap-2 w-full ${className}`}>
            <div className="relative flex-1 min-w-0">
                <button
                    type="button"
                    onClick={onSearch}
                    disabled={disabled}
                    aria-label="Search"
                    className="absolute left-3 top-1/2 z-1 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                    <MdSearch size={20} />
                </button>
                <Input
                    id={id}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`pl-10 py-2 w-full ${value ? 'pr-10' : 'pr-4'}`}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear search"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <MdClear className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchInput;
