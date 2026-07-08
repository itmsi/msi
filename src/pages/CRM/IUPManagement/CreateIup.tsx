import React from 'react';
import PageMeta from '@/components/common/PageMeta';
import { useIupManagementCreate } from './hooks/useIupManagementCreate';
import TerritoryInfoDisplay from './components/TerritoryInfoDisplay';
import TerritorySelector from './components/TerritorySelector';
import FormActions from '../../../components/form/FormActions';
import IupInformtionsFormFields from './components/IupInformtionsFormFields';
import PageHeader from '@/components/common/PageHeader';
import useGoBack from '@/hooks/useGoBack';

const CreateIup: React.FC = () => {
    const goBack = useGoBack();
    const {
        selectedIsland,
        selectedGroup,
        selectedArea,
        selectedIupZone,
        selectedIupSegmentation,
        handleIslandChange,
        handleGroupChange,
        handleAreaChange,
        handleIupZoneChange,
        handleIupSegmentationChange,
        getAvailableGroups,
        getAvailableAreas,
        getAvailableIupZones,
        getAvailableIupSegmentations,
        territoriesLoading,
        territories,
        isSubmitting,
        formData,
        errors,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleSubmit
    } = useIupManagementCreate();
    
    // Territory selection state for passing to components
    const territorySelection = {
        island: selectedIsland,
        group: selectedGroup,
        area: selectedArea,
        iupZone: selectedIupZone,
        iupSegmentation: selectedIupSegmentation
    };

    const selectedTerritoryInfo = {
        island: selectedIsland,
        group: selectedGroup,
        area: selectedArea,
        iupZone: selectedIupZone,
        iupSegmentation: selectedIupSegmentation
    };
    return (
        <>
            <PageMeta 
                title="Create IUP - CRM" 
                description="Create new IUP management entry"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50">
                <div className="mx-auto">

                    {/* Header */}
                    <PageHeader
                        title={`Create IUP`}
                        backPath={() => goBack('/crm/iup-management')}
                    />

                    {/* Form */}
                    <TerritoryInfoDisplay selectedTerritory={selectedTerritoryInfo} />
                    
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
                        onDateChange={handleDateChange}
                    />

                    {/* Action Buttons */}
                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </>
    );
};

export default CreateIup;