import { useCallback, useEffect, useMemo, useState } from 'react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import Label from '@/components/form/Label';
import InputField from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { SalesOrderFormData, SalesOrderFormItem } from '../types/salesOrder';
import { formatCurrencyID } from '@/helpers/generalHelper';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';
import Button from '@/components/ui/button/Button';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table';
import { LoadingOverlay } from '@/components/common/Loading';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

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

    // Infinite scroll untuk tabel items
    const BATCH_SIZE = 50;
    const [displayCount, setDisplayCount] = useState(BATCH_SIZE);

    const hasMoreItems = displayCount < (formData.items?.length || 0);

    const loadMoreItems = useCallback(() => {
        setDisplayCount(prev => Math.min(prev + BATCH_SIZE, formData.items?.length || 0));
    }, [formData.items?.length]);

    const { loadingRef } = useInfiniteScroll({
        hasMore: hasMoreItems,
        loading: false,
        onLoadMore: loadMoreItems,
        threshold: 100,
    });

    // Reset displayCount ketika items berubah (misal item ditambah/dihapus)
    useEffect(() => {
        setDisplayCount(BATCH_SIZE);
    }, [formData.items?.length]);

    const visibleItems = useMemo(
        () => formData.items?.slice(0, displayCount) || [],
        [formData.items, displayCount]
    );
    const itemColumns: TableColumn<SalesOrderFormItem>[] = [
        {
            name: 'Item',
            selector: (row: SalesOrderFormItem) => row.item_name || 'N/A',
            cell: row => (
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.item_name || 'N/A'}</div>
                    <div className="block text-sm text-gray-500">{row.itemId || '-'}</div>
                </div>
            ),
            grow: 2
        },
        {
            name: 'Description',
            selector: (row: SalesOrderFormItem) => row.description || 'N/A',
            cell: (row, idx) => (
                <InputField
                    type="text"
                    value={row.description}
                    onChange={(e) => onUpdateItem(idx, 'description', e.target.value)}
                    placeholder="Deskripsi item"
                    className="text-xs py-1"
                />
            ),
            width: '250px',
        },
        {
            name: 'Quantity',
            selector: (row: SalesOrderFormItem) => row.qty || 0,
            cell: (row, index) => (<>
                <InputField
                    type="number"
                    value={row.qty.toString()}
                    onChange={(e) => onUpdateItem(index, 'qty', Number(e.target.value))}
                    className="text-right text-xs py-1"
                    min="0"
                />
            </>),
            wrap: true,
            width: '120px',
        },
        {
            name: 'Rate',
            selector: (row: SalesOrderFormItem) => row.rate || 0,
            cell: (row, index) => (<>
                <InputField
                    type="number"
                    value={row.rate.toString()}
                    onChange={(e) => onUpdateItem(index, 'rate', Number(e.target.value))}
                    className="text-right text-xs py-1"
                    min="0"
                />
            </>),
            wrap: true,
            width: '250px',
        },
        {
            name: 'Amount',
            selector: (row: SalesOrderFormItem) => formatCurrencyID(Number(row.amount)) || 'N/A',
            center: true,
            width: '250px',
            sortable: false
        },
        {
            name: 'Department',
            selector: (row: SalesOrderFormItem) => row.department_name || 'N/A',
            cell: (row, index) => (<>
                <CustomAsyncSelect
                    name={`department_${index}`}
                    disabled={!formData.subsidiary}
                    placeholder={!formData.entity ? "Pilih Customer dahulu" : !formData.subsidiary ? "Pilih Subsidiary dahulu" : "Select department..."}
                    value={row.department ? {
                        label: row.department_name || '',
                        value: row.department.toString()
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
                        onUpdateItem(index, 'department', option ? parseInt(option.value) : null);
                        onUpdateItem(index, 'department_name', option ? option.label : '');
                    }}
                    className="text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            </>),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Class',
            selector: (row: SalesOrderFormItem) => row.class || 0,
            cell: (row, index) => (<>
                <CustomAsyncSelect
                    name={`class_${index}`}
                    disabled={!formData.subsidiary}
                    placeholder={!formData.entity ? "Pilih Customer dahulu" : !formData.subsidiary ? "Pilih Subsidiary dahulu" : "Select class..."}
                    value={row.class ? {
                        label: row.class_name || '',
                        value: row.class.toString()
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
                        onUpdateItem(index, 'class', option ? parseInt(option.value) : null);
                        onUpdateItem(index, 'class_name', option ? option.label : '');
                    }}
                    className="text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            </>),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Location',
            selector: (row: SalesOrderFormItem) => row.location || 0,
            cell: (row, index) => (
                <CustomAsyncSelect
                    name={`location_${index}`}
                    disabled={!formData.subsidiary}
                    placeholder={!formData.entity ? "Pilih Customer dahulu" : !formData.subsidiary ? "Pilih Subsidiary dahulu" : "Select location..."}
                    value={row.location ? {
                        label: row.location_name || '',
                        value: row.location.toString()
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
                        onUpdateItem(index, 'location', option ? parseInt(option.value) : null);
                        onUpdateItem(index, 'location_name', option ? option.label : '');
                    }}
                    className="text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            ),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Actions',
            cell: (row: SalesOrderFormItem, index: number) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveItem(row.id || index.toString())}
                        className="text-red-600 hover:text-red-800"
                    >
                        <MdDeleteOutline size={14} />
                    </Button>
                </div>
            ),
            width: '100px',
            center: true,
            sortable: false
        }
    ];
    return (
        <div className="space-y-6">

            {/* Items Section */}
            <div className="mb-6 space-y-6 p-6">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">Line Items</h3>

                {/* Add Item */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Label htmlFor="so-add-item">Select Item to Add</Label>
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
                    <div className="flex flex-col justify-end">
                        <Button
                            type="button"
                            onClick={() => {
                                if (selectedNewItem) {
                                    onAddItem(selectedNewItem);
                                    setSelectedNewItem(null);
                                }
                            }}
                            
                            className={`flex items-center gap-2 ${(!selectedNewItem || !formData.subsidiary) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!selectedNewItem || !formData.subsidiary}
                        >
                            <MdAdd size={18} />
                            Add Item
                        </Button>
                    </div>
                </div>

                {errors.items && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.items}</p>
                    </div>
                )}

                {/* Items Table */}
                {formData.items && formData.items.length > 0 ? (
                    <div
                        className="mt-6 font-secondary overflow-y-auto"
                        style={{ maxHeight: formData.items?.length > 100 ? '920px' : '625px' }}
                    >
                        <CustomDataTable
                            columns={itemColumns}
                            data={visibleItems}
                            pagination={false}
                            responsive
                            striped={false}
                            highlightOnHover={false}
                            className={`min-h-[300px]`}
                            noDataComponent={
                                <div className="text-center py-8 text-gray-500">
                                    No items added yet
                                </div>
                            }
                        />
                        {/* Sentinel harus di dalam wrapper scroll agar IntersectionObserver bekerja */}
                        <div ref={loadingRef} className="py-2 text-center text-sm text-gray-400">
                            {hasMoreItems && (
                                <LoadingOverlay
                                    message={`Menampilkan ${displayCount} dari ${formData.items.length} item...`}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={`text-center py-8 text-gray-500 border-2 border-dashed rounded-lg ${errors?.items ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                        <p className="text-lg mb-2">No items added yet</p>
                        <p className="text-sm">Start by selecting an item from the dropdown above</p>
                    </div>
                )}

                {/* Summary Section */}
                <div className="w-full px-0 space-y-3">
                    <div className="space-y-6">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Total Items:</span>
                            <span className="font-medium text-gray-800">
                                {formData.items.reduce((acc, item) => acc + (Number(item.qty) || 0), 0)}
                            </span>
                        </div>
                        <div className="border-t border-gray-300 pt-3 flex justify-between text-sm font-primary-bold">
                            <span className="text-base font-bold text-gray-900">Grand Total:</span>
                            <span className="text-blue-700">
                                {formatCurrencyID(formData.items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
