import { MasterDataFormFieldItems } from '../types/quotation';

// Helper function untuk convert API response ke format options
export const formatMasterDataOptions = (data: { id: number; name: string }[]) => {
    return data.map(item => ({
        label: item.name,
        value: item.id
    }));
};

export const STATIC_CFI_OPTIONS = [
    { value: 13, label: 'Cash paid for fixed assets, intangible assets and other long-term assets' },
    { value: 4, label: 'Cash paid for goods and services' },
    { value: 5, label: 'Cash paid to and for employees' },
    { value: 21, label: 'Cash payments for distribution of dividends, profit and interest expenses' },
    { value: 14, label: 'Cash payments for investments' },
    { value: 18, label: 'Cash received from borrowings' },
    { value: 9, label: 'Cash received from investment income' },
    { value: 17, label: 'Cash received from investments by others' },
    { value: 1, label: 'Cash received from sales and services' },
    { value: 8, label: 'Cash received from withdraw of investments' },
    { value: 20, label: 'Cash repayments for debts' },
    { value: 15, label: 'Net cash paid for acquiring subsidiaries and other business units' },
    { value: 10, label: 'Net cash received from disposal of fixed assets, intangible assets and other long-term assets' },
    { value: 11, label: 'Net cash received from disposal of subsidiaries and other business units' },
    { value: 22, label: 'Other cash payments related to financing activities' },
    { value: 16, label: 'Other cash payments related to investing activities' },
    { value: 7, label: 'Other cash payments related to operating activities' },
    { value: 12, label: 'Other cash receipts related to investing activities' },
    { value: 3, label: 'Other cash receipts related to operating activities' },
    { value: 19, label: 'Other cash receipts related to other financing activities' },
    { value: 6, label: 'Taxes and surcharges cash payments' },
    { value: 2, label: 'Taxes and surcharges refunds' },
].sort((a, b) => a.label.localeCompare(b.label));

export const STATIC_FORECAST_OPTIONS = [
    { value: 0, label: 'Omitted' },
    { value: 1, label: 'Worst Case' },
    { value: 2, label: 'Most Likely' },
    { value: 3, label: 'Upside' },
];

export const getPrimaryInfoFields = (masterData?: MasterDataFormFieldItems | null) => [
    {
        name: "customform",
        label: "Custom Form",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.customforms) : [],
        disabled: true,
        readonlyDisplay: "Quotation",
    },
    {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Judul Quotation",
        forceEditable: true,
    },
    {
        name: "expectedclosedate",
        label: "Expected Close Date",
        type: "date",
    },
    {
        name: "entity",
        label: "Customer",
        type: "select-customer",
        required: true,
    },
    {
        name: "probability",
        label: "Probability (%)",
        type: "number",
        placeholder: "e.g., 50",
        min: 0,
        max: 100,
    },
    {
        name: "trandate",
        label: "Transaction Date",
        type: "date",
        required: true,
    },
    {
        name: "duedate",
        label: "Due Date",
        type: "date",
    },
    {
        name: "terms",
        label: "Terms",
        type: "select-terms",
    },
    {
        name: "otherrefnum",
        label: "Reference Number",
        type: "text",
        placeholder: "Enter reference number",
    },
    {
        name: "memo",
        label: "Memo / Notes",
        type: "text",
        placeholder: "Catatan untuk Quotation ini",
    },
];

export const getAdditionalInfoFields = (_masterData?: MasterDataFormFieldItems | null) => [
    {
        name: "custbody_msi_bank_payment_so",
        label: "Bank Payment",
        type: "select-bank",
    },
    {
        name: "custbody_msi_quotation_no_iec",
        label: "Quotation No (IEC)",
        type: "text",
        placeholder: "Nomor Quotation",
    },
    {
        name: "forecasttype",
        label: "Forecast Type",
        type: "select",
        options: STATIC_FORECAST_OPTIONS,
        forceEditable: true,
    },
    {
        name: "salesrep",
        label: "Sales Rep",
        type: "text",
        placeholder: "Sales Representative",
        forceEditable: true,
    },
    {
        name: "opportunity",
        label: "Opportunity",
        type: "text",
        placeholder: "Opportunity",
        forceEditable: true,
    },
    {
        name: "partner",
        label: "Partner",
        type: "text",
        placeholder: "Partner",
        forceEditable: true,
    },
    {
        name: "custbody_cseg_cn_cfi",
        label: "China Cash Flow Item",
        type: "select",
        options: STATIC_CFI_OPTIONS,
        forceEditable: true,
    },
];

export const getClassificationInfoFields = (masterData?: MasterDataFormFieldItems | null, subsidiaryId?: number) => [
    {
        name: "subsidiary",
        label: "Subsidiary",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.subsidiarys) : [],
        required: true,
        dependsOn: "entity",
        dependsOnLabel: "Customer",
        cascadeClear: ["location", "department", "class"],
        showFieldError: true,
    },
    {
        name: "location",
        label: "Location",
        type: "select-location",
        required: true,
        dependsOn: "subsidiary",
        dependsOnLabel: "Subsidiary",
        subsidiaryId: subsidiaryId,
    },
    {
        name: "department",
        label: "Department",
        type: "select-department",
        required: true,
        dependsOn: "subsidiary",
        dependsOnLabel: "Subsidiary",
        subsidiaryId: subsidiaryId,
    },
    {
        name: "class",
        label: "Class",
        type: "select-class",
        dependsOn: "subsidiary",
        dependsOnLabel: "Subsidiary",
        subsidiaryId: subsidiaryId,
    },
];
