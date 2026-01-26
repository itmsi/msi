import React, { useRef, useState, useEffect } from 'react';
import { ActivityFormData, ActivityValidationErrors } from '../types/activity';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import DatePicker from '@/components/form/date-picker';
import { useSegementationSelect } from '@/hooks/useSegmentSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { allowOnlyNumeric, formatDate } from '@/helpers/generalHelper';
import CustomSelect from '@/components/form/select/CustomSelect';
import { SegmentSelectOption } from '../../IUPManagement/components/IupInformtionsFormFields';
import { useContractorSelect } from '@/hooks/useContractorSelect';

interface ActivityFormProps {
    formData: ActivityFormData;
    errors: ActivityValidationErrors;
    onChange: (field: keyof ActivityFormData, value: any) => void;
    isSubmitting: boolean;
}
interface ContractorSelectOption {
    value: string;
    label: string;
}
const ActivityForm: React.FC<ActivityFormProps> = ({ 
    formData, 
    errors, 
    onChange,
    isSubmitting 
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
    
    const [selectedSegment, setSelectedSegment] = useState<SegmentSelectOption | null>(null);

    const {
        contractorOptions,
        inputValue: contractorInputValue,
        handleInputChange: handleContractorInputChange,
        pagination: contractorPagination,
        handleMenuScrollToBottom: handleContractorMenuScrollToBottom,
        initializeOptions: initializeContractorOptions
    } = useContractorSelect();

    useEffect(() => {
        initializeContractorOptions();
    }, [initializeContractorOptions]);

    const [selectedContractor, setSelectedContractor] = useState<ContractorSelectOption | null>(null);

    // Helper untuk render input field
    const renderInput = (
        field: keyof ActivityFormData,
        label: string,
        type: string = 'text',
        placeholder?: string,
        required: boolean = false
    ) => {
        return (
            <div>
                <Label>
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    type={type}
                    value={formData[field] ? String(formData[field]) : ''}
                    onKeyPress={type === 'number' ? allowOnlyNumeric : undefined}
                    onChange={(e) => {
                        let value: any = e.target.value;
                        
                        if (type === 'number') {
                            value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            if (isNaN(value)) value = 0;
                        }
                        
                        onChange(field, value);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[field as keyof ActivityValidationErrors] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                    disabled={isSubmitting}
                    step={type === 'number' && (field === 'latitude' || field === 'longitude') ? 0.000001 : undefined}
                />
                {errors[field as keyof ActivityValidationErrors] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field as keyof ActivityValidationErrors]}</p>
                )}
            </div>
        );
    };
    
    // const [transactionDate, setTransactionDate] = useState(new Date());
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    // const { loadCustomerOptions } = useCustomerSelect();

    // Initialize dates from formData
    useEffect(() => {
        if (formData?.segmentation_properties?.segmentation_id) {
            setSelectedSegment({
                value: formData.segmentation_properties.segmentation_id,
                label: formData.segmentation_properties.segmentation_name_en || 'Select Segment'
            });
        }
    }, [formData?.segmentation_properties?.segmentation_id]);
    useEffect(() => {
        if (formData.iup_customer_id) {
            setSelectedContractor({
                value: formData.iup_customer_id,
                label: formData.customer_iup_name || 'Selected Customer'
            });
        } else {
            setSelectedContractor(null);
        }
    }, [formData.iup_customer_id, formData.customer_iup_name]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };

        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showDatePicker]);

    // Transaction type options
    const transactionTypes = [
        { value: 'Find', label: 'Find' },
        { value: 'Pull', label: 'Pull' },
        { value: 'Survey', label: 'Survey' }
    ];

    // Handle segmentation selection
    const handleSegmentationChange = (selectedOption: any) => {
        if (selectedOption) {
            onChange('segmentation_id', selectedOption.value);
            onChange('segmentation_properties', {
                segmentation_id: selectedOption.value,
                segmentation_name_en: selectedOption.label
            });
        } else {
            onChange('segmentation_id', '');
            onChange('segmentation_properties', {
                segmentation_id: '',
                segmentation_name_en: ''
            });
        }
    };

    const handleContractorChange = (selectedOption: any) => {
        if (selectedOption) {
            onChange('iup_customer_id', selectedOption.value);
            // Update customer name if available in the option
            if (selectedOption.customer_name || selectedOption.label) {
                onChange('customer_iup_name', selectedOption.customer_name || selectedOption.label);
            }
        } else {
            onChange('iup_customer_id', '');
            onChange('customer_iup_name', '');
        }
    };

    return (
        <div className="space-y-6">
            {/* Transaction Info Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Transaction Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                        {/* Transaction Type */}
                        <div>
                            <Label>
                                Transaction Type <span>*</span>
                            </Label>
                            <CustomSelect
                                value={transactionTypes.find(option => option.value === formData.transaction_type) || null}
                                onChange={(option) => onChange('transaction_type', option?.value || '')}
                                options={transactionTypes}
                                placeholder="Filter by Transaction Type"
                                isClearable={false}
                                isSearchable={false}
                                className={`w-full md:col-span-2 ${
                                    errors.transaction_type ? 'border rounded-[0.5rem] border-red-500' : ''
                                }`}
                            />
                            {errors.transaction_type && (
                                <p className="text-red-500 text-sm mt-1">{errors.transaction_type}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>Date</Label>
                        <div className="relative" ref={datePickerRef}>
                            <div 
                                className={`flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer bg-white hover:border-gray-400 ${
                                    errors.transaction_date ? 'border-red-500' : 'border-gray-300 focus-within:border-blue-500'
                                }`}
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                <span className="text-gray-700">
                                    {formData.transaction_date ? 
                                        formatDate(formData.transaction_date instanceof Date ? formData.transaction_date.toISOString() : formData.transaction_date) : 
                                        formatDate(new Date().toISOString())
                                    }
                                </span>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            
                            {showDatePicker && (
                                <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                    <Calendar
                                        date={formData.transaction_date ? new Date(formData.transaction_date) : new Date()}
                                        onChange={(date) => {
                                            onChange('transaction_date', date as Date);
                                            setShowDatePicker(false);
                                        }}
                                        color="#3b82f6"
                                        rangeColors={['#3b82f6']}
                                        showDateDisplay={false}
                                    />
                                </div>
                            )}
                        </div>
                        
                        {errors.transaction_date && (
                            <p className="text-red-500 text-sm mt-1">{errors.transaction_date}</p>
                        )}
                    </div>

                    {/* Time */}
                    <div>
                        <DatePicker
                            id="activity-time-picker"
                            mode="time"
                            label="Time"
                            placeholder="Select time..."
                            defaultDate={formData.transaction_time ? (() => {
                                const today = new Date();
                                const [hours, minutes] = formData.transaction_time.split(':');
                                today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                                return today;
                            })() : new Date()}
                            onChange={(selectedDates) => {
                                if (selectedDates && selectedDates.length > 0) {
                                    const timeString = selectedDates[0].toTimeString().slice(0, 5);
                                    onChange('transaction_time', timeString);
                                }
                            }}
                        />
                        {errors.transaction_time && (
                            <p className="text-red-500 text-sm mt-1">{errors.transaction_time}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                        {/* Customer Selection */}
                        <div>
                            <Label>
                                Customer <span className="text-red-500">*</span>
                            </Label>
                            
                            <CustomAsyncSelect
                                placeholder="Selected Customer..."
                                value={selectedContractor}
                                defaultOptions={contractorOptions}
                                loadOptions={handleContractorInputChange}
                                onMenuScrollToBottom={handleContractorMenuScrollToBottom}
                                isLoading={contractorPagination.loading}
                                noOptionsMessage={() => "No customers found"}
                                loadingMessage={() => "Loading customers..."}
                                isSearchable={true}
                                inputValue={contractorInputValue}
                                className={`w-full md:col-span-2 ${
                                    errors.iup_customer_id ? 'border rounded-[0.5rem] border-red-500' : ''
                                }`}
                                onInputChange={(inputValue) => {
                                    handleContractorInputChange(inputValue);
                                }}
                                onChange={(option: any) => {
                                    setSelectedContractor(option);
                                    handleContractorChange(option);
                                }}
                            />
                            {errors.iup_customer_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.iup_customer_id}</p>
                            )}
                        </div>

                        {/* Segmentation Selection */}
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
                                className={`w-full md:col-span-2 ${
                                    errors.segmentation_id ? 'border rounded-[0.5rem] border-red-500' : ''
                                }`}
                                onInputChange={(inputValue) => {
                                    handleSegmentationInputChange(inputValue);
                                }}
                                onChange={(option: any) => {
                                    setSelectedSegment(option);
                                    handleSegmentationChange(option);
                                }}
                            />
                            {errors.segmentation_id && (
                                <p className="text-red-500 text-sm mt-1">{errors.segmentation_id}</p>
                            )}
                        </div>
                    </div>

                    {renderInput('latitude', 'Latitude', 'number', '-6.2088', true)}
                    {renderInput('longitude', 'Longitude', 'number', '106.8456', true)}
                </div>                
            </div>


            {/* Content Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Content</h3>
                
                <div className="grid grid-cols-1 gap-6">
                    {/* Transcription */}
                    <div>
                        <Label>
                            Transcription <span className="text-red-500">*</span>
                        </Label>
                        <TextArea
                            value={formData.transcription}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('transcription', e.target.value)}
                            placeholder="Transcription of voice recording..."
                            rows={3}
                            disabled={isSubmitting}
                            error={!!errors.transcription}
                            className='flex'
                        />
                        {errors.transcription && (
                            <p className="text-red-500 text-sm mt-1">{errors.transcription}</p>
                        )}
                    </div>

                    {/* Summary Point */}
                    <div>
                        <Label>
                            Summary Point <span className="text-red-500">*</span>
                        </Label>
                        <TextArea
                            value={formData.summary_point}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('summary_point', e.target.value)}
                            placeholder="Key points from the transaction..."
                            rows={3}
                            disabled={isSubmitting}
                            error={!!errors.summary_point}
                            className='flex'
                        />
                        {errors.summary_point && (
                            <p className="text-red-500 text-sm mt-1">{errors.summary_point}</p>
                        )}
                    </div>

                    {/* Summary BIM */}
                    <div>
                        <Label>
                            Summary BIM <span className="text-red-500">*</span>
                        </Label>
                        <TextArea
                            value={formData.summary_bim}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('summary_bim', e.target.value)}
                            placeholder="BIM summary information..."
                            rows={3}
                            error={!!errors.summary_bim}
                            disabled={isSubmitting}
                            className='flex'
                        />
                        {errors.summary_bim && (
                            <p className="text-red-500 text-sm mt-1">{errors.summary_bim}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Media (Optional)</h3>
                
                <div className="grid grid-cols-1 gap-6">
                    {renderInput('image_url', 'Image URL', 'url', 'https://example.com/images/transaction-image.jpg')}
                    {renderInput('voice_record_url', 'Voice Record URL', 'url', 'https://example.com/voice/transaction-voice.mp3')}
                </div>
            </div>

            {/* General Error */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
            )}
        </div>
    );
};

export default ActivityForm;