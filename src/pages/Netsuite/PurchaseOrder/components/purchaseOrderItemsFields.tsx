import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { handleKeyPress, formatCurrencyTyping, parseCurrencyIDR, handleCurrencyKeyPress, formatNumberPriceKoma, formatCurrencyDynamic, handleDecimalInput, formatNumberInputwithComma, formatNumberUSTyping, parseNumberUS } from '@/helpers/generalHelper';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PurchaseOrderForm, MasterDataFormFieldItems, TablePOItem } from '../types/purchaseorder';
import CustomSelect from '@/components/form/select/CustomSelect';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { TableColumn } from 'react-data-table-component';
import { usePOItemsSelect } from '@/hooks/usePOItemsSelect';
import { POLocationPaginationState, POLocationSelectOption } from '@/hooks/usePOLocationSelect';
import { POClassPaginationState, POClassSelectOption } from '@/hooks/usePOClassSelect';
import { PODepartmentPaginationState, PODepartmentSelectOption } from '@/hooks/usePODepartmentSelect';
import TextArea from '@/components/form/input/TextArea';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { LoadingOverlay } from '@/components/common/Loading';


interface POItemsFieldsProps {
    formData: PurchaseOrderForm;
    errors: Record<string, string>;
    masterData?: MasterDataFormFieldItems | null;
    loadingMasterData?: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onDateChange?: (name: string, value: string) => void;
    onAddProductItem: (selectedProduct: any) => void;
    onProductDelete?: (productId: string) => void;
    onUpdateProductItem?: (index: number, field: string, value: any) => void;
    
    // Receive status edit
    editReceive?: boolean;
    
    // Location Select Props
    locationOptions?: POLocationSelectOption[];
    locationPagination?: POLocationPaginationState;
    locationInputValue?: string;
    onLocationInputChange?: (inputValue: string) => Promise<POLocationSelectOption[]>;
    onLocationMenuScrollToBottom?: () => void;
    selectedLocation?: POLocationSelectOption | null;
    onLocationChange?: (option: POLocationSelectOption | null) => void;
    locationError?: string;

    // Class Select Props
    classOptions?: POClassSelectOption[]; // Tambahkan props untuk class options
    classPagination?: POClassPaginationState;
    classInputValue?: string;
    onClassInputChange?: (inputValue: string) => Promise<POClassSelectOption[]>;
    onClassMenuScrollToBottom?: () => void;
    selectedClass?: POClassSelectOption | null;
    onClassChange?: (option: POClassSelectOption | null) => void;
    classError?: string;
    // Department Select Props
    departmentOptions?: PODepartmentSelectOption[]; // Tambahkan props untuk department options
    departmentPagination?: PODepartmentPaginationState;
    departmentInputValue?: string;
    onDepartmentInputChange?: (inputValue: string) => Promise<PODepartmentSelectOption[]>;
    onDepartmentMenuScrollToBottom?: () => void;
    selectedDepartment?: PODepartmentSelectOption | null;
    onDepartmentChange?: (option: PODepartmentSelectOption | null) => void;
    departmentError?: string;
    // Grand total dari server (foreigntotal) — override kalkulasi lokal di Edit page
    serverTotal?: number;
}

