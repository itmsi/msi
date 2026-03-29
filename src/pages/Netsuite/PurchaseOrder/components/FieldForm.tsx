import { MasterDataFormFieldItems } from '../types/purchaseorder';

// Helper function untuk convert API response ke format options
export const formatMasterDataOptions = (data: { id: number; name: string }[]) => {
    return data.map(item => ({
        label: item.name,
        value: item.id
    }));
};

export const getPrimaryInfoFields = (masterData?: MasterDataFormFieldItems) => [
    {
        name: "customform",
        label: "Custom Form",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.customforms) : [],
        required: true,
    },
    {
        name: "purchasedate",
        label: "Purchase Date",
        type: "date",
        required: true,
    },
    {
        name: "vendorid",
        label: "Vendor",
        type: "select-vendor",
        required: true,
    },
    {
        name: "memo",
        label: "Memo",
        type: "text",
    },
    {
        name: "currency",
        label: "Currency",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.currencys) : [],
        required: true,
    },
    {
        name: "terms",
        label: "Terms",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.terms) : [],
    }
];

export const getAdditionalInfoFields = (masterData?: MasterDataFormFieldItems) => [
    {
        name: "custbody_me_pr_date",
        label: "ME - PR Date",
        type: "date",
    },
    {
        name: "custbody_me_pr_type",
        label: "ME - PR Type",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.custbody_me_pr_types) : [],
    },
    {
        name: "custbody_me_pr_number",
        label: "ME - PR Number",
        type: "text",
    },
    {
        name: "custbody_me_project_location",
        label: "ME - Project Location",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.custbody_me_project_locations) : [],
    },
    {
        name: "custbody_me_saving_type",
        label: "ME - Saving Type",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.custbody_me_saving_types) : [],
    }
];

export const getClassificationInfoFields = (masterData?: MasterDataFormFieldItems) => [
    {
        name: "subsidiary",
        label: "Subsidiary",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.subsidiarys) : [],
        required: true,
    },
    {
        name: "location",
        label: "Location",
        type: "select-location",
        required: true,
    },
    {
        name: "class",
        label: "Class",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.class) : [],
        required: true,
    },
    {
        name: "department",
        label: "Department",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.departments) : [],
        required: true,
    },
];

export const getInterCompanyManageFields = () => [
    {
        name: "description",
        label: "ME - Description",
        type: "textarea",
        required: true,
    },
    {
        name: "note",
        label: "Note",
        type: "textarea",
        required: true,
    }
];