import React, { useCallback, useEffect, useRef, useState } from 'react';
import Label from '@/components/form/Label';
import CustomSelect from '@/components/form/select/CustomSelect';
import Input from '@/components/form/input/InputField';
import { STATUS_OPTIONS } from '../constants/iupConstants';
import { allowOnlyNumeric } from '@/helpers/generalHelper';
import { IupManagementFormData } from '../types/iupmanagement';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import toast from 'react-hot-toast';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useSegementationSelect } from '@/hooks/useSegmentSelect';

interface IupFormFieldsProps {
    formData: IupManagementFormData;
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onDateChange?: (name: string, value: string) => void; // Add date change handler
}
export interface SegmentSelectOption {
    value: string;
    label: string;
}
const IupInformtionsFormFields: React.FC<IupFormFieldsProps> = ({
    formData,
    errors,
    onInputChange,
    onSelectChange,
    onDateChange // Add date change handler
}) => {
    const {
        segementationOptions,
        inputValue: segmentationInputValue,
        handleInputChange: handleSegmentationInputChange,
        pagination: segmentationPagination,
        handleMenuScrollToBottom: handleSegmentationMenuScrollToBottom,
        initializeOptions: initializeSegementationOptions
    } = useSegementationSelect();

    useEffect(() => {
        initializeSegementationOptions();
    }, [initializeSegementationOptions]);

    const [skDate, setSkDate] = useState(new Date());
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const [showSkDatePicker, setShowSkDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const skDatePickerRef = useRef<HTMLDivElement>(null);
    const skDueDatePickerRef = useRef<HTMLDivElement>(null);
    // Helper function untuk render input field dengan consistent styling
    
    // Banks Account states
    const [selectedSegment, setSelectedSegment] = useState<SegmentSelectOption | null>(null);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    const renderInput = (
        name: keyof IupManagementFormData,
        label: string,
        type: string = 'text',
        required: boolean = false
    ) => (
        <div>
            <Label>
                {label} {required && '*'}
            </Label>
            <Input
                type={'text'}
                name={name}
                value={formData[name]}
                onKeyPress={type === 'number' ? allowOnlyNumeric : undefined}
                onChange={onInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[name] ? 'border-red-500' : 'border-gray-300'
                }`}
                min={type === 'number' ? "1" : "10000"}
            />
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
        </div>
    );

    const handleSkDateChange = useCallback((date: Date) => {
        setSkDate(date);
        if (dueDate < date) {
            const newDueDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
            setDueDate(newDueDate);
            // Update both dates in formData
            onDateChange?.('sk_end_date', newDueDate.toISOString().split('T')[0]);
        }
        // Update SK effective date in formData
        onDateChange?.('sk_effective_date', date.toISOString().split('T')[0]);
        setShowSkDatePicker(false);
    }, [dueDate, onDateChange]);

    const handleDueDateChange = useCallback((date: Date) => {
        if (date < skDate) {
            toast.error('Due date cannot be earlier than SK effective date');
            return;
        }
        setDueDate(date);
        // Update SK end date in formData
        onDateChange?.('sk_end_date', date.toISOString().split('T')[0]);
        setShowDueDatePicker(false);
    }, [skDate, onDateChange]);

    // Initialize dates from formData
    useEffect(() => {
        if (formData.sk_effective_date) {
            setSkDate(new Date(formData.sk_effective_date));
        }
        if (formData.sk_end_date) {
            setDueDate(new Date(formData.sk_end_date));
        }
        
        if (formData.segmentation_id) {
            setSelectedSegment({
                value: formData.segmentation_id,
                label: formData.segmentation_name_en || 'Select Segment'
            });
        }

    }, [formData.sk_effective_date, formData.sk_end_date, formData.segmentation_id]);

    // Handle click outside for SK effective date picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (skDatePickerRef.current && !skDatePickerRef.current.contains(event.target as Node)) {
                setShowSkDatePicker(false);
            }
        };

        if (showSkDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showSkDatePicker]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (skDueDatePickerRef.current && !skDueDatePickerRef.current.contains(event.target as Node)) {
                setShowDueDatePicker(false);
            }
        };

        if (showDueDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showDueDatePicker]);

    return (<>
        <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">IUP Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                    {renderInput('rkab', 'RKAB', 'text', false)}
                    {renderInput('sk_number', 'SK Number', 'text', false)}
                    <div>
                        <Label>Select Segmentation</Label>
                        <CustomAsyncSelect
                            placeholder="Select Segmentation..."
                            value={selectedSegment}
                            defaultOptions={segementationOptions}
                            loadOptions={handleSegmentationInputChange}
                            onMenuScrollToBottom={handleSegmentationMenuScrollToBottom}
                            isLoading={segmentationPagination.loading}
                            noOptionsMessage={() => "No segments found"}
                            loadingMessage={() => "Loading segments..."}
                            isSearchable={true}
                            inputValue={segmentationInputValue}
                            onInputChange={(inputValue) => {
                                handleSegmentationInputChange(inputValue);
                            }}
                            onChange={(option: any) => {
                                setSelectedSegment(option);
                                onSelectChange('segmentation_id', option?.value || '');
                            }}
                        />
                    </div>
                </div>

                <div>
                    <Label>SK Effective Date</Label>
                    <div className="relative" ref={skDatePickerRef}>
                        <div 
                            className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500"
                            onClick={() => setShowSkDatePicker(!showSkDatePicker)}
                        >
                            <span className="text-gray-700">
                                {formatDate(skDate)}
                            </span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        
                        {showSkDatePicker && (
                            <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                <Calendar
                                    date={skDate}
                                    onChange={(date) => handleSkDateChange(date as Date)}
                                    color="#3b82f6"
                                    minDate={new Date()}
                                />
                            </div>
                        )}
                    </div>
                    {/* {errors.sk_effective_date && (
                        <span className="text-sm text-red-500">
                            {errors.sk_effective_date}
                        </span>
                    )} */}
                </div>

                {/* Due Date */}
                <div>
                    <Label>SK End Date</Label>
                    <div className="relative" ref={skDueDatePickerRef}>
                        <div 
                            className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500"
                            onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                        >
                            <span className="text-gray-700">
                                {formatDate(dueDate)}
                            </span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        
                        {showDueDatePicker && (
                            <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                <div className="p-3 border-b border-gray-200">
                                    <div className="text-sm text-gray-600 mb-2">Quick Select:</div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                            onClick={() => handleDueDateChange(new Date(skDate.getTime() + 24 * 60 * 60 * 1000))}
                                        >
                                            +1 Day
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                            onClick={() => handleDueDateChange(new Date(skDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                                        >
                                            +7 Days
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                            onClick={() => handleDueDateChange(new Date(skDate.getTime() + 14 * 24 * 60 * 60 * 1000))}
                                        >
                                            +14 Days
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                            onClick={() => handleDueDateChange(new Date(skDate.getTime() + 30 * 24 * 60 * 60 * 1000))}
                                        >
                                            +30 Days
                                        </button>
                                    </div>
                                </div>
                                <Calendar
                                    date={dueDate}
                                    onChange={(date) => handleDueDateChange(date as Date)}
                                    color="#3b82f6"
                                    minDate={skDate} // Due date cannot be before invoice date
                                />
                            </div>
                        )}
                    </div>

                    {/* {errors.sk_end_date && (
                        <span className="text-sm text-red-500">
                            {errors.sk_end_date}
                        </span>
                    )} */}
                </div>
            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('province_name', 'Province Name', 'text', false)}
                {renderInput('mine_location', 'Mine Location', 'text', false)}
                {renderInput('area_size_ha', 'Area Size (Ha)', 'number', false)}
                {renderInput('regency_name', 'Regency Name', 'text', false)}
                
                
                {/* Status Field */}
                <div>
                    <Label>Status *</Label>
                    <CustomSelect
                        value={STATUS_OPTIONS.find(option => option.value === formData.status) || null}
                        onChange={(option) => onSelectChange('status', option?.value || 'active')}
                        options={STATUS_OPTIONS}
                        placeholder="Select status"
                        isClearable={false}
                        isSearchable={false}
                    />
                </div>
            </div>
        </div>
    </>);
};

export default IupInformtionsFormFields;