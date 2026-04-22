import Input from '@/components/form/input/InputField';
import { formatCurrency, handleKeyPress } from '@/helpers/generalHelper';
import React, { useCallback, useRef } from 'react'
import { ItemReceiptItem, ItemReceiptPayload, MasterDataFormFieldItems, PODetailData, ReceiptItem } from '../../types/purchaseorder';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomDataTable from '@/components/ui/table';
import { TableColumn } from 'react-data-table-component';
import { POLocationPaginationState, POLocationSelectOption } from '@/hooks/usePOLocationSelect';
import { POClassPaginationState, POClassSelectOption } from '@/hooks/usePOClassSelect';
import { PODepartmentPaginationState, PODepartmentSelectOption, } from '@/hooks/usePODepartmentSelect';


interface POItemsFieldsProps {
    formData: ItemReceiptPayload;
    errors: Record<string, string>;
    masterData?: MasterDataFormFieldItems | null;
    loadingMasterData?: boolean;
    onAddProductItem: (selectedProduct: any) => void;
    onProductDelete?: (itemId: number) => void;
    onUpdateProductItem?: (index: number, field: string, value: any) => void;

    receiptList?: ReceiptItem[];
    editReceive?: boolean;
    poDetail?: PODetailData | null;
    
    locationOptions?: POLocationSelectOption[];
    locationPagination?: POLocationPaginationState;
    locationInputValue?: string;
    onLocationInputChange?: (inputValue: string) => Promise<POLocationSelectOption[]>;
    onLocationMenuScrollToBottom?: () => void;
    selectedLocation?: POLocationSelectOption | null;
    onLocationChange?: (option: POLocationSelectOption | null) => void;
    locationError?: string;

    classOptions?: POClassSelectOption[];
    classPagination?: POClassPaginationState;
    classInputValue?: string;
    onClassInputChange?: (inputValue: string) => Promise<POClassSelectOption[]>;
    onClassMenuScrollToBottom?: () => void;
    selectedClass?: POClassSelectOption | null;
    onClassChange?: (option: POClassSelectOption | null) => void;
    classError?: string;

    departmentOptions?: PODepartmentSelectOption[];
    departmentPagination?: PODepartmentPaginationState;
    departmentInputValue?: string;
    onDepartmentInputChange?: (inputValue: string) => Promise<PODepartmentSelectOption[]>;
    onDepartmentMenuScrollToBottom?: () => void;
    selectedDepartment?: PODepartmentSelectOption | null;
    onDepartmentChange?: (option: PODepartmentSelectOption | null) => void;
    departmentError?: string;
    handleRowSelected?: (selected: { allSelected: boolean; selectedCount: number; selectedRows: ItemReceiptItem[] }) => void;
    selectedRows?: ItemReceiptItem[];
}

