// ---------------------------------------------------------------------------
// Types untuk Survey Form — schema-driven, tiap section mewakili satu topik
// di sheet "SITE VISIT SURVEY REPORT" (Jetty, PIT, ETO, EFO, dst).
// ---------------------------------------------------------------------------

export type SurveyFieldType = "text" | "number" | "select" | "textarea";

export interface SurveyFieldOption {
    label: string;
    value: string;
}

export interface SurveyField {
    /** Key unik secara global (dipakai sebagai key di SurveyValues). */
    key: string;
    label: string;
    type: SurveyFieldType;
    unit?: string;
    options?: SurveyFieldOption[];
    placeholder?: string;
}

export interface SurveySection {
    /** Key unik section, dipetakan ke zona (mis. "jetty" ↔ Zone.schemaKey). */
    sectionKey: string;
    title: string;
    fields: SurveyField[];
}

/** Flat map: field.key -> value yang diisi user. */
export type SurveyValues = Record<string, string>;

export interface SurveyFormProps {
    /** Nilai awal (misal hasil load dari server/local storage). */
    initialValues?: SurveyValues;
    /** Dipanggil setiap kali ada perubahan nilai. */
    onChange?: (values: SurveyValues) => void;
    /** Section mana saja yang ditampilkan. Default: semua section di SURVEY_SCHEMA. */
    sectionKeys?: string[];
}