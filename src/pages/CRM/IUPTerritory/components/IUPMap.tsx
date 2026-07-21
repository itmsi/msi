// src/components/IUPMap.tsx
import { Marker, Popup } from 'react-leaflet';
import { BaseMap } from '../../../../components/map';
import '../../../../components/map/lib/leaflet';
import type { IupItem } from '../types/iupterritory';
import { Link } from 'react-router-dom';
import "../../../../components/map/css/map.css";
import { FaIndustry, FaRegBuilding, FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { iupIcon } from './createMarkerIcon';

interface IUPMapProps {
    iupList: IupItem[];
    handleDeleteItem: (iup: IupItem) => void;
}

export default function IUPMap({ iupList, handleDeleteItem }: IUPMapProps) {
    return (
        <BaseMap height="81vh">
            {iupList.map((iup) => {
                const latitude = Number(iup.iup_latitude);
                const longitude = Number(iup.iup_longitude);

                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                    return null;
                }

                return (
                    <Marker 
                        key={iup.iup_selection_id} 
                        position={[latitude, longitude]}
                        icon={iupIcon}
                    >

                        <Popup className="iup-popup-custom leaf-custom-blur">
                            <div className="iup-popup">
                                <div className="iup-popup-avatar">
                                    <FaIndustry size={20} className="text-primary" />
                                </div>

                                <p className="font-secondary font-semibold text-white">
                                    {iup.iup_code ? `${iup.iup_code} - ` : ''} {iup.company_name}
                                </p>

                                <div className="flex gap-2 justify-center relative">
                                
                                    <Link to={`/crm/iup-management/edit/${iup.iup_id}`}
                                        className="circle-btn"
                                    >
                                        <FaRegBuilding />
                                    </Link>
                                    
                                    <Link to={`/crm/iup/edit/${iup.iup_selection_id}`} 
                                        className="circle-btn accent"
                                    >
                                        <FaRegEdit />
                                    </Link>
                                    
                                        <PermissionGate permission={["delete"]}>
                                            <button
                                                type="button"
                                                className="circle-btn danger"
                                                onClick={() => handleDeleteItem(iup)}
                                                aria-label="Hapus data"
                                            >
                                                <FaRegTrashAlt />
                                            </button>
                                        </PermissionGate>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </BaseMap>
    );
}