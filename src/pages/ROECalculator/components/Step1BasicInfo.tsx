import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useCustomerSelect } from '@/hooks/useCustomerSelect';
import { ROECalculatorFormData, ROECalculatorValidationErrors } from '../types/roeCalculator';
import { useEffect, useState } from 'react';
import { allowOnlyNumeric, formatNumberInput, handleKeyPress } from '@/helpers/generalHelper';
import CustomSelect from '@/components/form/select/CustomSelect';

interface Step1Props {
    formData: ROECalculatorFormData;
    validationErrors: ROECalculatorValidationErrors;
    loading: boolean;
    handleInputChange: (field: keyof ROECalculatorFormData, value: any) => void;
}

const KOMODITAS_OPTIONS = [
    { value: 'batu_bara', label: 'Batu Bara' },
    { value: 'nikel', label: 'Nikel' }
];

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    // { value: 'presented', label: 'Presented' },
    // { value: 'won', label: 'Won' },
    // { value: 'lost', label: 'Lost' }
];

export default function Step1BasicInfo({ 
    formData, 
    validationErrors, 
    loading,
    handleInputChange }: Step1Props) {
    const {
        customerOptions,
        pagination: customerPagination,
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom,
        initializeOptions: initializeCustomerOptions,
        getCustomerById
    } = useCustomerSelect();

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    // const selectedCustomer = customerOptions.find(c => c.value === formData.customer_id) || null;

    useEffect(() => {
        initializeCustomerOptions();
    }, [initializeCustomerOptions]);
    
    useEffect(() => {
        const loadSelectedCustomer = async () => {
            if (!formData.customer_id) {
                setSelectedCustomer(null);
                return;
            }

            // First, try to find customer in current options
            const foundInOptions = customerOptions.find(c => c.value === formData.customer_id);
            
            if (foundInOptions) {
                setSelectedCustomer(foundInOptions);
            } else if (formData.customer_id) {
                // If not found in current options, fetch customer by ID
                try {
                    const customer = await getCustomerById(formData.customer_id);
                    if (customer) {
                        setSelectedCustomer(customer);
                    } else {
                        setSelectedCustomer(null);
                    }
                } catch (error) {
                    console.error('Error loading selected customer:', error);
                    setSelectedCustomer(null);
                }
            }
        };

        loadSelectedCustomer();
    }, [formData.customer_id, customerOptions, getCustomerById]);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading calculator data...</p>
                </div>
            </div>
        );
    }
    return (
        
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Masukkan informasi dasar untuk kalkulasi ROE/ROA
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div className="md:col-span-2">
                    <Label>Pilih Customer</Label>
                    <CustomAsyncSelect
                        placeholder="Select customer..."
                        value={selectedCustomer}
                        error={validationErrors.customer_id}
                        defaultOptions={customerOptions}
                        loadOptions={handleCustomerInputChange}
                        onMenuScrollToBottom={handleCustomerMenuScrollToBottom}
                        isLoading={customerPagination.loading}
                        noOptionsMessage={() => "No customers found"}
                        loadingMessage={() => "Loading customers..."}
                        isSearchable={true}
                        inputValue={customerInputValue}
                        onInputChange={(inputValue) => {
                            handleCustomerInputChange(inputValue);
                        }}
                        onChange={(option: any) => {
                            setSelectedCustomer(option);
                            handleInputChange('customer_id', option?.value || '');
                        }}
                    />
                    {validationErrors.customer_id && (
                        <span className="text-sm text-red-500">{validationErrors.customer_id}</span>
                    )}
                </div>

                {/* Komoditas */}
                <div>
                    <Label htmlFor="komoditas">Komoditas</Label>
                    <CustomSelect
                        id="komoditas"
                        value={KOMODITAS_OPTIONS.find(option => option.value === formData.komoditas) || null}
                        onChange={(option) => handleInputChange('komoditas', option?.value || '')}
                        options={KOMODITAS_OPTIONS}
                        className="w-full"
                        placeholder="Select Komoditas"
                        isClearable={false}
                        isSearchable={false}
                        error={validationErrors.komoditas}
                    />
                    {validationErrors.komoditas && (
                        <span className="text-sm text-red-500">{validationErrors.komoditas}</span>
                    )}
                </div>

                {/* Status */}
                <div className='hidden'>
                    <Label htmlFor="status">Status</Label>
                    <CustomSelect
                        id="status"
                        value={STATUS_OPTIONS.find(option => option.value === formData.status) || null}
                        onChange={(option) => handleInputChange('status', option?.value || 'draft')}
                        options={STATUS_OPTIONS}
                        className="w-full"
                        placeholder="Select Status"
                        isClearable={false}
                        isSearchable={false}
                        error={validationErrors.status}
                    />
                    {validationErrors.status && (
                        <span className="text-sm text-red-500">{validationErrors.status}</span>
                    )}
                </div>

                {/* Tonase per Ritase */}
                <div>
                    <Label htmlFor="tonase_per_ritase">Tonase per Ritase (ton)</Label>
                    <Input
                        id="tonase_per_ritase"
                        onKeyPress={allowOnlyNumeric}
                        value={formData.tonase_per_ritase}
                        onChange={(e) => handleInputChange('tonase_per_ritase', e.target.value)}
                        error={!!validationErrors.tonase_per_ritase}
                    />
                    {validationErrors.tonase_per_ritase && (
                        <span className="text-sm text-red-500">{validationErrors.tonase_per_ritase}</span>
                    )}
                </div>

                {/* Jarak Haul */}
                <div>
                    <Label htmlFor="jarak_haul">Jarak Haul (km PP)</Label>
                    <Input
                        id="jarak_haul"
                        onKeyPress={allowOnlyNumeric}
                        maxLength={5}
                        value={formData.jarak_haul}
                        onChange={(e) => handleInputChange('jarak_haul', e.target.value)}
                        error={!!validationErrors.jarak_haul}
                    />
                    {validationErrors.jarak_haul && (
                        <span className="text-sm text-red-500">{validationErrors.jarak_haul}</span>
                    )}
                </div>

                {/* Harga Jual per Ton */}
                <div>
                    <Label htmlFor="harga_jual_per_ton">Harga Jual per Ton (Rp)</Label>
                    <Input
                        id="harga_jual_per_ton"
                        onKeyPress={handleKeyPress}
                        value={formatNumberInput(formData.harga_jual_per_ton)}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('harga_jual_per_ton', value);
                        }}
                        error={!!validationErrors.harga_jual_per_ton}
                    />
                    {validationErrors.harga_jual_per_ton && (
                        <span className="text-sm text-red-500">{validationErrors.harga_jual_per_ton}</span>
                    )}
                </div>
            </div>
        </div>
    );
}