import React from 'react';
import Input from '@/components/form/input/InputField';
import { MdSearch, MdClear } from 'react-icons/md';
import Button from '@/components/ui/button/Button';

interface ActivitySearchProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onClear: () => void;
    loading?: boolean;
}

const ActivitySearch: React.FC<ActivitySearchProps> = ({
    searchValue,
    onSearchChange,
    onKeyPress,
    onClear,
    loading = false
}) => {
    return (
            <div className="md:col-span-3 w-full">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search transactions... (Press Enter to search)"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyPress={onKeyPress}
                            className="pl-10 pr-10"
                            disabled={loading}
                        />
                        {searchValue && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button
                                    type="button"
                                    onClick={onClear}
                                    disabled={loading}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition duration-150 ease-in-out"
                                >
                                    <MdClear className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
    );
};

export default ActivitySearch;