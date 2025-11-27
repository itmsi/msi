import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdSave } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { handleKeyPress, formatNumberInput } from '@/helpers/generalHelper';
import { SettingsService } from './services/settingsService';
import Loading from '@/components/common/Loading';

interface SettingsFormData {
    // Operasional
    ritase_per_shift: string;
    shift_per_hari: string;
    hari_kerja_per_bulan: string;
    utilization_percent: string;
    
    // Biaya
    konsumsi_bbm_per_km: string;
    harga_bbm: string;
    tyre_expense_monthly: string;
    sparepart_expense_monthly: string;
    salary_operator_monthly: string;
    
    // Financial
    depreciation_monthly: string;
    interest_monthly: string;
    overhead_monthly: string;
    equity: string;
    liability: string;
}

export default function ROESettings() {
    const [formData, setFormData] = useState<SettingsFormData>({
        ritase_per_shift: '',
        shift_per_hari: '',
        hari_kerja_per_bulan: '',
        utilization_percent: '',
        
        konsumsi_bbm_per_km: '',
        harga_bbm: '',
        tyre_expense_monthly: '',
        sparepart_expense_monthly: '',
        salary_operator_monthly: '',
        
        depreciation_monthly: '',
        interest_monthly: '',
        overhead_monthly: '',
        equity: '',
        liability: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch settings saat component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await SettingsService.getSettings();
            
            if (response.success && response.data.data.length > 0) {
                const settingsData = response.data.data[0];
                
                // Map response ke form data
                setFormData({
                    ritase_per_shift: settingsData.ritase_per_shift?.toString() || '',
                    shift_per_hari: settingsData.shift_per_hari?.toString() || '',
                    hari_kerja_per_bulan: settingsData.hari_kerja_per_bulan?.toString() || '',
                    utilization_percent: settingsData.utilization_percent?.toString() || '',
                    
                    konsumsi_bbm_per_km: settingsData.fuel_consumption?.toString() || '',
                    harga_bbm: settingsData.fuel_price?.toString() || '',
                    tyre_expense_monthly: settingsData.tyre_expense_monthly?.toString() || '',
                    sparepart_expense_monthly: settingsData.sparepart_expense_monthly?.toString() || '',
                    salary_operator_monthly: settingsData.salary_operator_monthly?.toString() || '',
                    
                    depreciation_monthly: settingsData.depreciation_monthly?.toString() || '',
                    interest_monthly: settingsData.interest_monthly?.toString() || '',
                    overhead_monthly: settingsData.overhead_monthly?.toString() || '',
                    equity: settingsData.equity?.toString() || '',
                    liability: settingsData.liability?.toString() || '',
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input untuk field numeric
    const handleNumericInput = (field: keyof SettingsFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle input untuk field percentage
    const handlePercentInput = (field: keyof SettingsFormData, value: string) => {
        const numeric = value.replace(/[^\d]/g, '');
        if (numeric === '' || (parseInt(numeric) >= 0 && parseInt(numeric) <= 100)) {
            setFormData(prev => ({ ...prev, [field]: numeric }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            // Convert string to number untuk payload
            const payload = {
                ritase_per_shift: parseFloat(formData.ritase_per_shift.replace(/\./g, '')) || 0,
                shift_per_hari: parseFloat(formData.shift_per_hari.replace(/\./g, '')) || 0,
                hari_kerja_per_bulan: parseFloat(formData.hari_kerja_per_bulan.replace(/\./g, '')) || 0,
                utilization_percent: parseFloat(formData.utilization_percent) || 0,
                
                fuel_consumption: parseFloat(formData.konsumsi_bbm_per_km) || 0,
                fuel_price: parseFloat(formData.harga_bbm.replace(/\./g, '')) || 0,
                tyre_expense_monthly: parseFloat(formData.tyre_expense_monthly.replace(/\./g, '')) || 0,
                sparepart_expense_monthly: parseFloat(formData.sparepart_expense_monthly.replace(/\./g, '')) || 0,
                salary_operator_monthly: parseFloat(formData.salary_operator_monthly.replace(/\./g, '')) || 0,
                
                depreciation_monthly: parseFloat(formData.depreciation_monthly.replace(/\./g, '')) || 0,
                interest_monthly: parseFloat(formData.interest_monthly.replace(/\./g, '')) || 0,
                overhead_monthly: parseFloat(formData.overhead_monthly.replace(/\./g, '')) || 0,
                equity: parseFloat(formData.equity.replace(/\./g, '')) || 0,
                liability: parseFloat(formData.liability.replace(/\./g, '')) || 0,
            };

            await SettingsService.updateSettings(payload);
            toast.success('Settings saved successfully');
            
            // Refresh data setelah save
            await fetchSettings();
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Loading state
    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            <PageMeta
                title="ROE Calculator Settings - MSI Dashboard"
                description="Configure ROE Calculator parameters"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div>
                            <h1 className="font-primary-bold text-xl">ROE Calculator Settings</h1>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Parameter Operasional */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-5">
                                Parameter Operasional
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="ritase_per_shift">Ritase per Shift</Label>
                                    <Input
                                        id="ritase_per_shift"
                                        type="text"
                                        value={formatNumberInput(formData.ritase_per_shift)}
                                        onChange={(e) => handleNumericInput('ritase_per_shift', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="2"
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="shift_per_hari">Shift per Hari</Label>
                                    <Input
                                        id="shift_per_hari"
                                        type="text"
                                        value={formatNumberInput(formData.shift_per_hari)}
                                        onChange={(e) => handleNumericInput('shift_per_hari', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="2"
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="hari_kerja_per_bulan">Hari Kerja per Bulan</Label>
                                    <Input
                                        id="hari_kerja_per_bulan"
                                        type="text"
                                        value={formatNumberInput(formData.hari_kerja_per_bulan)}
                                        onChange={(e) => handleNumericInput('hari_kerja_per_bulan', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="26"
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="utilization_percent">Utilization (%)</Label>
                                    <div className="relative">
                                        <Input
                                            id="utilization_percent"
                                            type="text"
                                            value={formData.utilization_percent}
                                            onChange={(e) => handlePercentInput('utilization_percent', e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="85"
                                            maxLength={3}
                                            className="pr-8"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-gray-500 text-sm">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parameter Biaya */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-5">
                                Parameter Biaya
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="konsumsi_bbm_per_km">Konsumsi BBM per KM (Liter)</Label>
                                    <Input
                                        id="konsumsi_bbm_per_km"
                                        type="text"
                                        value={formData.konsumsi_bbm_per_km}
                                        onChange={(e) => handleNumericInput('konsumsi_bbm_per_km', e.target.value)}
                                        placeholder="0.25"
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="harga_bbm">Harga BBM (Rp/Liter)</Label>
                                    <Input
                                        id="harga_bbm"
                                        type="text"
                                        value={formatNumberInput(formData.harga_bbm)}
                                        onChange={(e) => handleNumericInput('harga_bbm', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="6.800"
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tyre_expense_monthly">Biaya Ban per Bulan (Rp)</Label>
                                    <Input
                                        id="tyre_expense_monthly"
                                        type="text"
                                        value={formatNumberInput(formData.tyre_expense_monthly)}
                                        onChange={(e) => handleNumericInput('tyre_expense_monthly', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="2.500.000"
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="sparepart_expense_monthly">Biaya Sparepart per Bulan (Rp)</Label>
                                    <Input
                                        id="sparepart_expense_monthly"
                                        type="text"
                                        value={formatNumberInput(formData.sparepart_expense_monthly)}
                                        onChange={(e) => handleNumericInput('sparepart_expense_monthly', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="1.500.000"
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="salary_operator_monthly">Gaji Operator per Bulan (Rp)</Label>
                                    <Input
                                        id="salary_operator_monthly"
                                        type="text"
                                        value={formatNumberInput(formData.salary_operator_monthly)}
                                        onChange={(e) => handleNumericInput('salary_operator_monthly', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="5.000.000"
                                        maxLength={15}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Parameter Financial */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-5">
                                Parameter Financial
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="depreciation_monthly">Depresiasi per Bulan (Rp)</Label>
                                    <Input
                                        id="depreciation_monthly"
                                        type="text"
                                        value={formatNumberInput(formData.depreciation_monthly)}
                                        onChange={(e) => handleNumericInput('depreciation_monthly', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="8.000.000"
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="interest_monthly">Interest per Bulan (Rp)</Label>
                                    <Input
                                        id="interest_monthly"
                                        type="text"
                                        value={formatNumberInput(formData.interest_monthly)}
                                        onChange={(e) => handleNumericInput('interest_monthly', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="3.000.000"
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="overhead_monthly">Overhead per Bulan (Rp)</Label>
                                    <Input
                                        id="overhead_monthly"
                                        type="text"
                                        value={formatNumberInput(formData.overhead_monthly)}
                                        onChange={(e) => handleNumericInput('overhead_monthly', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="2.000.000"
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="equity">Equity (Rp)</Label>
                                    <Input
                                        id="equity"
                                        type="text"
                                        value={formatNumberInput(formData.equity)}
                                        onChange={(e) => handleNumericInput('equity', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="500.000.000"
                                        maxLength={15}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="liability">Liability (Rp)</Label>
                                    <Input
                                        id="liability"
                                        type="text"
                                        value={formatNumberInput(formData.liability)}
                                        onChange={(e) => handleNumericInput('liability', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="300.000.000"
                                        maxLength={15}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 p-6 bg-white rounded-2xl shadow-sm">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2"
                            >
                                <MdSave size={16} />
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
