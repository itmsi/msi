import React from 'react';
import ZoneArea from '@/pages/CRM/IUPManagement/components/zonearea/ZoneArea';
import { useIupZoneSIte } from '../hooks/useIupZoneSIte';


const TabZoneArea: React.FC = () => {

    const {
        zones,
        handleZonesChange,
        handleSubmitZone
    } = useIupZoneSIte();

    return (<>
        <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg leading-6 font-primary-bold text-gray-900">Zona &amp; Evidence</h2>
                    </div>
                </div>
            </div>
            
            <div className="p-6 font-secondary">
                <ZoneArea 
                    zones={zones}
                    onChange={handleZonesChange}
                    onSubmitZone={handleSubmitZone}
                />
            </div>
        </div>
    </>);
}
export default TabZoneArea;