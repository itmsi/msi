import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { MdSave, MdKeyboardArrowLeft, MdAdd, MdDelete } from 'react-icons/md';
import { Calendar } from 'react-date-range';
import { TableColumn } from "react-data-table-component";

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

// Components
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomDataTable from "@/components/ui/table/CustomDataTable";
import WysiwygEditor from '@/components/form/editor/WysiwygEditor';

// Types and hooks
import { 
    QuotationFormData, 
    QuotationItem, 
    QuotationValidationErrors
} from './types/quotation';
import { ItemProduct } from '../Product/types/product';
import { useCreateQuotation } from './hooks/useCreateQuotation';
import { useAsyncSelect, SelectOption } from '../hooks/useAsyncSelect';
import { useTermConditionSelect, TermConditionSelectOption } from '../hooks/useTermConditionSelect';
import { handleKeyPress, formatNumberInput, handlePercentageInput, parseDecimalInput, handleDecimalInputComma, formatNumberInputwithComma } from '@/helpers/generalHelper';
import { TermConditionService } from '../TermCondition/services/termconditionService';
import { ItemProductService } from '../Product/services/productService';
import { QuotationService } from './services/quotationService';
import ProductDetailDrawer from '@/pages/Quotation/Manage/components/ProductDetailDrawer';
import { BankSelectOption, useBankSelect } from '../hooks/useBankSelect';
import { useEmployeeSelect } from '../hooks/useEmployeeSelect';
import { useCustomerSelect } from '../hooks/useCustomerSelect';
import Checkbox from '@/components/form/input/Checkbox';
import { FaEye } from 'react-icons/fa6';
import { IslandSelectOption, useIslandSelect } from '@/hooks/useIslandSelect';

