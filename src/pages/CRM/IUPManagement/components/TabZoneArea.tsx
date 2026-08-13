import React from 'react';
import ZoneArea from '@/pages/CRM/IUPManagement/components/zonearea/ZoneArea';

const TabZoneArea: React.FC<{ segmentasion: string }> = ({ segmentasion }) => {
    return (<>
        <ZoneArea segmentasion={segmentasion} />
    </>);
}
export default TabZoneArea;