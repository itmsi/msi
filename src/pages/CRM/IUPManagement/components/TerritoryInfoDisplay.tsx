import React from 'react';

interface SelectedTerritoryInfo {
    island?: { id: string; name: string } | null;
    group?: { id: string; name: string } | null;
    area?: { id: string; name: string } | null;
    iupZone?: { id: string; name: string } | null;
    iupSegmentation?: { id: string; name: string } | null;
}

interface TerritoryInfoDisplayProps {
    selectedTerritory: SelectedTerritoryInfo;
}

const TerritoryInfoDisplay: React.FC<TerritoryInfoDisplayProps> = ({ 
    selectedTerritory 
}) => {
    const { island, group, area, iupZone, iupSegmentation } = selectedTerritory;
    
    // Only show if we have an IUP zone selected
    if (!iupSegmentation) return null;

    return (
        <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                Selected Territory Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-sm">
                <div>
                    <span className="font-medium text-gray-600">Island:</span>
                    <span className="ml-2 text-blue-700">{island?.name}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Group:</span>
                    <span className="ml-2 text-blue-700">{group?.name}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Area:</span>
                    <span className="ml-2 text-blue-700">{area?.name}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">IUP Zone:</span>
                    <span className="ml-2 text-blue-700">{iupZone?.name}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-600">IUP Segmentation:</span>
                    <span className="ml-2 text-blue-700">{iupSegmentation?.name}</span>
                </div>
            </div>
        </div>
    );
};

export default TerritoryInfoDisplay;