export default function CreateQuotation() {
    const navigate = useNavigate();
    const { isCreating, validationErrors, clearFieldError, createQuotation } = useCreateQuotation();
    
    // Use useEmployees hook
    const { 
        employeeOptions, 
        pagination: employeePagination, 
        inputValue: employeeInputValue,
        setActiveSales,
        handleInputChange: handleEmployeeInputChange,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions
    } = useEmployeeSelect(); 

    // Use useCustomers hook
    const {
        customerOptions, 
        pagination: customerPagination, 
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom,
        initializeOptions: initializeCustomerOptions
    } = useCustomerSelect();

    // Use async select hook for products and accessories
    const {
        productOptions,
        productPagination,
        productInputValue,
        handleProductInputChange,
        handleProductMenuScrollToBottom,
        initializeProductOptions
    } = useAsyncSelect();

    // Use term condition select hook
    const {
        termConditionOptions,
        pagination: termConditionPagination,
        inputValue: termConditionInputValue,
        handleInputChange: handleTermConditionInputChange,
        handleMenuScrollToBottom: handleTermConditionMenuScrollToBottom,
        initializeOptions: initializeTermConditionOptions
    } = useTermConditionSelect();

    // Use bank hook
    const {
        bankOptions,
        pagination: bankPagination, 
        inputValue: bankInputValue,
        handleInputChange: handleBankInputChange,
        handleMenuScrollToBottom: handleBankMenuScrollToBottom,
        initializeOptions: initializeBankOptions
    } = useBankSelect();

    // Use reusable island select hook
    const {
        islandOptions,
        pagination: islandPagination, 
        inputValue: islandInputValue,
        handleInputChange: handleIslandInputChange,
        handleMenuScrollToBottom: handleIslandMenuScrollToBottom,
        initializeOptions: initializeIslandOptions
    } = useIslandSelect();

    // Form state
    const [formData, setFormData] = useState<QuotationFormData>({
        customer_id: '',
        employee_id: '',
        island_id: '',
        bank_account_id: '',
        bank_account_name: '',
        bank_account_number: '',
        bank_account_type: '',
        bank_account_bank_name: '',
        manage_quotation_date: new Date().toISOString().split('T')[0],
        manage_quotation_valid_date: '',
        manage_quotation_grand_total: '',
        manage_quotation_grand_total_before: '0',
        manage_quotation_mutation_type: '',
        manage_quotation_mutation_nominal: '0',
        manage_quotation_ppn: '11',
        manage_quotation_delivery_fee: '',
        manage_quotation_other: '',
        manage_quotation_payment_presentase: '',
        manage_quotation_payment_nominal: '',
        manage_quotation_description: '',
        manage_quotation_shipping_term: '',
        manage_quotation_franco: '',
        manage_quotation_lead_time: '',
        term_content_id: '',
        term_content_directory: '',
        include_aftersales_page: true,  // Added for API payload
        include_msf_page: false,        // Added for API payload
        status: 'draft',
        manage_quotation_items: [],
        manage_quotation_item_accessories: [] // Will be removed from form level
    });

    // Date picker states for separate invoice and due dates
    const [invoiceDate, setInvoiceDate] = useState(new Date());
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from today
    const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const invoiceDatePickerRef = useRef<HTMLDivElement>(null);
    const dueDatePickerRef = useRef<HTMLDivElement>(null);

    // Temporary states for adding items
    const [selectedProduct, setSelectedProduct] = useState<SelectOption | null>(null);
    
    // Product detail offcanvas state
    const [showProductDetail, setShowProductDetail] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [unsavedProductChanges, setUnsavedProductChanges] = useState<Record<string, ItemProduct>>({});
    const [productSelectError, setProductSelectError] = useState<string>('');
    
    // Term condition states
    const [selectedTermCondition, setSelectedTermCondition] = useState<TermConditionSelectOption | null>(null);
    const [termConditionContent, setTermConditionContent] = useState<string>('');
    const [termConditionLoading, setTermConditionLoading] = useState<boolean>(false);
    
    // Banks Account states
    const [selectedBank, setSelectedBank] = useState<BankSelectOption | null>(null);

    // Island Account states
    const [selectedIsland, setSelectedIsland] = useState<IslandSelectOption | null>(null);

    // Selected values for form
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    // Sync individual dates with form data
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            manage_quotation_date: invoiceDate.toISOString().split('T')[0],
            manage_quotation_valid_date: dueDate.toISOString().split('T')[0]
        }));
    }, [invoiceDate, dueDate]);

    // Handle click outside for invoice date picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (invoiceDatePickerRef.current && !invoiceDatePickerRef.current.contains(event.target as Node)) {
                setShowInvoiceDatePicker(false);
            }
        };

        if (showInvoiceDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showInvoiceDatePicker]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dueDatePickerRef.current && !dueDatePickerRef.current.contains(event.target as Node)) {
                setShowDueDatePicker(false);
            }
        };

        if (showDueDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showDueDatePicker]);

    const calculateItemTotal = (quantity: number, price: string): string => {
        const numPrice = parseFloat(price) || 0;
        if (quantity <= 0 || numPrice === 0) return '0';
        return (quantity * numPrice).toString();
    };

    const resetQuotationFormattedNumbers = (formData: any): any => {
        // const quotationNumericFields = [
        //     'manage_quotation_delivery_fee',
        //     'manage_quotation_other',
        //     'manage_quotation_payment_presentase',
        //     'manage_quotation_ppn',
        //     'manage_quotation_grand_total',
        //     'manage_quotation_payment_nominal'
        // ];
        // return resetFormatNumbers(formData, quotationNumericFields);
        return formData;
    };

    const calculateGrandTotal = useCallback((currentFormData: QuotationFormData): { ppn: string; grandTotal: string; paymentNominal: string, remainingPayment: string } => {
        const itemsTotal = currentFormData.manage_quotation_items.reduce((sum, item) => 
            sum + (parseFloat(item.total) || 0), 0
        );

        const deliveryFee = parseFloat(currentFormData.manage_quotation_delivery_fee || '0') || 0;
        const otherFee = parseFloat(currentFormData.manage_quotation_other || '0') || 0;
        const ppnPercentage = parseFloat(currentFormData.manage_quotation_ppn || '11') || 11;
        
        const ppn = itemsTotal * (ppnPercentage / 100);
        let grandTotal = itemsTotal + ppn + deliveryFee + otherFee;
        
        // Apply mutation if type and nominal are set
        const mutationType = currentFormData.manage_quotation_mutation_type;
        const mutationNominal = parseDecimalInput(currentFormData.manage_quotation_mutation_nominal, 0);
        
        if (mutationType && mutationNominal > 0) {
            if (mutationType === 'plus') {
                grandTotal += mutationNominal;
            } else if (mutationType === 'minus') {
                grandTotal -= mutationNominal;
            }
        }
        
        const paymentPercentage = parseFloat(currentFormData.manage_quotation_payment_presentase || '0') || 0;
        const paymentNominal = grandTotal * (paymentPercentage / 100);
        const remainingPayment = grandTotal - paymentNominal;

        return {
            ppn: ppn.toString(),
            grandTotal: grandTotal.toString(),
            paymentNominal: paymentNominal.toString(),
            remainingPayment: remainingPayment.toString()
        };
    }, []);

    const handleBankChange = useCallback((selectedOption: BankSelectOption | null) => {
        if (selectedOption && selectedOption.data) {
            const bankData = selectedOption.data;
            setFormData(prev => ({
                ...prev,
                bank_account_id: bankData.bank_account_id,
                bank_account_name: bankData.bank_account_name || '',
                bank_account_type: bankData.bank_account_type || '',
                bank_account_number: bankData.bank_account_number || '',
                bank_account_bank_name: bankData.bank_account_type || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                bank_account_id: '',
                bank_account_name: '',
                bank_account_type: '',
                bank_account_number: '',
                bank_account_bank_name: ''
            }));
        }
    }, []);
    const handleInputChange = (field: keyof QuotationFormData, value: string | boolean) => {
        setFormData(prev => {
            const newFormData = { ...prev, [field]: value };
            
            // Reset mutation nominal to 0 when mutation type is set to "No Adjustment"
            if (field === 'manage_quotation_mutation_type' && !value) {
                newFormData.manage_quotation_mutation_nominal = '0';
            }
            
            if (field === 'manage_quotation_delivery_fee' || field === 'manage_quotation_other' || 
                field === 'manage_quotation_payment_presentase' || field === 'manage_quotation_ppn' ||
                field === 'manage_quotation_mutation_type' || field === 'manage_quotation_mutation_nominal') {
                
                // Calculate base grand total (without mutation)
                const itemsTotal = newFormData.manage_quotation_items.reduce((sum, item) => 
                    sum + (parseFloat(item.total) || 0), 0
                );
                const deliveryFee = parseFloat(newFormData.manage_quotation_delivery_fee || '0') || 0;
                const otherFee = parseFloat(newFormData.manage_quotation_other || '0') || 0;
                const ppnPercentage = parseFloat(newFormData.manage_quotation_ppn || '11') || 11;
                const ppn = itemsTotal * (ppnPercentage / 100);
                const baseGrandTotal = itemsTotal + ppn + deliveryFee + otherFee;
                
                // Store base grand total before applying mutation
                newFormData.manage_quotation_grand_total_before = baseGrandTotal.toString();
                
                const calculations = calculateGrandTotal(newFormData);
                return {
                    ...newFormData,
                    manage_quotation_grand_total: calculations.grandTotal,
                    manage_quotation_payment_nominal: calculations.paymentNominal,
                    manage_quotation_remaining_payment: calculations.remainingPayment
                };
            }

            return newFormData;
        });

        const validatableFields: (keyof QuotationValidationErrors)[] = [
            'customer_id', 'employee_id', 'island_id', 'manage_quotation_date', 
            'manage_quotation_valid_date', 'manage_quotation_delivery_fee', 
            'manage_quotation_other', 'manage_quotation_payment_presentase', 
            'manage_quotation_description', 'manage_quotation_items'
        ];
        
        if (validatableFields.includes(field as keyof QuotationValidationErrors)) {
            clearFieldError(field as keyof QuotationValidationErrors);
        }
    };

    const handleNumericInputChange = (field: keyof QuotationFormData, inputValue: string) => {
        const numberic = inputValue.replace(/[^\d]/g, '');
        handleInputChange(field, numberic);
    };

    const handleNumericCleanInput = (field: keyof QuotationFormData, inputValue: string) => {
        handleInputChange(field, inputValue);
    };

    // const handleDecimalInputChange = (field: keyof QuotationFormData, inputValue: string) => {
    //     // Allow digits, comma, and dot
    //     const cleaned = inputValue.replace(/[^\d,.]/g, '');
    //     handleInputChange(field, cleaned);
    // };

    // Format decimal for display - preserves decimal separator and trailing digits
    // const formatDecimalDisplayInput = (value: string | undefined | null): string => {
    //     if (!value) return '';
        
    //     const str = value.toString();
        
    //     // Check if there's a decimal separator (comma or dot)
    //     const hasComma = str.includes(',');
    //     const hasDot = str.includes('.');
        
    //     if (!hasComma && !hasDot) {
    //         // No decimal - just format as integer with thousand separators
    //         const cleaned = str.replace(/[^\d]/g, '');
    //         if (!cleaned) return '';
    //         return new Intl.NumberFormat('id-ID').format(parseInt(cleaned));
    //     }
        
    //     // Has decimal separator - preserve it
    //     const separator = hasComma ? ',' : '.';
    //     const parts = str.split(separator);
    //     const integerPart = parts[0].replace(/[^\d]/g, '') || '0';
    //     const decimalPart = parts[1] || '';
        
    //     // Format integer part with thousand separators
    //     const formattedInteger = new Intl.NumberFormat('id-ID').format(parseInt(integerPart));
        
    //     // Return with comma as decimal separator (Indonesian format)
    //     return `${formattedInteger},${decimalPart}`;
    // };

    const handlePercentageInputChange = (field: keyof QuotationFormData, inputValue: string) => {
        handleInputChange(field, handlePercentageInput(inputValue));
    };

    const handleInvoiceDateChange = useCallback((date: Date) => {
        setInvoiceDate(date);
        if (dueDate < date) {
            setDueDate(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000));
        }
        clearFieldError('manage_quotation_date');
        setShowInvoiceDatePicker(false);
    }, [clearFieldError, dueDate]);

    const handleDueDateChange = useCallback((date: Date) => {
        if (date < invoiceDate) {
            toast.error('Due date cannot be earlier than invoice date');
            return;
        }
        setDueDate(date);
        clearFieldError('manage_quotation_valid_date');
        setShowDueDatePicker(false);
    }, [clearFieldError, invoiceDate]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    useEffect(() => {
        initializeCustomerOptions();
    }, [initializeCustomerOptions]);

    useEffect(() => {
        setActiveSales(true);
        initializeEmployeeOptions();
    }, [initializeEmployeeOptions]);
    
    useEffect(() => {
        initializeBankOptions();
    }, [initializeBankOptions]);

    useEffect(() => {
        initializeProductOptions();
    }, [initializeProductOptions]);

    useEffect(() => {
        initializeTermConditionOptions();
    }, [initializeTermConditionOptions]);
    
    useEffect(() => {
        initializeIslandOptions();
    }, [initializeIslandOptions]);
    useEffect(() => {
        const editor = document.getElementById('wysiwyg-editor');
        if (editor && termConditionContent && editor.innerHTML !== termConditionContent) {
            if (document.activeElement !== editor) {
                editor.innerHTML = termConditionContent;
            }
        }
    }, [termConditionContent]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdowns = document.querySelectorAll('.toolbar-dropdown');
            dropdowns.forEach(dropdown => {
                if (!dropdown.parentElement?.contains(event.target as Node)) {
                    dropdown.classList.add('hidden');
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Function to fetch detailed term condition content
    const fetchTermConditionContent = useCallback(async (termConditionId: string) => {
        setTermConditionLoading(true);
        try {
            const response = await TermConditionService.getTermConditionById(termConditionId);
            if (response && response.data) {
                const apiResponse = response;
                
                
                if (apiResponse.status && apiResponse.data && apiResponse.data.term_content_payload) {
                    // Successfully loaded term condition content
                    const detailedContent = apiResponse.data.term_content_payload;
                    setTermConditionContent(detailedContent);
                    handleInputChange('term_content_directory', detailedContent);
                    toast.success('Term condition content loaded successfully');
                } else {
                    toast.error(apiResponse.message || 'Failed to load term condition content');
                }
            } else {
                toast.error('Invalid response format');
            }
        } catch (error: any) {
            console.error('Error fetching term condition content:', error);
            toast.error('Failed to load term condition content');
        } finally {
            setTermConditionLoading(false);
        }
    }, [handleInputChange]);

    const addProductItem = async () => {
        setProductSelectError('');

        if (!formData.island_id) {
            const errorMessage = 'Please select an island first before adding products';
            setProductSelectError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        if (!selectedProduct) {
            const errorMessage = 'Please select a product first';
            setProductSelectError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        try {
            const response = await ItemProductService.getItemProductById(selectedProduct.value);
            
            if (response.data && response.data.data) {
                const apiProductData = response.data.data;
                
                const islandAccessories = (formData.manage_quotation_item_accessories || []).map(accessory => ({
                    accessory_id: accessory.accessory_id,
                    accessory_part_number: accessory.accessory_part_number,
                    accessory_part_name: accessory.accessory_part_name,
                    accessory_brand: accessory.accessory_brand,
                    accessory_specification: accessory.accessory_specification,
                    quantity: accessory.quantity,
                    description: accessory.description,
                    accessory_description: accessory.description || '',
                    accessory_remark: '',
                    accessory_region: '' 
                }));
                
                const newQuotationItem: QuotationItem = {
                    componen_product_id: apiProductData.componen_product_id,
                    componen_product_name: apiProductData.componen_product_name || selectedProduct.label || '',
                    code_unique: apiProductData.code_unique || '',
                    msi_model: apiProductData.msi_model || '',
                    msi_product: apiProductData.msi_product || '',
                    segment: apiProductData.segment || '',
                    wheel_no: apiProductData.wheel_no || '',
                    engine: apiProductData.engine || '',
                    volume: apiProductData.volume || '',
                    horse_power: apiProductData.horse_power || '',
                    product_type: apiProductData.product_type || '',
                    market_price: apiProductData.market_price || '0',
                    image: apiProductData.image || '',
                    quantity: 1,
                    price: apiProductData.market_price || '0',
                    total: apiProductData.market_price || '0',
                    componen_product_unit_model: apiProductData.componen_product_unit_model || '',
                    selling_price_star_1: apiProductData.selling_price_star_1 || '0',
                    selling_price_star_2: apiProductData.selling_price_star_2 || '0',
                    selling_price_star_3: apiProductData.selling_price_star_3 || '0',
                    selling_price_star_4: apiProductData.selling_price_star_4 || '0',
                    selling_price_star_5: apiProductData.selling_price_star_5 || '0',
                    description: apiProductData.componen_product_description || '',
                    manage_quotation_item_accessories: islandAccessories,
                    manage_quotation_item_specifications: apiProductData.componen_product_specifications?.map((spec: any) => ({
                        manage_quotation_item_specification_label: spec.componen_product_specification_label || spec.specification_label_name || '',
                        manage_quotation_item_specification_value: spec.componen_product_specification_value || spec.specification_value_name || ''
                    })) || []
                };

                // Add new item to quotation and recalculate totals
                setFormData(prev => {
                    const newFormData = {
                        ...prev,
                        manage_quotation_items: [...prev.manage_quotation_items, newQuotationItem]
                    };
                    
                    const calculations = calculateGrandTotal(newFormData);
                    return {
                        ...newFormData,
                        manage_quotation_grand_total: calculations.grandTotal,
                        manage_quotation_payment_nominal: calculations.paymentNominal,
                        manage_quotation_remaining_payment: calculations.remainingPayment
                    };
                });

                // Clear selection after successful add
                setSelectedProduct(null);
                toast.success('Product added successfully');
            } else {
                toast.error('Failed to load product details');
            }
        } catch (error: any) {
            console.error('Error fetching product details:', error);
            toast.error('Failed to load product details');
        }
    };



    // Update quotation item directly from table (inline editing)
    const updateItemById = (itemIndex: number, field: keyof QuotationItem, value: string | number) => {
        setFormData(prev => {
            const updatedQuotationItems = [...prev.manage_quotation_items];
            updatedQuotationItems[itemIndex] = { ...updatedQuotationItems[itemIndex], [field]: value };

            // Auto-calculate total when quantity or price changes
            if (field === 'quantity' || field === 'price') {
                updatedQuotationItems[itemIndex].total = calculateItemTotal(
                    updatedQuotationItems[itemIndex].quantity,
                    updatedQuotationItems[itemIndex].price
                );
            }

            const updatedFormData = { ...prev, manage_quotation_items: updatedQuotationItems };
            const calculations = calculateGrandTotal(updatedFormData);
            
            return {
                ...updatedFormData,
                manage_quotation_grand_total: calculations.grandTotal,
                manage_quotation_payment_nominal: calculations.paymentNominal,
                manage_quotation_remaining_payment: calculations.remainingPayment
            };
        });
    };



    // Remove quotation item and recalculate totals
    const removeQuotationItem = (itemIndex: number) => {
        setFormData(prev => {
            const updatedFormData = {
                ...prev,
                manage_quotation_items: prev.manage_quotation_items.filter((_, i) => i !== itemIndex)
            };
            
            const calculations = calculateGrandTotal(updatedFormData);
            return {
                ...updatedFormData,
                manage_quotation_grand_total: calculations.grandTotal,
                manage_quotation_payment_nominal: calculations.paymentNominal,
                manage_quotation_remaining_payment: calculations.remainingPayment
            };
        });
    };

    const handleShowProductDetail = useCallback((productId: string) => {
        const existingItem = formData.manage_quotation_items.find(
            item => item.componen_product_id === productId
        );
        
        if (!existingItem) {
            toast.error('Product not found in quotation');
            return;
        }

        // Always sync with current formData to ensure accessories are up to date
        setUnsavedProductChanges(prev => ({
            ...prev,
            [productId]: {
                componen_product_id: existingItem.componen_product_id,
                componen_product_name: existingItem.componen_product_name,
                code_unique: existingItem.code_unique || '',
                msi_model: existingItem.msi_model || '',
                msi_product: existingItem.msi_product || '',
                segment: existingItem.segment || '',
                wheel_no: existingItem.wheel_no || '',
                engine: existingItem.engine || '',
                volume: existingItem.volume || '',
                horse_power: existingItem.horse_power || '',
                market_price: existingItem.market_price || '',
                product_type: existingItem.product_type || '',
                selling_price_star_1: existingItem.selling_price_star_1 || '',
                selling_price_star_2: existingItem.selling_price_star_2 || '',
                selling_price_star_3: existingItem.selling_price_star_3 || '',
                selling_price_star_4: existingItem.selling_price_star_4 || '',
                selling_price_star_5: existingItem.selling_price_star_5 || '',
                image: existingItem.image,
                componen_product_description: existingItem.description || '',
                is_delete: false,
                componen_type: 1,
                componen_product_unit_model: existingItem.componen_product_unit_model || '',
                componen_product_specifications: existingItem.manage_quotation_item_specifications?.map((spec: any) => ({
                    componen_product_specification_label: spec.manage_quotation_item_specification_label || spec.specification_label_name || '',
                    componen_product_specification_value: spec.manage_quotation_item_specification_value || spec.specification_value_name || '',
                    componen_product_specification_description: spec.manage_quotation_item_specification_description || null,
                    specification_label_name: spec.manage_quotation_item_specification_label || spec.specification_label_name || '',
                    specification_value_name: spec.manage_quotation_item_specification_value || spec.specification_value_name || ''
                })) || [],
                manage_quotation_item_accessories: existingItem.manage_quotation_item_accessories?.map((acc: any) => ({
                    accessory_id: acc.accessory_id,
                    accessory_part_name: acc.accessory_part_name,
                    accessory_part_number: acc.accessory_part_number,
                    accessory_brand: acc.accessory_brand,
                    accessory_specification: acc.accessory_specification,
                    quantity: acc.quantity,
                    description: acc.description
                })) || []
            }
        }));
        
        setSelectedProductId(productId);
        setShowProductDetail(true);
    }, [formData.manage_quotation_items, unsavedProductChanges]);

    const handleCloseProductDetail = useCallback(() => {
        setShowProductDetail(false);
    }, []);

    // Auto-save product changes to formData
    const handleProductDataChange = useCallback((updatedProductData: ItemProduct) => {
        if (!updatedProductData.componen_product_id) return;
        
        const productId = updatedProductData.componen_product_id;
        
        // Update UI state
        setUnsavedProductChanges(prev => 
            prev[productId] === updatedProductData ? prev : { ...prev, [productId]: updatedProductData }
        );
        
        // Save to formData
        setFormData(prev => {
            const itemIndex = prev.manage_quotation_items.findIndex(
                item => item.componen_product_id === productId
            );
            
            if (itemIndex === -1) return prev;
            
            const items = [...prev.manage_quotation_items];
            const currentItem = items[itemIndex];
            
            // Map accessories dengan fallback ke berbagai format
            const mappedAccessories = (updatedProductData.accessories || (updatedProductData as any).accessories)?.map((acc: any) => ({
                accessory_id: acc.accessory_id || acc.id || '',
                accessory_part_number: acc.accessory_part_number || acc.code_unique || acc.part_number || '',
                accessory_part_name: acc.accessory_part_name || acc.componen_product_name || acc.name || '',
                accessory_brand: acc.accessory_brand || acc.brand || '',
                accessory_specification: acc.accessory_specification || acc.specification || '',
                quantity: acc.quantity || 1,
                description: acc.description || '',
                accessory_description: acc.description || '',
                accessory_remark: acc.remark || '',
                accessory_region: acc.region || ''
            })) || currentItem.manage_quotation_item_accessories;
            
            items[itemIndex] = {
                ...currentItem,
                componen_product_name: updatedProductData.componen_product_name || currentItem.componen_product_name,
                msi_model: updatedProductData.msi_model || currentItem.msi_model,
                msi_product: updatedProductData.msi_product || currentItem.msi_product,
                segment: updatedProductData.segment || currentItem.segment,
                wheel_no: updatedProductData.wheel_no || currentItem.wheel_no,
                engine: updatedProductData.engine || currentItem.engine,
                volume: updatedProductData.volume || currentItem.volume,
                horse_power: updatedProductData.horse_power || currentItem.horse_power,
                market_price: updatedProductData.market_price || currentItem.market_price,
                price: updatedProductData.market_price || currentItem.price,
                product_type: updatedProductData.product_type || currentItem.product_type,
                componen_product_unit_model: updatedProductData.componen_product_unit_model || currentItem.componen_product_unit_model,
                selling_price_star_1: updatedProductData.selling_price_star_1 || currentItem.selling_price_star_1,
                selling_price_star_2: updatedProductData.selling_price_star_2 || currentItem.selling_price_star_2,
                selling_price_star_3: updatedProductData.selling_price_star_3 || currentItem.selling_price_star_3,
                selling_price_star_4: updatedProductData.selling_price_star_4 || currentItem.selling_price_star_4,
                selling_price_star_5: updatedProductData.selling_price_star_5 || currentItem.selling_price_star_5,
                description: updatedProductData.componen_product_description || currentItem.description,
                manage_quotation_item_specifications: updatedProductData.componen_product_specifications?.map((spec: any) => ({
                    manage_quotation_item_specification_label: spec.componen_product_specification_label || '',
                    manage_quotation_item_specification_value: spec.componen_product_specification_value || ''
                })) || currentItem.manage_quotation_item_specifications,
                manage_quotation_item_accessories: mappedAccessories,
                total: calculateItemTotal(items[itemIndex].quantity, items[itemIndex].price)
            };

            const newFormData = { ...prev, manage_quotation_items: items };
            const calculations = calculateGrandTotal(newFormData);
            
            return {
                ...newFormData,
                manage_quotation_grand_total: calculations.grandTotal,
                manage_quotation_payment_nominal: calculations.paymentNominal,
                manage_quotation_remaining_payment: calculations.remainingPayment
            };
        });
    }, [calculateGrandTotal]);

    // Define columns for product table
    const productColumns: TableColumn<QuotationItem>[] = [
        {
            name: 'Product Name',
            selector: (row) => row.componen_product_name,
            cell: (row, index) => (
                <Input
                    value={row.componen_product_name}
                    onChange={(e) => updateItemById(index as number, 'componen_product_name', e.target.value)}
                    className="border-0 border-b-1 rounded-none p-1 px-3 w-full w-[480px]"
                    placeholder="Product name"
                    readonly
                />
            ),
            wrap: true,
            width: '500px',
        },
        {
            name: 'Quantity',
            selector: (row) => row.quantity,
            cell: (row, index) => (
                <Input
                    type="text"
                    maxLength={3}
                    min='0'
                    value={row.quantity}
                    onKeyPress={handleKeyPress}
                    onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateItemById(index as number, 'quantity', val);
                    }}
                    onBlur={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val === 0) {
                            updateItemById(index as number, 'quantity', 1);
                        }
                    }}
                    className="border-0 border-b-1 rounded-none p-1 px-3 w-[80px] text-center"
                />
            ),
            wrap: true,
            width: '130px',
        },
        {
            name: 'Price',
            selector: (row) => row.price,
            cell: (row, index) => (
                <Input
                    type="text"
                    value={row.price}
                    onChange={(e) => updateItemById(index as number, 'price', e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-0 border-b-1 rounded-none p-1 px-3 w-[150px] text-center"
                    placeholder='input price'
                />
            ),
            center: true,
        },
        {
            name: 'Total',
            selector: (row) => row.total,
            cell: (row) => (
                <div className="font-medium">
                    {parseFloat(row.total).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                    })}
                </div>
            ),
            // right: true,
            width: '250px',
        },
        // {
        //     name: 'Description',
        //     selector: (row) => row.description,
        //     cell: (row, index) => (
        //         <Input
        //             value={row.description}
        //             onChange={(e) => updateItem(index as number, 'description', e.target.value)}
        //             className="border-0 border-b-1 rounded-none p-1 px-3 w-full"
        //         />
        //     ),
        //     wrap: true,
        // },
        {
            name: 'Detail',
            cell: (row) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowProductDetail(row.componen_product_id)}
                    className=""
                    disabled={showProductDetail && selectedProductId === row.componen_product_id}
                >
                    {showProductDetail && selectedProductId === row.componen_product_id ? <FaEye /> : <FaEye />}
                </Button>
            ),
            width: '100px',
            center: true,
            ignoreRowClick: true,
        },
        {
            name: 'Action',
            cell: (_row, index) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuotationItem(index as number)}
                    className="text-red-600 hover:text-red-700"
                >
                    <MdDelete size={16} />
                </Button>
            ),
            width: '80px',
            center: true,
            ignoreRowClick: true,
        },
    ];

    // Form validation
    const validateForm = (): boolean => {
        const errors: any = {};

        if (!formData.customer_id) {
            errors.customer_id = 'Customer is required';
        }

        if (!formData.employee_id) {
            errors.employee_id = 'Employee is required';
        }

        if (!formData.island_id) {
            errors.island_id = 'Island is required';
        }

        if (!formData.bank_account_id) {
            errors.bank_account_id = 'Bank account is required';
        }

        if (!formData.manage_quotation_date) {
            errors.manage_quotation_date = 'Invoice date is required';
        }

        if (!formData.manage_quotation_valid_date) {
            errors.manage_quotation_valid_date = 'Due date is required';
        }

        if (formData.manage_quotation_items.length === 0) {
            errors.manage_quotation_items = 'At least one product item is required';
        }

        if (!formData.term_content_directory) {
            errors.term_content_directory = 'Term & Condition is required';
        }

        if (Object.keys(errors).length > 0) {
            Object.keys(errors).forEach(key => {
                toast.error(errors[key]);
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'submit' = 'draft') => {
        e.preventDefault();

        if (status === 'submit' && !validateForm()) {
            return;
        }

        try {
            // Calculate final values
            const finalCalculations = calculateGrandTotal(formData);
            
            // Validate grand total is not negative
            const grandTotalValue = parseFloat(finalCalculations.grandTotal);
            if (grandTotalValue < 0) {
                toast.error('Grand total cannot be negative. Please reduce the adjustment amount.');
                return;
            }
            
            // Format numbers to max 2 decimals for backend validation
            const formatForBackend = (value: string): string => {
                const num = parseFloat(value);
                return isNaN(num) ? '0' : num.toFixed(2);
            };
            
            const updatedFormData = {
                ...formData,
                status,
                manage_quotation_grand_total: formatForBackend(finalCalculations.grandTotal),
                manage_quotation_payment_nominal: formatForBackend(finalCalculations.paymentNominal),
                manage_quotation_remaining_payment: formatForBackend(finalCalculations.remainingPayment)
            };
            
            // Clean up manage_quotation_items - remove unnecessary fields for API
            const cleanedItems = updatedFormData.manage_quotation_items.map(item => {
                const { 
                    product_type, 
                    image, 
                    componen_product_unit_model, 
                    selling_price_star_1, 
                    selling_price_star_2, 
                    selling_price_star_3, 
                    selling_price_star_4, 
                    selling_price_star_5,
                    ...cleanedItem 
                } = item;
                return cleanedItem;
            });
            
            // Prepare API payload
            const apiPayload: any = {
                ...updatedFormData,
                manage_quotation_items: cleanedItems,
                // Ensure mutation fields are properly formatted for API (max 2 decimals)
                manage_quotation_grand_total_before: updatedFormData.manage_quotation_grand_total_before 
                    ? formatForBackend(updatedFormData.manage_quotation_grand_total_before)
                    : null,
                manage_quotation_mutation_type: updatedFormData.manage_quotation_mutation_type || null,
                manage_quotation_mutation_nominal: updatedFormData.manage_quotation_mutation_nominal 
                    ? parseDecimalInput(updatedFormData.manage_quotation_mutation_nominal, 0).toFixed(2)
                    : null
            };
            
            // Clean up number formatting for API
            const finalPayload = resetQuotationFormattedNumbers(apiPayload);
            
            // Submit to API
            const response = await createQuotation(finalPayload);
            
            if (response.success) {
                toast.success(`Quotation ${status === 'submit' ? 'submitted' : 'saved as draft'} successfully`);
                navigate('/quotations/manage');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save quotation');
        }
    };
    const romanMonths = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

    const monthRoman = romanMonths[new Date().getMonth()];
    return (
        <>
            <PageMeta
                title="Create Quotation | MSI"
                description="Create a new quotation"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/quotations/manage')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Quotation</h1>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => handleSubmit(e, 'submit')} className="space-y-6">
                        <div className='md:grid-cols-5 grid gap-6'>
                            <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-3">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-5">Quotation Detail</h2>
                                <div className='md:grid-cols-2 grid gap-x-5'>
                                    <div className="md:col-span-1 space-y-3">
                                        {/* INVOICE NUMBER */}
                                        <div>
                                            <Label htmlFor="quotation_number">Quotation Number</Label>
                                            <Input
                                                id="quotation_number"
                                                type="text"
                                                value={`###/IEC-MSI/${monthRoman}/${new Date().getFullYear()}`}
                                                disabled={true}
                                            />
                                        </div>
                                        {/* Quotation Date */}
                                        <div>
                                            <Label>Quotation Date</Label>
                                            <div className="relative" ref={invoiceDatePickerRef}>
                                                <div 
                                                    className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500"
                                                    onClick={() => setShowInvoiceDatePicker(!showInvoiceDatePicker)}
                                                >
                                                    <span className="text-gray-700">
                                                        {formatDate(invoiceDate)}
                                                    </span>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                
                                                {showInvoiceDatePicker && (
                                                    <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                                        <Calendar
                                                            date={invoiceDate}
                                                            onChange={handleInvoiceDateChange}
                                                            color="#3b82f6"
                                                            minDate={new Date()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {validationErrors.manage_quotation_date && (
                                                <span className="text-sm text-red-500">
                                                    {validationErrors.manage_quotation_date}
                                                </span>
                                            )}
                                        </div>
                                        {/* Due Date */}
                                        <div>
                                            <Label>Quotation Valid Until</Label>
                                            <div className="relative" ref={dueDatePickerRef}>
                                                <div 
                                                    className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500"
                                                    onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                                                >
                                                    <span className="text-gray-700">
                                                        {formatDate(dueDate)}
                                                    </span>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                
                                                {showDueDatePicker && (
                                                    <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                                        <div className="p-3 border-b border-gray-200">
                                                            <div className="text-sm text-gray-600 mb-2">Quick Select:</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                                                    onClick={() => handleDueDateChange(new Date(invoiceDate.getTime() + 24 * 60 * 60 * 1000))}
                                                                >
                                                                    +1 Day
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                                                    onClick={() => handleDueDateChange(new Date(invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                                                                >
                                                                    +7 Days
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                                                    onClick={() => handleDueDateChange(new Date(invoiceDate.getTime() + 14 * 24 * 60 * 60 * 1000))}
                                                                >
                                                                    +14 Days
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                                                    onClick={() => handleDueDateChange(new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000))}
                                                                >
                                                                    +30 Days
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <Calendar
                                                            date={dueDate}
                                                            onChange={handleDueDateChange}
                                                            color="#3b82f6"
                                                            minDate={invoiceDate} // Due date cannot be before invoice date
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {validationErrors.manage_quotation_valid_date && (
                                                <span className="text-sm text-red-500">
                                                    {validationErrors.manage_quotation_valid_date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 space-y-3">
                                        {/* Customer */}
                                        <div>
                                            <Label>Select Customer</Label>
                                            <CustomAsyncSelect
                                                name="customer_id"
                                                placeholder="Select customer..."
                                                value={selectedCustomer}
                                                error={validationErrors.customer_id}
                                                defaultOptions={customerOptions}
                                                loadOptions={handleCustomerInputChange}
                                                onMenuScrollToBottom={handleCustomerMenuScrollToBottom}
                                                isLoading={customerPagination.loading}
                                                noOptionsMessage={() => "No customers found"}
                                                loadingMessage={() => "Loading customers..."}
                                                isSearchable={true}
                                                inputValue={customerInputValue}
                                                onInputChange={(inputValue) => {
                                                    handleCustomerInputChange(inputValue);
                                                }}
                                                onChange={(option: any) => {
                                                    setSelectedCustomer(option);
                                                    handleInputChange('customer_id', option?.value || '');
                                                }}
                                            />
                                            {validationErrors.customer_id && (
                                                <span className="text-sm text-red-500">{validationErrors.customer_id}</span>
                                            )}
                                        </div>
                                        {/* Employee */}
                                        <div>
                                            <Label>Select Sales</Label>
                                            <CustomAsyncSelect
                                                placeholder="Select employee..."
                                                value={selectedEmployee}
                                                error={validationErrors.employee_id}
                                                defaultOptions={employeeOptions}
                                                loadOptions={handleEmployeeInputChange}
                                                onMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                                                isLoading={employeePagination.loading}
                                                noOptionsMessage={() => "No employees found"}
                                                loadingMessage={() => "Loading employees..."}
                                                isSearchable={true}
                                                inputValue={employeeInputValue}
                                                onInputChange={(inputValue) => {
                                                    handleEmployeeInputChange(inputValue);
                                                }}
                                                onChange={(option: any) => {
                                                    setSelectedEmployee(option);
                                                    handleInputChange('employee_id', option?.value || '');
                                                }}
                                            />
                                            {validationErrors.employee_id && (
                                                <span className="text-sm text-red-500">{validationErrors.employee_id}</span>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <Label>Select Island</Label>
                                            <CustomAsyncSelect
                                                placeholder="Select Island..."
                                                value={selectedIsland}
                                                error={validationErrors.island_id}
                                                defaultOptions={islandOptions}
                                                loadOptions={handleIslandInputChange}
                                                onMenuScrollToBottom={handleIslandMenuScrollToBottom}
                                                isLoading={islandPagination.loading}
                                                noOptionsMessage={() => "No islands found"}
                                                loadingMessage={() => "Loading islands..."}
                                                isSearchable={true}
                                                inputValue={islandInputValue}
                                                onInputChange={(inputValue) => {
                                                    handleIslandInputChange(inputValue);
                                                }}
                                                onChange={async (option: any) => {
                                                    setSelectedIsland(option);
                                                    handleInputChange('island_id', option?.value || '');
                                                    
                                                    if (option?.value) {
                                                        // Fetch new accessories for the selected island
                                                        try {
                                                            const response = await QuotationService.getQuotationAccessories(option.value);
                                                            
                                                            if (response.data && response.data.status && response.data.data) {
                                                                const accessories = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
                                                                
                                                                // Check if accessories array has items
                                                                if (accessories.length > 0) {
                                                                    // Transform accessories to QuotationItemAccessory format
                                                                    const transformedAccessories = accessories.map(accessory => ({
                                                                        accessory_id: accessory.accessory_id,
                                                                        accessory_part_number: accessory.accessory_part_number,
                                                                        accessory_part_name: accessory.accessory_part_name,
                                                                        accessory_brand: accessory.accessory_brand || '',
                                                                        accessory_specification: accessory.accessory_specification || '',
                                                                        quantity: accessory.accessories_island_detail_quantity || 1,
                                                                        description: accessory.accessory_description || '',
                                                                        accessory_description: accessory.accessory_description || '',
                                                                        accessory_remark: accessory.accessory_remark || '',
                                                                        accessory_region: accessory.accessory_region || ''
                                                                    }));
                                                                    
                                                                    // Update accessories in all existing quotation items AND form level
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        manage_quotation_item_accessories: transformedAccessories,
                                                                        manage_quotation_items: prev.manage_quotation_items.map(item => ({
                                                                            ...item,
                                                                            manage_quotation_item_accessories: transformedAccessories
                                                                        }))
                                                                    }));
                                                                    
                                                                    toast.success(`${transformedAccessories.length} accessories loaded for selected island`);
                                                                } else {
                                                                    // Clear accessories if data array is empty
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        manage_quotation_item_accessories: [],
                                                                        manage_quotation_items: prev.manage_quotation_items.map(item => ({
                                                                            ...item,
                                                                            manage_quotation_item_accessories: []
                                                                        }))
                                                                    }));
                                                                    toast.success('No accessories found for selected island');
                                                                }
                                                            } else {
                                                                // Clear accessories if no data
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    manage_quotation_item_accessories: [],
                                                                    manage_quotation_items: prev.manage_quotation_items.map(item => ({
                                                                        ...item,
                                                                        manage_quotation_item_accessories: []
                                                                    }))
                                                                }));
                                                                toast.success('No accessories found for selected island');
                                                            }
                                                        } catch (error: any) {
                                                            console.error('Error fetching accessories by island:', error);
                                                            toast.error('Failed to load accessories for selected island');
                                                            // Clear accessories on error
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                manage_quotation_item_accessories: [],
                                                                manage_quotation_items: prev.manage_quotation_items.map(item => ({
                                                                    ...item,
                                                                    manage_quotation_item_accessories: []
                                                                }))
                                                            }));
                                                        }
                                                    } else {
                                                        // Clear accessories when no island selected
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            manage_quotation_item_accessories: [],
                                                            manage_quotation_items: prev.manage_quotation_items.map(item => ({
                                                                ...item,
                                                                manage_quotation_item_accessories: []
                                                            }))
                                                        }));
                                                    }
                                                }}
                                            />
                                            {validationErrors.island_id && (
                                                <span className="text-sm text-red-500">{validationErrors.island_id}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2 space-y-3">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-5">Beneficiary Details</h2>
                                {/* GET BANK */}
                                <div>
                                    <Label>Select Bank</Label>
                                    <CustomAsyncSelect
                                        placeholder="Select Bank..."
                                        value={selectedBank}
                                        error={validationErrors.bank_account_id}
                                        defaultOptions={bankOptions}
                                        loadOptions={handleBankInputChange}
                                        onMenuScrollToBottom={handleBankMenuScrollToBottom}
                                        isLoading={bankPagination.loading}
                                        noOptionsMessage={() => "No banks found"}
                                        loadingMessage={() => "Loading banks..."}
                                        isSearchable={true}
                                        inputValue={bankInputValue}
                                        onInputChange={(inputValue) => {
                                            handleBankInputChange(inputValue);
                                        }}
                                        onChange={(option: any) => {
                                            setSelectedBank(option);
                                            handleBankChange(option);
                                        }}
                                    />
                                    {validationErrors.bank_account_id && (
                                        <span className="text-sm text-red-500">{validationErrors.bank_account_id}</span>
                                    )}
                                </div>
                                
                                {/* Beneficiary Name */}
                                <div>
                                    <Label htmlFor="bank_account_name">Beneficiary Name</Label>
                                    <Input
                                        id="bank_account_name"
                                        type="text"
                                        value={formData.bank_account_name || ''}
                                        readonly={true}
                                        placeholder="Auto filled when bank selected"
                                        className="bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                                {/* Beneficiary Bank */}
                                <div>
                                    <Label htmlFor="bank_account_type">Beneficiary Bank</Label>
                                    <Input
                                        id="bank_account_type"
                                        type="text"
                                        value={formData.bank_account_type || ''}
                                        readonly={true}
                                        placeholder="Auto filled when bank selected"
                                        className="bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                                {/* Beneficiary Account */}
                                <div>
                                    <Label htmlFor="bank_account_number">Beneficiary Account</Label>
                                    <Input
                                        id="bank_account_number"
                                        type="text"
                                        value={formData.bank_account_number || ''}
                                        readonly={true}
                                        placeholder="Auto filled when bank selected"
                                        className="bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='md:grid-cols-5 grid gap-6'>

                            {/* Products Section */}
                            <div className="bg-white rounded-2xl shadow-sm p-6 md:col-span-5 col-span-1">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 pb-6 relative">
                                    Products
                                    
                                    {!formData.island_id && (
                                        <span className="text-sm text-orange-500 font-primary italic mt-1 block absolute bottom-0">Please select an island first to add products</span>
                                    )}
                                </h2>
                                
                                {/* Add Product */}
                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1">
                                        <CustomAsyncSelect
                                            name="product_select"
                                            placeholder="Select product to add..."
                                            value={selectedProduct}
                                            error={productSelectError}
                                            defaultOptions={productOptions}
                                            loadOptions={handleProductInputChange}
                                            onMenuScrollToBottom={handleProductMenuScrollToBottom}
                                            isLoading={productPagination.loading}
                                            noOptionsMessage={() => "No products found"}
                                            loadingMessage={() => "Loading products..."}
                                            isSearchable={true}
                                            inputValue={productInputValue}
                                            onInputChange={(inputValue) => {
                                                handleProductInputChange(inputValue);
                                            }}
                                            onChange={(option: any) => {
                                                if (option) {
                                                    const completeOption = productOptions.find(p => p.value === option.value);
                                                    setSelectedProduct(completeOption || option);
                                                } else {
                                                    setSelectedProduct(null);
                                                }
                                                // Clear error when user selects a product
                                                if (option && productSelectError) {
                                                    setProductSelectError('');
                                                }
                                            }}
                                        />
                                        {productSelectError && (
                                            <span className="text-sm text-red-500 mt-1 block">{productSelectError}</span>
                                        )}
                                    </div>
                                    <Button 
                                        type="button" 
                                        onClick={addProductItem} 
                                        className="flex items-center gap-2"
                                        disabled={!selectedProduct || !formData.island_id}
                                    >
                                        <MdAdd size={16} />
                                        Add Product
                                    </Button>
                                </div>

                                {/* Products Table */}
                                {formData.manage_quotation_items.length > 0 && (
                                    <div className="mt-6">
                                        <CustomDataTable
                                            columns={productColumns}
                                            data={formData.manage_quotation_items}
                                            pagination={false}
                                            fixedHeader={false}
                                            responsive
                                            striped={false}
                                            highlightOnHover
                                            noDataComponent={
                                                <div className="text-center py-8 text-gray-500">
                                                    No products added yet
                                                </div>
                                            }
                                        />
                                    </div>
                                )}

                                {validationErrors.manage_quotation_items && (
                                    <span className="text-sm text-red-500">{validationErrors.manage_quotation_items}</span>
                                )}
                            </div>
                        </div>

                        <div className='md:grid-cols-5 grid gap-6'>
                            
                            <div className="bg-white rounded-2xl shadow-sm p-6 md:col-span-3 space-y-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">Terms & Conditions</h2>
                                
                                {/* Term Condition */}
                                <div className="md:col-span-2">
                                    <Label>Term Condition</Label>
                                    <CustomAsyncSelect
                                        name="term_condition"
                                        placeholder="Select term condition..."
                                        value={selectedTermCondition}
                                        defaultOptions={termConditionOptions}
                                        loadOptions={handleTermConditionInputChange}
                                        onMenuScrollToBottom={handleTermConditionMenuScrollToBottom}
                                        isLoading={termConditionPagination.loading}
                                        noOptionsMessage={() => "No term conditions found"}
                                        loadingMessage={() => "Loading term conditions..."}
                                        isSearchable={true}
                                        inputValue={termConditionInputValue}
                                        onInputChange={(inputValue) => {
                                            handleTermConditionInputChange(inputValue);
                                        }}
                                        onChange={(option: any) => {
                                            if (option) {
                                                const completeOption = termConditionOptions.find(t => t.value === option.value);
                                                setSelectedTermCondition(completeOption || option);
                                                
                                                if (completeOption) {
                                                    handleInputChange('term_content_id', completeOption.value);
                                                    fetchTermConditionContent(completeOption.value);
                                                }
                                            } else {
                                                setSelectedTermCondition(null);
                                                handleInputChange('term_content_id', '');
                                                setTermConditionContent('');
                                                handleInputChange('term_content_directory', '');
                                            }
                                        }}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <WysiwygEditor
                                        id="wysiwyg-editor"
                                        label={termConditionLoading ? 'Term Content (Loading...)' : 'Term Content'}
                                        value={termConditionContent}
                                        onChange={(content) => {
                                            setTermConditionContent(content);
                                            handleInputChange('term_content_directory', content);
                                        }}
                                        placeholder="Select a term condition or start typing..."
                                        minHeight="200px"
                                        disabled={termConditionLoading}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        Selected: {selectedTermCondition?.label || ''}
                                    </div>
                                </div>
                            </div>

                            {/* Totals Summary */}
                            <div className="bg-white rounded-2xl md:col-span-2 shadow-sm p-6 md:col-span-2">
                                <div className="space-y-3">
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                                        <Label htmlFor="manage_quotation_items" className='text-end'>Subtotal</Label>
                                        <Input
                                            id="manage_quotation_items"
                                            type="text"
                                            onKeyPress={handleKeyPress}
                                            value={(
                                                formData.manage_quotation_items.reduce((sum: number, item) => sum + (parseFloat(item.total) || 0), 0)
                                            ).toLocaleString('id-ID')}
                                            readonly={true}
                                            className="bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <Label>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-end'>
                                                PPN
                                                <div className="relative md:col-span-1">
                                                    <Input
                                                        id="manage_quotation_ppn"
                                                        type="text"
                                                        onKeyPress={handleKeyPress}
                                                        min="0"
                                                        max="100"
                                                        maxLength={3}
                                                        value={formData.manage_quotation_ppn}
                                                        onChange={(e) => handlePercentageInputChange('manage_quotation_ppn', e.target.value)}
                                                        placeholder="11"
                                                        className="pr-8"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <span className="text-gray-500 text-sm">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Label>
                                        <Input
                                            type="text"
                                            onKeyPress={handleKeyPress}
                                            value={(() => {
                                                const itemsTotal = formData.manage_quotation_items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
                                                const ppnPercentage = parseFloat(formData.manage_quotation_ppn || '11') || 11;
                                                const ppnAmount = itemsTotal * (ppnPercentage / 100);
                                                return ppnAmount.toLocaleString('id-ID');
                                            })()}
                                            readonly={true}
                                            className="bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Delivery Fee */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                                        <Label htmlFor="manage_quotation_delivery_fee" className='text-end mb-0'>Delivery Fee</Label>
                                        <Input
                                            id="manage_quotation_delivery_fee"
                                            type="text"
                                            onKeyPress={handleKeyPress}
                                            value={formatNumberInput(formData.manage_quotation_delivery_fee)}
                                            maxLength={15}
                                            onChange={(e) => handleNumericInputChange('manage_quotation_delivery_fee', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    {/* Other Fee */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                                        <Label htmlFor="manage_quotation_other" className='text-end mb-0'>Other Fee</Label>
                                        <Input
                                            id="manage_quotation_other"
                                            type="text"
                                            onKeyPress={handleKeyPress}
                                            value={formatNumberInput(formData.manage_quotation_other)}
                                            maxLength={15}
                                            onChange={(e) => handleNumericInputChange('manage_quotation_other', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* Mutation Type & Nominal */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-gray-300 pt-4 mt-4'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                                            <Label htmlFor="manage_quotation_mutation_type" className='text-end mb-0'>Adjustment Type</Label>
                                            <select
                                                id="manage_quotation_mutation_type"
                                                value={formData.manage_quotation_mutation_type || ''}
                                                onChange={(e) => handleInputChange('manage_quotation_mutation_type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">No Adjustment</option>
                                                <option value="plus">Plus (+)</option>
                                                <option value="minus">Minus (-)</option>
                                            </select>
                                        </div>
                                        <Input
                                            id="manage_quotation_mutation_nominal"
                                            value={formatNumberInputwithComma(formData.manage_quotation_mutation_nominal)}
                                            disabled={!formData.manage_quotation_mutation_type}
                                            onChange={(e) => {
                                                const rawValue = e.target.value;
                                                
                                                handleDecimalInputComma(
                                                    rawValue,
                                                    (validValue) => handleNumericCleanInput('manage_quotation_mutation_nominal', validValue),
                                                    () => handleNumericCleanInput('manage_quotation_mutation_nominal', ''),
                                                    true,
                                                    20,
                                                    5
                                                );
                                            }}
                                        />
                                    </div>

                                    {formData.manage_quotation_mutation_type && (
                                        <>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                                                <Label className='text-end mb-0 text-gray-600'>Grand Total (Before Adjustment)</Label>
                                                <Input
                                                    type="text"
                                                    value={(parseFloat(formData.manage_quotation_grand_total_before || '0')).toLocaleString('id-ID')}
                                                    readonly={true}
                                                    className="bg-gray-50 cursor-not-allowed text-gray-600"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-300 pt-4 mt-4 items-center'>
                                        <Label className='font-bold text-lg mb-0 text-end'>Grand Total</Label>
                                        <Input
                                            type="text"
                                            onKeyPress={handleKeyPress}
                                            value={(parseFloat(calculateGrandTotal(formData).grandTotal)).toLocaleString('id-ID')}
                                            readonly={true}
                                            className="font-bold text-lg cursor-not-allowed"
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <Label htmlFor="manage_quotation_payment_presentase" className='text-end mb-0'>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-end'>
                                                Down Payment
                                                <div className="relative md:col-span-1">
                                                    <Input
                                                        id="manage_quotation_payment_presentase"
                                                        type="text"
                                                        onKeyPress={handleKeyPress}
                                                        min="0"
                                                        max="100"
                                                        maxLength={3}
                                                        value={formData.manage_quotation_payment_presentase}
                                                        onChange={(e) => handlePercentageInputChange('manage_quotation_payment_presentase', e.target.value)}
                                                        placeholder="50"
                                                        className="pr-8"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <span className="text-gray-500 text-sm">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Label>
                                        <Input
                                            type="text"
                                            onKeyPress={handleKeyPress}
                                            value={(parseFloat(formData.manage_quotation_payment_nominal || '0')).toLocaleString('id-ID')}
                                            readonly={true}
                                            className="border-[#34c759] cursor-not-allowed"
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                                        <Label className='text-end mb-0'>
                                            Remaining Payment
                                        </Label>
                                        <Input
                                            type="text"
                                            onKeyPress={handleKeyPress}
                                            value={(parseFloat(calculateGrandTotal(formData).remainingPayment)).toLocaleString('id-ID')}
                                            readonly={true}
                                            className="text-lg cursor-not-allowed border-red-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='md:grid-cols-5 grid gap-6'>
                            <div className="bg-white rounded-2xl shadow-sm p-6 md:col-span-3 space-y-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">Shipping T&C</h2>
                                <div className='md:grid-cols-3 grid gap-6'>
                                    {/* Shipping Term */}
                                    <div>
                                        <Label htmlFor="manage_quotation_shipping_term">Shipping Term</Label>
                                        <Input
                                            id="manage_quotation_shipping_term"
                                            type="text"
                                            value={formData?.manage_quotation_shipping_term}
                                            onChange={(e) => handleInputChange('manage_quotation_shipping_term', e.target.value)}
                                            placeholder="Enter shipping term..."
                                        />
                                    </div>

                                    {/* Franco */}
                                    <div>
                                        <Label htmlFor="manage_quotation_franco">Franco</Label>
                                        <Input
                                            id="manage_quotation_franco"
                                            type="text"
                                            value={formData.manage_quotation_franco}
                                            onChange={(e) => handleInputChange('manage_quotation_franco', e.target.value)}
                                            placeholder="Enter franco..."
                                        />
                                    </div>

                                    {/* Lead Time */}
                                    <div>
                                        <Label htmlFor="manage_quotation_lead_time">Lead Time</Label>
                                        <Input
                                            id="manage_quotation_lead_time"
                                            type="text"
                                            value={formData.manage_quotation_lead_time}
                                            onChange={(e) => handleInputChange('manage_quotation_lead_time', e.target.value)}
                                            placeholder="Enter lead time..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl md:col-span-2 shadow-sm p-6 md:col-span-2">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-5">Additional Pages</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={formData.include_aftersales_page ?? true}
                                            onChange={(checked) => handleInputChange('include_aftersales_page', checked)}
                                            label="Include Aftersales Page"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={formData.include_msf_page ?? false}
                                            onChange={(checked) => handleInputChange('include_msf_page', checked)}
                                            label="Include MSF Page"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 bg-white rounded-2xl shadow-sm">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/quotations/manage')}
                                className="px-6 rounded-full"
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            {/* <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                                    handleSubmit(fakeEvent, 'draft');
                                }}
                                disabled={isCreating}
                                className="flex items-center gap-2"
                            >
                                <MdSave size={16} />
                                Save as Draft
                            </Button> */}
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="px-6 flex items-center gap-2 rounded-full"
                            >
                                <MdSave size={16} />
                                {isCreating ? 'Submitting...' : 'Submit Quotation'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Product Detail Offcanvas */}
            <ProductDetailDrawer
                productId={selectedProductId}
                isOpen={showProductDetail}
                onClose={handleCloseProductDetail}
                onChange={handleProductDataChange}
                initialData={selectedProductId ? unsavedProductChanges[selectedProductId] : null}
                readOnly={false}
            />
        </>
    );
}
