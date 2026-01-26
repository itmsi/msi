import React from 'react';
import { MdAdd } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import RkabCard from './RkabCard';
import { RkabEntry } from '../types/contractor';

interface RkabSectionProps {
    rkabEntries: RkabEntry[];
    errors: Record<string, string>;
    onAddRkab: () => void;
    onRemoveRkab: (index: number) => void;
    onRkabChange: (index: number, field: keyof RkabEntry, value: number) => void;
}

const RkabSection: React.FC<RkabSectionProps> = ({
    rkabEntries,
    errors,
    onAddRkab,
    onRemoveRkab,
    onRkabChange
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">RKAB</h2>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddRkab}
                    className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                    size="sm"
                >
                    <MdAdd className="w-4 h-4" />
                    Add RKAB
                </Button>
            </div>

            {(!rkabEntries || rkabEntries.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    No RKAB entries added yet. Click "Add RKAB" to add yearly production data.
                </div>
            ) : (
                <div className="space-y-4">
                    {rkabEntries.map((rkab, index) => (
                        <RkabCard
                            key={index}
                            rkab={rkab}
                            index={index}
                            errors={errors}
                            onChange={(field, value) => onRkabChange(index, field, value)}
                            onRemove={() => onRemoveRkab(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RkabSection;
