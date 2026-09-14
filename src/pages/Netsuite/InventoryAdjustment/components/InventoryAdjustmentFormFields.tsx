import { useEffect, useRef, useState } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Checkbox from '@/components/form/input/Checkbox';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomSelect from '@/components/form/select/CustomSelect';
import { InventoryAdjustmentFormData } from '../types/inventoryAdjustment';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';
import { convertDateToTanggal, formatTanggal, parseTanggalToDate } from '@/helpers/generalHelper';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface AsyncSelectFieldProps {
    options: any[];
    pagination: { loading: boolean };
    inputValue: string;
    onInputChange: (val: string) => Promise<any[]>;
    onMenuScrollToBottom: () => void;
    selected: any;
    onChange: (option: any) => void;
    disabled?: boolean;
    placeholder?: string;
    noOptionsMessage?: string;
    loadingMessage?: string;
}

// Sementara statis karena belum ada API list account — hanya 1 pilihan yang valid saat ini.
const ADJUSTMENT_ACCOUNT_OPTIONS = [
    { value: '128', label: 'Inventory Asset' },
];

// Custom Form untuk record Inventory Adjustment selalu fix ke form ini di NetSuite.
const CUSTOM_FORM_ID = 112;

// Sementara statis karena belum ada API list posting period — data diambil manual dari
// dropdown Posting Period NetSuite (FY 2025-2027).
const POSTING_PERIOD_OPTIONS = [
    { value: '35', label: 'FY 2025' },
    { value: '36', label: 'Q1 2025' },
    { value: '37', label: 'Jan 2025' },
    { value: '38', label: 'Feb 2025' },
    { value: '39', label: 'Mar 2025' },
    { value: '40', label: 'Q2 2025' },
    { value: '41', label: 'Apr 2025' },
    { value: '42', label: 'May 2025' },
    { value: '43', label: 'Jun 2025' },
    { value: '44', label: 'Q3 2025' },
    { value: '45', label: 'Jul 2025' },
    { value: '46', label: 'Aug 2025' },
    { value: '47', label: 'Sep 2025' },
    { value: '48', label: 'Q4 2025' },
    { value: '49', label: 'Oct 2025' },
    { value: '50', label: 'Nov 2025' },
    { value: '51', label: 'Dec 2025' },
    { value: '52', label: 'Adjust 2025' },
    { value: '18', label: 'FY 2026' },
    { value: '19', label: 'Q1 2026' },
    { value: '20', label: 'Jan 2026' },
    { value: '21', label: 'Feb 2026' },
    { value: '22', label: 'Mar 2026' },
    { value: '23', label: 'Q2 2026' },
    { value: '24', label: 'Apr 2026' },
    { value: '25', label: 'May 2026' },
    { value: '26', label: 'Jun 2026' },
    { value: '27', label: 'Q3 2026' },
    { value: '28', label: 'Jul 2026' },
    { value: '29', label: 'Aug 2026' },
    { value: '30', label: 'Sep 2026' },
    { value: '31', label: 'Q4 2026' },
    { value: '32', label: 'Oct 2026' },
    { value: '33', label: 'Nov 2026' },
    { value: '34', label: 'Dec 2026' },
    { value: '54', label: 'Adjust 2026' },
    { value: '55', label: 'FY 2027' },
    { value: '56', label: 'Q1 2027' },
    { value: '57', label: 'Jan 2027' },
    { value: '58', label: 'Feb 2027' },
    { value: '59', label: 'Mar 2027' },
    { value: '60', label: 'Q2 2027' },
    { value: '61', label: 'Apr 2027' },
    { value: '62', label: 'May 2027' },
    { value: '63', label: 'Jun 2027' },
    { value: '64', label: 'Q3 2027' },
    { value: '65', label: 'Jul 2027' },
    { value: '66', label: 'Aug 2027' },
    { value: '67', label: 'Sep 2027' },
    { value: '68', label: 'Q4 2027' },
    { value: '69', label: 'Oct 2027' },
    { value: '70', label: 'Nov 2027' },
    { value: '71', label: 'Dec 2027' },
    { value: '72', label: 'Adjust 2027' },
];

interface InventoryAdjustmentFormFieldsProps {
    formData: InventoryAdjustmentFormData;
    errors: Record<string, string>;
    masterData: MasterDataFormFieldItems | null;
    loadingMasterData: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSelectChange: (field: string, value: any) => void;

