import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { LuX, LuCheck, LuLoaderCircle } from 'react-icons/lu';

interface BrandUnitFormValues {
    name: string;
    qty: string | number;
}

interface BrandUnitFormErrors {
    name?: string;
    qty?: string;
}

interface BrandUnitFormProps {
    editingId: string | number | null;
    form: BrandUnitFormValues;
    errors: BrandUnitFormErrors;
    submitting: boolean;
    updateField: (field: keyof BrandUnitFormValues, value: string) => void;
    handleQtyChange: (value: string) => void;
    closeForm: () => void;
    handleSubmitForm: () => void;
}

export default function BrandUnitForm({
    editingId,
    form,
    errors,
    submitting,
    updateField,
    handleQtyChange,
    closeForm,
    handleSubmitForm,
}: BrandUnitFormProps) {
    return (
        <div className="px-5 py-4 border-b border-slate-300 bg-slate-50">
            <p className="text-sm font-primary-bold text-slate-800 mb-3">
                {editingId ? 'Edit Unit' : 'Add New Unit'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="brand-unit-name">Brand Unit</Label>
                    <Input
                        id="brand-unit-name"
                        value={form.name}
                        placeholder="Input brand unit"
                        onChange={(e) => updateField('name', e.target.value)}
                        className={errors.name ? 'border-red-500' : ''}
                        hint={errors.name}
                        error={!!errors.name}
                    />
                </div>
                <div>
                    <Label htmlFor="brand-unit-qty">Qty</Label>
                    <Input
                        id="brand-unit-qty"
                        type="number"
                        min="1"
                        value={form.qty}
                        placeholder="0"
                        onChange={(e) => handleQtyChange(e.target.value)}
                        className={errors.qty ? 'border-red-500' : ''}
                        hint={errors.qty}
                        error={!!errors.qty}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-[50px] py-2"
                    onClick={closeForm}
                    disabled={submitting}
                >
                    <LuX size={14} />
                    Cancel
                </Button>
                <Button
                    type="button"
                    className="rounded-[50px] py-2"
                    onClick={handleSubmitForm}
                    disabled={submitting}
                >
                    {submitting ? <LuLoaderCircle size={14} className="animate-spin" /> : <LuCheck size={14} />}
                    {editingId ? 'Update Unit' : 'Save Unit'}
                </Button>
            </div>
        </div>
    );
}