import { LuPencil, LuTrash2, LuLoaderCircle } from 'react-icons/lu';
import Button from '@/components/ui/button/Button';
import type { IupBrandUnitItem } from '../../types/iupmanagement';

interface BrandUnitItemProps {
    item: IupBrandUnitItem;
    index: number;
    submitting: boolean;
    deletingId: string | null;
    openEditForm: (item: IupBrandUnitItem) => void;
    deleteBrandUnit: (id: string) => void;
}

export default function UnitCard({
    item,
    index,
    submitting,
    deletingId,
    openEditForm,
    deleteBrandUnit,
}: BrandUnitItemProps) {
    return (
        <div className="px-5 py-4 hover:bg-[#dfe8f2]/20 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs text-slate-500">#{index + 1}</p>
                    <p className="text-sm font-primary-bold text-slate-800">{item.iup_brand_unit_name}</p>
                    <p className="text-xs text-slate-600 mt-1">Qty: {item.iup_brand_unit_qty}</p>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="transparent"
                        size="sm"
                        className="p-2"
                        onClick={() => openEditForm(item)}
                        disabled={submitting}
                    >
                        <LuPencil size={15} />
                    </Button>
                    <Button
                        type="button"
                        variant="transparent"
                        size="sm"
                        className="p-2 text-red-600 hover:text-red-700"
                        onClick={() => deleteBrandUnit(item.iup_brand_unit_id)}
                        disabled={deletingId === item.iup_brand_unit_id || submitting}
                    >
                        {deletingId === item.iup_brand_unit_id ? (
                            <LuLoaderCircle size={15} className="animate-spin" />
                        ) : (
                            <LuTrash2 size={15} />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}