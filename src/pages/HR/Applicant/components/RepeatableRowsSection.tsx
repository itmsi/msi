import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';

export interface RepeatableField<T> {
    key: keyof T & string;
    label: string;
    type?: 'text' | 'textarea';
    fullWidth?: boolean;
}

interface RepeatableRowsSectionProps<T extends object> {
    title: string;
    rowLabel: string;
    rows: T[];
    fields: RepeatableField<T>[];
    readOnly: boolean;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, key: keyof T & string, value: string) => void;
}

const RepeatableRowsSection = <T extends object>({
    title,
    rowLabel,
    rows,
    fields,
    readOnly,
    onAdd,
    onRemove,
    onChange,
}: RepeatableRowsSectionProps<T>) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
            <h3 className="text-md font-primary-bold font-medium text-gray-900">{title}</h3>
            {!readOnly && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                    className="flex items-center gap-1 rounded-full"
                >
                    <MdAdd className="w-4 h-4" /> Tambah
                </Button>
            )}
        </div>

        {rows.length === 0 ? (
            <p className="text-sm text-gray-500">-</p>
        ) : (
            <div className="space-y-4">
                {rows.map((row, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">{rowLabel} #{index + 1}</span>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Hapus"
                                >
                                    <MdDeleteOutline className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {fields.map(field => {
                                const value = String(row[field.key] ?? '');

                                return (
                                    <div key={field.key} className={field.fullWidth ? 'md:col-span-3' : undefined}>
                                        <Label>{field.label}</Label>
                                        {field.type === 'textarea' ? (
                                            <TextArea
                                                name={field.key}
                                                rows={3}
                                                value={value}
                                                placeholder={readOnly ? '-' : field.label}
                                                readonly={readOnly}
                                                onChange={(e) => onChange(index, field.key, e.target.value)}
                                            />
                                        ) : (
                                            <Input
                                                name={field.key}
                                                value={value}
                                                placeholder={readOnly ? '-' : field.label}
                                                readonly={readOnly}
                                                onChange={(e) => onChange(index, field.key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default RepeatableRowsSection;
