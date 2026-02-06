import React, { useEffect, useState } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
// import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
// import { useSegementationSelect } from '@/hooks/useSegmentSelect';
// import { SegmentSelectOption } from './IupInformtionsFormFields';
import { Area, Group, Island, IUPSegmentation, IUPZone, useTerritory } from '../../Territory';
// import Label from '@/components/form/Label';

interface TerritoryFilters {
    island_id?: string;
    group_id?: string;
    area_id?: string;
    iup_zone_id?: string;
    iup_segment_id?: string;
}

interface FilterSectionProps {
    onFilterChange: (field: string, value: string) => void;
    onTerritoryFilterChange: (filters: TerritoryFilters) => void;
    onClearFilters: () => void;
    onApplyFilters?: () => void;
}

interface FilterOption {
    value: string;
    label: string;
}

// Config filter - mudah untuk extend dengan field baru
const filterConfigs = [
    {
        id: 'status',
        label: 'Filter by Status',
        options: [
            { value: '', label: 'All Status' },
            { value: 'aktif', label: 'Active' },
            { value: 'non aktif', label: 'Inactive' }
        ],
        placeholder: 'Filter by Status'
    },
    {
        id: 'sort_by',
        label: 'Sort by',
        options: [
            { value: '', label: 'All Modify' },
            { value: 'updated_at', label: 'Updated' },
            { value: 'created_at', label: 'Created' }
        ],
        placeholder: 'Sort by',
    }
];

