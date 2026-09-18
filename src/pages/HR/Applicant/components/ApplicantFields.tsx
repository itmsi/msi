import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Checkbox from '@/components/form/input/Checkbox';
import { useLanguage } from '@/components/lang/useLanguage';
import { ApplicantFormScalarField, ApplicantFormUpdateRequest } from '../types/applicant';
import { ApplicantFormErrors } from '../hooks/useApplicantEdit';
import { applicantLabels } from '../language/applicantLabels';

interface ScalarFieldConfig {
    field: ApplicantFormScalarField;
    labelKey: string;
    type?: 'text' | 'email' | 'date' | 'textarea';
    required?: boolean;
    fullWidth?: boolean;
}

const FIELD_GROUPS: { titleKey: string; fields: ScalarFieldConfig[]; withDriverLicense?: boolean }[] = [
    {
        titleKey: 'personalInformation',
        withDriverLicense: true,
        fields: [
            { field: 'full_name', labelKey: 'fullName', required: true },
            { field: 'address_as_per_id_card', labelKey: 'addressIdCard', type: 'textarea' },
            { field: 'nickname', labelKey: 'nickname' },
            { field: 'present_address', labelKey: 'presentAddress', type: 'textarea' },
            { field: 'no_mobile', labelKey: 'mobileNumber' },
            { field: 'city', labelKey: 'city' },
            { field: 'name_relationship_emergency_contact_number', labelKey: 'emergencyContact' },
            { field: 'place_date_of_birth', labelKey: 'placeDateOfBirth' },
            { field: 'email', labelKey: 'email', type: 'email' },
            { field: 'blood_type', labelKey: 'bloodType' },
            { field: 'id_number', labelKey: 'idNumber' },
            { field: 'tax_identification_number', labelKey: 'taxIdNumber' },
            { field: 'position_applied_for', labelKey: 'positionAppliedFor' },
            { field: 'working_available_date', labelKey: 'availableToWork', type: 'date' },
            { field: 'marital_status', labelKey: 'maritalStatus' },
            { field: 'relogion', labelKey: 'religion' },
            { field: 'height_weight', labelKey: 'heightWeight' },
            { field: 'tshirt_size', labelKey: 'tshirtSize' },
        ],
    }
];

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
            {FIELD_GROUPS.map(group => (
                <div key={group.titleKey} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    <h3 className="text-lg font-primary-bold text-center pb-3 border-b border-b-gray-300 uppercase text-gray-900">{langField(group.titleKey)}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.fields.map(({ field, labelKey, type = 'text', required, fullWidth }) => {
                            const label = langField(labelKey);
                            const errorKey = errors[field];

                            return (
                                <div key={field} className={`${fullWidth ? 'md:col-span-2' : ''} ${readOnly ? 'flex items-center gap-5' : ''}`}>
                                    <Label htmlFor={field} className={`${readOnly ? 'w-50' : ''}`}>
                                        {label} {required && !readOnly && <span className="text-red-500">*</span>}
                                    </Label>
                                    {type === 'textarea' ? (
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
                                    ) : (
                                        <div className={`${readOnly ? 'flex-1 text-end' : undefined}`}>
                                            <Input
                                                id={field}
                                                name={field}
                                                autoComplete="off"
                                                type={type}
                                                value={values[field]}
                                                placeholder={readOnly ? '-' : label}
                                                readonly={readOnly}
                                                error={Boolean(errorKey)}
                                                onChange={(e) => onChange(field, e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {errorKey && <p className="mt-1 text-xs text-red-500">{langField(errorKey)}</p>}
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
