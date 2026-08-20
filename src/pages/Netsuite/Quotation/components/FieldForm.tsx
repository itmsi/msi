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

// NetSuite "Customer Status" list (entitystatus). Order kept as grouped by
// Stage (Lead -> Prospect -> Customer), matching NetSuite's own list order.
export const STATIC_STATUS_OPTIONS = [
    { value: 7, label: 'Memenuhi Syarat' },
    { value: 6, label: 'Tidak Memenuhi Syarat' },
    { value: 14, label: 'Kekalahan Tertutup' },
    { value: 12, label: 'Pembelian' },
    { value: 9, label: 'Pengambil Keputusan yang Teridentifikasi' },
    { value: 10, label: 'Proposal' },
    { value: 8, label: 'Sedang Didiskusikan' },
    { value: 11, label: 'Sedang Dinegosiasikan' },
    { value: 15, label: 'Diperbarui' },
    { value: 13, label: 'Kemenangan Tertutup' },
    { value: 16, label: 'Pelanggan Hilang' },
];

// Field grouping mirrors the NetSuite Estimate form exactly: Primary Information,
// Approval Information (rendered directly in QuotationFields.tsx), Sales Information,
// Classification. Each field carries a `column` (1-3) so the layout can be rendered as
// independent stacked columns instead of a row-major grid, matching NetSuite's column order.
export const getPrimaryInfoFields = (masterData?: MasterDataFormFieldItems | null, tranid?: string) => [
    // Column 1
    {
        name: "customform",
        label: "Custom Form",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.customforms) : [],
        disabled: true,
        readonlyDisplay: "Quotation",
        column: 1,
    },
    {
        name: "tranid",
        label: "Estimate #",
        type: "display",
        staticValue: tranid || "To Be Generated",
        column: 1,
    },
    {
        name: "entity",
        label: "Customer",
        type: "select-customer",
        required: true,
        column: 1,
    },
    {
        name: "title",
        label: "Title",
        type: "text",
        placeholder: "Judul Quotation",
        forceEditable: true,
        column: 1,
    },
    {
        name: "duedate",
        label: "Expires",
        type: "date",
        column: 1,
    },
    {
        name: "trandate",
        label: "Date",
        type: "date",
        required: true,
        column: 1,
    },
    {
        name: "orderstatus",
        label: "Status",
        type: "select",
        options: STATIC_STATUS_OPTIONS,
        forceEditable: true,
        showFieldError: false,
        column: 1,
    },
    // Column 2
    {
        name: "probability",
        label: "Probability",
        type: "number",
        placeholder: "e.g., 50",
        min: 0,
        max: 100,
        column: 2,
    },
    {
        name: "expectedclosedate",
        label: "Exp. Close",
        type: "date",
        column: 2,
    },
    {
        name: "memo",
        label: "Memo",
        type: "text",
        placeholder: "Catatan untuk Quotation ini",
        column: 2,
    },
    {
        name: "custbody_msi_bank_payment_so",
        label: "MSI - Bank Payment",
        type: "select-bank",
        column: 2,
    },
    // {
    //     name: "custbody_msi_price_level",
    //     label: "MSI - Price Level",
    //     type: "display",
    //     staticValue: "-",
    //     column: 2,
    // },
];

export const getSalesInfoFields = () => [
    {
        name: "salesrep",
        label: "Sales Rep",
        type: "text",
        placeholder: "Sales Representative",
        forceEditable: true,
        column: 1,
    },
    {
        name: "opportunity",
        label: "Opportunity",
        type: "text",
        placeholder: "Opportunity",
        forceEditable: true,
        column: 1,
    },
    {
        name: "forecasttype",
        label: "Forecast Type",
        type: "select",
        options: STATIC_FORECAST_OPTIONS,
        forceEditable: true,
        column: 2,
    },
    {
        name: "partner",
        label: "Partner",
        type: "text",
        placeholder: "Partner",
        forceEditable: true,
        column: 3,
    },
];

export const getClassificationInfoFields = (masterData?: MasterDataFormFieldItems | null, subsidiaryId?: number) => [
    // Column 1
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
        column: 1,
    },
    {
        name: "department",
        label: "Department",
        type: "select-department",
        required: true,
        dependsOn: "subsidiary",
        dependsOnLabel: "Subsidiary",
        subsidiaryId: subsidiaryId,
        column: 1,
    },
    // Column 2
    {
        name: "class",
        label: "Class",
        type: "select-class",
        dependsOn: "subsidiary",
        dependsOnLabel: "Subsidiary",
        subsidiaryId: subsidiaryId,
        column: 2,
    },
    {
        name: "location",
        label: "Location",
        type: "select-location",
        required: true,
        dependsOn: "subsidiary",
        dependsOnLabel: "Subsidiary",
        subsidiaryId: subsidiaryId,
        column: 2,
    },
    // Column 3
    {
        name: "custbody_cseg_cn_cfi",
        label: "China Cash Flow Item",
        type: "select",
        options: STATIC_CFI_OPTIONS,
        forceEditable: true,
        column: 3,
    },
];

// Fields that exist in the app but aren't part of NetSuite's visible Estimate sections
// (Primary / Approval / Sales / Classification) — kept functional in their own section
// rather than dropped, since they're still required for create/update.
export const getAdditionalInfoFields = (_masterData?: MasterDataFormFieldItems | null) => [
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
        name: "custbody_msi_quotation_no_iec",
        label: "Quotation No (IEC)",
        type: "text",
        placeholder: "Nomor Quotation",
    },
];