const FilterSection: React.FC<FilterSectionProps> = ({
    onFilterChange,
    onTerritoryFilterChange,
    onClearFilters,
    onApplyFilters
}) => {
    // Use reusable segmentation select hook
    // const {
    //     segementationOptions,
    //     inputValue: segmentationInputValue,
    //     handleInputChange: handleSegmentationInputChange,
    //     pagination: segmentationPagination,
    //     handleMenuScrollToBottom: handleSegmentationMenuScrollToBottom,
    //     initializeOptions: initializeSegementationOptions
    // } = useSegementationSelect();

    // Segmentation states
    // const [selectedSegment, setSelectedSegment] = useState<SegmentSelectOption | null>(null);
    
    // State for other filter values
    const [filterValues, setFilterValues] = useState<{[key: string]: string}>({
        status: '',
        sort_by: ''
    });

    // Initialize segmentation options
    // useEffect(() => {
    //     initializeSegementationOptions();
    // }, [initializeSegementationOptions]);
    
    
    // TERRITORY SELECTION LOGIC
    const {
        territories,
        loading: territoriesLoading,
        fetchTerritories
    } = useTerritory();

    const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [selectedIupZone, setSelectedIupZone] = useState<IUPZone | null>(null);
    const [selectedIupSegmentation, setSelectedIupSegmentation] = useState<IUPSegmentation | null>(null);
    
    // Fetch territories on component mount
    useEffect(() => {
        fetchTerritories();
    }, []);

    // Get available groups based on selected island
    const getAvailableGroups = (): Group[] => {
        if (!selectedIsland) return [];
        return selectedIsland.children || [];
    };

    // Get available areas based on selected group
    const getAvailableAreas = (): Area[] => {
        if (!selectedGroup) return [];
        return selectedGroup.children || [];
    };

    // Get available IUP zones based on selected area
    const getAvailableIupZones = (): IUPZone[] => {
        if (!selectedArea) return [];
        return selectedArea.children || [];
    };

    // Get available IUP Segmentations based on selected IUP Zone
    const getAvailableIupSegmentations = (): IUPSegmentation[] => {
        if (!selectedIupZone) return [];
        return selectedIupZone.children || [];
    };

    const handleIslandChange = (option: { value: string; label: string; } | null) => {
        const island = territories.find(t => t.id === option?.value) || null;
        setSelectedIsland(island);
        setSelectedGroup(null);
        setSelectedArea(null);
        setSelectedIupZone(null);
        setSelectedIupSegmentation(null);
        
        // Batch update territory filters - kirim semua value sekaligus
        onTerritoryFilterChange({
            island_id: option?.value || '',
            group_id: '',
            area_id: '',
            iup_zone_id: '',
            iup_segment_id: ''
        });
    };

    const handleGroupChange = (option: { value: string; label: string; } | null) => {
        const group = getAvailableGroups().find(g => g.id === option?.value) || null;
        setSelectedGroup(group);
        setSelectedArea(null);
        setSelectedIupZone(null);
        setSelectedIupSegmentation(null);
        
        // Batch update - group berubah, reset children
        onTerritoryFilterChange({
            group_id: option?.value || '',
            area_id: '',
            iup_zone_id: '',
            iup_segment_id: ''
        });
    };

    const handleAreaChange = (option: { value: string; label: string; } | null) => {
        const area = getAvailableAreas().find(a => a.id === option?.value) || null;
        setSelectedArea(area);
        setSelectedIupZone(null);
        setSelectedIupSegmentation(null);
        
        // Batch update - area berubah, reset children
        onTerritoryFilterChange({
            area_id: option?.value || '',
            iup_zone_id: '',
            iup_segment_id: ''
        });
    };

    const handleIupZoneChange = (option: { value: string; label: string; } | null) => {
        const iupZone = getAvailableIupZones().find(z => z.id === option?.value) || null;
        setSelectedIupZone(iupZone);
        setSelectedIupSegmentation(null);
        
        // Batch update - iup zone berubah, reset children
        onTerritoryFilterChange({
            iup_zone_id: option?.value || '',
            iup_segment_id: ''
        });
    };

    const handleIupSegmentationChange = (option: { value: string; label: string; } | null) => {
        const iupSegmentation = getAvailableIupSegmentations().find(s => s.id === option?.value) || null;
        setSelectedIupSegmentation(iupSegmentation);
        
        // Update filter
        onTerritoryFilterChange({
            iup_segment_id: option?.value || ''
        });
    };

    const { island, group, area, iupZone, iupSegmentation } = {
        island: selectedIsland,
        group: selectedGroup,
        area: selectedArea,
        iupZone: selectedIupZone,
        iupSegmentation: selectedIupSegmentation
    };
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

    const getCurrentValue = (filterId: string): { value: string; label: string } | null => {
        const value = filterValues[filterId];
        if (!value) return null;
        
        const config = filterConfigs.find(config => config.id === filterId);
        const option = config?.options.find(opt => opt.value === value);
        
        return option || null;
    };

    const handleFilterChangeInternal = (filterId: string, selectedOption: FilterOption | null) => {
        // if (filterId === 'segmentation') {
        //     const segment = segementationOptions.find(opt => opt.value === selectedOption?.value) || null;
        //     setSelectedSegment(segment);
        // } else {
            setFilterValues(prev => ({
                ...prev,
                [filterId]: selectedOption?.value || ''
            }));
        // }
        
        onFilterChange(filterId, selectedOption?.value || '');
    };
    
    const handleClearAllFilters = () => {
        // Reset segmentation & other filters
        // setSelectedSegment(null);
        setFilterValues({
            status: '',
            sort_by: ''
        });
        
        // Reset territory selections
        setSelectedIsland(null);
        setSelectedGroup(null);
        setSelectedArea(null);
        setSelectedIupZone(null);
        setSelectedIupSegmentation(null);
        
        onClearFilters();
    };
    
    return (
        <div className="mt-4 pt-4 border-t border-gray-200 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* <CustomAsyncSelect
                    placeholder="Select Segmentation..."
                    value={selectedSegment}
                    defaultOptions={segementationOptions}
                    loadOptions={handleSegmentationInputChange}
                    onMenuScrollToBottom={() => {
                        handleSegmentationMenuScrollToBottom();
                    }}
                    isLoading={segmentationPagination.loading}
                    noOptionsMessage={() => "No segments found"}
                    loadingMessage={() => segementationOptions.length > 0 ? "Loading segments..." : ""}
                    isSearchable={true}
                    isClearable={true}
                    inputValue={segmentationInputValue}
                    className="w-full md:col-span-2"
                    onInputChange={(inputValue) => {
                        handleSegmentationInputChange(inputValue);
                    }}
                    onChange={(option: SegmentSelectOption | null) => {
                        setSelectedSegment(option);
                        onFilterChange('segmentation', option?.value || '');
                    }}
                /> */}
                
                {/* Island Selection */}
                <div>
                    <CustomSelect
                        options={territories.map(island => ({
                            value: island.id,
                            label: island.name
                        }))}
                        value={island ? { value: island.id, label: island.name } : null}
                        onChange={handleIslandChange}
                        placeholder="Select Island"
                        isLoading={territoriesLoading}
                        isClearable={false}
                        isSearchable={false}
                    />
                    {territories.length === 0 && !territoriesLoading && (
                        <p className="text-sm text-amber-600 mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            No islands available
                        </p>
                    )}
                </div>

                {/* Group Selection */}
                <div>
                    <CustomSelect
                        options={getAvailableGroups().map(group => ({
                            value: group.id,
                            label: group.name
                        }))}
                        value={group ? { value: group.id, label: group.name } : null}
                        onChange={handleGroupChange}
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
                    <CustomSelect
                        options={getAvailableAreas().map(area => ({
                            value: area.id,
                            label: area.name
                        }))}
                        value={area ? { value: area.id, label: area.name } : null}
                        onChange={handleAreaChange}
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
                    <CustomSelect
                        options={getAvailableIupZones().map(zone => ({
                            value: zone.id,
                            label: zone.name
                        }))}
                        value={iupZone ? { value: iupZone.id, label: iupZone.name } : null}
                        onChange={handleIupZoneChange}
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
                    <CustomSelect
                        options={getAvailableIupSegmentations().map(seg => ({
                            value: seg.id,
                            label: seg.name
                        }))}
                        value={iupSegmentation ? { value: iupSegmentation.id, label: iupSegmentation.name } : null}
                        onChange={handleIupSegmentationChange}
                        placeholder="Select IUP Segmentation"
                        isDisabled={!iupZone}
                        isClearable
                        isSearchable
                    />
                    {iupZone && getAvailableIupSegmentations().length === 0 && 
                        renderNoOptionsWarning(iupZone.name, "IUP zone", "IUP segmentation")
                    }
                </div>

                {filterConfigs.map((config) => (
                    <div key={config.id}>
                        <CustomSelect
                            id={config.id}
                            name={config.id}
                            value={getCurrentValue(config.id)}
                            onChange={(selectedOption) => handleFilterChangeInternal(config.id, selectedOption)}
                            options={config.options}
                            placeholder={config.placeholder}
                            isClearable={true}
                            isSearchable={false}
                            className="w-full"
                        />
                    </div>
                ))}

            </div>

            {/* Filter actions */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                    size="sm"
                >
                    Clear All
                </Button>
                {onApplyFilters && (
                    <Button
                        onClick={onApplyFilters}
                        className="px-4 py-2"
                        size="sm"
                    >
                        Apply Filters
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FilterSection;