    subsidiary: AsyncSelectFieldProps;
    adjLocation: AsyncSelectFieldProps;
    department: AsyncSelectFieldProps;
    classField: AsyncSelectFieldProps;
    customer: AsyncSelectFieldProps;
}

// Field & pengelompokan disamain persis dengan record Inventory Adjustment di UI
// NetSuite: Primary Information / Classification (lihat InventoryAdjustmentFields.tsx
// untuk versi read-only-nya, yang juga punya section "Approval Information" —
// tidak relevan di form Create karena field itu baru ada setelah record dibuat).
export default function InventoryAdjustmentFormFields({
    formData,
    errors,
    masterData,
    loadingMasterData,
    onInputChange,
    onSelectChange,
    subsidiary,
    adjLocation,
    department,
    classField,
    customer,
}: InventoryAdjustmentFormFieldsProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const currentDate = formData.trandate ? parseTanggalToDate(formData.trandate) : null;

    const handleDateChange = (date: Date | any) => {
        setShowDatePicker(false);
        const selectedDate = date instanceof Date ? date : new Date(date);
        onSelectChange('trandate', convertDateToTanggal(selectedDate));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-4">
                        <div>
                            <Label>Custom Form</Label>
                            <CustomSelect
                                name="customform"
                                options={
                                    masterData?.customforms
                                        ? masterData.customforms.map(o => ({ value: String(o.id), label: o.name }))
                                        : []
                                }
                                value={
                                    masterData?.customforms
                                        ? {
                                            value: String(CUSTOM_FORM_ID),
                                            label: masterData.customforms.find(o => Number(o.id) === CUSTOM_FORM_ID)?.name || ''
                                        }
                                        : null
                                }
                                isLoading={loadingMasterData}
                                isSearchable={false}
                                isClearable={false}
                                disabled
                            />
                        </div>
                        <div>
                            <Label>Adjustment Account <span className="text-red-500">*</span></Label>
                            <CustomSelect
                                name="account"
                                placeholder="Select account..."
                                options={ADJUSTMENT_ACCOUNT_OPTIONS}
                                value={ADJUSTMENT_ACCOUNT_OPTIONS.find(opt => opt.value === String(formData.account)) ?? null}
                                error={errors.account}
                                isSearchable={false}
                                isClearable={false}
                                onChange={(option) => onSelectChange('account', option ? Number(option.value) : null)}
                            />
                            {errors.account && <span className="text-sm text-red-500 mt-1 block">{errors.account}</span>}
                        </div>
                        <div>
                            <Label>Customer</Label>
                            <CustomAsyncSelect
                                name="customer"
                                placeholder="Select customer..."
                                value={customer.selected}
                                defaultOptions={customer.options}
                                loadOptions={customer.onInputChange}
                                onMenuScrollToBottom={customer.onMenuScrollToBottom}
                                isLoading={customer.pagination.loading}
                                noOptionsMessage={() => 'No customers found'}
                                loadingMessage={() => 'Loading customers...'}
                                isSearchable={true}
                                inputValue={customer.inputValue}
                                onInputChange={customer.onInputChange}
                                onChange={customer.onChange}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label>Date</Label>
                            <div className="relative" ref={datePickerRef}>
                                <div
                                    className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500"
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                >
                                    <span className={currentDate ? 'text-gray-700' : 'text-gray-400'}>
                                        {currentDate ? formatTanggal(formData.trandate) : 'Pilih tanggal'}
                                    </span>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                {showDatePicker && (
                                    <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <Calendar
                                            date={currentDate || new Date()}
                                            onChange={handleDateChange}
                                            color="#3b82f6"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label>Posting Period</Label>
                            <CustomSelect
                                name="postingperiod"
                                placeholder="Select posting period..."
                                options={POSTING_PERIOD_OPTIONS}
                                value={POSTING_PERIOD_OPTIONS.find(opt => opt.value === String(formData.postingperiod)) ?? null}
                                isSearchable={true}
                                onChange={(option) => onSelectChange('postingperiod', option ? Number(option.value) : null)}
                            />
                        </div>
                        <div>
                            <Label>Memo</Label>
                            <TextArea
                                name="memo"
                                value={formData.memo}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onSelectChange('memo', e.target.value)}
                                rows={2}
                                placeholder="Memo"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label>Related Document Number</Label>
                            <Input
                                id="custbody_me_purchase_order_number"
                                name="custbody_me_purchase_order_number"
                                type="text"
                                placeholder="Related Document Number"
                                value={formData.custbody_me_purchase_order_number}
                                onChange={onInputChange}
                            />
                        </div>
                        <div>
                            <Label>MSI - Related Cycle Count Number</Label>
                            <Input
                                id="custbody_msi_cycle_count_cumber"
                                name="custbody_msi_cycle_count_cumber"
                                type="text"
                                placeholder="MSI - Related Cycle Count Number"
                                value={formData.custbody_msi_cycle_count_cumber}
                                onChange={onInputChange}
                            />
                        </div>
                        <div className="flex items-center pt-2">
                            <Checkbox
                                label="Opening Balance"
                                checked={!!formData.custbody_me_opening_balance}
                                onChange={(checked) => onSelectChange('custbody_me_opening_balance', checked)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="space-y-4">
                        <div>
                            <Label>Subsidiary <span className="text-red-500">*</span></Label>
                            <CustomAsyncSelect
                                name="subsidiary"
                                placeholder="Select subsidiary..."
                                value={subsidiary.selected}
                                error={errors.subsidiary}
                                defaultOptions={subsidiary.options}
                                loadOptions={subsidiary.onInputChange}
                                onMenuScrollToBottom={subsidiary.onMenuScrollToBottom}
                                isLoading={subsidiary.pagination.loading}
                                noOptionsMessage={() => 'No subsidiaries found'}
                                loadingMessage={() => 'Loading subsidiaries...'}
                                isSearchable={true}
                                inputValue={subsidiary.inputValue}
                                onInputChange={subsidiary.onInputChange}
                                onChange={subsidiary.onChange}
                            />
                            {errors.subsidiary && <span className="text-sm text-red-500 mt-1 block">{errors.subsidiary}</span>}
                        </div>
                        <div>
                            <Label>Department <span className="text-red-500">*</span></Label>
                            <CustomAsyncSelect
                                name="department"
                                placeholder="Select department..."
                                value={department.selected}
                                error={errors.department}
                                defaultOptions={department.options}
                                loadOptions={department.onInputChange}
                                onMenuScrollToBottom={department.onMenuScrollToBottom}
                                isLoading={department.pagination.loading}
                                noOptionsMessage={() => 'No departments found'}
                                loadingMessage={() => 'Loading departments...'}
                                isSearchable={true}
                                inputValue={department.inputValue}
                                onInputChange={department.onInputChange}
                                onChange={department.onChange}
                            />
                            {errors.department && <span className="text-sm text-red-500 mt-1 block">{errors.department}</span>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label>Class <span className="text-red-500">*</span></Label>
                            <CustomAsyncSelect
                                name="class"
                                placeholder="Select class..."
                                value={classField.selected}
                                error={errors.class}
                                defaultOptions={classField.options}
                                loadOptions={classField.onInputChange}
                                onMenuScrollToBottom={classField.onMenuScrollToBottom}
                                isLoading={classField.pagination.loading}
                                noOptionsMessage={() => 'No classes found'}
                                loadingMessage={() => 'Loading classes...'}
                                isSearchable={true}
                                inputValue={classField.inputValue}
                                onInputChange={classField.onInputChange}
                                onChange={classField.onChange}
                            />
                            {errors.class && <span className="text-sm text-red-500 mt-1 block">{errors.class}</span>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label>Adjustment Location <span className="text-red-500">*</span></Label>
                            <CustomAsyncSelect
                                name="adjlocation"
                                placeholder="Select location..."
                                value={adjLocation.selected}
                                error={errors.adjlocation}
                                defaultOptions={adjLocation.options}
                                loadOptions={adjLocation.onInputChange}
                                onMenuScrollToBottom={adjLocation.onMenuScrollToBottom}
                                isLoading={adjLocation.pagination.loading}
                                noOptionsMessage={() => 'No locations found'}
                                loadingMessage={() => 'Loading locations...'}
                                isSearchable={true}
                                inputValue={adjLocation.inputValue}
                                onInputChange={adjLocation.onInputChange}
                                onChange={adjLocation.onChange}
                            />
                            {errors.adjlocation && <span className="text-sm text-red-500 mt-1 block">{errors.adjlocation}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
