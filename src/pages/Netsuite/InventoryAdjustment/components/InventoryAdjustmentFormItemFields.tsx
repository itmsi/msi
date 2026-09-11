import { useState } from 'react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { TableColumn } from 'react-data-table-component';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import Button from '@/components/ui/button/Button';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { InventoryAdjustmentFormData, InventoryAdjustmentFormLine } from '../types/inventoryAdjustment';

interface AsyncSelectFieldProps {
    options: any[];
    pagination: { loading: boolean };
    inputValue: string;
    onInputChange: (val: string) => Promise<any[]>;
    onMenuScrollToBottom: () => void;
}

interface InventoryAdjustmentFormItemFieldsProps {
    formData: InventoryAdjustmentFormData;
    errors: Record<string, string>;
    onAddLine: (selectedItem: any) => void;
    onRemoveLine: (lineId: string) => void;
    onUpdateLine: (index: number, field: string, value: any) => void;

    item: AsyncSelectFieldProps;
    location: AsyncSelectFieldProps;
    department: AsyncSelectFieldProps;
    classField: AsyncSelectFieldProps;
}

// Kolom disamain dengan sublist "Inventory Adjustment" di UI NetSuite yang
// relevan untuk create: Item, Location, Quantity, Unit Cost, Department,
// Class, ME - Purchase Number (Line), Serials, Memo.
export default function InventoryAdjustmentFormItemFields({
    formData,
    errors,
    onAddLine,
    onRemoveLine,
    onUpdateLine,
    item,
    location,
    department,
    classField,
}: InventoryAdjustmentFormItemFieldsProps) {
    const [selectedNewItem, setSelectedNewItem] = useState<any>(null);
    const isHeaderComplete = !!(formData.subsidiary && formData.adjlocation && formData.department && formData.class);

    const lineColumns: TableColumn<InventoryAdjustmentFormLine>[] = [
        {
            name: 'Item',
            selector: row => row.item_displayname || '-',
            cell: row => (
                <div className="py-1">
                    <span className="text-sm font-medium text-gray-900">{row.item_displayname || '-'}</span>
                    {row.item_name && <div className="text-xs text-gray-500">{row.item_name}</div>}
                </div>
            ),
            wrap: true,
            minWidth: '220px',
        },
        {
            name: 'Location',
            selector: row => row.location_name || '-',
            cell: (row, index) => (
                <CustomAsyncSelect
                    name={`location_${index}`}
                    placeholder="Select location..."
                    value={row.location ? { label: row.location_name || '', value: String(row.location) } : null}
                    defaultOptions={location.options}
                    loadOptions={location.onInputChange}
                    onMenuScrollToBottom={location.onMenuScrollToBottom}
                    isLoading={location.pagination.loading}
                    noOptionsMessage={() => 'No locations found'}
                    loadingMessage={() => 'Loading locations...'}
                    isSearchable={true}
                    inputValue={location.inputValue}
                    onInputChange={location.onInputChange}
                    onChange={(option) => {
                        onUpdateLine(index as number, 'location', option ? Number(option.value) : null);
                        onUpdateLine(index as number, 'location_name', option ? option.label : '');
                    }}
                    className="w-full text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            ),
            minWidth: '220px',
        },
        {
            name: 'Quantity',
            selector: row => row.quantity,
            cell: (row, index) => (
                <Input
                    name={`quantity_${index}`}
                    type="number"
                    placeholder="cth: -3 atau 10"
                    value={row.quantity}
                    onChange={(e) => onUpdateLine(index as number, 'quantity', e.target.value)}
                    className="text-center"
                />
            ),
            center: true,
            minWidth: '130px',
        },
        {
            name: 'Unit Cost',
            selector: row => row.unit_cost,
            cell: (row, index) => (
                <Input
                    name={`unit_cost_${index}`}
                    type="number"
                    placeholder="0"
                    value={row.unit_cost}
                    onChange={(e) => onUpdateLine(index as number, 'unit_cost', e.target.value)}
                    className="text-right"
                />
            ),
            center: true,
            minWidth: '140px',
        },
        {
            name: 'Department',
            selector: row => row.department_name || '-',
            cell: (row, index) => (
                <CustomAsyncSelect
                    name={`department_${index}`}
                    placeholder="Select department..."
                    value={row.department ? { label: row.department_name || '', value: String(row.department) } : null}
                    defaultOptions={department.options}
                    loadOptions={department.onInputChange}
                    onMenuScrollToBottom={department.onMenuScrollToBottom}
                    isLoading={department.pagination.loading}
                    noOptionsMessage={() => 'No departments found'}
                    loadingMessage={() => 'Loading departments...'}
                    isSearchable={true}
                    inputValue={department.inputValue}
                    onInputChange={department.onInputChange}
                    onChange={(option) => {
                        onUpdateLine(index as number, 'department', option ? Number(option.value) : null);
                        onUpdateLine(index as number, 'department_name', option ? option.label : '');
                    }}
                    className="w-full text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            ),
            minWidth: '220px',
        },
        {
            name: 'Class',
            selector: row => row.class_name || '-',
            cell: (row, index) => (
                <CustomAsyncSelect
                    name={`class_${index}`}
                    placeholder="Select class..."
                    value={row.class ? { label: row.class_name || '', value: String(row.class) } : null}
                    defaultOptions={classField.options}
                    loadOptions={classField.onInputChange}
                    onMenuScrollToBottom={classField.onMenuScrollToBottom}
                    isLoading={classField.pagination.loading}
                    noOptionsMessage={() => 'No classes found'}
                    loadingMessage={() => 'Loading classes...'}
                    isSearchable={true}
                    inputValue={classField.inputValue}
                    onInputChange={classField.onInputChange}
                    onChange={(option) => {
                        onUpdateLine(index as number, 'class', option ? Number(option.value) : null);
                        onUpdateLine(index as number, 'class_name', option ? option.label : '');
                    }}
                    className="w-full text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            ),
            minWidth: '220px',
        },
        {
            name: 'ME - Purchase Number (Line)',
            selector: row => row.custcol_me_purchase_number_line || '-',
            cell: (row, index) => (
                <Input
                    name={`custcol_me_purchase_number_line_${index}`}
                    type="text"
                    placeholder="Purchase Number (Line)"
                    value={row.custcol_me_purchase_number_line}
                    onChange={(e) => onUpdateLine(index as number, 'custcol_me_purchase_number_line', e.target.value)}
                />
            ),
            minWidth: '220px',
        },
        {
            name: 'Serials',
            selector: row => row.serials || '-',
            cell: (row, index) => (
                <Input
                    name={`serials_${index}`}
                    type="text"
                    placeholder="SN001, SN002"
                    value={row.serials}
                    onChange={(e) => onUpdateLine(index as number, 'serials', e.target.value)}
                />
            ),
            minWidth: '200px',
        },
        {
            name: 'Memo',
            selector: row => row.memo || '-',
            cell: (row, index) => (
                <Input
                    name={`memo_${index}`}
                    type="text"
                    placeholder="Memo"
                    value={row.memo}
                    onChange={(e) => onUpdateLine(index as number, 'memo', e.target.value)}
                />
            ),
            minWidth: '200px',
        },
        createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: (row: InventoryAdjustmentFormLine) => onRemoveLine(row.id),
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Remove Item',
                permission: 'delete' as const,
            },
        ]),
    ];

    return (
        <div className="mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900">Item Lines</h3>

            <div className="flex gap-4 mb-2">
                <div className="flex-1">
                    <Label>Select Item to Add</Label>
                    <CustomAsyncSelect
                        name="add_item"
                        disabled={!isHeaderComplete}
                        value={selectedNewItem}
                        onChange={(opt) => setSelectedNewItem(opt)}
                        defaultOptions={item.options}
                        loadOptions={item.onInputChange}
                        onMenuScrollToBottom={item.onMenuScrollToBottom}
                        isLoading={item.pagination.loading}
                        noOptionsMessage={() => 'No items found'}
                        loadingMessage={() => 'Loading items...'}
                        isSearchable={true}
                        inputValue={item.inputValue}
                        onInputChange={item.onInputChange}
                        placeholder={!isHeaderComplete ? 'Lengkapi Subsidiary, Location, Department, Class dahulu' : 'Cari item...'}
                    />
                </div>
                <div className="flex flex-col justify-end">
                    <Button
                        type="button"
                        onClick={() => {
                            if (selectedNewItem) {
                                onAddLine(selectedNewItem);
                                setSelectedNewItem(null);
                            }
                        }}
                        className={`flex items-center gap-2 ${(!selectedNewItem || !isHeaderComplete) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!selectedNewItem || !isHeaderComplete}
                    >
                        <MdAdd size={18} />
                        Add Item
                    </Button>
                </div>
            </div>

            {!isHeaderComplete && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
                    Lengkapi field Subsidiary, Adjustment Location, Department, dan Class terlebih dahulu sebelum menambahkan item.
                </p>
            )}

            {errors.lines && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.lines}</p>
                </div>
            )}

            {formData.lines && formData.lines.length > 0 ? (
                <div className="font-secondary overflow-x-auto">
                    <CustomDataTable
                        columns={lineColumns}
                        data={formData.lines}
                        pagination={false}
                        responsive
                        striped={false}
                        highlightOnHover={false}
                        noDataComponent={
                            <div className="text-center py-8 text-gray-500">No item lines found</div>
                        }
                    />
                </div>
            ) : (
                <div className={`text-center py-8 text-gray-500 border-2 border-dashed rounded-lg ${errors.lines ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <p className="text-lg mb-2">No items added yet</p>
                    <p className="text-sm">Start by selecting an item from the dropdown above</p>
                </div>
            )}
        </div>
    );
}
