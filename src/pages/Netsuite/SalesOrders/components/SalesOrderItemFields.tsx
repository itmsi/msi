import { useCallback, useEffect, useMemo, useState } from 'react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import Label from '@/components/form/Label';
import InputField from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { SalesOrderFormData, SalesOrderFormItem } from '../types/salesOrder';
import { formatCurrencyDynamic, formatCurrencyTyping, formatNumberPriceKoma, handleCurrencyKeyPress, handleKeyPress, parseCurrencyIDR } from '@/helpers/generalHelper';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';
import Button from '@/components/ui/button/Button';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { LoadingOverlay } from '@/components/common/Loading';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
// import Input from '@/components/form/input/InputField';

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
    masterData,
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

    // Helper to ensure numeric value
    const toNumber = (value: any): number => {
        if (typeof value === 'string') return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
        return Number(value) || 0;
    };
    const loadMoreItems = useCallback(() => {
        setDisplayCount(prev => Math.min(prev + BATCH_SIZE, formData.items?.length || 0));
    }, [formData.items?.length]);

    const { loadingRef } = useInfiniteScroll({
        hasMore: hasMoreItems,
        loading: false,
        onLoadMore: loadMoreItems,
        threshold: 100,
    });
    
    const updateItemById = (index: number, field: string, value: any) => {
        if (onUpdateItem) {
            onUpdateItem(index, field, value);
        }
    };

    // Extract tax percentage from tax code name
    const extractTaxPercentage = (taxCodeName: string): number => {
        const match = taxCodeName.match(/([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
    };
    
    // Calculate tax amounts
    const calculateTaxAmounts = (amount: number, taxCodeName: string) => {
        const numericAmount = toNumber(amount);
        const taxPercentage = extractTaxPercentage(taxCodeName);
        const taxAmount = (numericAmount * taxPercentage) / 100;
        const grossAmount = numericAmount + taxAmount;
        
        return { 
            taxAmount: Math.round(taxAmount), 
            grossAmount: Math.round(grossAmount)
        };
    };
    
    // Update tax calculations for an item
    const updateTaxCalculation = (index: number, amount: number, taxCodeName?: string) => {
        if (taxCodeName && amount > 0) {
            const { taxAmount, grossAmount } = calculateTaxAmounts(amount, taxCodeName);
            updateItemById(index, 'tax_amount', taxAmount);
            updateItemById(index, 'gross_amount', grossAmount);
        } else {
            updateItemById(index, 'tax_amount', 0);
            updateItemById(index, 'gross_amount', toNumber(amount));
        }
    };

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
            grow: 2,
            width: '260px',
        },
        {
            name: 'Description',
            selector: (row: SalesOrderFormItem) => row.description || '-',
            cell: (row, idx) => (<>
                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md min-h-[42px] flex items-center">
                        {row.description || '-'}
                    </p>
                ) : (
                <TextArea
                    name={`description_${idx}`}
                    value={row.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {                                
                        onUpdateItem(idx, 'description', e.target.value);
                    }}
                    rows={2} 
                    placeholder="Enter item description..."
                    className={`w-full px-3 py-2 my-2 w-[220px] border-0 border-b-1 rounded-none focus:border-b-blue-500 ${
                        errors[`description_${idx}`] ? 'border-red-500 ' : 'border-gray-300'
                    }`}
                />
                )}
            </>),
            width: '250px',
        },
        {
            name: 'Quantity',
            selector: (row: SalesOrderFormItem) => row.qty || 0,
            cell: (row, index) => (<>
                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md min-h-[42px] flex items-center">
                        {row.qty || 'N/A'}
                    </p>
                ) : (
                <InputField
                    name={`qty_${index}`}
                    type="text"
                    maxLength={3}
                    min='0'
                    value={row.qty && row.qty > 0 ? row.qty.toString() : ''}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => {
                        const qty = toNumber(e.target.value);
                        
                        onUpdateItem(index as number, 'qty', qty);
                    }}
                    onBlur={(e) => {
                        const qty = toNumber(e.target.value);
                        if (qty === 0) {
                            onUpdateItem(index as number, 'qty', 1);
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    className={`p-1 px-3 w-[80px] text-center`}
                />
                )}
            </>),
            wrap: true,
            center: true,
            width: '120px',
        },
        {
            name: 'Rate',
            selector: (row: SalesOrderFormItem) => row.rate || 0,
            cell: (row, index) => (<>
                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md min-h-[42px] flex items-center">
                        {formatCurrencyDynamic(row.rate.toString(), formData?.currency_name || '')}
                    </p>
                ) : (
                <InputField
                    name={`rate_${index}`}
                    type="text"
                    value={row.rate && row.rate > 0 ? formatCurrencyTyping(row.rate.toString()) : '0'}
                    onKeyPress={handleCurrencyKeyPress}
                    // onChange={(e) => {
                    //     const rawValue = e.target.value;
                    //     const costVal = parseCurrencyIDR(rawValue);
                    //     onUpdateItem(index as number, 'rate', costVal);
                    // }}
                    onChange={(e) => {
                        const rawValue = e.target.value;
                        const fobVal = parseCurrencyIDR(rawValue);
                        // const landedCost = toNumber(row.custcol_me_landed_cost);
                        const quantity = toNumber(row.qty) || 1;
                        
                        const rate = fobVal;
                        const amount = quantity * rate;
                        
                        updateItemById(index as number, 'custcol_msi_fob', fobVal);
                        updateItemById(index as number, 'rate', rate);
                        updateItemById(index as number, 'amount', amount);
                        updateItemById(index as number, 'total', amount);
                        
                        updateTaxCalculation(index as number, amount, row.taxcode_name);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="border-1 rounded p-1 px-3 w-[285px] text-center"
                    placeholder="0"
                />
                )}
            </>),
            wrap: true,
            width: '250px',
            center: true,
        },
        {
            name: 'Amount',
            selector: (row: SalesOrderFormItem) => row.amount || 0,
            cell: (row, index) => (<>
                <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                    formatCurrencyDynamic(row.amount.toString(), formData?.currency_name || '')
                }</p>
                <InputField
                    name={`amount_${index}`}
                    type="text"
                    value={row.amount && row.amount > 0 ? formatNumberPriceKoma(row.amount) : ''}
                    disabled={true}
                    readonly={true}
                    className="border-0 rounded bg-white p-1 px-3 text-center text-gray cursor-text hidden"
                    placeholder="Auto calculated"
                />
            </>),
            center: true,
            width: '250px',
            sortable: false
        },
        {
            name: 'Tax Code',
            selector: (row: SalesOrderFormItem) => row.taxcode || 'N/A',
            cell: (row, index) => (<>
                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md min-h-[42px] flex items-center">
                        {row.taxcode_name || 'N/A'}
                    </p>
                ) : (
                <div className="w-[250px]">
                    <CustomSelect
                        options={masterData?.taxcodes?.map(tax => ({
                            label: tax.name,
                            value: tax.id.toString()
                        })) || []}
                        value={row.taxcode ? {
                            label: row.taxcode_name || '',
                            value: row.taxcode.toString()
                        } : null}
                        onChange={(option) => {
                            if (option) {
                                updateItemById(index as number, 'taxcode', parseInt(option.value));
                                updateItemById(index as number, 'taxcode_name', option.label);
                                updateItemById(index as number, 'tax_rate', option.label);
                                
                                const currentAmount = toNumber(row.amount);
                                updateTaxCalculation(index as number, currentAmount, option.label);
                            } else {
                                // Clear tax code
                                updateItemById(index as number, 'taxcode', 0);
                                updateItemById(index as number, 'taxcode_name', '');
                                updateItemById(index as number, 'tax_rate', '');
                                
                                const currentAmount = toNumber(row.amount);
                                updateTaxCalculation(index as number, currentAmount);
                            }
                        }}
                        placeholder="Select tax code"
                        className="text-xs"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
                )}
            </>),
            center: true,
            width: '250px',
            sortable: false
        },
        {
            name: 'Tax Rate',
            selector: (row) => row.tax_rate || 'N/A',
            cell: (row) => (
                <div className="font-medium text-center">
                    {row.taxcode_name ? row.taxcode_name.replace(/VAT/g, '') : '-'}
                </div>
            ),
            center: true,
            width: '150px',
            sortable: false
        },
        {
            name: 'Tax Amt',
            selector: (row) => row.tax_amount || 0,
            cell: (row) => (
                <div className="font-medium text-center">
                    {row.tax_amount ? formatCurrencyDynamic(row.tax_amount, formData?.currency_name || '') : formatCurrencyDynamic(0, formData?.currency_name || '')}
                </div>
            ),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Gross Amt',
            selector: (row) => row.gross_amount || 0,
            cell: (row) => (
                <div className="font-medium text-center">
                    {row.gross_amount ? formatCurrencyDynamic(row.gross_amount, formData?.currency_name || '') : formatCurrencyDynamic(0, formData?.currency_name || '')}
                </div>
            ),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Department',
            selector: (row: SalesOrderFormItem) => row.department_name || 'N/A',
            cell: (row, index) => (<>
                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md min-h-[42px] flex items-center">
                        {row.department_name || 'N/A'}
                    </p>
                ) : (
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
                        onUpdateItem(index, 'department', option ? parseInt(String(option.value)) : null);
                        onUpdateItem(index, 'department_name', option ? option.label : '');
                    }}
                    className="w-full text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
                )}
            </>),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Class',
            selector: (row: SalesOrderFormItem) => row.class || 0,
            cell: (row, index) => (<>
                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md min-h-[42px] flex items-center">
                        {row.class_name || 'N/A'}
                    </p>
                ) : (
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
                        onUpdateItem(index, 'class', option ? parseInt(String(option.value)) : null);
                        onUpdateItem(index, 'class_name', option ? option.label : '');
                    }}
                    className="w-full text-xs"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
                )}
            </>),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Location',
            selector: (row: SalesOrderFormItem) => row.location || 0,
            cell: (row, index) => (<>
                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md min-h-[42px] flex items-center">
                        {row.location_name || 'N/A'}
                    </p>
                ) : (
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
                            onUpdateItem(index, 'location', option ? parseInt(String(option.value)) : null);
                            onUpdateItem(index, 'location_name', option ? option.label : '');
                        }}
                        className="w-full text-xs"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                )}
            </>),
            center: true,
            width: '300px',
            sortable: false
        },
        ...(formData.custbody_me_approval_status !== 2 && formData.custbody_me_approval_status !== 3 ? [createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: (row: SalesOrderFormItem) => {
                    onRemoveItem(row.id || '')
                },
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Remove Item',
                permission: 'delete' as const
            }
        ])] : [])
    ];
    return (
        <div className="space-y-6">

            {/* Items Section */}
            <div className="mb-6 space-y-6 p-6">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">Line Items</h3>

                {(formData.custbody_me_approval_status !== 2 && formData.custbody_me_approval_status !== 3) && (<>  
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
                    {(!formData.subsidiary || !formData.location || !formData.class || !formData.department) && (
                        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
                            Lengkapi field Subsidiary, Location, Class, dan Department terlebih dahulu sebelum menambahkan item.
                        </p>
                    )}
                </>)}

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
                {/* Invoice Summary */}
                {(formData.custbody_me_approval_status !== 1) && (
                    formData.items && formData.items.length > 0 && (<>
                        <SOInvoiceSummary 
                            items={formData.items} 
                            currency={formData?.currency_name || ''} 
                            serverTotal={Number(formData.total_amount)}
                        />
                    </>)
                )}

            </div>
        </div>
    );
}

