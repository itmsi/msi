import React from 'react';
import { MdAdd } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import UnitCard from './UnitCard';
import { ContractorUnit } from '../types/contractor';

interface UnitsSectionProps {
    units: ContractorUnit[];
    errors: Record<string, string>;
    onAddUnit: () => void;
    onRemoveUnit: (index: number) => void;
    onUnitChange: (index: number, field: keyof ContractorUnit, value: string | number) => void;
    // Brand select props
    brandOptions: any[];
    brandPagination?: { loading: boolean };
    brandInputValues: Record<number, string>;
    onBrandInputChange: (index: number, value: string) => void;
    onBrandMenuScroll: () => void;
    onBrandSelect: (index: number, option: any) => void;
}

const UnitsSection: React.FC<UnitsSectionProps> = ({
    units,
    errors,
    onAddUnit,
    onRemoveUnit,
    onUnitChange,
    brandOptions,
    brandPagination = { loading: false },
    brandInputValues,
    onBrandInputChange,
    onBrandMenuScroll,
    onBrandSelect
}) => {    
    return (
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Units</h2>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddUnit}
                    className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                    size="sm"
                >
                    <MdAdd className="w-4 h-4" />
                    Add Unit
                </Button>
            </div>

            {units.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                    No units added yet. Click "Add Unit" to get started.
                </div>
            ) : (
                <div className="space-y-4">
                    {units.map((unit, index) => (
                        <UnitCard
                            key={index}
                            unit={unit}
                            index={index}
                            errors={errors}
                            onChange={(field, value) => onUnitChange(index, field, value)}
                            onRemove={() => onRemoveUnit(index)}
                            brandOptions={brandOptions}
                            brandPagination={brandPagination}
                            brandInputValue={brandInputValues[index] || ''}
                            onBrandInputChange={(value) => onBrandInputChange(index, value)}
                            onBrandMenuScroll={onBrandMenuScroll}
                            onBrandSelect={(option) => onBrandSelect(index, option)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UnitsSection;