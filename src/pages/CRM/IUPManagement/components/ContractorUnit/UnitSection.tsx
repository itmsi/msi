import { LuPlus } from 'react-icons/lu';
import BrandUnitRow from './UnitRow';
import { BrandUnitForm, BrandUnitErrors } from '../../types/iupmanagement';

interface BrandUnitSectionProps {
    brandUnits: BrandUnitForm[];
    brandUnitErrors: Record<number, BrandUnitErrors>;
    addBrandUnit: () => void;
    removeBrandUnit: (index: number) => void;
    updateBrandUnit: (index: number, field: keyof BrandUnitForm, value: string | number) => void;
}

export default function UnitSection({
    brandUnits,
    brandUnitErrors,
    addBrandUnit,
    removeBrandUnit,
    updateBrandUnit,
}: BrandUnitSectionProps) {
    return (
        <div className="w-full rounded-2xl border border-slate-300 bg-white">
            <div className="px-5 py-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide">Brand Unit</h2>
                    </div>
                </div>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                    List of brand units owned by the contractor. Each brand unit must have a valid name and unit count.
                </p>
            </div>

            {(!brandUnits || brandUnits.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    No brand unit data available. Click &ldquo;Add Unit&rdquo; to add one.
                </div>
            ) : (
                <div className="divide-slate-300 divide-y">
                    {brandUnits.map((item, index) => (
                        <BrandUnitRow
                            key={index}
                            index={index}
                            item={item}
                            error={brandUnitErrors[index]}
                            disableRemove={brandUnits.length === 1}
                            onChange={updateBrandUnit}
                            onRemove={removeBrandUnit}
                        />
                    ))}
                </div>
            )}

            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl">
                <button
                    type="button"
                    onClick={addBrandUnit}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Add Unit
                </button>
            </div>
        </div>
    );
}