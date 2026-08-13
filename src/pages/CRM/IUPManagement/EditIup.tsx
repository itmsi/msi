import React, { useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import LoadingSpinner from '@/components/common/Loading';
import { useIupManagementEdit } from './hooks/useIupManagementEdit';
import TerritorySelector from './components/TerritorySelector';
import FormActions from '@/components/form/FormActions';
import IupInformtionsFormFields from './components/IupInformtionsFormFields';
import PageHeader from '@/components/common/PageHeader';
import useGoBack from '@/hooks/useGoBack';
import { FaIndustry, FaMapMarkedAlt, FaHistory } from 'react-icons/fa';
import TabZoneArea from './components/TabZoneArea';
import { GiMineTruck } from 'react-icons/gi';
import TabContractorUnit from './components/TabContractorUnit';
import TabHistoryVisit from './components/TabHistoryVisit';
import TabSurvey from './components/TabSurvey';
import { AiOutlineDashboard, AiOutlineHistory } from 'react-icons/ai';
import IupDashboard from './Dashboard';
import { useLocation } from 'react-router-dom';


const EditIupManagement: React.FC = () => {
    const goBack = useGoBack();
    const location = useLocation();
    const listRoute = `/crm/iup-management${location.search}`;

    const {
        isLoading,
        isSubmitting,
        formData,
        errors,
        customers,
        // Territory states
        territories,
        territoriesLoading,
        selectedIsland,
        selectedGroup,
        selectedArea,
        selectedIupZone,
        selectedIupSegmentation,
        // Territory handlers
        handleIslandChange,
        handleGroupChange,
        handleAreaChange,
        handleIupZoneChange,
        handleIupSegmentationChange,
        getAvailableGroups,
        getAvailableAreas,
        getAvailableIupZones,
        getAvailableIupSegmentations,
        // Form handlers
        handleInputChange,
        handleSelectChange,
        handleSalesPicChange,
        handleSubmit
    } = useIupManagementEdit();

    const [activeTab, setActiveTab] = useState<'info_iup' | 'contractor_unit' | 'zone_iup' | 'history_visit' | 'survey' | 'dashboard'>('dashboard');

    // Show loading spinner while data is loading
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    // Territory selection state for passing to components
    const territorySelection = {
        island: selectedIsland,
        group: selectedGroup,
        area: selectedArea,
        iupZone: selectedIupZone,
        iupSegmentation: selectedIupSegmentation
    };

    return (
        <>
            <PageMeta
                title="Edit IUP Management - CRM"
                description="Edit IUP management information and view customer details"
                image="/motor-sights-international.png"
            />
            <div className="mx-auto px-0">
                <PageHeader
                    title={`Edit IUP ${formData.company_name ? `- ${formData.company_name}` : ''}`}
                    backPath={() => goBack(listRoute)}
                />

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6 overflow-auto">
                    <nav className="flex w-[910px] xl:w-full">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 min-w-[280px] inline-flex items-center gap-2 justify-center ${activeTab === 'dashboard'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <AiOutlineDashboard size={'1.2rem'} /> General Site Information
                        </button>
                        <button
                            onClick={() => setActiveTab('zone_iup')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 min-w-[150px] inline-flex items-center gap-2 justify-center ${activeTab === 'zone_iup'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FaMapMarkedAlt size={'1.2rem'} /> Zone Site
                        </button>
                        <button
                            onClick={() => setActiveTab('survey')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 min-w-[150px] inline-flex items-center gap-2 justify-center ${activeTab === 'survey'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <AiOutlineHistory size={'1.2rem'} /> Survey
                        </button>
                        <button
                            onClick={() => setActiveTab('info_iup')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 min-w-[150px] inline-flex items-center gap-2 justify-center ${activeTab === 'info_iup'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FaIndustry size={'1.2rem'} /> Detail IUP
                        </button>
                        <button
                            onClick={() => setActiveTab('contractor_unit')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 min-w-[200px] inline-flex items-center gap-2 justify-center ${activeTab === 'contractor_unit'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <GiMineTruck size={'1.2rem'} /> Contractor & Unit
                        </button>
                        <button
                            onClick={() => setActiveTab('history_visit')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 min-w-[150px] inline-flex items-center gap-2 justify-center ${activeTab === 'history_visit'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <FaHistory size={'1.2rem'} /> History Visit
                        </button>
                    </nav>
                </div>

                {activeTab === 'info_iup' && (<>
                    <TerritorySelector
                        formData={formData}
                        errors={errors}
                        onInputChange={handleInputChange}
                        onSalesPicChange={handleSalesPicChange}
                        territories={territories}
                        selection={territorySelection}
                        loading={territoriesLoading}
                        onIslandChange={handleIslandChange}
                        onGroupChange={handleGroupChange}
                        onAreaChange={handleAreaChange}
                        onIupZoneChange={handleIupZoneChange}
                        onIupSegmentationChange={handleIupSegmentationChange}
                        getAvailableGroups={getAvailableGroups}
                        getAvailableAreas={getAvailableAreas}
                        getAvailableIupZones={getAvailableIupZones}
                        getAvailableIupSegmentations={getAvailableIupSegmentations}
                    />

                    <IupInformtionsFormFields
                        formData={formData}
                        errors={errors}
                        onInputChange={handleInputChange}
                        onSelectChange={handleSelectChange}
                    />

                    {/* <CustomerInformation customers={customers} /> */}

                    <FormActions
                        submitText={isSubmitting ? 'Updating...' : 'Update IUP'}
                        cancelRoute="/crm/iup-management"
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </>)}
                {activeTab === 'contractor_unit' && (<>
                    <TabContractorUnit customers={customers} />
                </>)}
                {activeTab === 'zone_iup' && (<>
                    <TabZoneArea segmentasion={formData?.iup_segmentation_name || ''} />
                </>)}
                {activeTab === 'history_visit' && (<>
                    <TabHistoryVisit />
                </>)}
                {activeTab === 'survey' && (<>
                    <TabSurvey />
                </>)}
                {activeTab === 'dashboard' && (<>
                    <IupDashboard />
                </>)}
            </div>
        </>
    );
};

export default EditIupManagement;