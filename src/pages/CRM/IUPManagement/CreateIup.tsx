import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useIupManagementCreate } from './hooks/useIupManagementCreate';
import TerritoryInfoDisplay from './components/TerritoryInfoDisplay';
import TerritorySelector from './components/TerritorySelector';
import FormActions from '../../../components/form/FormActions';
import IupInformtionsFormFields from './components/IupInformtionsFormFields';

const CreateIup: React.FC = () => {
    const navigate = useNavigate();
    const {
        selectedIsland,
        selectedGroup,
        selectedArea,
        selectedIupZone,
        handleIslandChange,
        handleGroupChange,
        handleAreaChange,
        handleIupZoneChange,
        getAvailableGroups,
        getAvailableAreas,
        getAvailableIupZones,
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
        iupZone: selectedIupZone
    };

    const selectedTerritoryInfo = {
        island: selectedIsland,
        group: selectedGroup,
        area: selectedArea,
        iupZone: selectedIupZone
    };
    return (
        <>
            <PageMeta 
                title="Create IUP - CRM" 
                description="Create new IUP management entry"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* Header */}
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
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create IUP</h1>
                        </div>
                    </div>

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
                        getAvailableGroups={getAvailableGroups}
                        getAvailableAreas={getAvailableAreas}
                        getAvailableIupZones={getAvailableIupZones}
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