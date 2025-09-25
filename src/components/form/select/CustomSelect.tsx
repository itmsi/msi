import React from 'react';
import Select, { Props as SelectProps, StylesConfig, SingleValue, MultiValue, ActionMeta } from 'react-select';

interface Option {
    value: string | number;
    label: string;
}

interface CustomSelectProps extends Omit<SelectProps<Option>, 'styles' | 'onChange'> {
    error?: string;
    isSearchable?: boolean;
    isClearable?: boolean;
    success?: boolean;
    disabled?: boolean;
    className?: string;
    onChange?: (selectedOption: { value: string; label: string; } | null) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
    error, 
    isSearchable = true, 
    isClearable = true, 
    success, 
    disabled, 
    className = '', 
    onChange,
    ...props 
}) => {
    const handleChange = (newValue: SingleValue<Option> | MultiValue<Option>, _actionMeta: ActionMeta<Option>) => {
        // actionMeta = untuk melakukan tracing jenis aksi yang terjadi
        if (onChange) {
            // Handle single select
            if (!Array.isArray(newValue)) {
                const singleValue = newValue as SingleValue<Option>;
                if (singleValue) {
                    onChange({
                        value: String(singleValue.value),
                        label: singleValue.label
                    });
                } else {
                    onChange(null);
                }
            }
        }
    };
    const getSelectStyles = (): StylesConfig<Option> => {
        return {
            control: (baseStyles, state) => {
                let inputClasses = `font-secondary h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3:text-white/30`;

                if (disabled || state.isDisabled) {
                    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed`;
                } else if (error) {
                    inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20:border-error-800`;
                } else if (success) {
                    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20:border-success-800`;
                } else if (state.isFocused) {
                    inputClasses += ` bg-transparent text-gray-800 border-brand-300 ring-3 ring-brand-500/20`;
                } else {
                    inputClasses += ` bg-transparent text-gray-800 border-gray-300`;
                }

                return {
                    ...baseStyles,
                    minHeight: '44px',
                    height: '44px',
                    borderRadius: '0.5rem',
                    borderWidth: '1px',
                    boxShadow: state.isFocused 
                        ? (error 
                            ? '0 0 0 3px rgba(239, 68, 68, 0.2)' 
                            : success 
                                ? '0 0 0 3px rgba(34, 197, 94, 0.2)'
                                : '0 0 0 3px rgba(59, 130, 246, 0.2)'
                          ) 
                        : 'none',
                    borderColor: state.isFocused 
                        ? (error 
                            ? '#ef4444' 
                            : success 
                                ? '#22c55e'
                                : '#3b82f6'
                          )
                        : (error 
                            ? '#ef4444' 
                            : success 
                                ? '#22c55e'
                                : '#d1d5db'
                          ),
                    backgroundColor: (state.isDisabled || disabled) 
                        ? '#f3f4f6' 
                        : 'transparent',
                    cursor: (state.isDisabled || disabled) ? 'not-allowed' : 'default',
                    opacity: (state.isDisabled || disabled) ? 0.4 : 1,
                    '&:hover': {
                        borderColor: error 
                            ? '#ef4444' 
                            : success 
                                ? '#22c55e' 
                                : 'trasnsparent',
                    }
                };
            },
            valueContainer: (baseStyles) => ({
                ...baseStyles,
                padding: '0 16px',
                height: '42px'
            }),
            input: (baseStyles) => ({
                ...baseStyles,
                margin: 0,
                padding: 0,
                color: 'inherit'
            }),
            placeholder: (baseStyles) => ({
                ...baseStyles,
                color: '#9ca3af',
                fontSize: '0.875rem'
            }),
            singleValue: (baseStyles) => ({
                ...baseStyles,
                color: 'inherit',
                fontSize: '0.875rem'
            }),
            multiValue: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: '#eff6ff',
                borderRadius: '0.375rem',
                margin: '2px'
            }),
            multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                color: '#1e40af',
                fontSize: '0.875rem',
                padding: '2px 6px'
            }),
            multiValueRemove: (baseStyles) => ({
                ...baseStyles,
                color: '#1e40af',
                ':hover': {
                    backgroundColor: '#dbeafe',
                    color: '#1e40af'
                }
            }),
            menu: (baseStyles) => ({
                ...baseStyles,
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                zIndex: 9999,
                marginTop: '4px'
            }),
            menuList: (baseStyles) => ({
                ...baseStyles,
                padding: 0,
                borderRadius: '0.5rem'
            }),
            option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isSelected 
                    ? '#3b82f6' 
                    : state.isFocused 
                        ? '#eff6ff' 
                        : 'white',
                color: state.isSelected ? 'white' : '#374151',
                padding: '8px 16px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                borderRadius: '0px',
                ':first-of-type': {
                    borderTopLeftRadius: '0.5rem',
                    borderTopRightRadius: '0.5rem'
                },
                ':last-of-type': {
                    borderBottomLeftRadius: '0.5rem',
                    borderBottomRightRadius: '0.5rem'
                },
                '&:hover': {
                    backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
                }
            }),
            indicatorSeparator: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: '#d1d5db',
                width: '1px'
            }),
            dropdownIndicator: (baseStyles, state) => ({
                ...baseStyles,
                color: '#6b7280',
                padding: '8px',
                transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                '&:hover': {
                    color: '#374151'
                }
            }),
            clearIndicator: (baseStyles) => ({
                ...baseStyles,
                color: '#6b7280',
                padding: '8px',
                '&:hover': {
                    color: '#374151'
                }
            }),
            loadingIndicator: (baseStyles) => ({
                ...baseStyles,
                color: '#3b82f6'
            }),
            noOptionsMessage: (baseStyles) => ({
                ...baseStyles,
                color: '#6b7280',
                fontSize: '0.875rem',
                padding: '8px 16px'
            }),
            loadingMessage: (baseStyles) => ({
                ...baseStyles,
                color: '#6b7280',
                fontSize: '0.875rem',
                padding: '8px 16px'
            })
        };
    };

    const customClassNames = [
        'react-select-container font-secondary ',
        error ? 'react-select-error' : '',
        success ? 'react-select-success' : '',
        disabled ? 'react-select-disabled' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <Select
            {...props}
            styles={getSelectStyles()}
            isDisabled={disabled}
            className={customClassNames}
            classNamePrefix="react-select"
            onChange={handleChange}
            isSearchable={isSearchable}
            isClearable={isClearable}
            
        />
    );
};

export default CustomSelect;