import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Checkbox from '@/components/form/input/Checkbox';
import Button from '@/components/ui/button/Button';
import { DatePickerField } from '@/components/datepicker/DatePickerField';
import { formatDateLocal, formatNumberInput } from '@/helpers/generalHelper';
import { useLanguage } from '@/components/lang/useLanguage';
import { parseApplicantDate, toApplicantDateValue, toDateInputValue } from '../utils/applicantForm';
import { applicantLabels } from '../language/applicantLabels';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export interface RepeatableField<T> {
    key: keyof T & string;
    label: string | ((row: T) => string);
    type?: 'text' | 'textarea' | 'choice' | 'date' | 'number';
    options?: { value: string; label: string }[];
    fullWidth?: boolean;
}

interface RepeatableRowsSectionProps<T extends object> {
    id: string;
    title: string;
    rowLabel: string | ((row: T, index: number) => string);
    rows: T[];
    fields: RepeatableField<T>[];
    readOnly: boolean;
    onAdd?: () => void;
    onRemove?: (index: number) => void;
    onChange: (index: number, key: keyof T & string, value: string) => void;
}

const RepeatableRowsSection = <T extends object>({
    id,
    title,
    rowLabel,
    rows,
    fields,
    readOnly,
    onAdd,
    onRemove,
    onChange,
}: RepeatableRowsSectionProps<T>) => {
    const { langField } = useLanguage(applicantLabels);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-primary-bold text-center pb-3 border-b border-b-gray-300 uppercase text-gray-900">{title}</h3>

            {rows.length === 0 ? (
                <p className="text-sm text-gray-500">-</p>
            ) : (
                <div className="space-y-4">
                    {rows.map((row, index) => (
                        <div key={index} className={`${readOnly ? '' : 'border border-gray-200 rounded-xl p-4'} `}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-primary-bold text-gray-700">
                                    {typeof rowLabel === 'function' ? rowLabel(row, index) : `${rowLabel} #${index + 1}`}
                                </span>
                                {!readOnly && onRemove && (
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title={langField('remove')}
                                    >
                                        <MdDeleteOutline className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className={`grid grid-cols-1 ${id !== 'working_experiences' ? `md:grid-cols-${fields.length}` : `md:grid-cols-${fields.length - 1}`} gap-4`}>
                                {fields.map(field => {
                                    const value = String(row[field.key] ?? '');
                                    const label = typeof field.label === 'function' ? field.label(row) : field.label;
                                    const inputId = `${id}_${index}_${field.key}`;

                                    if (field.type === 'choice') {
                                        const options = field.options || [];
                                        const matchedOption = options.find(option => option.value.toLowerCase() === value.trim().toLowerCase());

                                        return (
                                            <div key={field.key} className={field.fullWidth ? 'md:col-span-5' : undefined}>
                                                <Label>{label}</Label>
                                                <div className="flex flex-wrap items-center gap-6 min-h-10.5">
                                                    {options.map(option => (
                                                        <Checkbox
                                                            key={option.value}
                                                            id={`${inputId}_${option.value.replace(/\s+/g, '_')}`}
                                                            label={option.label}
                                                            checked={matchedOption?.value === option.value}
                                                            disabled={readOnly}
                                                            onChange={(checked) => onChange(index, field.key, checked ? option.value : '')}
                                                        />
                                                    ))}
                                                </div>
                                                {value.trim() && !matchedOption && (
                                                    <p className="mt-1 text-xs text-gray-500">{langField('savedAnswer')}: {value}</p>
                                                )}
                                            </div>
                                        );
                                    }

                                    if (field.type === 'date') {
                                        const dateValue = toDateInputValue(value);

                                        return (
                                            <div key={field.key} className={field.fullWidth ? 'md:col-span-5' : undefined}>
                                                <DatePickerField
                                                    name={field.key}
                                                    label={label}
                                                    value={value}
                                                    placeholder={readOnly ? '-' : label}
                                                    readOnly={readOnly}
                                                    onChange={(_, nextValue) => onChange(index, field.key, nextValue)}
                                                    parseValueToDate={parseApplicantDate}
                                                    convertDateToValue={toApplicantDateValue}
                                                    formatDisplayValue={(val) => formatDateLocal(toDateInputValue(val))}
                                                    formatReadOnlyValue={(date) => formatDateLocal(toApplicantDateValue(date))}
                                                />
                                                {value.trim() && !dateValue && (
                                                    <p className="mt-1 text-xs text-gray-500">{langField('savedValue')}: {value}</p>
                                                )}
                                            </div>
                                        );
                                    }

                                    if (field.type === 'number') {
                                        return (
                                            <div key={field.key} className={field.fullWidth ? 'md:col-span-5' : undefined}>
                                                <Label htmlFor={inputId}>{label}</Label>
                                                <Input
                                                    id={inputId}
                                                    name={field.key}
                                                    autoComplete="off"
                                                    value={formatNumberInput(value)}
                                                    placeholder={readOnly ? '-' : label}
                                                    readonly={readOnly}
                                                    onChange={(e) => onChange(index, field.key, e.target.value.replace(/\D/g, ''))}
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={field.key} className={field.fullWidth ? 'md:col-span-5' : undefined}>
                                            <Label htmlFor={inputId}>{label}</Label>
                                            {field.type === 'textarea' ? (
                                                <TextArea
                                                    id={inputId}
                                                    name={field.key}
                                                    autoComplete="off"
                                                    rows={3}
                                                    value={value}
                                                    placeholder={readOnly ? '-' : label}
                                                    readonly={readOnly}
                                                    onChange={(e) => onChange(index, field.key, e.target.value)}
                                                />
                                            ) : (
                                                <Input
                                                    id={inputId}
                                                    name={field.key}
                                                    autoComplete="off"
                                                    value={value}
                                                    placeholder={readOnly ? '-' : label}
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

            {!readOnly && onAdd && (
                <div className="flex items-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAdd}
                        className="flex items-center gap-1 rounded-full"
                    >
                        <MdAdd className="w-4 h-4" /> {langField('add')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RepeatableRowsSection;
