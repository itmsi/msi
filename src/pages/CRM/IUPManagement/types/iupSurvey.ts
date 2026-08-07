// ---------------------------------------------------------------------------
// Types untuk master zone site template — di-fetch dari
// POST /crm/master_iup_zone_site/get, bukan lagi hardcoded di frontend.
// ---------------------------------------------------------------------------

export interface MasterZoneSiteField {
    key: string;
    label: string;
    unit?: string;
    placeholder?: string;
}

export interface MasterZoneSiteSection {
    id: string;
    sectionKey: string;
    title: string;
    /** Field set untuk "Insert default data" — disuntikkan ke Remarks/description. */
    field_data: MasterZoneSiteField[];
    /** Field set untuk Insert Table di Guide modal — disuntikkan ke field guide. */
    field_guide: MasterZoneSiteField[];
    is_default: boolean;
}

export interface MasterZoneSiteRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    is_default?: boolean;
}

export interface MasterZoneSiteListResponse {
    success: boolean;
    data: MasterZoneSiteSection[];
}

/** Flat map: field.key -> value yang diisi user. */
export type SurveyValues = Record<string, string>;