// Summary invoice dari items
export const SOInvoiceSummary: React.FC<{ items: SalesOrderFormItem[], currency: string, serverTotal?: number }> = ({ items, currency, serverTotal }) => {
    // Helper to ensure numeric value  
    const toNumber = (value: any): number => {
        if (typeof value === 'string') {
            return parseCurrencyIDR(value);
        }
        return Number(value) || 0;
    };
    const summary = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + toNumber(formatNumberPriceKoma(item.amount)), 0);
        const totalTax = items.reduce((sum, item) => sum + toNumber(item.tax_amount), 0);
        const grandTotal = serverTotal !== undefined ? serverTotal : items.reduce((sum, item) => sum + toNumber(item.gross_amount || item.amount), 0);
        const totalQty = items.reduce((sum, item) => sum + toNumber(item.qty), 0);

        return { subtotal, totalTax, grandTotal, totalQty };
    }, [items]);

    return (
            <div className="w-full px-0 space-y-3">
                <div className="space-y-6">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Total Items</span>
                        <span className="font-medium text-gray-800">{items.length} item ({summary.totalQty} qty)</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-800">{formatCurrencyDynamic(summary.subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax</span>
                        <span className="font-medium text-gray-800">{formatCurrencyDynamic(summary.totalTax, currency)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex justify-between text-sm font-primary-bold">
                        <span>Grand Total</span>
                        <span className="text-blue-700">{formatCurrencyDynamic(Number(summary.grandTotal), currency)}</span>
                    </div>
                </div>
            </div>
    );
};