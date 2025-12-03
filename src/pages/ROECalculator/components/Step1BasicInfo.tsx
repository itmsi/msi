import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useCustomerSelect } from '@/hooks/useCustomerSelect';
import { ROECalculatorFormData, ROECalculatorValidationErrors } from '../types/roeCalculator';

interface Step1Props {
    formData: ROECalculatorFormData;
    validationErrors: ROECalculatorValidationErrors;
    handleInputChange: (field: keyof ROECalculatorFormData, value: any) => void;
}

const KOMODITAS_OPTIONS = [
    { value: 'batu_bara', label: 'Batu Bara' },
    { value: 'nikel', label: 'Nikel' }
];

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'presented', label: 'Presented' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
];

export default function Step1BasicInfo({ formData, validationErrors, handleInputChange }: Step1Props) {
    // Customer select hook
    const {
        customerOptions,
        pagination: customerPagination,
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom
    } = useCustomerSelect();

    const selectedCustomer = customerOptions.find(c => c.value === formData.customer_id) || null;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Masukkan informasi dasar untuk kalkulasi ROE/ROA
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div className="md:col-span-2">
                    <Label>Select Customer</Label>
                    <CustomAsyncSelect
                        name="customer_id"
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
                    <select
                        id="komoditas"
                        value={formData.komoditas}
                        onChange={(e) => handleInputChange('komoditas', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.komoditas ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Pilih Komoditas</option>
                        {KOMODITAS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {validationErrors.komoditas && (
                        <span className="text-sm text-red-500">{validationErrors.komoditas}</span>
                    )}
                </div>

                {/* Status */}
                <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.status ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {validationErrors.status && (
                        <span className="text-sm text-red-500">{validationErrors.status}</span>
                    )}
                </div>

                {/* Tonase per Ritase */}
                <div>
                    <Label htmlFor="tonase_per_ritase">Tonase per Ritase (ton)</Label>
                    <Input
                        id="tonase_per_ritase"
                        type="number"
                        step={0.1}
                        value={formData.tonase_per_ritase}
                        onChange={(e) => handleInputChange('tonase_per_ritase', e.target.value)}
                        placeholder="0"
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
                        type="number"
                        step={0.1}
                        value={formData.jarak_haul}
                        onChange={(e) => handleInputChange('jarak_haul', e.target.value)}
                        placeholder="0"
                        error={!!validationErrors.jarak_haul}
                    />
                    {validationErrors.jarak_haul && (
                        <span className="text-sm text-red-500">{validationErrors.jarak_haul}</span>
                    )}
                </div>

                {/* Harga Jual per Ton */}
                <div className="md:col-span-2">
                    <Label htmlFor="harga_jual_per_ton">Harga Jual per Ton (Rp)</Label>
                    <Input
                        id="harga_jual_per_ton"
                        type="text"
                        value={formData.harga_jual_per_ton}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('harga_jual_per_ton', value);
                        }}
                        placeholder="0"
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