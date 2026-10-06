// Kontrak tipe field form untuk seluruh workspace.
// Aturan pemakaian dan pemetaan tiap tipe ke komponennya ada di docs/form-field-pattern.md.
export type FormFieldType =
    | 'text'
    | 'email'
    | 'date'
    | 'textarea'
    | 'choice'
    | 'select'
    | 'number';

export interface FormFieldOption {
    value: string;
    label: string;
}
