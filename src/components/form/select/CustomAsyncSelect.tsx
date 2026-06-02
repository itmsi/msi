import React, { useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { SingleValue, MultiValue, ActionMeta } from 'react-select';
import { createAsyncSelectStyles, generateSelectClassNames } from '@/utils/asyncSelectStyles';
import { CustomAsyncSelectProps, SelectOption } from '@/types/asyncSelect';

const CustomAsyncSelect: React.FC<CustomAsyncSelectProps> = ({ 
    error, 
    isSearchable = true, 
    isClearable = true, 
    success, 
    disabled, 
    className = '', 
    onChange,
    onChangeMulti,
    defaultOptions = [],
    loadOptions,
    onMenuScrollToBottom,
    isLoading = false,
    inputValue = '',
    onInputChange,
    noOptionsMessage,
    loadingMessage,
    id,
    menuPortalTarget,
    menuPosition = 'absolute',
    ...props 
}) => {

    const handleChange = useCallback((
        newValue: SingleValue<SelectOption> | MultiValue<SelectOption>, 
        _actionMeta: ActionMeta<SelectOption>
    ) => {
        if (Array.isArray(newValue)) {
            if (onChangeMulti) onChangeMulti(newValue as SelectOption[]);
        } else {
            const singleValue = newValue as SingleValue<SelectOption>;
            if (onChange) onChange(singleValue ? (singleValue as SelectOption) : null);
        }
    }, [onChange, onChangeMulti]);

    const handleInputChange = useCallback((newValue: string) => {
        if (onInputChange) {
            onInputChange(newValue);
        }
    }, [onInputChange]);

    const handleMenuScrollToBottom = useCallback(async () => {
        if (onMenuScrollToBottom) {
            await onMenuScrollToBottom();
        }
    }, [onMenuScrollToBottom]);

    const selectStyles = createAsyncSelectStyles({ 
        error: !!error, 
        success, 
        disabled 
    });

    const selectClassNames = generateSelectClassNames(
        error, 
        success, 
        disabled, 
        className
    );

    return (
        <AsyncSelect
            {...props}
            id={id}
            styles={selectStyles}
            isDisabled={disabled}
            className={selectClassNames}
            classNamePrefix="react-select"
            onChange={handleChange}
            isSearchable={isSearchable}
            isClearable={isClearable}
            defaultOptions={defaultOptions}
            loadOptions={loadOptions}
            onMenuScrollToBottom={handleMenuScrollToBottom}
            isLoading={isLoading}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            noOptionsMessage={noOptionsMessage}
            loadingMessage={loadingMessage}
            cacheOptions
            filterOption={null}
            menuPortalTarget={menuPortalTarget}
            menuPosition={menuPosition}
        />
    );
};

export default CustomAsyncSelect;