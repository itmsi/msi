import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { MdKeyboardArrowLeft, MdSave, MdArrowForward, MdArrowBack, MdEdit, MdAdd } from 'react-icons/md';

import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { useROECalculatorForm } from './hooks/useROECalculatorForm';

// Step Components
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2UnitPurchase from './components/Step2UnitPurchase';
import Step3Operational from './components/Step3Operational';
import Step4MonthlyCosts from './components/Step4MonthlyCosts';
import Step5FinancialData from './components/Step5FinancialData';
import { PermissionGate } from '@/components/common/PermissionComponents';

const STEPS = [
    { number: 1, title: 'Informasi Dasar', component: Step1BasicInfo },
    { number: 2, title: 'Data Pembelian Unit', component: Step2UnitPurchase },
    { number: 3, title: 'Operasional', component: Step3Operational },
    { number: 4, title: 'Biaya Bulanan', component: Step4MonthlyCosts },
    // { number: 5, title: 'Data Financial', component: Step5FinancialData }
];

export default function CreateROECalculator() {
    const navigate = useNavigate();
    const { calculatorId } = useParams<{ calculatorId: string }>();
    const [searchParams] = useSearchParams();
    const isEditMode = Boolean(calculatorId);

    const {
        formData,
        validationErrors,
        loading,
        currentStep,
        calculationResults,
        quoteDefaults,
        handleInputChange,
        saveStep,
        calculateStep2,
        calculateFinancials,
        goToStep,
        loadCalculatorData,
        loadQuoteDefaults,
    } = useROECalculatorForm(calculatorId);

    useEffect(() => {
        const initializeData = async () => {
            try {
                if (isEditMode) {
                    await loadCalculatorData();
                }
                await loadQuoteDefaults();
                
                const stepParam = searchParams.get('step');
                if (stepParam) {
                    const stepNumber = parseInt(stepParam);
                    if (stepNumber >= 1 && stepNumber <= 4) {
                        goToStep(stepNumber);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize data:', error);
            }
        };
        
        initializeData();
    }, [isEditMode, calculatorId]); // Removed dependencies that cause re-runs

    const handleSaveAndNext = async () => {

        const success = await saveStep(currentStep, true);
        if (success && currentStep === 1) {
            await calculateFinancials();
        } else if (success && currentStep === 2) {
          await calculateStep2();
        }
    };

    const handleSaveOnly = async () => {
        await saveStep(currentStep, false);
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        const commonProps = {
            formData,
            validationErrors,
            handleInputChange
        };

        switch (currentStep) {
        case 1:
            return <Step1BasicInfo {...commonProps} loading={loading} />;
            
        case 2:
            return (
                <Step2UnitPurchase
                    {...commonProps}
                    calculationResults={calculationResults}
                    calculateStep2={calculateStep2}
                    loading={loading}
                    calculatorId={calculatorId}
                />
            );
            
        case 3:
            return (
                <Step3Operational
                    {...commonProps}
                    loading={loading}
                    quoteDefaults={quoteDefaults}
                    onLoadDefaults={loadQuoteDefaults}
                    calculatorId={calculatorId}
                />
            );
            
        case 4:
            return <Step4MonthlyCosts 
                        {...commonProps} 
                        loading={loading} 
                        calculatorId={calculatorId}
                    />;
            
        case 5:
            return (
                <Step5FinancialData
                    formData={formData}
                    calculationResults={calculationResults}
                    calculatorId={calculatorId}
                />
            );
            
        default:
            return null;
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {STEPS.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div 
                        className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 
                        ${currentStep === step.number 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : step.number === formData.step
                            ? 'bg-orange-500 border-orange-500 text-white cursor-pointer hover:bg-orange-600 hover:border-orange-600 transition-colors'
                            : currentStep > step.number
                            ? 'bg-green-600 border-green-600 text-white cursor-pointer hover:bg-green-700 hover:border-green-700 transition-colors'
                            : 'bg-white border-gray-300 text-gray-500'
                        }
                        `}
                        onClick={() => {
                            if (step.number <= formData.step) {
                                goToStep(step.number);
                            }
                        }}
                    >
                        {step.number}
                    </div>
                    <div 
                        className={`ml-2 mr-4 ${step.number <= formData.step ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                            if (step.number <= formData.step) {
                                goToStep(step.number);
                            }
                        }}
                    >
                        <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'} ${currentStep > step.number ? 'hover:text-green-700 transition-colors' : ''}`}>
                            Step {step.number}
                        </div>
                        <div className={`text-xs ${currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'} ${currentStep > step.number ? 'hover:text-green-600 transition-colors' : ''}`}>
                            {step.title}
                        </div>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div className={`w-12 h-0.5 ${
                            step.number < formData.step 
                                ? 'bg-green-600' 
                                : step.number === formData.step 
                                ? 'bg-orange-500' 
                                : 'bg-gray-300'
                        } mr-4`} />
                    )}
                </div>
            ))}
        </div>
    );

    // if (loading && isEditMode) {
    //     return (
    //         <div className="flex items-center justify-center min-h-[400px]">
    //             <div className="text-center">
    //                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    //                 <p className="text-gray-600">Loading calculator data...</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <>
            <PageMeta
                title={`${isEditMode ? 'Edit' : 'Create'} ROE Calculator - MSI Dashboard`}
                description={`${isEditMode ? 'Edit' : 'Create'} ROE ROA Calculator`}
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/roe-roa-calculator/manage')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            {isEditMode ? <MdEdit size={20} className="text-primary" /> : <MdAdd size={20} className="text-green-600" />}
                            <div className='ms-2'>
                                <h1 className="font-primary-bold font-normal text-xl">{isEditMode ? 'Edit' : 'Create'} ROE Calculator</h1>
                                <p className="text-gray-600 text-sm">
                                    Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    {renderStepIndicator()}

                    {/* Step Content */}
                    
                    <div className="bg-white rounded-2xl shadow-sm grid lg:grid-cols-3 gap-2 md:gap-2">
                        <div className="md:col-span-3 p-8 relative">
                            {renderStepContent()}
                        </div>

                        {/* Step Navigation */}
                        <div className="flex justify-between gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <div className="flex items-center gap-3">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={loading}
                                        className="px-6 rounded-full"
                                    >
                                        <MdArrowBack size={16} />
                                        Previous
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <PermissionGate permission={["create", "update"]}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSaveOnly}
                                        disabled={loading}
                                        className="px-6 rounded-full"
                                    >
                                        <MdSave size={16} />
                                        Save
                                    </Button>
                                </PermissionGate>

                                {currentStep < 5 ? (
                                    <PermissionGate permission={["create", "update"]}>
                                        <Button
                                            type="button"
                                            onClick={handleSaveAndNext}
                                            disabled={loading}
                                            className="px-6 rounded-full"
                                        >
                                            {loading ? 'Saving...' : 'Save & Next'}
                                            <MdArrowForward size={16} />
                                        </Button>
                                    </PermissionGate>
                                ) : (
                                    <PermissionGate permission={["create", "update"]}>
                                        <Button
                                            type="button"
                                            onClick={handleSaveOnly}
                                            disabled={loading}
                                        className="px-6 rounded-full"
                                        >
                                            <MdSave size={16} />
                                            {loading ? 'Saving...' : 'Complete'}
                                        </Button>
                                    </PermissionGate>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}