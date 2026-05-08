import { useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import Label from '@/components/form/Label';
import InputField from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { SalesOrderFormData } from '../types/salesOrder';
import { formatCurrencyID } from '@/helpers/generalHelper';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

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

    // Item Select Props
    itemOptions: any[];
    itemPagination: any;
    itemInput: string;
    onItemInputChange: (val: string) => Promise<any[]>;
    onItemMenuScrollToBottom: () => void;

    // Item Location Props
    locationOptions: any[];
    locationPagination: any;
    locationInput: string;
    onLocationInputChange: (val: string) => Promise<any[]>;
    onLocationMenuScrollToBottom: () => void;

    // Item Class Props
    classOptions: any[];
    classPagination: any;
    classInput: string;
    onClassInputChange: (val: string) => Promise<any[]>;
    onClassMenuScrollToBottom: () => void;

    // Item Department Props
    deptOptions: any[];
    deptPagination: any;
    deptInput: string;
    onDeptInputChange: (val: string) => Promise<any[]>;
    onDeptMenuScrollToBottom: () => void;
}

export default function SalesOrderItemFields({
    formData,
    errors,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    itemOptions,
    itemPagination,
    itemInput,
    onItemInputChange,
    onItemMenuScrollToBottom,
    locationOptions,
    locationPagination,
    locationInput,
    onLocationInputChange,
    onLocationMenuScrollToBottom,
    classOptions,
    classPagination,
    classInput,
    onClassInputChange,
    onClassMenuScrollToBottom,
    deptOptions,
    deptPagination,
    deptInput,
    onDeptInputChange,
    onDeptMenuScrollToBottom,
}: SOFormFieldsProps) {
    const [selectedNewItem, setSelectedNewItem] = useState<any>(null);

    return (
        <div className="space-y-6">

            {/* Items Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <h3 className="text-base font-semibold text-gray-900">
                        Line Items
                        <span className="ml-2 text-sm font-normal text-gray-500">({formData.items.length} item)</span>
                    </h3>
                </div>

                {/* Add Item */}
                <div className="mb-4 flex gap-3 items-end">
                    <div className="flex-1">
                        <Label htmlFor="so-add-item">Tambah Item</Label>
                        <CustomAsyncSelect
                            name="add_item"
                            disabled={!formData.subsidiary}
                            value={selectedNewItem}
                            onChange={(opt) => setSelectedNewItem(opt)}
                            defaultOptions={itemOptions}
                            loadOptions={onItemInputChange}
                            onMenuScrollToBottom={onItemMenuScrollToBottom}
                            isLoading={itemPagination.loading}
                            noOptionsMessage={() => "No items found"}
                            loadingMessage={() => "Loading items..."}
                            isSearchable={true}
                            inputValue={itemInput}
                            onInputChange={onItemInputChange}
                            placeholder={!formData.entity ? "Pilih Customer dahulu" : !formData.subsidiary ? "Pilih Subsidiary dahulu" : "Cari item..."}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (selectedNewItem) {
                                onAddItem(selectedNewItem);
                                setSelectedNewItem(null);
                            }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium h-[42px] ${(!selectedNewItem || !formData.subsidiary) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedNewItem || !formData.subsidiary}
                    >
                        <MdAdd size={18} />
                        Tambah
                    </button>
                </div>

                {errors.items && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.items}</p>
                    </div>
                )}

                {/* Items Table */}
                {formData.items.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[250px]">Item</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[400px]">Description</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-44">Qty</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-44">Rate</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-44">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[400px]">Department</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[400px]">Class</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[400px]">Location</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">Hapus</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {formData.items.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 text-xs">{item.item_name}</div>
                                                <div className="text-xs text-gray-400">ID: {item.itemId}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <InputField
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => onUpdateItem(idx, 'description', e.target.value)}
                                                    placeholder="Deskripsi item"
                                                    className="text-xs py-1"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <InputField
                                                    type="number"
                                                    value={item.qty.toString()}
                                                    onChange={(e) => onUpdateItem(idx, 'qty', Number(e.target.value))}
                                                    className="text-right text-xs py-1"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <InputField
                                                    type="number"
                                                    value={item.rate.toString()}
                                                    onChange={(e) => onUpdateItem(idx, 'rate', Number(e.target.value))}
                                                    className="text-right text-xs py-1"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                {formatCurrencyID(Number(item.amount))}
                                            </td>
                                            <td className="px-4 py-3">
                                                <CustomAsyncSelect
                                                    name={`department_${idx}`}
                                                    disabled={!formData.subsidiary}
                                                    placeholder={!formData.entity ? "Pilih Customer dahulu" : !formData.subsidiary ? "Pilih Subsidiary dahulu" : "Select department..."}
                                                    value={item.department ? {
                                                        label: item.department_name || '',
                                                        value: item.department.toString()
                                                    } : null}
                                                    defaultOptions={deptOptions}
                                                    loadOptions={onDeptInputChange}
                                                    onMenuScrollToBottom={onDeptMenuScrollToBottom}
                                                    isLoading={deptPagination.loading}
                                                    noOptionsMessage={() => "No departments found"}
                                                    loadingMessage={() => "Loading departments..."}
                                                    isSearchable={true}
                                                    inputValue={deptInput}
                                                    onInputChange={onDeptInputChange}
                                                    onChange={(option) => {
                                                        onUpdateItem(idx, 'department', option ? parseInt(option.value) : null);
                                                        onUpdateItem(idx, 'department_name', option ? option.label : '');
                                                    }}
                                                    className="text-xs"
                                                    menuPortalTarget={document.body}
                                                    menuPosition="fixed"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <CustomAsyncSelect
                                                    name={`class_${idx}`}
                                                    disabled={!formData.subsidiary}
                                                    placeholder={!formData.entity ? "Pilih Customer dahulu" : !formData.subsidiary ? "Pilih Subsidiary dahulu" : "Select class..."}
                                                    value={item.class ? {
                                                        label: item.class_name || '',
                                                        value: item.class.toString()
                                                    } : null}
                                                    defaultOptions={classOptions}
                                                    loadOptions={onClassInputChange}
                                                    onMenuScrollToBottom={onClassMenuScrollToBottom}
                                                    isLoading={classPagination.loading}
                                                    noOptionsMessage={() => "No classes found"}
                                                    loadingMessage={() => "Loading classes..."}
                                                    isSearchable={true}
                                                    inputValue={classInput}
                                                    onInputChange={onClassInputChange}
                                                    onChange={(option) => {
                                                        onUpdateItem(idx, 'class', option ? parseInt(option.value) : null);
                                                        onUpdateItem(idx, 'class_name', option ? option.label : '');
                                                    }}
                                                    className="text-xs"
                                                    menuPortalTarget={document.body}
                                                    menuPosition="fixed"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <CustomAsyncSelect
                                                    name={`location_${idx}`}
                                                    disabled={!formData.subsidiary}
                                                    placeholder={!formData.entity ? "Pilih Customer dahulu" : !formData.subsidiary ? "Pilih Subsidiary dahulu" : "Select location..."}
                                                    value={item.location ? {
                                                        label: item.location_name || '',
                                                        value: item.location.toString()
                                                    } : null}
                                                    defaultOptions={locationOptions}
                                                    loadOptions={onLocationInputChange}
                                                    onMenuScrollToBottom={onLocationMenuScrollToBottom}
                                                    isLoading={locationPagination.loading}
                                                    noOptionsMessage={() => "No locations found"}
                                                    loadingMessage={() => "Loading locations..."}
                                                    isSearchable={true}
                                                    inputValue={locationInput}
                                                    onInputChange={onLocationInputChange}
                                                    onChange={(option) => {
                                                        onUpdateItem(idx, 'location', option ? parseInt(option.value) : null);
                                                        onUpdateItem(idx, 'location_name', option ? option.label : '');
                                                    }}
                                                    className="text-xs"
                                                    menuPortalTarget={document.body}
                                                    menuPosition="fixed"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveItem(item.id)}
                                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus item"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Section */}
                        <div className="mt-6 flex justify-end">
                            <div className="w-full lg:w-1/3 space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Total Items:</span>
                                    <span className="font-semibold text-gray-900">
                                        {formData.items.reduce((acc, item) => acc + (Number(item.qty) || 0), 0)}
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900">Grand Total:</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatCurrencyID(formData.items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm">Belum ada item. Cari dan tambahkan item di atas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
