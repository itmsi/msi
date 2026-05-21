import Label from '@/components/form/Label';
import InputField from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { SalesOrderFormData } from '../types/salesOrder';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

const SO_STATUS_OPTIONS = [
    { value: 'A', label: 'Pending Approval' },
    { value: 'B', label: 'Pending Fulfillment' },
    { value: 'C', label: 'Cancelled' },
    { value: 'D', label: 'Partially Fulfilled' },
    { value: 'E', label: 'Pending Billing/Partially Fulfilled' },
    { value: 'F', label: 'Pending Billing' },
    { value: 'G', label: 'Billed' },
    { value: 'H', label: 'Closed' },
];

interface SOFormFieldsProps {
    formData: SalesOrderFormData;
    errors: Record<string, string>;
    masterData: MasterDataFormFieldItems | null;
    loadingMasterData: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSelectChange: (field: string, value: any) => void;
    onDateChange: (field: string, value: string) => void;
    onAddItem: (selectedItem: any) => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (index: number, field: string, value: any) => void;

    // Location Props
    locationOptions: any[];
    locationPagination: any;
    locationInputValue: string;
    onLocationInputChange: (val: string) => Promise<any[]>;
    onLocationMenuScrollToBottom: () => void;
    selectedLocation: any;
    onLocationChange: (opt: any) => void;

    // Department Props
    deptOptions: any[];
    deptPagination: any;
    deptInputValue: string;
    onDeptInputChange: (val: string) => Promise<any[]>;
    onDeptMenuScrollToBottom: () => void;
    selectedDepartment: any;
    onDepartmentChange: (opt: any) => void;

    // Class Props
    classOptions: any[];
    classPagination: any;
    classInputValue: string;
    onClassInputChange: (val: string) => Promise<any[]>;
    onClassMenuScrollToBottom: () => void;
    selectedClass: any;
    onClassChange: (opt: any) => void;

    // Customer Props
    customerOptions: any[];
    customerPagination: any;
    customerInput: string;
    onCustomerInputChange: (val: string) => Promise<any[]>;
    onCustomerMenuScrollToBottom: () => void;
    selectedCustomer: any;
    onCustomerChange: (opt: any) => void;

    // Term Props
    termOptions: any[];
    termPagination: any;
    termInput: string;
    onTermInputChange: (val: string) => Promise<any[]>;
    onTermMenuScrollToBottom: () => void;
    selectedTerm: any;
    onTermChange: (opt: any) => void;
}

