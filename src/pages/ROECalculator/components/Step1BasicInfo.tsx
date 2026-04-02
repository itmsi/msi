import { useCallback, useMemo, useEffect } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import IupContractorSelect from '@/components/form/select/IupContractorSelect';
import { ROECalculatorFormData, ROECalculatorValidationErrors } from '../types/roeCalculator';
import { formatNumberInputFadlan, handleDecimalInput, handleKeyPress } from '@/helpers/generalHelper';
import CustomSelect from '@/components/form/select/CustomSelect';
import { useIupSelect } from '@/hooks/useIupSelect';

interface Step1Props {
    formData: ROECalculatorFormData;
    validationErrors: ROECalculatorValidationErrors;
    loading: boolean;
    handleInputChange: (field: keyof ROECalculatorFormData, value: any) => void;
    langField: (key: string) => string;
}

export default function Step1BasicInfo({ 
    formData, 
    validationErrors, 
    loading,
    handleInputChange,
    langField 
}: Step1Props) {

    const { getIupById } = useIupSelect();

    const KOMODITAS_OPTIONS = [
        { value: 'batu_bara', label: langField('coalCommodity') },
        { value: 'nikel', label: langField('nickelCommodity') }
    ];

    const STATUS_OPTIONS = [
        { value: 'draft', label: langField('draft') }
    ];

    useEffect(() => {
        if (formData.iup_id && !formData.iup_name) {
            getIupById(formData.iup_id).then((iup) => {
                if (iup) {
                    handleInputChange('iup_name', iup.label);
                }
            });
        }
    }, [formData.iup_id]);

    // Handle IUP change
    const handleIupChange = useCallback((iup: { value: string; label: string } | null) => {
        if (iup) {
            handleInputChange('iup_id', iup.value);
            handleInputChange('iup_name', iup.label);
        } else {
            handleInputChange('iup_id', '');
            handleInputChange('iup_name', '');
            // Clear contractor when IUP is cleared
            handleInputChange('iup_customer_id', '');
            handleInputChange('customer_name', '');
        }
    }, [handleInputChange]);

    // Handle Contractor change
    const handleContractorChange = useCallback((contractor: { value: string; label: string; customer_name?: string } | null) => {
        if (contractor) {
            handleInputChange('iup_customer_id', contractor.value);
            handleInputChange('customer_name', contractor.customer_name || contractor.label || '');
        } else {
            handleInputChange('iup_customer_id', '');
            handleInputChange('customer_name', '');
        }
    }, [handleInputChange]);

    // IUP value for IupContractorSelect
    const iupValue = useMemo(() => {
        return formData.iup_id && formData.iup_name
            ? { value: formData.iup_id, label: formData.iup_name }
            : null;
    }, [formData.iup_id, formData.iup_name]);

    // Memoized Contractor value for IupContractorSelect
    const contractorValue = useMemo(() => {
        return formData.iup_customer_id && formData.customer_name
            ? { value: formData.iup_customer_id, label: formData.customer_name }
            : null;
    }, [formData.iup_customer_id, formData.customer_name]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{langField('loadingCalculatorData')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{langField('basicInformation')}</h3>
                <p className="text-sm text-gray-600 mb-6">
                    {langField('basicInfoDescription')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IUP & Contractor Selection */}
                <IupContractorSelect
                    className="md:col-span-2"
                    layout="horizontal"
                    gridCols="grid-cols-1 md:grid-cols-2"
                    iupValue={iupValue}
                    iupLabel={langField('iupSelection')}
                    iupRequired={true}
                    contractorValue={contractorValue}
                    contractorLabel={langField('contractor')}
                    contractorRequired={true}
                    contractorError={validationErrors.iup_customer_id}
                    onIupChange={handleIupChange}
                    onContractorChange={handleContractorChange}
                />

                {/* Komoditas */}
                <div>
                    <Label htmlFor="komoditas">{langField('commodity')}</Label>
                    <CustomSelect
                        id="komoditas"
                        value={KOMODITAS_OPTIONS.find(option => option.value === formData.komoditas) || null}
                        onChange={(option) => handleInputChange('komoditas', option?.value || '')}
                        options={KOMODITAS_OPTIONS}
                        className="w-full"
                        placeholder={langField('selectCommodity')}
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
                    <Label htmlFor="status">{langField('status')}</Label>
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
                    <Label htmlFor="tonase_per_ritase">{langField('tonnagePerUnit')}</Label>
                    <Input
                        id="tonase_per_ritase"
                        value={formData.tonase_per_ritase}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            
                            handleDecimalInput(
                                rawValue,
                                (validValue) => handleInputChange('tonase_per_ritase', validValue),
                                () => handleInputChange('tonase_per_ritase', null),
                                true,
                                5, // maxIntegerDigits
                                4 // maxDecimalDigits
                            );
                        }}
                        error={!!validationErrors.tonase_per_ritase}
                    />
                    {validationErrors.tonase_per_ritase && (
                        <span className="text-sm text-red-500">{validationErrors.tonase_per_ritase}</span>
                    )}
                </div>

                {/* Jarak Haul */}
                <div>
                    <Label htmlFor="jarak_haul">{langField('haulDistance')}</Label>
                    <Input
                        id="jarak_haul"
                        value={formData.jarak_haul}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            
                            handleDecimalInput(
                                rawValue,
                                (validValue) => handleInputChange('jarak_haul', validValue),
                                () => handleInputChange('jarak_haul', null),
                                true,
                                7, // maxIntegerDigits
                                4 // maxDecimalDigits
                            );
                        }}
                        error={!!validationErrors.jarak_haul}
                    />
                    {validationErrors.jarak_haul && (
                        <span className="text-sm text-red-500">{validationErrors.jarak_haul}</span>
                    )}
                </div>

                {/* Harga Jual per Ton */}
                <div>
                    <Label htmlFor="harga_jual_per_ton">{langField('sellingPricePerTon')}</Label>
                    <Input
                        id="harga_jual_per_ton"
                        onKeyPress={handleKeyPress}
                        value={formatNumberInputFadlan(formData.harga_jual_per_ton)}
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