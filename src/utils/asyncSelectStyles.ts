import { SelectOption } from '@/types/asyncSelect';
import { StylesConfig } from 'react-select';


interface StyleOptions {
    error?: boolean;
    success?: boolean;
    disabled?: boolean;
}

/**
 * Custom styles for react-select AsyncSelect component
 */
export const createAsyncSelectStyles = ({ error, success, disabled }: StyleOptions = {}): StylesConfig<SelectOption> => {
    return {
        control: (baseStyles, state) => {
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
                            : '#d1d5db',
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
            borderRadius: '0.5rem',
            maxHeight: '200px',
            overflowY: 'auto'
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

export const generateSelectClassNames = (
    error?: string, 
    success?: boolean, 
    disabled?: boolean, 
    className?: string
): string => {
    const classNames = [
        'react-select-container font-secondary',
        error ? 'react-select-error' : '',
        success ? 'react-select-success' : '',
        disabled ? 'react-select-disabled' : '',
        className || ''
    ];

    return classNames.filter(Boolean).join(' ');
};