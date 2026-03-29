import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { formatCurrency, formatNumberInput, handleKeyPress } from '@/helpers/generalHelper';
import React, { useEffect, useState } from 'react'
import { PurchaseOrderForm, MasterDataFormFieldItems, TablePOItem } from '../types/purchaseorder';
import CustomSelect from '@/components/form/select/CustomSelect';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomDataTable from '@/components/ui/table';
import Button from '@/components/ui/button/Button';
import { MdAdd, MdDelete } from 'react-icons/md';
import { TableColumn } from 'react-data-table-component';
import { usePOItemsSelect } from '@/hooks/usePOItemsSelect';
import { POLocationPaginationState, POLocationSelectOption } from '@/hooks/usePOLocationSelect';


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
    
    // Location Select Props
    locationOptions?: POLocationSelectOption[];
    locationPagination?: POLocationPaginationState;
    locationInputValue?: string;
    onLocationInputChange?: (inputValue: string) => Promise<POLocationSelectOption[]>;
    onLocationMenuScrollToBottom?: () => void;
    selectedLocation?: POLocationSelectOption | null;
    onLocationChange?: (option: POLocationSelectOption | null) => void;
    locationError?: string;
}

const purchaseOrderItemFields: React.FC<POItemsFieldsProps> = ({
    formData,
    errors,
    masterData,
    loadingMasterData,
    onAddProductItem,
    onProductDelete,
    onUpdateProductItem,
    
    // Location props
    locationOptions = [],
    locationPagination = { page: 1, hasMore: true, loading: false },
    locationInputValue = '',
    onLocationInputChange,
    onLocationMenuScrollToBottom,
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

    // Cek apakah semua field utama sudah terisi
    const isFormComplete = !!(formData.customform && formData.purchasedate && formData.vendorid && formData.currency && formData.subsidiary && formData.location && formData.class && formData.department);
    // Handle update item function
    const updateItemById = (index: number, field: string, value: any) => {
        if (onUpdateProductItem) {
            onUpdateProductItem(index, field, value);
        }
    };
    
    // Helper function to extract tax percentage from tax code name
    const extractTaxPercentage = (taxCodeName: string): number => {
        const match = taxCodeName.match(/([\d.]+)%/);
        return match ? parseFloat(match[1]) : 0;
    };
    
    // Function to calculate tax amounts
    const calculateTaxAmounts = (amount: number, taxCodeName: string) => {
        const taxPercentage = extractTaxPercentage(taxCodeName);
        const taxAmount = (amount * taxPercentage) / 100;
        const grossAmount = amount + taxAmount;
        return { taxAmount, grossAmount };
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
    
    // Define product table columns
    const productColumns: TableColumn<TablePOItem>[] = [
        {
            name: 'Product Name',
            selector: (row: TablePOItem) => row.product_name || 'N/A',
            sortable: true,
            grow: 2
        },
        {
            name: 'Quantity',
            selector: (row: TablePOItem) => row.qty || 0,
            cell: (row, index) => (
                <Input
                    type="text"
                    maxLength={3}
                    min='0'
                    value={row.qty && row.qty > 0 ? row.qty.toString() : ''}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateItemById(index as number, 'qty', val);
                        
                        // Auto-calculate amount and total when quantity changes
                        if (row.rate && row.rate > 0) {
                            const calculatedAmount = val * row.rate;
                            updateItemById(index as number, 'amount', calculatedAmount);
                            updateItemById(index as number, 'total', calculatedAmount);
                            
                            // Recalculate tax amounts if tax code is selected
                            if (row.taxcode_name) {
                                const { taxAmount, grossAmount } = calculateTaxAmounts(calculatedAmount, row.taxcode_name);
                                updateItemById(index as number, 'tax_amount', taxAmount);
                                updateItemById(index as number, 'gross_amount', grossAmount);
                            }
                        }
                    }}
                    onBlur={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val === 0) {
                            updateItemById(index as number, 'qty', 1);
                            // Recalculate with qty = 1
                            if (row.rate && row.rate > 0) {
                                const calculatedAmount = 1 * row.rate;
                                updateItemById(index as number, 'amount', calculatedAmount);
                                updateItemById(index as number, 'total', calculatedAmount);
                                
                                // Recalculate tax amounts if tax code is selected
                                if (row.taxcode_name) {
                                    const { taxAmount, grossAmount } = calculateTaxAmounts(calculatedAmount, row.taxcode_name);
                                    updateItemById(index as number, 'tax_amount', taxAmount);
                                    updateItemById(index as number, 'gross_amount', grossAmount);
                                }
                            }
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="border-0 border-b-1 rounded-none p-1 px-3 w-[80px] text-center"
                />
            ),
            wrap: true,
            width: '130px',
        },
        {
            name: 'Rate',
            selector: (row: TablePOItem) => row.rate || 0,
            cell: (row, index) => (
                <Input
                    type="text"
                    value={row.rate && row.rate > 0 ? formatNumberInput(row.rate) : ''}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^\d]/g, '');
                        updateItemById(index as number, 'rate', val);
                        
                        // Auto-calculate amount and total when rate changes
                        const quantity = row.qty || 1;
                        const calculatedAmount = quantity * parseFloat(val || '0');
                        updateItemById(index as number, 'amount', calculatedAmount);
                        updateItemById(index as number, 'total', calculatedAmount);
                        
                        // Recalculate tax amounts if tax code is selected
                        if (row.taxcode_name && calculatedAmount > 0) {
                            const { taxAmount, grossAmount } = calculateTaxAmounts(calculatedAmount, row.taxcode_name);
                            updateItemById(index as number, 'tax_amount', taxAmount);
                            updateItemById(index as number, 'gross_amount', grossAmount);
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="border-1 rounded p-1 px-3 w-[285px] text-center"
                    placeholder="0"
                />
                // <Input
                //     type="text"
                //     value={row.rate && row.rate > 0 ? formatNumberInput(row.rate) : ''}
                //     onKeyPress={handleKeyPress}
                //     onChange={(e) => {
                //         const val = e.target.value.replace(/[^\d]/g, '');
                //         updateItemById(index as number, 'rate', val);
                //     }}
                //     onFocus={(e) => e.target.select()}
                //     className="border-1 rounded p-1 px-3 w-full text-center"
                //     placeholder="0"
                // />
            ),
            center: true,
            width: '300px',
        },
        {
            name: 'Amount',
            selector: (row: TablePOItem) => row.amount || 0,
            cell: (row, index) => (
                <Input
                    type="text"
                    value={row.amount && row.amount > 0 ? formatNumberInput(row.amount) : ''}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^\d]/g, '');
                        updateItemById(index as number, 'amount', val);
                        
                        // Update total based on quantity * amount (manual amount override)
                        const total = (row.qty || 1) * parseFloat(val || '0');
                        updateItemById(index as number, 'total', total);
                        
                        // Recalculate tax amounts if tax code is selected
                        if (row.taxcode_name && parseFloat(val || '0') > 0) {
                            const { taxAmount, grossAmount } = calculateTaxAmounts(parseFloat(val || '0'), row.taxcode_name);
                            updateItemById(index as number, 'tax_amount', taxAmount);
                            updateItemById(index as number, 'gross_amount', grossAmount);
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="border-1 rounded p-1 px-3 w-[285px] text-center"
                    placeholder="0"
                />
            ),
            center: true,
            width: '300px',
        },
        {
            name: 'Tax Code',
            selector: (row: TablePOItem) => row.taxcode_name || 'N/A',
            cell: (row, index) => (
                <div className="w-[285px]">
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
                                
                                // Calculate tax amounts when tax code is selected
                                const currentAmount = row.amount || 0;
                                if (currentAmount > 0) {
                                    const { taxAmount, grossAmount } = calculateTaxAmounts(currentAmount, option.label);
                                    updateItemById(index as number, 'tax_amount', taxAmount);
                                    updateItemById(index as number, 'gross_amount', grossAmount);
                                }
                            }
                        }}
                        placeholder="Select tax code"
                        className="text-xs"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
            ),
            center: true,
            width: '250px',
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
        },
        {
            name: 'Gross Amt',
            selector: (row) => row.gross_amount || 0,
            cell: (row) => (
                <div className="font-medium text-center">
                    {row.gross_amount ? formatCurrency(row.gross_amount) : 'Rp 0'}
                </div>
            ),
            center: true,
            width: '150px',
        },
        {
            name: 'Tax Amt',
            selector: (row) => row.tax_amount || 0,
            cell: (row) => (
                <div className="font-medium text-center">
                    {row.tax_amount ? formatCurrency(row.tax_amount) : 'Rp 0'}
                </div>
            ),
            center: true,
            width: '150px',
        },
        {
            name: 'Department',
            selector: (row: TablePOItem) => row.department_name || 'N/A',
            cell: (row, index) => (
                <div className="w-[285px]">
                    <CustomSelect
                        options={masterData?.departments?.map(dept => ({
                            label: dept.name,
                            value: dept.id.toString()
                        })) || []}
                        value={row.department ? {
                            label: row.department_name || '',
                            value: row.department.toString()
                        } : null}
                        onChange={(option) => {
                            if (option) {
                                updateItemById(index as number, 'department', parseInt(option.value));
                                updateItemById(index as number, 'department_name', option.label);
                            }
                        }}
                        placeholder="Select department"
                        isSearchable
                        className="text-xs"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
            ),
            width: '300px',
        },
        {
            name: 'Class',
            selector: (row: TablePOItem) => row.class_name || 'N/A',
            cell: (row, index) => (
                <div className="w-full">
                    <CustomSelect
                        options={masterData?.class?.map(cls => ({
                            label: cls.name,
                            value: cls.id.toString()
                        })) || []}
                        value={row.class ? {
                            label: row.class_name || '',
                            value: row.class.toString()
                        } : null}
                        onChange={(option) => {
                            if (option) {
                                updateItemById(index as number, 'class', parseInt(option.value));
                                updateItemById(index as number, 'class_name', option.label);
                            }
                        }}
                        placeholder="Select class"
                        isSearchable
                        className="text-xs"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
            ),
            width: '300px',
        },
        {
            name: 'Location',
            selector: (row: TablePOItem) => row.location_name || 'N/A',
            cell: (row, index) => (
                <div className="w-[285px]">
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
                                updateItemById(index as number, 'location', parseInt(option.value));
                                updateItemById(index as number, 'location_name', option.label);
                            }
                        }}
                        className="text-xs"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
            ),
            width: '300px',
        },
        {
            name: 'Actions',
            cell: (row: TablePOItem, index: number) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onProductDelete?.(row.id || index.toString())}
                        className="p-1 text-red-600 hover:text-red-800"
                    >
                        <MdDelete size={14} />
                    </Button>
                </div>
            ),
            width: '100px',
            center: true
        }
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
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6 min-h-[500px]">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Purchase Order Items</h3>
                
                {/* Add Product Section */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Label>Select Product to Add</Label>
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
                            disabled={!selectedProduct || !isFormComplete}
                        >
                            <MdAdd size={16} />
                            Add Product
                        </Button>
                    </div>
                </div>

                {!isFormComplete && (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                        Lengkapi field Custom Form, Purchase Date, Vendor, Currency, Subsidiary, Location, Class, dan Department terlebih dahulu sebelum menambahkan item.
                    </p>
                )}

                {/* Products Table */}
                {formData.items && formData.items.length > 0 ? (
                    <div className="mt-6">
                        <CustomDataTable
                            columns={productColumns}
                            data={formData.items}
                            pagination={false}
                            responsive
                            striped={false}
                            highlightOnHover
                            className='min-h-[500px]'
                            noDataComponent={
                                <div className="text-center py-8 text-gray-500">
                                    No products added yet
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <div className={`text-center py-8 text-gray-500 border-2 border-dashed rounded-lg ${errors?.items ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                        <p className="text-lg mb-2">No products added yet</p>
                        <p className="text-sm">Start by selecting a product from the dropdown above</p>
                    </div>
                )}

                {errors?.items && (
                    <span className="text-sm text-red-500">{errors.items}</span>
                )}
            </div>
        </div>
    )
}

export default purchaseOrderItemFields
