import { LuPlus } from 'react-icons/lu';
import RkabRow from './RkabRow';
import { RkabForm, RkabErrors } from '../../types/iupmanagement';

interface RkabSectionProps {
    rkabs: RkabForm[];
    rkabErrors: Record<number, RkabErrors>;
    addRkab: () => void;
    removeRkab: (index: number) => void;
    updateRkab: (index: number, field: keyof RkabForm, value: string | number) => void;
}

export default function RkabSection({
    rkabs,
    rkabErrors,
    addRkab,
    removeRkab,
    updateRkab,
}: RkabSectionProps) {
    return (
        <div className="w-full rounded-2xl border border-slate-300 bg-white">
            <div className="px-5 py-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide">RKAB</h2>
                    </div>
                </div>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                    Rencana Kerja Anggaran Biaya (RKAB) is a document outlining production plans and targets for each year. Each RKAB must include a valid year, current production, and production target.
                </p>
            </div>

            {(!rkabs || rkabs.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    No RKAB data available. Click &ldquo;Add RKAB&rdquo; to add one.
                </div>
            ) : (
                <div className="divide-slate-300 divide-y">
                    {rkabs.map((item, index) => (
                        <RkabRow
                            key={index}
                            index={index}
                            item={item}
                            error={rkabErrors[index]}
                            disableRemove={rkabs.length === 1}
                            onChange={updateRkab}
                            onRemove={removeRkab}
                        />
                    ))}
                </div>
            )}

            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl">
                <button
                    type="button"
                    onClick={addRkab}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Add RKAB
                </button>
            </div>
        </div>
    );
}