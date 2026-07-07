import { useEffect, useState } from 'react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useIupSelect, type IupSelectOption } from '@/hooks/useIupSelect';
import type { IupFormData } from '../types/iupterritory';

interface IUPFormProps {
    formData: IupFormData;
    errors: Record<string, string>;
    onSelectChange: (field: string, value: string) => void;
}

export default function IUPForm({ formData, errors, onSelectChange }: IUPFormProps) {
    const {
        iupOptions,
        pagination,
        inputValue: iupInputValue,
        handleInputChange: handleIupInputChange,
        handleMenuScrollToBottom: handleIupMenuScrollToBottom,
        initializeOptions: initializeIupOptions,
        getIupById
    } = useIupSelect();
    const [selectedIup, setSelectedIup] = useState<IupSelectOption | null>(null);

    useEffect(() => {
        initializeIupOptions();
    }, [initializeIupOptions]);

    useEffect(() => {
        let aktif = true;

        const syncSelectedIup = async () => {
            if (!formData.iup_id) {
                setSelectedIup(null);
                return;
            }

            if (selectedIup?.value === formData.iup_id) {
                return;
            }

            const opsiTersimpan = iupOptions.find((opsi) => opsi.value === formData.iup_id);
            if (opsiTersimpan) {
                setSelectedIup(opsiTersimpan);
                return;
            }

            const opsi = await getIupById(formData.iup_id);
            if (aktif) {
                setSelectedIup(opsi);
            }
        };

        syncSelectedIup();

        return () => {
            aktif = false;
        };
    }, [formData.iup_id, getIupById, iupOptions, selectedIup?.value]);

    const handleIupChange = (opsi: IupSelectOption | null) => {
        setSelectedIup(opsi);
        onSelectChange('iup_id', opsi?.value || '');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900">IUP Territory</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label>
                        IUP Selection <span className="text-red-500">*</span>
                    </Label>
                    <CustomAsyncSelect
                        placeholder="Select IUP..."
                        value={selectedIup}
                        defaultOptions={iupOptions}
                        loadOptions={handleIupInputChange}
                        onMenuScrollToBottom={handleIupMenuScrollToBottom}
                        isLoading={pagination.loading}
                        inputValue={iupInputValue}
                        onInputChange={handleIupInputChange}
                        onChange={(opsi) => handleIupChange(opsi as IupSelectOption | null)}
                        noOptionsMessage={() => 'No IUP found'}
                        loadingMessage={() => 'Loading IUPs...'}
                        className={`w-full md:col-span-2 ${
                            errors.segmentation_id ? 'border rounded-[0.5rem] border-red-500' : ''
                        }`}
                        // error={!!errors.iup_id}
                    />
                    {errors.iup_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.iup_id}</p>
                    )}
                </div>

                <div>
                    <Label>Latitude</Label>
                    <Input
                        value={formData.iup_latitude || ''}
                        readonly
                        placeholder="Pin location from map"
                    />
                </div>

                <div>
                    <Label>Longitude</Label>
                    <Input
                        value={formData.iup_longitude || ''}
                        readonly
                        placeholder="Pin location from map"
                    />
                </div>
            </div>
        </div>
    );
}