export default function SalesOrderFields({
    formData,
    errors,
    masterData,
    loadingMasterData,
    onInputChange,
    onSelectChange,
    onDateChange,
    
    locationOptions,
    locationPagination,
    locationInputValue,
    onLocationInputChange,
    onLocationMenuScrollToBottom,
    selectedLocation,
    onLocationChange,

    deptOptions,
    deptPagination,
    deptInputValue,
    onDeptInputChange,
    onDeptMenuScrollToBottom,
    selectedDepartment,
    onDepartmentChange,

    classOptions,
    classPagination,
    classInputValue,
    onClassInputChange,
    onClassMenuScrollToBottom,
    selectedClass,
    onClassChange,

    customerOptions,
    customerPagination,
    customerInput,
    onCustomerInputChange,
    onCustomerMenuScrollToBottom,
    selectedCustomer,
    onCustomerChange,

    termOptions,
    termPagination,
    termInput,
    onTermInputChange,
    onTermMenuScrollToBottom,
    selectedTerm,
    onTermChange,
}: SOFormFieldsProps) {

    const FieldError = ({ field }: { field: string }) =>
        errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

    return (
        <div className="space-y-6">
            {/* Primary Information */}
            <div className="bg-white rounded-2xl shadow-sm space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Custom Form */}
                    <div>
                        <Label htmlFor="so-customform">Custom Form</Label>
                        <CustomSelect
                            id="so-customform"
                            name="customform"
                            value={
                                masterData?.customforms && formData.customform
                                    ? { 
                                        value: formData.customform, 
                                        label: masterData.customforms.find(o => Number(o.id) === Number(formData.customform))?.name || '' 
                                      }
                                    : null
                            }
                            onChange={(opt) => onSelectChange('customform', opt?.value ? Number(opt.value) : null)}
                            options={
                                masterData?.customforms
                                    ? masterData.customforms.map(o => ({ value: o.id, label: o.name }))
                                    : []
                            }
                            placeholder="Pilih Form"
                            isClearable={false}
                            isSearchable={true}
                            isLoading={loadingMasterData}
                        />
                    </div>

                    {/* Transaction Date */}
                    <div>
                        <Label htmlFor="so-trandate">Transaction Date <span className="text-red-500">*</span></Label>
                        <InputField
                            id="so-trandate"
                            type="date"
                            value={formData.trandate}
                            onChange={(e) => onDateChange('trandate', e.target.value)}
                            className={errors.trandate ? 'border-red-500' : ''}
                        />
                        <FieldError field="trandate" />
                    </div>

                    {/* Customer (entity) */}
                    <div>
                        <Label htmlFor="so-entity">Customer <span className="text-red-500">*</span></Label>
                        <CustomAsyncSelect
                            name="entity"
                            value={selectedCustomer}
                            onChange={onCustomerChange}
                            defaultOptions={customerOptions}
                            loadOptions={onCustomerInputChange}
                            onMenuScrollToBottom={onCustomerMenuScrollToBottom}
                            isLoading={customerPagination.loading}
                            noOptionsMessage={() => "No customers found"}
                            loadingMessage={() => "Loading customers..."}
                            isSearchable={true}
                            inputValue={customerInput}
                            onInputChange={onCustomerInputChange}
                            placeholder="Cari Customer..."
                            className={errors.entity ? 'border-red-500' : ''}
                        />
                        <FieldError field="entity" />
                    </div>

                    {/* Currency */}
                    <div>
                        <Label htmlFor="so-currency">Currency <span className="text-red-500">*</span></Label>
                        <CustomSelect
                            id="so-currency"
                            name="currency"
                            value={
                                masterData?.currencys && formData.currency
                                    ? { 
                                        value: formData.currency, 
                                        label: masterData.currencys.find(o => Number(o.id) === Number(formData.currency))?.name || '' 
                                      }
                                    : null
                            }
                            onChange={(opt) => onSelectChange('currency', opt?.value ? Number(opt.value) : null)}
                            options={
                                masterData?.currencys
                                    ? masterData.currencys.map(o => ({ value: o.id, label: o.name }))
                                    : []
                            }
                            placeholder="Pilih Currency"
                            isClearable={false}
                            isSearchable={true}
                            isLoading={loadingMasterData}
                        />
                        <FieldError field="currency" />
                    </div>

                    {/* Terms */}
                    <div>
                        <Label htmlFor="so-terms">Terms</Label>
                        <CustomAsyncSelect
                            name="terms"
                            value={selectedTerm}
                            onChange={onTermChange}
                            defaultOptions={termOptions}
                            loadOptions={onTermInputChange}
                            onMenuScrollToBottom={onTermMenuScrollToBottom}
                            isLoading={termPagination.loading}
                            noOptionsMessage={() => "No terms found"}
                            loadingMessage={() => "Loading terms..."}
                            isSearchable={true}
                            inputValue={termInput}
                            onInputChange={onTermInputChange}
                            placeholder="Pilih Terms"
                        />
                    </div>

                    {/* Other Ref Num */}
                    <div>
                        <Label htmlFor="so-otherrefnum">Other Ref Number</Label>
                        <InputField
                            id="so-otherrefnum"
                            name="otherrefnum"
                            type="text"
                            value={formData.otherrefnum}
                            onChange={onInputChange}
                            placeholder="Nomor referensi lain"
                        />
                    </div>

                    {/* Memo */}
                    <div className="md:col-span-3">
                        <Label htmlFor="so-memo">Memo / Notes</Label>
                        <textarea
                            id="so-memo"
                            name="memo"
                            value={formData.memo}
                            onChange={onInputChange}
                            placeholder="Catatan untuk Sales Order ini"
                            rows={2}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl shadow-sm space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                        <Label htmlFor="so-startdate">Start Date</Label>
                        <InputField
                            id="so-startdate"
                            type="date"
                            value={formData.startdate}
                            onChange={(e) => onDateChange('startdate', e.target.value)}
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <Label htmlFor="so-enddate">End Date</Label>
                        <InputField
                            id="so-enddate"
                            type="date"
                            value={formData.enddate}
                            onChange={(e) => onDateChange('enddate', e.target.value)}
                        />
                    </div>

                    {/* Order Status */}
                    <div>
                        <Label htmlFor="so-orderstatus">Order Status</Label>
                        <CustomSelect
                            id="so-orderstatus"
                            name="orderstatus"
                            value={SO_STATUS_OPTIONS.find(o => o.value === formData.orderstatus) || null}
                            onChange={(opt) => onSelectChange('orderstatus', opt?.value ?? 'A')}
                            options={SO_STATUS_OPTIONS}
                            placeholder="Pilih Status"
                            isClearable={false}
                            isSearchable={false}
                            disabled={true}
                        />
                    </div>

                    {/* Quotation No */}
                    <div>
                        <Label htmlFor="so-quotation">Quotation No (IEC)</Label>
                        <InputField
                            id="so-quotation"
                            name="custbody_msi_quotation_no_iec"
                            type="text"
                            value={formData.custbody_msi_quotation_no_iec}
                            onChange={onInputChange}
                            placeholder="Nomor Quotation"
                        />
                    </div>
                </div>
            </div>

            {/* Classification */}
            <div className="bg-white rounded-2xl shadow-sm space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {/* Subsidiary */}
                    <div>
                        <Label htmlFor="so-subsidiary">Subsidiary <span className="text-red-500">*</span></Label>
                        <CustomSelect
                            id="so-subsidiary"
                            name="subsidiary"
                            disabled={!formData.entity}
                            value={
                                masterData?.subsidiarys && formData.subsidiary
                                    ? { 
                                        value: formData.subsidiary, 
                                        label: masterData.subsidiarys.find(o => Number(o.id) === Number(formData.subsidiary))?.name || '' 
                                      }
                                    : null
                            }
                            onChange={(opt) => {
                                onSelectChange('subsidiary', opt?.value ? Number(opt.value) : null);
                                onSelectChange('location', null);
                                onSelectChange('location_name', '');
                                onSelectChange('department', null);
                                onSelectChange('department_name', '');
                                onSelectChange('class', null);
                                onSelectChange('class_name', '');
                            }}
                            options={
                                masterData?.subsidiarys
                                    ? masterData.subsidiarys.map(o => ({ value: o.id, label: o.name }))
                                    : []
                            }
                            placeholder={!formData.entity ? "Pilih Customer dahulu" : "Pilih Subsidiary"}
                            isClearable={false}
                            isSearchable={true}
                            isLoading={loadingMasterData}
                        />
                        <FieldError field="subsidiary" />
                    </div>

                    {/* Location */}
                    <div>
                        <Label htmlFor="so-location">Location <span className="text-red-500">*</span></Label>
                        <CustomAsyncSelect
                            name="location"
                            disabled={!formData.subsidiary}
                            value={selectedLocation}
                            onChange={onLocationChange}
                            defaultOptions={locationOptions}
                            loadOptions={onLocationInputChange}
                            onMenuScrollToBottom={onLocationMenuScrollToBottom}
                            isLoading={locationPagination.loading}
                            noOptionsMessage={() => "No locations found"}
                            loadingMessage={() => "Loading locations..."}
                            isSearchable={true}
                            inputValue={locationInputValue}
                            onInputChange={onLocationInputChange}
                            placeholder={!formData.subsidiary ? "Pilih Subsidiary dahulu" : "Pilih Location"}
                        />
                        <FieldError field="location" />
                    </div>

                    {/* Department */}
                    <div>
                        <Label htmlFor="so-department">Department <span className="text-red-500">*</span></Label>
                        <CustomAsyncSelect
                            name="department"
                            disabled={!formData.subsidiary}
                            value={selectedDepartment}
                            onChange={onDepartmentChange}
                            defaultOptions={deptOptions}
                            loadOptions={onDeptInputChange}
                            onMenuScrollToBottom={onDeptMenuScrollToBottom}
                            isLoading={deptPagination.loading}
                            noOptionsMessage={() => "No departments found"}
                            loadingMessage={() => "Loading departments..."}
                            isSearchable={true}
                            inputValue={deptInputValue}
                            onInputChange={onDeptInputChange}
                            placeholder={!formData.subsidiary ? "Pilih Subsidiary dahulu" : "Pilih Department"}
                        />
                        <FieldError field="department" />
                    </div>

                    {/* Class */}
                    <div>
                        <Label htmlFor="so-class">Class</Label>
                        <CustomAsyncSelect
                            name="class"
                            disabled={!formData.subsidiary}
                            value={selectedClass}
                            onChange={onClassChange}
                            defaultOptions={classOptions}
                            loadOptions={onClassInputChange}
                            onMenuScrollToBottom={onClassMenuScrollToBottom}
                            isLoading={classPagination.loading}
                            noOptionsMessage={() => "No classes found"}
                            loadingMessage={() => "Loading classes..."}
                            isSearchable={true}
                            inputValue={classInputValue}
                            onInputChange={onClassInputChange}
                            placeholder={!formData.subsidiary ? "Pilih Subsidiary dahulu" : "Pilih Class"}
                        />
                        <FieldError field="class" />
                    </div>
                </div>
            </div>

        </div>
    );
}