const purchaseOrderItemFields: React.FC<POItemsFieldsProps> = ({
    formData,
    errors,
    masterData,
    loadingMasterData,
    onAddProductItem,
    onProductDelete,
    onUpdateProductItem,

    // Receive status edit
    editReceive,
    
    // Location props
    locationOptions = [],
    locationPagination = { page: 1, hasMore: true, loading: false },
    locationInputValue = '',
    onLocationInputChange,
    onLocationMenuScrollToBottom,

    // Class props
    classOptions = [],
    classPagination = { page: 1, hasMore: true, loading: false },
    classInputValue = '',
    onClassInputChange,
    onClassMenuScrollToBottom,
    
    // Department props
    departmentOptions = [],
    departmentPagination = { page: 1, hasMore: true, loading: false },
    departmentInputValue = '',
    onDepartmentInputChange,
    onDepartmentMenuScrollToBottom,
    serverTotal,
}) => {
    // Use POItemsSelect hook for product management
    const {
        POItemsOptions,
        pagination,
        inputValue,
        handleInputChange: handleProductInputChange,
        handleMenuScrollToBottom,
        initializeOptions
    } = usePOItemsSelect();

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [productSelectError, setProductSelectError] = useState<string>('');

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

    // Cek apakah semua field utama sudah terisi
    const isFormComplete = !!(formData.customform && formData.purchasedate && formData.vendorid && formData.currency && formData.subsidiary && formData.location && formData.class && formData.department);
    // Handle update item function
    const updateItemById = (index: number, field: string, value: any) => {
        if (onUpdateProductItem) {
            onUpdateProductItem(index, field, value);
        }
    };
    
    // Helper to ensure numeric value
    const toNumber = (value: any): number => {
        if (typeof value === 'string') return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
        return Number(value) || 0;
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

    // Initialize options on mount
    useEffect(() => {
        initializeOptions();
    }, [initializeOptions]);

    // Handle product selection
    const handleProductChange = (option: any) => {
        setSelectedProduct(option);
        if (productSelectError) {
            setProductSelectError('');
        }
    };

    // Handle add product button click
    const handleAddProduct = () => {
        if (!selectedProduct) {
            setProductSelectError('Please select a product');
            return;
        }

        onAddProductItem(selectedProduct);
        
        // Clear selection after adding
        setSelectedProduct(null);
    };
    console.log({
        a: visibleItems
    });
    
    // Define product table columns
    const productColumns: TableColumn<TablePOItem>[] = [
        {
            name: 'Product Name',
            selector: (row: TablePOItem) => row.product_name || 'N/A',
            sortable: false,
            grow: 2
        },
        {
            name: 'Quantity',
            selector: (row: TablePOItem) => row.qty || 0,
            cell: (row, index) => (<>
                    {((formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null)) && !(editReceive) ? (
                        <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                            row.qty && row.qty > 0 ? row.qty.toString() : '-'
                        }</p>
                    ) : (
                        <Input
                            name={`qty_${index}`}
                            type="text"
                            maxLength={3}
                            min='0'
                            value={row.qty && row.qty > 0 ? row.qty.toString() : ''}
                            onKeyPress={handleKeyPress}
                            onChange={(e) => {
                                const qty = toNumber(e.target.value);
                                const rate = toNumber(row.rate);
                                const amount = qty * rate;
                                
                                updateItemById(index as number, 'qty', qty);
                                updateItemById(index as number, 'amount', amount);
                                updateItemById(index as number, 'total', amount);
                                
                                updateTaxCalculation(index as number, amount, row.taxcode_name);
                            }}
                            onBlur={(e) => {
                                const qty = toNumber(e.target.value);
                                if (qty === 0) {
                                    const rate = toNumber(row.rate);
                                    const amount = rate; // qty = 1
                                    
                                    updateItemById(index as number, 'qty', 1);
                                    updateItemById(index as number, 'amount', amount);
                                    updateItemById(index as number, 'total', amount);
                                    
                                    updateTaxCalculation(index as number, amount, row.taxcode_name);
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                            className={`p-1 px-3 w-[80px] text-center ${editReceive ? 'border-1 border-[#14B8A6]' : 'border-1 rounded'}`}
                        />
                    )}
            </>),
            wrap: true,
            width: '120px',
        },
        {
            name: 'Description',
            selector: (row: TablePOItem) => row.description || 'N/A',
            cell: (row, index) => (<>
                    {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                        <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                            row.description  || '-'
                        }</p>
                    ) : (
                        <TextArea 
                            name={`description_${index}`}
                            value={row.description || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {                                
                                updateItemById(index as number, 'description', e.target.value);
                            }}
                            rows={2} 
                            placeholder="Enter item description..."
                            className={`w-full px-3 py-2 my-2 w-[220px] border-0 border-b-1 rounded-none focus:border-b-blue-500 ${
                                errors[`description_${index}` as keyof PurchaseOrderForm] ? 'border-red-500 ' : 'border-gray-300'
                            }`}
                        />
                    )}
            </>),
            wrap: true,
            width: '250px',
        },
        {
            name: 'FOB',
            selector: (row: TablePOItem) => row.custcol_msi_fob || 0,
            cell: (row, index) => (<>
                {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                        row.custcol_msi_fob && row.custcol_msi_fob > 0 ? formatCurrencyTyping(String(row.custcol_msi_fob)) : '-'
                    }</p>
                ) : (
                <Input
                    name={`custcol_msi_fob_${index}`}
                    type="text"
                    value={row.custcol_msi_fob && row.custcol_msi_fob > 0
                        ? formatNumberUSTyping(String(row.custcol_msi_fob))
                        : ''}
                    // onKeyPress={handleCurrencyKeyPress}
                    onChange={(e) => {
                        const rawValue = e.target.value;
                        const fobVal = parseNumberUS(rawValue);

                        handleDecimalInput(
                            rawValue,
                            (validValue) => updateItemById(index as number, 'custcol_msi_fob', validValue),
                            () => updateItemById(index as number, 'custcol_msi_fob', null),
                            true,
                            12,
                            4
                        );
                        
                        const landedCost = parseNumberUS(String(row.custcol_me_landed_cost));
                        const quantity = toNumber(row.qty) || 1;
                        
                        const rate = fobVal + landedCost;
                        const amount = quantity * Number(rate);
                        
                        // updateItemById(index as number, 'custcol_msi_fob', fobVal);
                        updateItemById(index as number, 'rate', rate);
                        updateItemById(index as number, 'amount', amount);
                        updateItemById(index as number, 'total', amount);
                        
                        updateTaxCalculation(index as number, amount, row.taxcode_name);
                    }}
                    // onFocus={(e) => e.target.select()}
                    className="border-1 rounded p-1 px-3 w-[285px] text-center"
                    placeholder="0"
                />
                )}
            </>),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Landed Cost',
            selector: (row: TablePOItem) => row.custcol_me_landed_cost || 0,
            cell: (row, index) => (<>
                {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                        row.custcol_me_landed_cost && row.custcol_me_landed_cost > 0 ? formatNumberUSTyping(row.custcol_me_landed_cost.toString()) : '-'
                    }</p>
                ) : (
                <Input
                    name={`custcol_me_landed_cost_${index}`}
                    type="text"
                    value={row.custcol_me_landed_cost && row.custcol_me_landed_cost > 0 ? formatNumberUSTyping(String(row.custcol_me_landed_cost)) : '0'}
                    // onKeyPress={handleCurrencyKeyPress}
                    onChange={(e) => {
                        const rawValue = e.target.value;
                        const costVal = parseNumberUS(String(rawValue));
                        const fob = parseNumberUS(String(row.custcol_msi_fob));
                        const quantity = toNumber(row.qty) || 1;
                        
                        handleDecimalInput(
                            rawValue,
                            (validValue) => updateItemById(index as number, 'custcol_me_landed_cost', validValue),
                            () => updateItemById(index as number, 'custcol_me_landed_cost', null),
                            true,
                            12,
                            4
                        );

                        const rate = fob + costVal;
                        const amount = quantity * rate;
                        

                        // updateItemById(index as number, 'custcol_me_landed_cost', costVal);
                        updateItemById(index as number, 'rate', rate);
                        updateItemById(index as number, 'amount', amount);
                        updateItemById(index as number, 'total', amount);
                        
                        updateTaxCalculation(index as number, amount, row.taxcode_name);
                    }}
                    // onFocus={(e) => e.target.select()}
                    className="border-1 rounded p-1 px-3 w-[285px] text-center"
                    placeholder="0"
                />
                )}
            </>),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Rate',
            selector: (row: TablePOItem) => row.rate || 0,
            cell: (row, index) => (<>
                {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                        row.rate && row.rate > 0 ? formatNumberUSTyping(String(row.rate)) : '-'
                    }</p>
                ) : (
                <Input
                    name={`rate_${index}`}
                    type="text"
                    value={row.rate && row.rate > 0 ? formatNumberUSTyping(String(row.rate)) : ''}
                    disabled={true}
                    readonly={true}
                    className="border-0 rounded bg-white p-1 px-3 text-center text-gray cursor-text"
                    placeholder="Auto calculated"
                />
                )}
            </>),
            center: true,
            width: '250px',
            sortable: false
        },
        {
            name: 'Amount',
            selector: (row: TablePOItem) => row.amount || 0,
            cell: (row, index) => (<>
                {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                        row.amount && row.amount > 0 ? formatNumberUSTyping(String(row.amount)) : '-'
                    }</p>
                ) : (
                <Input
                    name={`amount_${index}`}
                    type="text"
                    value={row.amount && row.amount > 0 ? formatNumberUSTyping(String(row.amount)) : ''}
                    disabled={true}
                    readonly={true}
                    className="border-0 rounded bg-white p-1 px-3 text-center text-gray cursor-text"
                    placeholder="Auto calculated"
                />
                )}
            </>),
            center: true,
            width: '250px',
            sortable: false
        },
        {
            name: 'Tax Code',
            selector: (row: TablePOItem) => row.taxcode_name || 'N/A',
            cell: (row, index) => (<>
                {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                         row.taxcode_name || '-'
                    }</p>
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
                                
                                const currentAmount = toNumber(row.amount);
                                updateTaxCalculation(index as number, currentAmount, option.label);
                            } else {
                                // Clear tax code
                                updateItemById(index as number, 'taxcode', 0);
                                updateItemById(index as number, 'taxcode_name', '');
                                
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
                    {row.tax_rate ? row.tax_rate.replace(/VAT/g, '') : '-'}
                </div>
            ),
            center: true,
            width: '150px',
            sortable: false
        },
        {
            name: 'Gross Amt',
            selector: (row) => row.gross_amount || 0,
            cell: (row) => (
                <div className="font-medium text-center">
                    {row.gross_amount ? formatCurrencyDynamic(row.gross_amount, formData?.currency_symbol || '') : formatCurrencyDynamic(0, formData?.currency_symbol || '')}
                </div>
            ),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Tax Amt',
            selector: (row) => row.tax_amount || 0,
            cell: (row) => (
                <div className="font-medium text-center">
                    {row.tax_amount ? formatCurrencyDynamic(row.tax_amount, formData?.currency_symbol || '') : formatCurrencyDynamic(0, formData?.currency_symbol || '')}
                </div>
            ),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Department',
            selector: (row: TablePOItem) => row.department_name || 'N/A',
            cell: (row, index) => (
                <div className="w-[285px]">
                {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                         row.department_name || '-'
                    }</p>
                ) : (
                    <CustomAsyncSelect
                        name={`department_${index}`}
                        placeholder="Select department..."
                        value={row.department ? {
                            label: row.department_name || '',
                            value: row.department.toString()
                        } : null}
                        defaultOptions={departmentOptions}
                        loadOptions={onDepartmentInputChange}
                        onMenuScrollToBottom={onDepartmentMenuScrollToBottom}
                        isLoading={departmentPagination.loading}
                        noOptionsMessage={() => "No departments found"}
                        loadingMessage={() => "Loading departments..."}
                        isSearchable={true}
                        inputValue={departmentInputValue}
                        onInputChange={onDepartmentInputChange}
                        onChange={(option) => {
                            if (option) {
                                updateItemById(index as number, 'department', parseInt(String(option.value)));
                                updateItemById(index as number, 'department_name', option.label);
                            }
                        }}
                        error={!row.department && errors?.items_department ? errors.items_department : undefined}
                        className="w-full text-xs"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                )}
                </div>
            ),
            center: true,
            width: '300px',
            sortable: false
        },
        {
            name: 'Class',
            selector: (row: TablePOItem) => row.class_name || 'N/A',
            cell: (row, index) => (
                <div className="w-full">
                    {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                        <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                            row.class_name || '-'
                        }</p>
                    ) : (
                        <CustomAsyncSelect
                            name={`class_${index}`}
                            placeholder="Select class..."
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
                            inputValue={classInputValue}
                            onInputChange={onClassInputChange}
                            onChange={(option) => {
                                if (option) {
                                    updateItemById(index as number, 'class', parseInt(String(option.value)));
                                    updateItemById(index as number, 'class_name', option.label);
                                }
                            }}
                            error={!row.class && errors?.items_class ? errors.items_class : undefined}
                            className="text-xs"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    )}
                </div>
            ),
            width: '300px',
            sortable: false
        },
        {
            name: 'Location',
            selector: (row: TablePOItem) => row.location_name || 'N/A',
            cell: (row, index) => (
                <div className="w-[285px]">
                    {(formData.approvalstatus === 2 || formData.approvalstatus === 3) || (formData.approvalstatus === 1 && formData.nextapprover !== null) ? (
                        <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">{
                            row.location_name || '-'
                        }</p>
                    ) : (
                        <>
                        <CustomAsyncSelect
                            name={`location_${index}`}
                            placeholder="Select location..."
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
                            inputValue={locationInputValue}
                            onInputChange={onLocationInputChange}
                            onChange={(option) => {
                                if (option) {
                                    updateItemById(index as number, 'location', parseInt(String(option.value)));
                                    updateItemById(index as number, 'location_name', option.label);
                                }
                            }}
                            error={!row.location && errors?.items_location ? errors.items_location : undefined}
                            className="text-xs"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                        {!row.location && errors?.items_location && (
                            <span className="text-xs text-red-500 mt-1 block">Location wajib dipilih</span>
                        )}
                        </>
                    )}
                </div>
            ),
            width: '300px',
            sortable: false
        },
        ...((formData.approvalstatus !== 2 && formData.approvalstatus !== 3) ? [createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: (row: TablePOItem) => {
                    onProductDelete?.(row.id || '')
                },
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Remove Item',
                permission: 'delete' as const
            }
        ])] : [])
    ];
    
    if (loadingMasterData) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading master data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`mb-6 space-y-6 p-6 ${formData.approvalstatus === 2 || formData.approvalstatus === 3 ? '' : 'min-h-[500px]'}`}>
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">Purchase Order Items</h3>
                
                {/* Add Product Section */}
                {(formData.approvalstatus !== 2 && formData.approvalstatus !== 3) && (formData.approvalstatus !== 1 || formData.nextapprover === null) && (
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Label htmlFor='selectProduct'>Select Product to Add</Label>
                        <CustomAsyncSelect
                            name="product_select"
                            placeholder="Select product to add..."
                            value={selectedProduct}
                            error={productSelectError}
                            defaultOptions={POItemsOptions}
                            loadOptions={handleProductInputChange}
                            onMenuScrollToBottom={handleMenuScrollToBottom}
                            isLoading={pagination.loading}
                            noOptionsMessage={() => "No products found"}
                            loadingMessage={() => "Loading products..."}
                            isSearchable={true}
                            inputValue={inputValue}
                            onInputChange={handleProductInputChange}
                            onChange={handleProductChange}
                        />
                        {productSelectError && (
                            <span className="text-sm text-red-500 mt-1 block">{productSelectError}</span>
                        )}
                    </div>
                    
                    <div className="flex flex-col justify-end">
                        <Button
                            type="button"
                            onClick={handleAddProduct}
                            className="flex items-center gap-2"
                            disabled={!selectedProduct || !isFormComplete || formData.items.length >= 300}
                        >
                            <MdAdd size={16} />
                            Add Product
                        </Button>
                    </div>
                </div>
                )}

                {(formData.approvalstatus !== 2 && formData.approvalstatus !== 3) && (
                    !isFormComplete && (
                        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                            Lengkapi field Custom Form, Purchase Date, Vendor, Currency, Subsidiary, Location, Class, dan Department terlebih dahulu sebelum menambahkan item.
                        </p>
                    )
                )}

                {/* Products Table */}
                {formData.items && formData.items.length > 0 ? (
                    <div
                        className="mt-6 font-secondary overflow-y-auto"
                        style={{ maxHeight: formData.items?.length > 100 ? '920px' : '625px' }}
                    >
                        <CustomDataTable
                            columns={productColumns}
                            data={visibleItems}
                            pagination={false}
                            responsive
                            striped={false}
                            highlightOnHover={false}
                            className={`${formData.approvalstatus === 2 || formData.approvalstatus === 3 ? '' : 'min-h-[300px] '}`}
                            noDataComponent={
                                <div className="text-center py-8 text-gray-500">
                                    No products added yet
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
                        <p className="text-lg mb-2">No products added yet</p>
                        <p className="text-sm">Start by selecting a product from the dropdown above</p>
                    </div>
                )}

                {/* Invoice Summary */}
                {
                 (formData.approvalstatus !== 2 && formData.approvalstatus !== 3) && (
                    formData.items && formData.items.length > 0 && (<>
                    {/* <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className=" md:col-span-2"></div> */}
                        <InvoiceSummary 
                            items={formData.items} 
                            currency={formData?.currency_symbol || ''} 
                            serverTotal={serverTotal}
                        />
                    {/* </div> */}
                    </>)
                )}
                {/* {errors?.items && (
                    <span className="text-sm text-red-500">{errors.items}</span>
                )} */}
            </div>
        </div>
    )
}

// Summary invoice dari items
export const InvoiceSummary: React.FC<{ items: TablePOItem[], currency: string, serverTotal?: number }> = ({ items, currency, serverTotal }) => {
    // Helper to ensure numeric value  
    const toNumber = (value: any): number => {
        if (typeof value === 'string') {
            // Handle currency formatted strings
            return parseCurrencyIDR(value);
        }
        return Number(value) || 0;
    };

    const summary = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + toNumber(formatNumberPriceKoma(item.amount)), 0);
        const totalTax = items.reduce((sum, item) => sum + toNumber(item.tax_amount), 0);
        const grandTotal = serverTotal !== null ? serverTotal : items.reduce((sum, item) => sum + toNumber(item.gross_amount || item.amount), 0);
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
export default purchaseOrderItemFields
