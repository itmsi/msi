import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { InventoryAdjustmentFormData } from '../types/inventoryAdjustment';

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

interface InventoryAdjustmentFormFieldsProps {
    formData: InventoryAdjustmentFormData;
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSelectChange: (field: string, value: any) => void;

    subsidiary: AsyncSelectFieldProps;
    adjLocation: AsyncSelectFieldProps;
    department: AsyncSelectFieldProps;
    classField: AsyncSelectFieldProps;
    customer: AsyncSelectFieldProps;
}

// Field & pengelompokan disamain dengan bagian "Primary Information" record
// Inventory Adjustment di UI NetSuite (lihat InventoryAdjustmentFields.tsx untuk
// versi read-only-nya).
export default function InventoryAdjustmentFormFields({
    formData,
    errors,
    onInputChange,
    onSelectChange,
    subsidiary,
    adjLocation,
    department,
    classField,
    customer,
}: InventoryAdjustmentFormFieldsProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
            <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
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
                        <Label>Adjustment Account <span className="text-red-500">*</span></Label>
                        <Input
                            id="account"
                            name="account"
                            type="number"
                            placeholder="Internal ID account, cth: 128"
                            value={formData.account ?? ''}
                            onChange={onInputChange}
                            error={!!errors.account}
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
            </div>
        </div>
    );
}
