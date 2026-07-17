import { Marker, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { INDONESIA_CENTER, DEFAULT_ZOOM, isInsideIndonesia, BaseMap } from '../../../../components/map';
import '../../../../components/map/lib/leaflet';
import { GeoData } from '../types/iupterritory';
import Alert from '@/components/ui/alert/Alert';

function ClickToPlacePin({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            if (!isInsideIndonesia(lat, lng)) {
                alert('Titik pin harus berada di dalam wilayah Indonesia.');
                return;
            }
            onPlace(lat, lng);
        },
    });
    return null;
}

interface Props {
    initialGeo?: GeoData;
    onChange: (geo: GeoData) => void;
}

export default function IUPMapForm({ initialGeo, onChange }: Props) {
    const pin = initialGeo?.pin ?? null;

    const handlePlacePin = (lat: number, lng: number) => {
        onChange({ pin: { lat, lng } });
    };

    const handleDragEnd = (e: L.DragEndEvent) => {
        const marker = e.target as L.Marker;
        const { lat, lng } = marker.getLatLng();
        if (!isInsideIndonesia(lat, lng)) {
            alert('Titik pin harus berada di dalam wilayah Indonesia.');
            if (pin) marker.setLatLng([pin.lat, pin.lng]);
            return;
        }
        onChange({ pin: { lat, lng } });
    };

    const center: LatLngExpression = pin
        ? [pin.lat, pin.lng]
        : [INDONESIA_CENTER[0], INDONESIA_CENTER[1]];

    return (
        <div style={{ position: 'relative' }}>
            <div className="mb-4">
                <Alert variant='info' title='Map Guide'>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 font-primary">
                            Click the map to select a location, or drag the pin to adjust it.
                        </p>
                    </div>
                </Alert>
            </div>
            <BaseMap
                center={center}
                height="700px"
                zoom={pin ? 14 : DEFAULT_ZOOM}
            >
                <ClickToPlacePin onPlace={handlePlacePin} />
                {pin && (
                    <Marker
                        position={[pin.lat, pin.lng]}
                        draggable
                        eventHandlers={{ dragend: handleDragEnd }}
                    />
                )}
            </BaseMap>

        </div>
    );
}