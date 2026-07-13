import React from 'react';
import PageMeta from '@/components/common/PageMeta';
import LoadingSpinner from '@/components/common/Loading';
import { useIupManagementEdit } from './hooks/useIupManagementEdit';
import TerritorySelector from './components/TerritorySelector';
import CustomerInformation from './components/CustomerInformation';
import FormActions from '@/components/form/FormActions';
import IupInformtionsFormFields from './components/IupInformtionsFormFields';
import PageHeader from '@/components/common/PageHeader';
import useGoBack from '@/hooks/useGoBack';


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

                {/* <TerritoryDisplayReadonly territoryInfo={territoryInfo} /> */}

                        
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

            </div>
        </>
    );
};

export default EditIupManagement;