import React from 'react';
import { MdDelete, MdWarning } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { RkabEntry } from '../types/contractor';
import Label from '@/components/form/Label';

interface RkabCardProps {
    rkab: RkabEntry;
    index: number;
    errors: Record<string, string>;
    onChange: (field: keyof RkabEntry, value: number) => void;
    onRemove: () => void;
}

const RkabCard: React.FC<RkabCardProps> = ({
    rkab,
    index,
    errors,
    onChange,
    onRemove
}) => {
    // Helper to check if any field in this card has error
    const hasError = Object.keys(errors).some(key => key.startsWith(`rkab_${index}_`));

    return (
        <div className={`relative border rounded-xl p-4 transition-all duration-200 ${
            hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}>
            {/* Header / Remove Button */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                        #{index + 1}
                    </span>
                    {hasError && (
                        <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
                            <MdWarning />
                            <span>Incomplete</span>
                        </div>
                    )}
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Year */}
                <div>
                    <Label htmlFor={`rkab_year_${index}`}>
                        Year *
                    </Label>
                    <Input
                        id={`rkab_year_${index}`}
                        type="number"
                        placeholder="YYYY"
                        value={rkab.year || ''}
                        onChange={(e) => onChange('year', parseInt(e.target.value) || 0)}
                        className={`w-full ${errors[`rkab_${index}_year`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`rkab_${index}_year`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`rkab_${index}_year`]}</p>
                    )}
                </div>

                {/* Current Production */}
                <div>
                    <Label htmlFor={`rkab_current_production_${index}`}>
                        Current Production *
                    </Label>
                    <Input
                        id={`rkab_current_production_${index}`}
                        type="number"
                        placeholder="0"
                        value={rkab.current_production || ''}
                        onChange={(e) => onChange('current_production', parseInt(e.target.value) || 0)}
                        className={`w-full ${errors[`rkab_${index}_current_production`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`rkab_${index}_current_production`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`rkab_${index}_current_production`]}</p>
                    )}
                </div>

                {/* Target Production */}
                <div>
                    <Label htmlFor={`rkab_target_production_${index}`}>
                        Target Production *
                    </Label>
                    <Input
                        id={`rkab_target_production_${index}`}
                        type="number"
                        placeholder="0"
                        value={rkab.target_production || ''}
                        onChange={(e) => onChange('target_production', parseInt(e.target.value) || 0)}
                        className={`w-full ${errors[`rkab_${index}_target_production`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`rkab_${index}_target_production`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`rkab_${index}_target_production`]}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RkabCard;
