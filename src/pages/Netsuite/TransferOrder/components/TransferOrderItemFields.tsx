import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import Label from '@/components/form/Label';
import InputField from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { TransferOrderFormData, TransferOrderFormItem } from '../types/transferOrder';
import { handleKeyPress, convertDateToTanggal, formatTanggal, parseTanggalToDate, formatCurrencyDynamic } from '@/helpers/generalHelper';
import Button from '@/components/ui/button/Button';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable, { createActionsColumn } from '@/components/ui/table';
import { LoadingOverlay } from '@/components/common/Loading';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import TextArea from '@/components/form/input/TextArea';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface TOItemFieldsProps {
    formData: TransferOrderFormData;
    errors: Record<string, string>;
    onAddItem: (selectedItem: any) => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (index: number, field: string, value: any) => void;

    // Item Select Props
    itemOptions: any[];
    itemPagination: any;
    itemInput: string;
    onItemInputChange: (val: string) => Promise<any[]>;
    onItemMenuScrollToBottom: () => void;

    isEditing?: boolean;
}

const InlineDatePicker: React.FC<{ value: string | null; onChange: (val: string) => void }> = ({ value, onChange }) => {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const currentDate = value ? parseTanggalToDate(value) : null;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                popupRef.current && !popupRef.current.contains(target)
            ) {
                setShow(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Popup dipindah ke document.body lewat portal supaya tidak ke-clip oleh
    // overflow-y-auto pada wrapper tabel item, lalu diposisikan fixed mengikuti trigger.
    useEffect(() => {
        if (!show) return;
        const handleScroll = () => setShow(false);
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [show]);

    const handleToggle = () => {
        if (!show && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom + 4, left: rect.left });
        }
        setShow(prev => !prev);
    };

    return (
        <div className="relative">
            <div
                ref={triggerRef}
                className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 text-sm min-w-[140px]"
                onClick={handleToggle}
            >
                <span className={currentDate ? "text-gray-700" : "text-gray-400"}>
                    {currentDate ? formatTanggal(value || '') : 'Pilih tanggal'}
                </span>
            </div>
            {show && createPortal(
                <div
                    ref={popupRef}
                    className="fixed z-[9999] bg-white border border-gray-300 rounded-md shadow-lg"
                    style={{ top: position.top, left: position.left }}
                >
                    <Calendar
                        date={currentDate || new Date()}
                        onChange={(date: any) => {
                            setShow(false);
                            const selectedDate = date instanceof Date ? date : new Date(date);
                            onChange(convertDateToTanggal(selectedDate));
                        }}
                        color="#3b82f6"
                    />
                </div>,
                document.body
            )}
        </div>
    );
};

