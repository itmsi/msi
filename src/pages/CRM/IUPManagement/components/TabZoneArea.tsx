import React from 'react';
import ZoneArea from '@/components/zonearea/ZoneArea';

interface TabZoneAreaProps {
    customerID: string;
}

const TabZoneArea: React.FC<TabZoneAreaProps> = ({ customerID: _customerID }) => {
    const handleChange = (_updatedZones: any[]) => {
        // zones tersimpan di state parent jika diperlukan
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg leading-6 font-primary-bold text-gray-900">Zona &amp; Evidence</h2>
                    </div>
                </div>
            </div>
            
            <div className="p-6 font-secondary">
                {/* {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )} */}
                <ZoneArea onChange={handleChange} />
            </div>
        </div>
    );
}
export default TabZoneArea;