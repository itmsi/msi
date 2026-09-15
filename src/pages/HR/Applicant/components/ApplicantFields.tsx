import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import { ApplicantFormScalarField, ApplicantFormUpdateRequest } from '../types/applicant';
import { ApplicantFormErrors } from '../hooks/useApplicantEdit';

interface ScalarFieldConfig {
    field: ApplicantFormScalarField;
    label: string;
    type?: 'text' | 'email' | 'date' | 'textarea';
    required?: boolean;
    fullWidth?: boolean;
}

const FIELD_GROUPS: { title: string; fields: ScalarFieldConfig[] }[] = [
    {
        title: 'Data Pribadi',
        fields: [
            { field: 'full_name', label: 'Nama Lengkap', required: true },
            { field: 'nickname', label: 'Nama Panggilan' },
            { field: 'no_mobile', label: 'No. HP' },
            { field: 'name_relationship_emergency_contact_number', label: 'Kontak Darurat (Nama, Hubungan, No. HP)', fullWidth: true },
            { field: 'email', label: 'Email', type: 'email' },
            { field: 'id_number', label: 'No. KTP' },
            { field: 'position_applied_for', label: 'Posisi Dilamar' },
            { field: 'marital_status', label: 'Status Pernikahan' },
            { field: 'height_weight', label: 'Tinggi / Berat Badan' },


            { field: 'address_as_per_id_card', label: 'Alamat Sesuai KTP', type: 'textarea', fullWidth: true },
            { field: 'present_address', label: 'Alamat Domisili', type: 'textarea', fullWidth: true },
            { field: 'city', label: 'Kota' },
            { field: 'place_date_of_birth', label: 'Tempat, Tanggal Lahir' },
            { field: 'blood_type', label: 'Golongan Darah' },
            { field: 'tax_identification_number', label: 'NPWP' },
            { field: 'working_available_date', label: 'Tersedia Bekerja', type: 'date' },
            { field: 'relogion', label: 'Agama' },
            { field: 'tshirt_size', label: 'Ukuran Kaos' },
        ],
    }
];

interface ApplicantFieldsProps {
    values: ApplicantFormUpdateRequest;
    errors: ApplicantFormErrors;
    readOnly: boolean;
    onChange: (field: ApplicantFormScalarField, value: string) => void;
}

const ApplicantFields = ({ values, errors, readOnly, onChange }: ApplicantFieldsProps) => (
    <>
        {FIELD_GROUPS.map(group => (
            <div key={group.title} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">{group.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields.map(({ field, label, type = 'text', required, fullWidth }) => (
                        <div key={field} className={fullWidth ? 'md:col-span-2' : undefined}>
                            <Label htmlFor={field}>
                                {label} {required && !readOnly && <span className="text-red-500">*</span>}
                            </Label>
                            {type === 'textarea' ? (
                                <TextArea
                                    name={field}
                                    rows={3}
                                    value={values[field]}
                                    placeholder={readOnly ? '-' : label}
                                    readonly={readOnly}
                                    error={Boolean(errors[field])}
                                    onChange={(e) => onChange(field, e.target.value)}
                                />
                            ) : (
                                <Input
                                    id={field}
                                    name={field}
                                    type={type}
                                    value={values[field]}
                                    placeholder={readOnly ? '-' : label}
                                    readonly={readOnly}
                                    error={Boolean(errors[field])}
                                    onChange={(e) => onChange(field, e.target.value)}
                                />
                            )}
                            {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </>
);

export default ApplicantFields;
