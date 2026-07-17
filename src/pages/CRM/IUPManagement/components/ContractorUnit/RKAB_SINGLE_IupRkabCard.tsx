import React from 'react';
import { MdDelete, MdCheck } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { IupRkabFormItem } from '../../types/iupmanagement';
import { handleDecimalInput, handleKeyPress } from '@/helpers/generalHelper';

interface IupRkabCardProps {
    rkab: IupRkabFormItem;
    index: number;
    errors: Record<string, string>;
    isSubmitting?: boolean;
    onChange: (field: keyof IupRkabFormItem, value: string) => void;
    onSave: () => void;
    onRemove: () => void;
}

const IupRkabCard: React.FC<IupRkabCardProps> = ({
    rkab,
    index,
    errors,
    isSubmitting,
    onChange,
    onSave,
    onRemove,
}) => {
    const hasError = Object.values(errors).some(Boolean);

    return (
        <div className={`relative px-5 py-4 transition-all duration-200 ${
            hasError ? 'border-red-300 bg-red-50' : 'hover:bg-[#dfe8f2]/20'
        }`}>
            <div className="flex justify-between items-center mb-4">
                <span className="flex items-center justify-center w-6 h-6 text-xs font-primary-bold text-gray-600">
                    #{index + 1}
                </span>
                <Button
                    type="button"
                    variant="transparent"
                    size="sm"
                    onClick={onRemove}
                    className="text-gray-400 hover:text-red-500 p-1 h-auto"
                >
                    <MdDelete size={18} />
                </Button>
            </div>

            <div className="flex gap-4 items-end">
                <div className="flex-1 min-h-[90px]">
                    <Label htmlFor={`rkab_year_${index}`}>Tahun *</Label>
                    <Input
                        id={`rkab_year_${index}`}
                        placeholder="YYYY"
                        maxLength={4}
                        value={rkab.iup_rkab_year}
                        onChange={(e) => onChange('iup_rkab_year', e.target.value)}
                        onKeyPress={handleKeyPress}
                        className={errors.iup_rkab_year ? 'border-red-500' : ''}
                    />
                    {errors.iup_rkab_year && (
                        <p className="text-red-500 text-xs mt-1">{errors.iup_rkab_year}</p>
                    )}
                </div>

                <div className="flex-1 min-h-[90px]">
                    <Label htmlFor={`rkab_current_${index}`}>Current Production *</Label>
                    <Input
                        id={`rkab_current_${index}`}
                        placeholder="0"
                        value={rkab.iup_rkab_current_production}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            
                            handleDecimalInput(
                                rawValue,
                                (validValue) => onChange('iup_rkab_current_production', validValue),
                                () => onChange('iup_rkab_current_production', ''),
                                true,
                                9, // maxIntegerDigits
                                4 // maxDecimalDigits
                            );
                        }}
                        className={errors.iup_rkab_current_production ? 'border-red-500' : ''}
                    />
                    {errors.iup_rkab_current_production && (
                        <p className="text-red-500 text-xs mt-1">{errors.iup_rkab_current_production}</p>
                    )}
                </div>

                <div className="flex-1 min-h-[90px]">
                    <Label htmlFor={`rkab_target_${index}`}>Target Production *</Label>
                    <Input
                        id={`rkab_target_${index}`}
                        placeholder="0"
                        value={rkab.iup_rkab_target_production}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            
                            handleDecimalInput(
                                rawValue,
                                (validValue) => onChange('iup_rkab_target_production', validValue),
                                () => onChange('iup_rkab_target_production', ''),
                                true,
                                9, // maxIntegerDigits
                                4 // maxDecimalDigits
                            );
                        }}
                        className={errors.iup_rkab_target_production ? 'border-red-500' : ''}
                    />
                    {errors.iup_rkab_target_production && (
                        <p className="text-red-500 text-xs mt-1">{errors.iup_rkab_target_production}</p>
                    )}
                </div>
                <div className="min-h-[90px] pb-[20px] flex items-end">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={onSave}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5"
                    >
                        <MdCheck size={16} />
                        Simpan
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default IupRkabCard;