export default function TransferOrderItemFields({
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
    isEditing = false,
}: TOItemFieldsProps) {
    const [selectedNewItem, setSelectedNewItem] = useState<any>(null);

    const BATCH_SIZE = 50;
    const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
    const hasMoreItems = displayCount < (formData.items?.length || 0);

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

    useEffect(() => {
        setDisplayCount(BATCH_SIZE);
    }, [formData.items?.length]);

    const visibleItems = useMemo(
        () => formData.items?.slice(0, displayCount) || [],
        [formData.items, displayCount]
    );

    // Kolom read-only ini urutannya disamakan persis dengan tabel Items di record
    // Transfer Order asli NetSuite: Item, Committed, Picked, Packed, Fulfilled,
    // Received, Back Ordered, Quantity, Transfer Price, Units, Amount,
    // Description, Expected Receipt Date, Order Priority, Commitment Confirmed, Closed.
    const progressColumns: TableColumn<TransferOrderFormItem>[] = isEditing ? [
        {
            name: 'Committed',
            selector: (row) => row.committed || 0,
            cell: (row) => <div className="text-center text-sm text-gray-600">{row.committed ?? '-'}</div>,
            center: true,
            width: '100px',
            sortable: false,
        },
        {
            name: 'Picked',
            selector: (row) => row.picked || 0,
            cell: (row) => <div className="text-center text-sm text-gray-600">{row.picked ?? '-'}</div>,
            center: true,
            width: '90px',
            sortable: false,
        },
        {
            name: 'Packed',
            selector: (row) => row.packed || 0,
            cell: (row) => <div className="text-center text-sm text-gray-600">{row.packed ?? '-'}</div>,
            center: true,
            width: '90px',
            sortable: false,
        },
        {
            name: 'Fulfilled',
            selector: (row) => row.fulfilled || row.shipped || 0,
            cell: (row) => <div className="text-center text-sm text-gray-600">{row.fulfilled ?? row.shipped ?? '-'}</div>,
            center: true,
            width: '100px',
            sortable: false,
        },
        {
            name: 'Received',
            selector: (row) => row.received || 0,
            cell: (row) => <div className="text-center text-sm text-gray-600">{row.received ?? '-'}</div>,
            center: true,
            width: '100px',
            sortable: false,
        },
        {
            name: 'Back Ordered',
            selector: (row) => row.backorder || 0,
            cell: (row) => <div className="text-center text-sm text-gray-600">{row.backorder ?? '-'}</div>,
            center: true,
            width: '120px',
            sortable: false,
        },
    ] : [];

    const unitsAmountColumns: TableColumn<TransferOrderFormItem>[] = isEditing ? [
        {
            name: 'Units',
            selector: (row) => row.units || '-',
            cell: (row) => <div className="text-center text-sm text-gray-600">{row.units || '-'}</div>,
            center: true,
            width: '90px',
            sortable: false,
        },
    ] : [];

    const statusColumns: TableColumn<TransferOrderFormItem>[] = isEditing ? [
        {
            name: 'Order Priority',
            selector: (row) => row.order_priority || '-',
            cell: (row) => <div className="text-center text-sm text-gray-600">{row.order_priority || '-'}</div>,
            center: true,
            width: '130px',
            sortable: false,
        },
        {
            name: 'Commitment Confirmed',
            selector: (row) => (row.commitment_confirmed ? 'Yes' : 'No'),
            cell: (row) => (
                <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.commitment_confirmed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {row.commitment_confirmed ? 'Yes' : 'No'}
                    </span>
                </div>
            ),
            center: true,
            width: '170px',
            sortable: false,
        },
        {
            name: 'Closed',
            selector: (row) => (row.closed ? 'Yes' : 'No'),
            cell: (row) => (
                <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.closed ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'}`}>
                        {row.closed ? 'Closed' : 'Open'}
                    </span>
                </div>
            ),
            center: true,
            width: '110px',
            sortable: false,
        },
    ] : [];

    const itemColumns: TableColumn<TransferOrderFormItem>[] = [
        {
            name: 'Item',
            selector: (row: TransferOrderFormItem) => row.item_displayname || 'N/A',
            cell: row => (
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.item_displayname || 'N/A'}</div>
                    <div className="block text-sm text-gray-500">{row.item_name || '-'}</div>
                </div>
            ),
            grow: 2,
            width: '260px',
        },
        ...progressColumns,
        {
            name: 'Quantity',
            selector: (row: TransferOrderFormItem) => row.quantity || 0,
            cell: (row, index) => (
                <InputField
                    name={`quantity_${index}`}
                    type="text"
                    maxLength={6}
                    min='0'
                    value={row.quantity && row.quantity > 0 ? row.quantity.toString() : ''}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => {
                        const quantity = toNumber(e.target.value);
                        onUpdateItem(index as number, 'quantity', quantity);
                        // Perkalian otomatis qty x rate -> amount cuma buat item baru (isEditing=false di
                        // Create, atau row.isNew di Edit). Item lama hasil load dari NetSuite gak disentuh
                        // amount-nya biar ga ke-overwrite tanpa sengaja.
                        if (!isEditing || row.isNew) {
                            onUpdateItem(index as number, 'amount', quantity * (row.rate || 0));
                        }
                    }}
                    onBlur={(e) => {
                        const quantity = toNumber(e.target.value);
                        if (quantity === 0) {
                            onUpdateItem(index as number, 'quantity', 1);
                            if (!isEditing || row.isNew) {
                                onUpdateItem(index as number, 'amount', 1 * (row.rate || 0));
                            }
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="p-1 px-3 w-[100px] text-center"
                />
            ),
            wrap: true,
            center: true,
            width: '130px',
        },
        {
            name: 'Transfer Price',
            selector: (row: TransferOrderFormItem) => row.rate || 0,
            cell: (row, index) => (
                <InputField
                    name={`rate_${index}`}
                    type="text"
                    value={row.rate ? String(row.rate) : ''}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => {
                        const rate = toNumber(e.target.value);
                        onUpdateItem(index as number, 'rate', rate);
                        if (!isEditing || row.isNew) {
                            onUpdateItem(index as number, 'amount', rate * (row.quantity || 0));
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="p-1 px-3 w-[130px] text-right"
                />
            ),
            wrap: true,
            center: true,
            width: '150px',
        },
        {
            name: 'Amount',
            selector: (row: TransferOrderFormItem) => row.amount || 0,
            cell: (row, index) => (
                <InputField
                    name={`amount_${index}`}
                    type="text"
                    value={row.amount ? String(row.amount) : ''}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => {
                        onUpdateItem(index as number, 'amount', toNumber(e.target.value));
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="p-1 px-3 w-[130px] text-right"
                />
            ),
            wrap: true,
            center: true,
            width: '150px',
        },
        ...unitsAmountColumns,
        {
            name: 'Description',
            selector: (row: TransferOrderFormItem) => row.description || '-',
            cell: (row, idx) => (
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
            ),
            width: '250px',
        },
        {
            name: 'Expected Receipt Date',
            selector: (row) => row.expectedreceiptdate || '-',
            cell: (row, index) => (
                <InlineDatePicker
                    value={row.expectedreceiptdate}
                    onChange={(val) => onUpdateItem(index as number, 'expectedreceiptdate', val)}
                />
            ),
            center: true,
            width: '180px',
            sortable: false
        },
        ...statusColumns,
        createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: (row: TransferOrderFormItem) => {
                    onRemoveItem(row.id || '')
                },
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Remove Item',
                permission: 'delete' as const
            }
        ])
    ];

    return (
        <div className="space-y-6">
            <div className="mb-6 space-y-6 p-6">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">Line Items</h3>

                {/* Add Item */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Label htmlFor="to-add-item">Select Item to Add</Label>
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
                            placeholder={!formData.subsidiary ? "Pilih Subsidiary dahulu" : "Cari item..."}
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
                {(!formData.subsidiary || !formData.location || !formData.transferlocation || !formData.class || !formData.department) && (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
                        Lengkapi field Subsidiary, Location, Transfer To Location, Class, dan Department terlebih dahulu sebelum menambahkan item.
                    </p>
                )}

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
            </div>
        </div>
    );
}

// Summary items Transfer Order — pola sama seperti InvoiceSummary (PO) / SOInvoiceSummary / QuotationInvoiceSummary,
// tanpa Tax karena Transfer Order tidak punya konsep tax per line.
export const TOInvoiceSummary: React.FC<{ items: TransferOrderFormItem[], serverTotal?: number }> = ({ items, serverTotal }) => {
    const summary = useMemo(() => {
        const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        const subtotal = items.reduce((sum, item) => {
            const amount = item.amount != null ? Number(item.amount) : (Number(item.rate) || 0) * (Number(item.quantity) || 0);
            return sum + amount;
        }, 0);
        const grandTotal = serverTotal != null && serverTotal > 0 ? serverTotal : subtotal;

        return { totalQty, subtotal, grandTotal };
    }, [items, serverTotal]);

    return (
        <div className="w-full px-0 space-y-3">
            <div className="space-y-6">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Items</span>
                    <span className="font-medium text-gray-800">{items.length} item ({summary.totalQty} qty)</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">{formatCurrencyDynamic(summary.subtotal, '')}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between text-sm font-primary-bold">
                    <span>Grand Total</span>
                    <span className="text-blue-700">{formatCurrencyDynamic(summary.grandTotal, '')}</span>
                </div>
            </div>
        </div>
    );
};
