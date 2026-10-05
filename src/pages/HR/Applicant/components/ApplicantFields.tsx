import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Checkbox from '@/components/form/input/Checkbox';
import CustomSelect from '@/components/form/select/CustomSelect';
import { DatePickerField } from '@/components/datepicker/DatePickerField';
import { formatDateLocal } from '@/helpers/generalHelper';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantFormScalarField, ApplicantFormUpdateRequest } from '../types/applicant';
import { ApplicantFormErrors } from '../hooks/useApplicantEdit';
import { applicantLabels } from '../language/applicantLabels';
import {
    APPLICANT_FIELD_GROUPS,
    parseApplicantDate,
    toApplicantDateValue,
    toDateInputValue,
} from '../utils/applicantForm';

const DRIVER_LICENSE_OPTIONS = ['SIM A', 'SIM B', 'SIM C', 'SIO'];

interface ApplicantFieldsProps {
    values: ApplicantFormUpdateRequest;
    errors: ApplicantFormErrors;
    readOnly: boolean;
    onChange: (field: ApplicantFormScalarField, value: string) => void;
    onDriverLicenseToggle: (name: string, checked: boolean) => void;
}

const ApplicantFields = ({ values, errors, readOnly, onChange, onDriverLicenseToggle }: ApplicantFieldsProps) => {
    const { langField } = useLanguage(applicantLabels);
    const ownedLicenses = values.driver_license.map(license => license.name);
    const licenseOptions = [
        ...DRIVER_LICENSE_OPTIONS,
        ...ownedLicenses.filter(name => name && !DRIVER_LICENSE_OPTIONS.includes(name)),
    ];

    return (
        <>
            {APPLICANT_FIELD_GROUPS.map(group => (
                <div key={group.titleKey} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-primary-bold text-center pb-3 border-b border-b-gray-300 uppercase text-gray-900">{langField(group.titleKey)}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.fields.map(({ field, labelKey, type = 'text', options, required, fullWidth }) => {
                            const label = langField(labelKey);
                            const errorKey = errors[field];
                            const value = String(values[field] ?? '');
                            const choiceOptions = options || [];
                            const matchedOption = choiceOptions.find(option => option.value.toLowerCase() === value.trim().toLowerCase());
                            // Nilai tersimpan yang tidak ada di daftar opsi tetap ditampilkan sebagai opsi tambahan,
                            // supaya data lama tidak hilang begitu saja saat form dibuka.
                            const savedOption = !matchedOption && value.trim() ? { value: value.trim(), label: value.trim() } : null;
                            const selectOptions = savedOption ? [...choiceOptions, savedOption] : choiceOptions;
                            const selectedOption = matchedOption ?? savedOption;
                            // DatePickerField membawa label dan pesan errornya sendiri, jadi keduanya tidak dirender ulang di sini.
                            const useDatePicker = type === 'date' && !readOnly;
                            const useSelect = type === 'select' && !readOnly;
                            const isReadOnlyDate = type === 'date' && readOnly;
                            const inputType = type === 'email' ? 'email' : 'text';

                            return (
                                <div key={field} className={`${fullWidth ? 'md:col-span-2' : ''} ${readOnly ? 'flex items-center gap-5' : ''}`}>
                                    {!useDatePicker && (
                                        <Label htmlFor={field} className={`${readOnly ? 'w-50' : ''}`}>
                                            {label} {required && !readOnly && <span className="text-red-500">*</span>}
                                        </Label>
                                    )}
                                    {useDatePicker ? (
                                        <DatePickerField
                                            name={field}
                                            label={label}
                                            required={required}
                                            value={value}
                                            placeholder={label}
                                            error={errorKey ? langField(errorKey) : undefined}
                                            onChange={(_, nextValue) => onChange(field, nextValue)}
                                            parseValueToDate={parseApplicantDate}
                                            convertDateToValue={toApplicantDateValue}
                                            formatDisplayValue={(val) => formatDateLocal(toDateInputValue(val))}
                                        />
                                    ) : useSelect ? (
                                        <div>
                                            <CustomSelect
                                                id={field}
                                                name={field}
                                                value={selectedOption}
                                                onChange={(option) => onChange(field, option?.value || '')}
                                                options={selectOptions}
                                                placeholder={label}
                                                error={errorKey ? langField(errorKey) : undefined}
                                                isClearable={false}
                                                isSearchable={false}
                                            />
                                        </div>
                                    ) : type === 'textarea' ? (
                                        <div className={`${readOnly ? 'flex-1' : ''}`}>
                                            <TextArea
                                                id={field}
                                                name={field}
                                                autoComplete="off"
                                                rows={1}
                                                value={values[field]}
                                                placeholder={readOnly ? '-' : label}
                                                readonly={readOnly}
                                                error={Boolean(errorKey)}
                                                onChange={(e) => onChange(field, e.target.value)}
                                            />
                                        </div>
                                    ) : type === 'choice' ? (
                                        <div className={`${readOnly ? 'flex-1' : ''}`}>
                                            <div className={`flex flex-wrap items-center gap-6 min-h-10.5 ${readOnly ? 'justify-end' : ''}`}>
                                                {choiceOptions.map(option => (
                                                    <Checkbox
                                                        key={option.value}
                                                        id={`${field}_${option.value.replace(/\s+/g, '_')}`}
                                                        label={option.label}
                                                        checked={matchedOption?.value === option.value}
                                                        disabled={readOnly}
                                                        onChange={(checked) => onChange(field, checked ? option.value : '')}
                                                    />
                                                ))}
                                            </div>
                                            {value.trim() && !matchedOption && (
                                                <p className="mt-1 text-xs text-gray-500">{langField('savedAnswer')}: {value}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`${readOnly ? 'flex-1 text-end' : undefined}`}>
                                            <Input
                                                id={field}
                                                name={field}
                                                autoComplete="off"
                                                type={inputType}
                                                value={isReadOnlyDate ? formatDateLocal(toDateInputValue(value)) : value}
                                                placeholder={readOnly ? '-' : label}
                                                readonly={readOnly}
                                                error={Boolean(errorKey)}
                                                onChange={(e) => onChange(field, e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {errorKey && !useDatePicker && <p className="mt-1 text-xs text-red-500">{langField(errorKey)}</p>}
                                </div>
                            );
                        })}

                        {group.withDriverLicense && (
                            <div className="md:col-span-2 flex items-center gap-5">
                                <Label>{langField('driverLicense')}</Label>
                                <div className="flex flex-wrap gap-6 min-h-10.5 flex-1 justify-around">
                                    {licenseOptions.map(name => (
                                        <Checkbox
                                            key={name}
                                            id={`driver_license_${name.replace(/\s+/g, '_')}`}
                                            label={name}
                                            checked={ownedLicenses.includes(name)}
                                            disabled={readOnly}
                                            onChange={(checked) => onDriverLicenseToggle(name, checked)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
};

export default ApplicantFields;
