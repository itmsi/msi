import React, { useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import LoadingSpinner from '@/components/common/Loading';
import { useIupManagementEdit } from './hooks/useIupManagementEdit';
import TerritorySelector from './components/TerritorySelector';
import CustomerInformation from './components/CustomerInformation';
import FormActions from '@/components/form/FormActions';
import IupInformtionsFormFields from './components/IupInformtionsFormFields';
import PageHeader from '@/components/common/PageHeader';
import useGoBack from '@/hooks/useGoBack';
import { FaIndustry, FaMapMarkedAlt, FaHistory } from 'react-icons/fa';
import TabZoneArea from './components/TabZoneArea';
import { GiMineTruck } from 'react-icons/gi';
import TabContractorUnit from './components/TabContractorUnit';


const EditIupManagement: React.FC = () => {
    const goBack = useGoBack();
    
    // Use custom hook for edit functionality
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
        handleSubmit
    } = useIupManagementEdit();

    const [activeTab, setActiveTab] = useState<'info_iup' | 'contractor_unit' | 'zone_iup' | 'history_visit'>('zone_iup');

    // Show loading spinner while data is loading
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    // Prepare territory info for display component
    // const territoryInfo = {
    //     island_name: formData.island_name,
    //     group_name: formData.group_name,
    //     area_name: formData.area_name,
    //     iup_zone_name: formData.iup_zone_name
    // };

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
                    title={`Edit IUP Management`}
                    backPath={() => goBack('/crm/iup-management')}
                />

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6 overflow-auto">
                    <nav className="flex w-[910px] xl:w-full">
                        <button
                            onClick={() => setActiveTab('info_iup')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                activeTab === 'info_iup'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FaIndustry size={'1.2rem'} /> Detail IUP
                        </button>
                        <button
                            onClick={() => setActiveTab('contractor_unit')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                activeTab === 'contractor_unit'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <GiMineTruck size={'1.2rem'} /> Contractor & Unit
                        </button>
                        <button
                            onClick={() => setActiveTab('zone_iup')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                activeTab === 'zone_iup'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FaMapMarkedAlt size={'1.2rem'} /> Zone Site
                        </button>
                        <button
                            onClick={() => setActiveTab('history_visit')}
                            className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                activeTab === 'history_visit'
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

                    <CustomerInformation customers={customers} />
                    
                    <FormActions
                        submitText={isSubmitting ? 'Updating...' : 'Update IUP'}
                        cancelRoute="/crm/iup-management"
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </>)}
                {activeTab === 'contractor_unit' && (<>
                    <TabContractorUnit formData={formData} />
                </>)}
                {activeTab === 'zone_iup' && (<>
                    <TabZoneArea customerID={formData.id} />
                </>)}
                {activeTab === 'history_visit' && (<></>)}
            </div>
        </>
    );
};

export default EditIupManagement;