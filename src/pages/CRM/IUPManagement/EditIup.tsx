import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import LoadingSpinner from '@/components/common/Loading';
import { useIupManagementEdit } from './hooks/useIupManagementEdit';
import TerritorySelector from './components/TerritorySelector';
import CustomerInformation from './components/CustomerInformation';
import FormActions from '@/components/form/FormActions';
import IupInformtionsFormFields from './components/IupInformtionsFormFields';


const EditIupManagement: React.FC = () => {
    const navigate = useNavigate();
    
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
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/crm/iup-management')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit IUP Management</h1>
                        </div>
                    </div>

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
            </div>
        </>
    );
};

export default EditIupManagement;