import React, { useEffect, useState } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
// import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
// import { useSegementationSelect } from '@/hooks/useSegmentSelect';
// import { SegmentSelectOption } from './IupInformtionsFormFields';
import { Area, Group, Island, IUPSegmentation, IUPZone, useTerritory } from '../../Territory';
import { parseSortBy } from '@/helpers/generalHelper';
// import Label from '@/components/form/Label';

interface TerritoryFilters {
    status?: string;
    sort_by?: '' | 'updated_at' | 'created_at'
    is_contractor_count?: string;
    is_selection_iup?: string;
    island_id?: string;
    group_id?: string;
    area_id?: string;
    iup_zone_id?: string;
    iup_segment_id?: string;
}

interface FilterSectionProps {
    onFilterChange: (filters: TerritoryFilters) => void;
    // onFilterChange: (field: string, value: string) => void;
    // onTerritoryFilterChange: (filters: TerritoryFilters) => void;
    onClearFilters: () => void;
    onApplyFilters?: () => void;
}

// Config filter - mudah untuk extend dengan field baru
const filterConfigs = [
    {
        id: 'is_selection_iup',
        label: 'Filter IUP Area',
        options: [
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' }
        ],
        placeholder: 'Filter IUP Area',
        defaultValue: 'false'
    },
    {
        id: 'is_contractor_count',
        label: 'Filter by Contractor Status',
        options: [
            { value: '', label: 'All Contractor' },
            { value: 'true', label: 'IUPs with Contractors' },
            { value: 'false', label: 'IUPs without Contractors' }
        ],
        placeholder: 'Filter by Contractor Status'
    },
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
    // onTerritoryFilterChange,
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
    const [filters, setFilters] = useState<TerritoryFilters>({});
    // const [filterValues, setFilterValues] = useState<{[key: string]: string}>({
    //     status: '',
    //     sort_by: ''
    // });

    // Initialize segmentation options
    // useEffect(() => {
    //     initializeSegementationOptions();
    // }, [initializeSegementationOptions]);
    
    const params = new URLSearchParams(location.search);

    
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
    useEffect(() => {
        if (!territories.length) return;

        const island = territories.find(t => t.id === params.get('island_id')) || null;
        if (island) {
            setSelectedIsland(island);
            
            if (params.get('group_id')) {
                const group = island.children?.find(g => g.id === params.get('group_id')) || null;
                if (group) {
                    setSelectedGroup(group);
                    
                    if (params.get('area_id')) {
                        const area = group.children?.find(a => a.id === params.get('area_id'));
                        if (area) {
                            setSelectedArea(area);
                            
                            if (params.get('iup_zone_id')) {
                                const iupZone = area.children?.find(z => z.id === params.get('iup_zone_id')) || null;
                                if (iupZone) {
                                    setSelectedIupZone(iupZone);
                                    
                                    if (params.get('iup_segment_id')) {
                                        const iupSegmentation = iupZone.children?.find(s => s.id === params.get('iup_segment_id')) || null;
                                        if (iupSegmentation) {
                                            setSelectedIupSegmentation(iupSegmentation);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        setFilters({
            status: params.get('status') || '',
            is_contractor_count: params.get('is_contractor_count') || '',
            is_selection_iup: params.get('is_selection_iup') || 'false',
            sort_by: parseSortBy(params.get('sort_by'))
        });
    }, [location.search]);

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
        const newFilters = {
            island_id: option?.value || '',
            group_id: '',
            area_id: '',
            iup_zone_id: '',
            iup_segment_id: ''
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleGroupChange = (option: { value: string; label: string; } | null) => {
        const group = getAvailableGroups().find(g => g.id === option?.value) || null;
        setSelectedGroup(group);
        setSelectedArea(null);
        setSelectedIupZone(null);
        setSelectedIupSegmentation(null);

        const newFilters = {
            ...filters,
            group_id: option?.value || '',
            area_id: '',
            iup_zone_id: '',
            iup_segment_id: ''
        };
        setFilters(newFilters);
        onFilterChange(newFilters);

        // onFilterChange('group_id', option?.value || '');
    };

    const handleAreaChange = (option: { value: string; label: string; } | null) => {
        const area = getAvailableAreas().find(a => a.id === option?.value) || null;
        setSelectedArea(area);
        setSelectedIupZone(null);
        setSelectedIupSegmentation(null);
        const newFilters = {
            ...filters,
            area_id: option?.value || '',
            iup_zone_id: '',
            iup_segment_id: ''
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleIupZoneChange = (option: { value: string; label: string; } | null) => {
        const iupZone = getAvailableIupZones().find(z => z.id === option?.value) || null;
        setSelectedIupZone(iupZone);
        setSelectedIupSegmentation(null);
        const newFilters = {
            ...filters,
            iup_zone_id: option?.value || '',
            iup_segment_id: ''
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleIupSegmentationChange = (option: { value: string; label: string; } | null) => {
        const iupSegmentation = getAvailableIupSegmentations().find(s => s.id === option?.value) || null;
        setSelectedIupSegmentation(iupSegmentation);
        
        const newFilters = {
            ...filters,
            iup_segment_id: option?.value || ''
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
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

    // const getCurrentValue = (filterId: string): { value: string; label: string } | null => {
    //     const value = filterValues[filterId];
    //     if (!value) return null;
        
    //     const config = filterConfigs.find(config => config.id === filterId);
    //     const option = config?.options.find(opt => opt.value === value);
        
    //     return option || null;
    // };
    const getCurrentValue = (id: string) => {
        const value = filters[id as keyof typeof filters];

        const config = filterConfigs.find((c) => c.id === id);

        if (!config) return null;

        return config.options.find((opt) => opt.value === value) || null;
    };

    const handleFilterChangeInternal = (updated: Partial<TerritoryFilters>) => {
        setFilters((prev) => {
            const newFilters = {
                ...prev,
                ...updated
            };
            onFilterChange(newFilters);
            // setFilterValues(prev => ({
            //     ...prev,
            //     [filterId]: selectedOption?.value || ''
            // }));
            return newFilters;
        });
    };
    
    const handleClearAllFilters = () => {
        setFilters({
            status: '',
            sort_by: '',
            is_selection_iup: ''
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
                        // value={getSelectValue(filters.island_id, islandOptions)}
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

            <div className="flex md:col-span-5 gap-4">
                {filterConfigs.map((config) => (
                    <div key={config.id} className='flex-1'>
                        <CustomSelect
                            id={config.id}
                            name={config.id}
                            value={getCurrentValue(config.id)}
                            // onChange={(selectedOption) => handleFilterChangeInternal(config.id, selectedOption)}
                            onChange={(selectedOption) =>
                                handleFilterChangeInternal({
                                    [config.id]: selectedOption?.value || ''
                                })
                            }
                            options={config.options}
                            placeholder={config.placeholder}
                            isClearable={true}
                            isSearchable={false}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>
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