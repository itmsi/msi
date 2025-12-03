import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { ROECalculatorFormData, ROECalculatorValidationErrors, QuoteDefaults } from '../types/roeCalculator';
import { handleKeyPress } from '@/helpers/generalHelper';

interface Step3Props {
    formData: ROECalculatorFormData;
    validationErrors: ROECalculatorValidationErrors;
    handleInputChange: (field: keyof ROECalculatorFormData, value: any) => void;
    quoteDefaults: QuoteDefaults | null;
    onLoadDefaults: () => Promise<void>;
}

export default function Step3Operational({ 
    formData, 
    validationErrors, 
    handleInputChange
}: Step3Props) {
    console.log({
        formData
    });
    
    const STATUS_OPTIONS = [
        { value: 'L/km', label: 'L/km (per kilometer)' },
        { value: 'L/km/ton', label: 'L/km/ton (per km per ton)' }
    ];
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
                        value={formData.ritase_per_shift || formData?.operation_data?.ritase_per_shift || ''}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleInputChange('ritase_per_shift', value)
                        }}
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
                        onKeyPress={handleKeyPress}
                        value={formData.shift_per_hari || formData?.operation_data?.shift_per_hari || ''}
                        onChange={(e) => {
                            handleInputChange('shift_per_hari', e.target.value)
                        }}
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
                        onKeyPress={handleKeyPress}
                        value={formData.hari_kerja_per_bulan || formData?.operation_data?.hari_kerja_per_bulan || ''}
                        onChange={(e) => handleInputChange('hari_kerja_per_bulan', parseInt(e.target.value) || 0)}
                        error={!!validationErrors.hari_kerja_per_bulan}
                    />
                    {validationErrors.hari_kerja_per_bulan && (
                        <span className="text-sm text-red-500">{validationErrors.hari_kerja_per_bulan}</span>
                    )}
                </div>

                {/* Utilization Rate Slider */}
                <div>
                    <Label htmlFor="utilization_percent">Utilization Rate (%)</Label>
                    <div className="space-y-2">
                        <input
                            id="utilization_percent"
                            type="range"
                            min={0}
                            max={100}
                            value={formData.utilization_percent}
                            onChange={(e) => handleInputChange('utilization_percent', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>0%</span>
                            <span className="font-medium">{formData.utilization_percent}%</span>
                            <span>100%</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Tingkat utilisasi unit dalam operasional
                    </p>
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
                <h4 className="font-medium text-gray-900 mb-4">Parameter Tambahan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Working Days */}
                    <div>
                        <Label htmlFor="fuel_consumption_type">Tipe Konsumsi BBM</Label>
                        <select
                            id="fuel_consumption_type"
                            value={formData.fuel_consumption_type}
                            onChange={(e) => handleInputChange('fuel_consumption_type', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            {STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="fuel_consumption">Konsumsi BBM (L/km)</Label>
                        <Input
                            id="fuel_consumption"
                            type="number"
                            min="0"
                            value={formData?.fuel_consumption || ''}
                            onChange={(e) => handleInputChange('fuel_consumption', e.target.value)}
                            placeholder="0.5"
                        />
                    </div>

                    <div>
                        <Label htmlFor="fuel_price">Harga BBM (Rp/L)</Label>
                        <Input
                            id="fuel_price"
                            type="number"
                            min="0"
                            value={formData?.fuel_price || ''}
                            onChange={(e) => handleInputChange('fuel_price', e.target.value)}
                            placeholder="6800"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Jumlah hari kerja efektif per bulan
                        </p>
                    </div>

                    {/* Capacity Factor */}
                    <div>
                        <Label htmlFor="downtime_percent">Downtime (%)</Label>
                        <div className="space-y-2">
                            <input
                                id="downtime_percent"
                                type="range"
                                min={50}
                                max={100}
                                value={formData.downtime_percent}
                                onChange={(e) => handleInputChange('downtime_percent', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                            />
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>50%</span>
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