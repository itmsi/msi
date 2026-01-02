import React from 'react';

interface TerritoryInfo {
    island_name?: string;
    group_name?: string;
    area_name?: string;
    iup_zone_name?: string;
}

interface TerritoryDisplayReadonlyProps {
    territoryInfo: TerritoryInfo;
}

const TerritoryDisplayReadonly: React.FC<TerritoryDisplayReadonlyProps> = ({ 
    territoryInfo 
}) => {
    const { island_name, group_name, area_name, iup_zone_name } = territoryInfo;
    
    // Only show if we have at least one territory field
    if (!island_name && !group_name && !area_name && !iup_zone_name) {
        return null;
    }

    return (
        <div className="md:col-span-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-4 mb-4">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Territory Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-sm">
                {island_name && (
                    <div>
                        <span className="font-medium text-gray-600">Island:</span>
                        <span className="ml-2 text-gray-700 font-[600] font-secondary">{island_name}</span>
                    </div>
                )}
                {group_name && (
                    <div>
                        <span className="font-medium text-gray-600">Group:</span>
                        <span className="ml-2 text-gray-700 font-[600] font-secondary">{group_name}</span>
                    </div>
                )}
                {area_name && (
                    <div>
                        <span className="font-medium text-gray-600">Area:</span>
                        <span className="ml-2 text-gray-700 font-[600] font-secondary">{area_name}</span>
                    </div>
                )}
                {iup_zone_name && (
                    <div>
                        <span className="font-medium text-gray-600">IUP Zone:</span>
                        <span className="ml-2 text-gray-700 font-[600] font-secondary">{iup_zone_name}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerritoryDisplayReadonly;