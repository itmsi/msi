import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { ROECalculatorFormData, ROECalculatorValidationErrors, QuoteDefaults } from '../types/roeCalculator';
import { formatNumberInput, handleKeyPress, twodigitcomma } from '@/helpers/generalHelper';
import CustomSelect from '@/components/form/select/CustomSelect';
import LoadingSpinner from '@/components/common/Loading';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

interface Step3Props {
    formData: ROECalculatorFormData;
    validationErrors: ROECalculatorValidationErrors;
    handleInputChange: (field: keyof ROECalculatorFormData, value: any) => void;
    quoteDefaults: QuoteDefaults | null;
    loading: boolean,
    onLoadDefaults: () => Promise<void>;
    calculatorId?: string;
}

export default function Step3Operational({ 
    formData, 
    validationErrors, 
    handleInputChange,
    loading,
    calculatorId
}: Step3Props) {
    
    const navigate = useNavigate();
    
    useEffect(() => {
        if (calculatorId && formData.step && formData.step < 3) {
            navigate(`/roe-roa-calculator/manage/edit/${calculatorId}?step=${formData.step}`, { replace: true });
        }
    }, [formData.step, calculatorId, navigate]);
    const STATUS_OPTIONS = [
        { value: 'L/km', label: 'L/km (per kilometer)' },
        { value: 'L/km/ton', label: 'L/km/ton (per km per ton)' }
    ];
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="text-gray-600">Please wait while we fetch your purchase data...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Parameter Operasional</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Input parameter operasional untuk menghitung revenue dan performa unit
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ritase per Shift */}
                <div>
                    <Label htmlFor="ritase_per_shift">Ritase per Shift</Label>
                    <Input
                        name='ritase_per_shift'
                        id="ritase_per_shift"
                        value={
                            formData.ritase_per_shift === null 
                                ? '' 
                                : (formData.ritase_per_shift || formData?.operation_data?.ritase_per_shift || '')
                        }
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const cleanValue = rawValue.replace(/[^\d.]/g, '');
                            const numericValue = parseFloat(cleanValue) || 0;
                            
                            if (rawValue === '' || numericValue <= 0) {
                                handleInputChange('ritase_per_shift', null);
                            } else {
                                const formattedValue = twodigitcomma(cleanValue);
                                handleInputChange('ritase_per_shift', formattedValue);
                            }
                        }}
                        maxLength={15}
                        error={!!validationErrors.ritase_per_shift}
                    />
                    {validationErrors.ritase_per_shift && (
                        <span className="text-sm text-red-500">{validationErrors.ritase_per_shift}</span>
                    )}
                </div>

                {/* Shift per Hari */}
                <div>
                    <Label htmlFor="shift_per_hari">Shift per Hari</Label>
                    <Input
                        id="shift_per_hari"
                        value={formData.shift_per_hari === null ? '' : formData.shift_per_hari || formData?.operation_data?.shift_per_hari || '0'}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const cleanValue = rawValue === '' ? "0" : rawValue.replace(/[^\d.]/g, '');
                            const numericValue = parseFloat(cleanValue) || 0;
                            
                            if (rawValue === '' || numericValue <= 0) {
                                handleInputChange('shift_per_hari', null);
                            } else {
                                handleInputChange('shift_per_hari', cleanValue);
                            }
                        }}
                        maxLength={15}
                        error={!!validationErrors.shift_per_hari}
                    />
                    {validationErrors.shift_per_hari && (
                        <span className="text-sm text-red-500">{validationErrors.shift_per_hari}</span>
                    )}
                </div>

                {/* Hari Kerja per Bulan */}
                <div>
                    <Label htmlFor="hari_kerja_per_bulan">Hari Kerja per Bulan</Label>
                    <Input
                        id="hari_kerja_per_bulan"
                        value={
                            formData.hari_kerja_per_bulan === null 
                                ? '' 
                                : (formData.hari_kerja_per_bulan || formData?.operation_data?.hari_kerja_per_bulan || '')
                        }
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const cleanValue = rawValue.replace(/[^\d.]/g, '');
                            const numericValue = parseFloat(cleanValue) || 0;
                            
                            if (rawValue === '' || numericValue <= 0) {
                                handleInputChange('hari_kerja_per_bulan', null);
                            } else {
                                const formattedValue = twodigitcomma(cleanValue);
                                handleInputChange('hari_kerja_per_bulan', formattedValue);
                            }
                        }}
                        maxLength={15}
                        error={!!validationErrors.hari_kerja_per_bulan}
                    />
                    
                    {validationErrors.hari_kerja_per_bulan && (
                        <span className="text-sm text-red-500">{validationErrors.hari_kerja_per_bulan}</span>
                    )}
                </div>

                {/* Utilization Rate Slider */}
                <div>
                    <Label htmlFor="utilization_percent">Physical Availability (%)</Label>
                    <div className="space-y-2">
                        <Input
                            id="utilization_percent"
                            value={formData.utilization_percent === null ? '0' : formData.utilization_percent || '0'}
                            onChange={(e) => {
                                const rawValue = e.target.value;
                                const cleanValue = rawValue.replace(/[^\d.]/g, '');
                                const numericValue = parseFloat(cleanValue) || 0;
                                
                                if (rawValue === '' || numericValue <= 0) {
                                    handleInputChange('utilization_percent', null);
                                } else {
                                    handleInputChange('utilization_percent', cleanValue);
                                }
                            }}
                            maxLength={5}
                            error={!!validationErrors.utilization_percent}
                        />
                    
                        {validationErrors.utilization_percent && (
                            <span className="text-sm text-red-500">{validationErrors.utilization_percent}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Revenue Calculation Display */}
            {/* {formData.ritase_per_shift && formData.shift_per_hari && formData.fuel_price && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">Perhitungan Revenue</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Ritase per Shift:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(formData.ritase_per_shift))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shift per Hari:</span>
                            <span className="font-medium">{formData.shift_per_hari} shift</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Hari Kerja per Bulan:</span>
                            <span className="font-medium">{formData.hari_kerja_per_bulan} hari</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Utilization Rate:</span>
                            <span className="font-medium">{formData.utilization_percent}%</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold text-base">
                            <span>Tipe Konsumsi BBM:</span>
                            <span className="text-green-700">{formData.fuel_price}</span>
                        </div>
                        {/* <div className="flex justify-between font-bold text-base">
                            <span>Revenue Efektif ({formData.utilization_percent}%):</span>
                            <span className="text-green-700">
                                {formatCurrency(calculateTotalRevenue() * (formData.utilization_rate / 100))}
                            </span>
                        </div> 
                    </div>
                </div>
            )} */}

            {/* Additional Parameters */}
            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Working Days */}
                    <div>
                        <Label htmlFor="fuel_consumption_type">Tipe Konsumsi BBM</Label>
                        <CustomSelect
                            id="fuel_consumption_type"
                            value={STATUS_OPTIONS.find(option => option.value === formData.fuel_consumption_type) || null}
                            onChange={(option) => handleInputChange('fuel_consumption_type', option?.value || '')}
                            options={STATUS_OPTIONS}
                            className="w-full"
                            placeholder="Select Tipe Konsumsi BBM"
                            isClearable={false}
                            isSearchable={false}
                            error={validationErrors.fuel_consumption_type}
                        />
                    </div>
                    <div>
                        <Label htmlFor="fuel_consumption">Konsumsi BBM {formData?.fuel_consumption_type || 'L/km'}</Label>
                        
                        <Input
                            id="fuel_consumption"
                            placeholder=""
                            value={
                                formData.fuel_consumption === null 
                                    ? '' 
                                    : (formData.fuel_consumption || formData?.operation_data?.fuel_consumption || '')
                            }
                            onChange={(e) => {
                                const rawValue = e.target.value;
                                const cleanValue = rawValue.replace(/[^\d.]/g, '');
                                const numericValue = parseFloat(cleanValue) || 0;
                                
                                if (rawValue === '' || numericValue <= 0) {
                                    handleInputChange('fuel_consumption', null);
                                } else {
                                    const formattedValue = twodigitcomma(cleanValue);
                                    handleInputChange('fuel_consumption', formattedValue);
                                }
                            }}
                            maxLength={7}
                            error={!!validationErrors.fuel_consumption}
                        />
                        {validationErrors.fuel_consumption && (
                            <span className="text-sm text-red-500">{validationErrors.fuel_consumption}</span>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="fuel_price">Harga BBM (Rp/L)</Label>
                        <Input
                            id="fuel_price"
                            onKeyPress={handleKeyPress}
                            value={formatNumberInput(formData?.fuel_price)}
                            onChange={(e) => handleInputChange('fuel_price', e.target.value)}
                            placeholder=""
                        />
                    </div>

                    {/* Capacity Factor */}
                    <div className='hidden'>
                        <Label htmlFor="downtime_percent">Downtime (%)</Label>
                        <div className="space-y-2">
                            <input
                                id="downtime_percent"
                                type="range"
                                min={0}
                                max={100}
                                value={formData.downtime_percent}
                                onChange={(e) => handleInputChange('downtime_percent', e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                            />
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>0%</span>
                                <span className="font-medium">{formData.downtime_percent}%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                        Faktor kapasitas unit terhadap spesifikasi maksimal
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}