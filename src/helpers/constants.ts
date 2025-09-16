export const ENUM_STATUS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

export const ENUM_TYRE_TYPE = [
    { label: '6x4', value: '6x4' },
    { label: '8x4', value: '8x4' },
];

export const ENUM_NOTE = [
    { label: 'RFU', value: 'RFU' },
    { label: 'BD', value: 'BD' },
];

export const ENUM_STIE_TYPE = [
    { label: 'Loading', value: 'loading' },
    { label: 'Dumping', value: 'dumping' },
];

export const ENUM_ENGINE_BRAND = [
    { label: 'Cummins', value: 'cummins' },
    { label: 'Weichai', value: 'weichai' },
];

export const FILE_TYPE_MAP: Record<string, string[]> = {
    csv: ['text/csv'],
    xls: ['application/vnd.ms-excel'],
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

export const ENUM_STATUS_EMPLOYEE = [
    { label: 'Active', value: 'active' },
    { label: 'Resign', value: 'resign' },
    { label: 'On Leave', value: 'on-leave' },
];

export const ENUM_SCHEDULE_DAY = [
    { label: 'Holiday', value: 0 },
    { label: 'One Shift', value: 0.5 },
    { label: 'Available Day', value: 1 },
];

export const ENUM_MONTH = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
];

export const ENUM_AVAILABLE = [
    { label: 'Available', value: 'available' },
    { label: 'Holiday', value: 'holiday' },
    { label: 'One Shift', value: 'one-shift' },
];

export const ENUM_SHIFT = [
    { label: 'DS (Day Shift)', value: 'DS' },
    { label: 'NS (Night Shift)', value: 'NS' },
];

export const ENUM_MATERIAL = [
    { label: 'Biomas', value: 'biomas' },
    { label: 'Boulder', value: 'boulder' },
    { label: 'OB', value: 'ob' },
    { label: 'Ore', value: 'ore' },
    { label: 'Ore Barge', value: 'ore-barge' },
    { label: 'Quarry', value: 'quarry' },
];

export const TYPE_FORM_PRODUCTION = ['dt', 'he'];

export const ENUM_FORM_TYPE = [
    { label: 'Textarea', value: 'textarea' },
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Email', value: 'email' },
    { label: 'Password', value: 'password' },
    // { label: "Select", value: "select" },
    // { label: "Checkbox", value: "checkbox" },
    // { label: "Switch", value: "switch" },
    // { label: "Date", value: "date" },
    // { label: "Datetime", value: "datetime-local" },
];

export const ENUM_CATEGORY = [
    { label: 'Standby', value: 'STB' },
    { label: 'Breakdown', value: 'BD' },
];

export const ENUM_UOM = [{ label: 'Liter', value: 'liter' }];

export const ENUM_ACTIVITIES = [
    { label: 'Direct', value: 'direct' },
    { label: 'Hauling', value: 'hauling' },
    { label: 'Barging', value: 'barging' },
    { label: 'Support', value: 'support' },
];

export const ENUM_DASHBOARD_PAGE_CCR = [
    {
        label: 'Hauling',
        value: 'hauling',
    },
    {
        label: 'Barging',
        value: 'barging',
    },
];
export const ENUM_TYPE_SUMMARY_PROD = [
    {
        label: '10',
        value: '10',
    },
    {
        label: '12',
        value: '12',
    },
];

export const ENUM_ORE_HAULING = [
    { label: 'OB', value: 'ob' },
    { label: 'Ore', value: 'ore' },
    { label: 'Ore Barge', value: 'ore-barge' },
    { label: 'Quarry', value: 'quarry' },
];