const receiptItemFields: React.FC<POItemsFieldsProps> = ({
    formData,
    errors,
    loadingMasterData,
    poDetail,
    editReceive,
    onUpdateProductItem,
    locationOptions = [],
    locationPagination = { page: 1, hasMore: true, loading: false },
    locationInputValue = '',
    onLocationInputChange,
    onLocationMenuScrollToBottom,
    classOptions = [],
    classPagination = { page: 1, hasMore: true, loading: false },
    classInputValue = '',
    onClassInputChange,
    onClassMenuScrollToBottom,
    departmentOptions = [],
    departmentPagination = { page: 1, hasMore: true, loading: false },
    departmentInputValue = '',
    onDepartmentInputChange,
    onDepartmentMenuScrollToBottom,
    handleRowSelected,
    selectedRows = []
}) => {
    const toNumber = (value: any): number => {
        if (typeof value === 'string') return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
        return Number(value) || 0;
    };

    const updateItemById = (index: number, field: string, value: any) => {
        onUpdateProductItem?.(index, field, value);
    };

    // Simpan nilai original quantitypending sebagai max limit
    const originalQtyRef = useRef<Map<number, number>>(new Map());
    formData.items?.forEach((item, idx) => {
        if (!originalQtyRef.current.has(idx)) {
            originalQtyRef.current.set(idx, item.quantitypending ?? 0);
        }
    });

    // Gunakan ref agar referensi isRowSelected tetap stabil
    const selectedItemIdsRef = useRef<Set<number>>(new Set());
    selectedItemIdsRef.current = new Set(selectedRows.map((r) => r.line_id).filter((id): id is number => id !== undefined));

    const isRowSelected = useCallback(
        (row: ItemReceiptItem) => row.line_id !== undefined && selectedItemIdsRef.current.has(row.line_id),
        []
    );

    const receiveItemColumns: TableColumn<ItemReceiptItem>[] = [
        {
            name: 'Item',
            selector: (row) => row.item_display || String(row.item),
        },
        {
            name: 'Remaining',
            selector: (row) => row.quantitypending || 0,
            cell: (_row, index) => <span>{originalQtyRef.current.get(index as number) ?? 0}</span>,
            width: '150px',
            center: true,
        },
        {
            name: 'Qty',
            selector: (row) => row.quantitypending ?? 0,
            cell: (row, index) => (<>
                {(poDetail?.po_status_label === 'Pending Bill' || editReceive) ? (
                        <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">
                            {row.quantitypending && row.quantitypending > 0 ? row.quantitypending.toString() : '-'}
                        </p>
                    ) : (
                    <Input
                        name={`qty_${index}`}
                        type="text"
                        maxLength={6}
                        min='0'
                        value={(row.quantitypending ?? 0) > 0 ? (row.quantitypending ?? 0).toString() : ''}
                        onKeyPress={handleKeyPress}
                        onChange={(e) => {
                            const qty = toNumber(e.target.value);
                            const max = originalQtyRef.current.get(index as number) ?? 0;
                            updateItemById(index as number, 'quantitypending', Math.min(qty, max));
                        }}
                        onBlur={(e) => {
                            if (toNumber(e.target.value) === 0) {
                                updateItemById(index as number, 'quantitypending', 1);
                            }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="p-1 px-3 w-[80px] text-center"
                    />
                )}
            </>),
            width: '140px',
            center: true,
        },
        {
            name: 'Rate',
            selector: (row) => row.rate || 0,
            cell: (row) => <span>{row.rate ? formatCurrency(row.rate) : '-'}</span>,
            width: '150px',
        },
        {
            name: 'Department',
            selector: (row) => row.department_display || '-',
            cell: (row, index) => (
                (poDetail?.po_status_label === 'Pending Bill' || editReceive) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">
                        {row.department_display || '-'}
                    </p>
                ) : (
                    <div className="w-[220px]">
                        <CustomAsyncSelect
                            name={`department_${index}`}
                            placeholder="Select department..."
                            value={row.department ? { label: row.department_display || '', value: String(row.department) } : null}
                            defaultOptions={departmentOptions}
                            loadOptions={onDepartmentInputChange}
                            onMenuScrollToBottom={onDepartmentMenuScrollToBottom}
                            isLoading={departmentPagination.loading}
                            isSearchable
                            inputValue={departmentInputValue}
                            onInputChange={onDepartmentInputChange}
                            onChange={(option) => {
                                if (option) {
                                    updateItemById(index as number, 'department', parseInt(option.value));
                                    updateItemById(index as number, 'department_display', option.label);
                                }
                            }}
                            noOptionsMessage={() => "No departments found"}
                            loadingMessage={() => "Loading..."}
                            className="text-xs"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                )
            ),
            width: '240px',
        },
        {
            name: 'Class',
            selector: (row) => row.class_display || '-',
            cell: (row, index) => (
                (poDetail?.po_status_label === 'Pending Bill' || editReceive) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">
                        {row.class_display || '-'}
                    </p>
                ) : (
                    <div className="w-[220px]">
                        <CustomAsyncSelect
                            name={`class_${index}`}
                            placeholder="Select class..."
                            value={row.class ? { label: row.class_display || '', value: String(row.class) } : null}
                            defaultOptions={classOptions}
                            loadOptions={onClassInputChange}
                            onMenuScrollToBottom={onClassMenuScrollToBottom}
                            isLoading={classPagination.loading}
                            isSearchable
                            inputValue={classInputValue}
                            onInputChange={onClassInputChange}
                            onChange={(option) => {
                                if (option) {
                                    updateItemById(index as number, 'class', parseInt(option.value));
                                    updateItemById(index as number, 'class_display', option.label);
                                }
                            }}
                            noOptionsMessage={() => "No classes found"}
                            loadingMessage={() => "Loading..."}
                            className="text-xs"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                )
            ),
            width: '240px',
        },
        {
            name: 'Location',
            selector: (row) => row.location_display || '-',
            cell: (row, index) => (
                (poDetail?.po_status_label === 'Pending Bill' || editReceive) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 min-h-[42px] flex items-center">
                        {row.location_display || '-'}
                    </p>
                ) : (
                    <div className="w-[220px]">
                        <CustomAsyncSelect
                            name={`location_${index}`}
                            placeholder="Select location..."
                            value={row.location ? { label: row.location_display || '', value: String(row.location) } : null}
                            defaultOptions={locationOptions}
                            loadOptions={onLocationInputChange}
                            onMenuScrollToBottom={onLocationMenuScrollToBottom}
                            isLoading={locationPagination.loading}
                            isSearchable
                            inputValue={locationInputValue}
                            onInputChange={onLocationInputChange}
                            onChange={(option) => {
                                if (option) {
                                    updateItemById(index as number, 'location', parseInt(option.value));
                                    updateItemById(index as number, 'location_display', option.label);
                                }
                            }}
                            noOptionsMessage={() => "No locations found"}
                            loadingMessage={() => "Loading..."}
                            className="text-xs"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                )
            ),
            width: '240px',
        }
    ];
    if (loadingMasterData) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">

            {/* ── Items to Receive ──────────────────────────── */}
            <div>
                <h3 className="text-md font-primary-bold font-medium text-gray-900 mb-4">Items to Receive</h3>

                {formData.items && formData.items.length > 0 ? (
                    <div className="font-secondary">
                        <CustomDataTable
                            columns={receiveItemColumns}
                            data={formData.items}
                            pagination={false}
                            responsive
                            striped={false}
                            highlightOnHover={false}
                            noDataComponent={<p className="text-gray-400 py-4 text-sm">Tidak ada items</p>}
                            {...(editReceive ? {
                                selectableRows: false,
                            } : {
                                selectableRows: true
                            })}
                            
                            selectableRowSelected={isRowSelected}
                            onSelectedRowsChange={handleRowSelected}
                            
                        />
                    </div>
                ) : (
                    <div className={`text-center py-8 text-gray-500 border-2 border-dashed rounded-lg ${errors?.items ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                        <p className="text-sm">Belum ada item yang ditambahkan</p>
                    </div>
                )}
                {errors?.items && (
                    <span className="text-sm text-red-500 mt-1 block">{errors.items}</span>
                )}
            </div>
        </div>
    );
}

export default receiptItemFields
