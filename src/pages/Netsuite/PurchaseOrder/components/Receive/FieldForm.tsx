import { MasterDataFormFieldItems } from '../../types/purchaseorder';

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
        name: "trandate",
        label: "Receive Date",
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
        disabled:true
    }
];

export const getClassificationInfoFields = (masterData?: MasterDataFormFieldItems, subsidiaryId?: number) => [
    {
        name: "subsidiary",
        label: "Subsidiary",
        type: "select",
        options: masterData ? formatMasterDataOptions(masterData.subsidiarys) : [],
        required: true,
        disabled: true
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
