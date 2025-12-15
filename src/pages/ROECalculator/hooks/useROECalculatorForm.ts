import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { ROECalculatorFormData, ROECalculatorValidationErrors, CalculationResponse, QuoteDefaults } from '../types/roeCalculator';
import { ROECalculatorService } from '../services/roeCalculatorService';

export const useROECalculatorForm = (calculatorId?: string) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [calculationResults, setCalculationResults] = useState<CalculationResponse | null>(null);
    const [quoteDefaults, setQuoteDefaults] = useState<QuoteDefaults | null>(null);

    const [formData, setFormData] = useState<ROECalculatorFormData>({
        // Step 1
        customer_id: '',
        komoditas: '',
        tonase_per_ritase: '',
        jarak_haul: '',
        harga_jual_per_ton: '',
        status: '',
        
        // Step 2
        harga_per_unit: '',
        jumlah_unit: '',
        down_payment_pct: 30,
        tenor_pembiayaan: 12,
        interest_rate: '',
        periode_depresiasi: 60,
        
        // Step 3
        ritase_per_shift: '',
        shift_per_hari: '',
        hari_kerja_per_bulan: 0,
        utilization_percent: 0,
        downtime_percent: 0,
        fuel_consumption_type: '',
        fuel_consumption: 0,
        fuel_price: 0,

        // Step 4
        tyre_expense_monthly: '',
        sparepart_expense_monthly: '',
        salary_operator_monthly: '',
        depreciation_monthly: '',
        interest_monthly: '',
        overhead_monthly: '',
        expense_notes: '',
        
        // Step 5
        equity_modal: '',
        liability_hutang: '',

        step: 1
    });

    const [validationErrors, setValidationErrors] = useState<ROECalculatorValidationErrors>({});

    const loadCalculatorData = useCallback(async () => {
        if (!calculatorId) return;
        
        setLoading(true);
        try {
            const response = await ROECalculatorService.getCalculatorById(calculatorId);
            if (response.success && response.data) {
                setFormData(response.data);
                setCurrentStep(response.data.current_step || 1);
            } else {
                toast.error(response.message || 'Failed to load calculator');
                navigate('/roe-roa-calculator/manage');
            }
        } catch (error) {
            toast.error('Failed to load calculator data');
            navigate('/roe-roa-calculator/manage');
        } finally {
            setLoading(false);
        }
    }, [calculatorId, navigate]);

    const loadQuoteDefaults = useCallback(async () => {
        try {
            const response = await ROECalculatorService.getQuoteDefaults();
            if (response.success && response.data) {
                setQuoteDefaults(response.data);
            }
        } catch (error) {
            console.error('Failed to load quote defaults:', error);
        }
    }, []);

    const handleInputChange = useCallback((field: keyof ROECalculatorFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (validationErrors[field as keyof ROECalculatorValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    }, [validationErrors]);

    const getEffectiveValue = useCallback((directField: any, operationDataField: any) => {
        return directField || operationDataField || '';
    }, []);

    const validateStep = useCallback((step: number): boolean => {
        const errors: ROECalculatorValidationErrors = {};
        
        switch (step) {
            case 1:
                if (!formData.customer_id) errors.customer_id = 'Customer is required';
                if (!formData.komoditas) errors.komoditas = 'Komoditas is required';
                if (!formData.status) errors.status = 'Status is required';
                if (!formData.tonase_per_ritase) errors.tonase_per_ritase = 'Tonase per ritase is required';
                if (!formData.jarak_haul) errors.jarak_haul = 'Jarak haul is required';
                if (!formData.harga_jual_per_ton) errors.harga_jual_per_ton = 'Harga jual per ton is required';
                break;
                
            case 2:
                if (!formData.harga_per_unit) errors.harga_per_unit = 'Harga per unit is required';
                if (!formData.jumlah_unit) errors.jumlah_unit = 'Jumlah unit is required';
                if (!formData.interest_rate) errors.interest_rate = 'Interest rate is required';
                break;
                
            case 3:
                const effectiveRitase = getEffectiveValue(formData.ritase_per_shift, formData?.operation_data?.ritase_per_shift);
                const effectiveShift = getEffectiveValue(formData.shift_per_hari, formData?.operation_data?.shift_per_hari);
                const effectiveHari = getEffectiveValue(formData.hari_kerja_per_bulan, formData?.operation_data?.hari_kerja_per_bulan);
                
                if (!effectiveRitase) errors.ritase_per_shift = 'Ritase per shift is required';
                if (!effectiveShift) errors.shift_per_hari = 'Shift per hari is required';
                if (!effectiveHari) errors.hari_kerja_per_bulan = 'Hari kerja per bulan is required';
                break;
                
            case 4:
                break;
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData, getEffectiveValue]);

    const saveStep = useCallback(async (step: number, goNext: boolean = false): Promise<boolean> => {
        if (!validateStep(step)) {
            toast.error('Please fix validation errors');
            return false;
        }

        let dataToSave = { ...formData };
        if (step === 3) {
            if (!dataToSave.ritase_per_shift && dataToSave.operation_data?.ritase_per_shift) {
                dataToSave.ritase_per_shift = dataToSave.operation_data.ritase_per_shift;
            }
            if (!dataToSave.shift_per_hari && dataToSave.operation_data?.shift_per_hari) {
                dataToSave.shift_per_hari = dataToSave.operation_data.shift_per_hari;
            }
            if (!dataToSave.hari_kerja_per_bulan && dataToSave.operation_data?.hari_kerja_per_bulan) {
                dataToSave.hari_kerja_per_bulan = parseInt(dataToSave.operation_data.hari_kerja_per_bulan) || 0;
            }
        }
        
        if (step === 4) {
            if ((!dataToSave.tyre_expense_monthly || dataToSave.tyre_expense_monthly === "") && dataToSave.cost_data?.tyre_expense_monthly) {
                dataToSave.tyre_expense_monthly = dataToSave.cost_data.tyre_expense_monthly;
            }
            if ((!dataToSave.sparepart_expense_monthly || dataToSave.sparepart_expense_monthly === "") && dataToSave.cost_data?.sparepart_expense_monthly) {
                dataToSave.sparepart_expense_monthly = dataToSave.cost_data.sparepart_expense_monthly;
            }
            if ((!dataToSave.salary_operator_monthly || dataToSave.salary_operator_monthly === "") && dataToSave.cost_data?.salary_operator_monthly) {
                dataToSave.salary_operator_monthly = dataToSave.cost_data.salary_operator_monthly;
            }
            if ((!dataToSave.depreciation_monthly || dataToSave.depreciation_monthly === "") && dataToSave.cost_data?.depreciation_monthly) {
                dataToSave.depreciation_monthly = dataToSave.cost_data.depreciation_monthly;
            }
            if ((!dataToSave.interest_monthly || dataToSave.interest_monthly === "") && dataToSave.cost_data?.interest_monthly) {
                dataToSave.interest_monthly = dataToSave.cost_data.interest_monthly;
            }
            if ((!dataToSave.overhead_monthly || dataToSave.overhead_monthly === "") && dataToSave.cost_data?.overhead_monthly) {
                dataToSave.overhead_monthly = dataToSave.cost_data.overhead_monthly;
            }
        }

        setLoading(true);
        try {
            let response;
        
            if (!calculatorId) {
                response = await ROECalculatorService.createCalculator(dataToSave);
                
                if (response.success && response.data) {
                const newId = response.data.roe_calculator_id;
                const nextStep = goNext && step < 4 ? step + 1 : step;
                navigate(`/roe-roa-calculator/manage/edit/${newId}?step=${nextStep}`, { replace: true });
                toast.success('Calculator created successfully');
                    return true;
                }
            } else {
                response = await ROECalculatorService.updateCalculatorStep(calculatorId, step, dataToSave);
                
                if (response.success) {
                    if ((step === 3 || step === 4) && dataToSave !== formData) {
                        setFormData(dataToSave);
                    }
                    
                    toast.success('Step saved successfully');
                    
                    if (goNext && step < 4) {
                        const nextStep = step + 1;
                        setCurrentStep(nextStep);
                        
                        const idToUse = step === 2 && response.data?.data?.quote_id ? response.data.data.quote_id : calculatorId;
                        navigate(`/roe-roa-calculator/manage/edit/${idToUse}?step=${nextStep}`, { replace: true });
                    }
                    if (step === 4) {
                    navigate(`/roe-roa-calculator/manage`);
                    }
                    return true;
                }
            }

            toast.error(response.message || 'Failed to save step');
            return false;
        } catch (error) {
            toast.error('Failed to save step');
            return false;
        } finally {
            setLoading(false);
        }
    }, [calculatorId, formData, validateStep, navigate]);

    const calculateStep2 = useCallback(async (): Promise<boolean> => {
        if (!calculatorId) {
            toast.error('Please save the calculator first');
            return false;
        }

        try {
            const response = await ROECalculatorService.calculateStep2(calculatorId, formData);
            
            if (response.success && response.data) {
                setCalculationResults(response.data);
                toast.success('Unit purchase calculated successfully');
                return true;
            } else {
                toast.error(response.message || 'Failed to calculate unit purchase');
                return false;
            }
        } catch (error) {
            toast.error('Failed to calculate unit purchase');
            return false;
        } finally {
        }
    }, [calculatorId, formData]);

    const calculateFinancials = useCallback(async (): Promise<void> => {
        setLoading(true);
        if (!calculatorId || calculatorId === 'undefined') {
            return;
        }
        try {
            const response = await ROECalculatorService.calculateFinancials(calculatorId as string, formData);
            
            if (response.success && response.data) {
                setCalculationResults(response.data);
            } else {
                toast.error(response.message || 'Failed to calculate financials');
            }
        } catch (error) {
            toast.error('Failed to calculate financials');
        } finally {
            setLoading(false);
        }
    }, [calculatorId, formData]);

    const goToStep = useCallback((step: number) => {
        console.log({
            step
        });
        
        if (step >= 1 && step <= 4) {
            setCurrentStep(step);
            
            if (calculatorId) {
                navigate(`/roe-roa-calculator/manage/edit/${calculatorId}?step=${step}`, { replace: true });
            } else {
                navigate(`/roe-roa-calculator/manage/create?step=${step}`, { replace: true });
            }
        }
    }, [calculatorId, navigate]);

    return {
        // State
        formData,
        validationErrors,
        loading,
        currentStep,
        calculationResults,
        quoteDefaults,
        
        // Actions
        handleInputChange,
        saveStep,
        calculateStep2,
        calculateFinancials,
        goToStep,
        loadCalculatorData,
        loadQuoteDefaults,
        
        // Computed
        totalAsset: calculationResults ? 
        parseFloat(formData.harga_per_unit || '0') * parseFloat(formData.jumlah_unit || '0') : 0,
        
        debtToEquityRatio: calculationResults?.debt_to_equity_ratio || 0,
        tenorInYears: Math.round((parseFloat(String(formData.tenor_pembiayaan || '0')) / 12) * 10) / 10
    };
};