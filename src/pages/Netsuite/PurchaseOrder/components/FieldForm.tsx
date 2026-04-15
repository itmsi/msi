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
        // required: true,
        disabled: true
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
        type: "select-terms",
        required: true,
    }
];

export const getAdditionalInfoFields = (masterData?: MasterDataFormFieldItems) => [
    {
        name: "custbody_me_validity_date",
        label: "ME - Validity Date",
        type: "date",
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
    },
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
    }
];

export const getClassificationInfoFields = (masterData?: MasterDataFormFieldItems, subsidiaryId?: number) => [
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
        subsidiaryId: subsidiaryId, // Pass subsidiary_id untuk filtering location
    },
    {
        name: "class",
        label: "Class",
        type: "select-class",
        required: true,
        subsidiaryId: subsidiaryId, // Pass subsidiary_id untuk filtering class
    },
    {
        name: "department",
        label: "Department",
        type: "select-department",
        required: true,
        subsidiaryId: subsidiaryId, // Pass subsidiary_id untuk filtering department
    },
];

export const getInterCompanyManageFields = () => [
    {
        name: "description",
        label: "ME - Description",
        type: "textarea",
        required: true,
    },
    // {
    //     name: "note",
    //     label: "Note",
    //     type: "textarea",
    //     required: true,
    // }
];

export const getApprovalFields = () => [
    {
        name: "approvalstatus",
        label: "Approval Status",
        type: "text",
        readOnly: true,
    },
    // {
    //     name: "created_by",
    //     label: "Created By",
    //     type: "text",
    //     readOnly: true,
    // },
    {
        name: "nextapprover",
        label: "Next Approver",
        type: "text",
        readOnly: true,
    },
    {
        name: "custbody_msi_createdby_api",
        label: "Created By API",
        type: "text",
        readOnly: true,
    },
]