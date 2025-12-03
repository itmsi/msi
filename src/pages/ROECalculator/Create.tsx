import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { MdKeyboardArrowLeft, MdSave, MdArrowForward, MdArrowBack } from 'react-icons/md';

import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { useROECalculatorForm } from './hooks/useROECalculatorForm';

// Step Components
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2UnitPurchase from './components/Step2UnitPurchase';
import Step3Operational from './components/Step3Operational';
import Step4MonthlyCosts from './components/Step4MonthlyCosts';
import Step5FinancialData from './components/Step5FinancialData';

const STEPS = [
    { number: 1, title: 'Basic Information', component: Step1BasicInfo },
    { number: 2, title: 'Data Pembelian Unit', component: Step2UnitPurchase },
    { number: 3, title: 'Operasional', component: Step3Operational },
    { number: 4, title: 'Biaya Bulanan', component: Step4MonthlyCosts },
    { number: 5, title: 'Data Financial', component: Step5FinancialData }
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
        totalAsset
    } = useROECalculatorForm(calculatorId);

    // Load data on mount
    useEffect(() => {
        const initializeData = async () => {
            if (isEditMode) {
                await loadCalculatorData();
            }
            await loadQuoteDefaults();
            
            // After loading data, check for step parameter in URL and override if present
            const stepParam = searchParams.get('step');
            if (stepParam) {
                const stepNumber = parseInt(stepParam);
                if (stepNumber >= 1 && stepNumber <= 5) {
                    goToStep(stepNumber);
                }
            }
        };
        
        initializeData();
    }, [isEditMode, loadCalculatorData, loadQuoteDefaults, searchParams, goToStep]);

    const handleSaveAndNext = async () => {
        const success = await saveStep(currentStep, true);
        if (success && currentStep === 1) {
            // Auto calculate after saving step 2
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
            return <Step1BasicInfo {...commonProps} />;
            
        case 2:
            return (
                <Step2UnitPurchase
                    {...commonProps}
                    calculationResults={calculationResults}
                    totalAsset={totalAsset}
                    calculateStep2={calculateStep2}
                />
            );
            
        case 3:
            return (
                <Step3Operational
                    {...commonProps}
                    quoteDefaults={quoteDefaults}
                    onLoadDefaults={loadQuoteDefaults}
                />
            );
            
        case 4:
            return <Step4MonthlyCosts {...commonProps} />;
            
        case 5:
            return (
                <Step5FinancialData
                    formData={formData}
                    calculationResults={calculationResults}
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
                            : currentStep > step.number
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white border-gray-300 text-gray-500'
                        }
                        `}
                    >
                        {step.number}
                    </div>
                    <div className="ml-2 mr-4">
                        <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                            Step {step.number}
                        </div>
                        <div className={`text-xs ${currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.title}
                        </div>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div className={`w-12 h-0.5 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'} mr-4`} />
                    )}
                </div>
            ))}
        </div>
    );

    if (loading && isEditMode) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading calculator data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`${isEditMode ? 'Edit' : 'Create'} ROE Calculator - MSI Dashboard`}
                description={`${isEditMode ? 'Edit' : 'Create'} ROE ROA Calculator`}
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/roe-roa-calculator/manage')}
                                className="flex items-center gap-2 p-2 rounded-full"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Edit' : 'Create'} ROE Calculator
                                </h1>
                                <p className="text-gray-600">
                                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    {renderStepIndicator()}

                    {/* Step Content */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6">
                            {renderStepContent()}
                        </div>

                        {/* Step Navigation */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                            <div className="flex items-center gap-3">
                                {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    <MdArrowBack size={16} />
                                    Previous
                                </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSaveOnly}
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    <MdSave size={16} />
                                    Save
                                </Button>

                                {currentStep < 5 ? (
                                    <Button
                                        type="button"
                                        onClick={handleSaveAndNext}
                                        disabled={loading}
                                        className="flex items-center gap-2"
                                    >
                                        {loading ? 'Saving...' : 'Save & Next'}
                                        <MdArrowForward size={16} />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSaveOnly}
                                        disabled={loading}
                                        className="flex items-center gap-2"
                                    >
                                        <MdSave size={16} />
                                        {loading ? 'Saving...' : 'Complete'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}