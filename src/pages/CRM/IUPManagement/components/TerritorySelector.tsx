import React from 'react';
import Label from '@/components/form/Label';
import CustomSelect from '@/components/form/select/CustomSelect';
import IupFormFields from './IupFormFields';

interface TerritoryOption {
    id: string;
    name: string;
    groups?: TerritoryOption[];
    areas?: TerritoryOption[];
    iupZones?: TerritoryOption[];
}

interface TerritorySelection {
    island: TerritoryOption | null;
    group: TerritoryOption | null;
    area: TerritoryOption | null;
    iupZone: TerritoryOption | null;
    iupSegmentation: TerritoryOption | null;
}
interface IupFormData {
    company_name: string;
}
interface TerritorySelectorProps {
    formData: IupFormData;
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    territories: TerritoryOption[];
    selection: TerritorySelection;
    loading?: boolean;
    onIslandChange: (option: any) => void;
    onGroupChange: (option: any) => void;
    onAreaChange: (option: any) => void;
    onIupZoneChange: (option: any) => void;
    onIupSegmentationChange: (option: any) => void;
    getAvailableGroups: () => TerritoryOption[];
    getAvailableAreas: () => TerritoryOption[];
    getAvailableIupZones: () => TerritoryOption[];
    getAvailableIupSegmentations: () => TerritoryOption[];
}

const TerritorySelector: React.FC<TerritorySelectorProps> = ({
    formData,
    errors,
    onInputChange,
    territories,
    selection,
    loading = false,
    onIslandChange,
    onGroupChange,
    onAreaChange,
    onIupZoneChange,
    onIupSegmentationChange,
    getAvailableGroups,
    getAvailableAreas,
    getAvailableIupZones,
    getAvailableIupSegmentations
}) => {
    const { island, group, area, iupZone, iupSegmentation } = selection;

    // Helper to show warning message when no options available
    const renderNoOptionsWarning = (
        parentName: string, 
        parentType: string, 
        childType: string
    ) => (
        <p className="text-sm text-amber-600 mt-1 flex items-center">
            No {childType}s available in "{parentName}" {parentType}
        </p>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Territory Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Island Selection */}
                <div>
                    <Label>Island *</Label>
                    <CustomSelect
                        options={territories.map(island => ({
                            value: island.id,
                            label: island.name
                        }))}
                        value={island ? { value: island.id, label: island.name } : null}
                        onChange={onIslandChange}
                        placeholder="Select Island"
                        isLoading={loading}
                        isClearable={false}
                        isSearchable={false}
                    />
                    {territories.length === 0 && !loading && (
                        <p className="text-sm text-amber-600 mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            No islands available
                        </p>
                    )}
                </div>

                {/* Group Selection */}
                <div>
                    <Label>Group *</Label>
                    <CustomSelect
                        options={getAvailableGroups().map(group => ({
                            value: group.id,
                            label: group.name
                        }))}
                        value={group ? { value: group.id, label: group.name } : null}
                        onChange={onGroupChange}
                        placeholder="Select Group"
                        isDisabled={!island}
                        isClearable={false}
                        isSearchable={false}
                    />
                    {island && getAvailableGroups().length === 0 && 
                        renderNoOptionsWarning(island.name, "island", "group")
                    }
                </div>

                {/* Area Selection */}
                <div>
                    <Label>Area *</Label>
                    <CustomSelect
                        options={getAvailableAreas().map(area => ({
                            value: area.id,
                            label: area.name
                        }))}
                        value={area ? { value: area.id, label: area.name } : null}
                        onChange={onAreaChange}
                        placeholder="Select Area"
                        isDisabled={!group}
                        isClearable={false}
                        isSearchable={false}
                    />
                    {group && getAvailableAreas().length === 0 && 
                        renderNoOptionsWarning(group.name, "group", "area")
                    }
                </div>

                {/* IUP Zone Selection */}
                <div>
                    <Label>IUP Zone *</Label>
                    <CustomSelect
                        options={getAvailableIupZones().map(zone => ({
                            value: zone.id,
                            label: zone.name
                        }))}
                        value={iupZone ? { value: iupZone.id, label: iupZone.name } : null}
                        onChange={onIupZoneChange}
                        placeholder="Select IUP Zone"
                        isDisabled={!area}
                        isClearable
                        isSearchable
                    />
                    {area && getAvailableIupZones().length === 0 && 
                        renderNoOptionsWarning(area.name, "area", "IUP zone")
                    }
                </div>

                {/* IUP Segmentation Selection */}
                <div>
                    <Label>IUP Segmentation *</Label>
                    <CustomSelect
                        options={getAvailableIupSegmentations().map(seg => ({
                            value: seg.id,
                            label: seg.name
                        }))}
                        value={iupSegmentation ? { value: iupSegmentation.id, label: iupSegmentation.name } : null}
                        onChange={onIupSegmentationChange}
                        placeholder="Select IUP Segmentation"
                        isDisabled={!iupZone}
                        isClearable
                        isSearchable
                    />
                    {iupZone && getAvailableIupSegmentations().length === 0 && 
                        renderNoOptionsWarning(iupZone.name, "IUP zone", "IUP segmentation")
                    }
                </div>
                {/* IUP Name Field */}
                <IupFormFields
                    formData={formData}
                    errors={errors}
                    onInputChange={onInputChange}
                />
            </div>
        </div>
    );
};

export default TerritorySelector;