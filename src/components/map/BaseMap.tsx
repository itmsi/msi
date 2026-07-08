// src/components/map/BaseMap.tsx
import { useEffect, ReactNode } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import MapLayersControl from './MapLayersControl';
import { INDONESIA_CENTER, DEFAULT_ZOOM } from './constants/constant';

function InvalidateMapSize() {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 150);
        return () => clearTimeout(t);
    }, [map]);
    return null;
}

interface Props {
    center?: LatLngExpression;
    zoom?: number;
    height?: string;
    children?: ReactNode;
}

export default function BaseMap({
    center = INDONESIA_CENTER as LatLngExpression,
    zoom = DEFAULT_ZOOM,
    height = '65vh',
    children,
}: Props) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            minZoom={4}
            maxBoundsViscosity={1.0}
            attributionControl={false} 
            style={{ height, width: '100%', borderRadius: 8 }}
        >
            <MapLayersControl />
            <InvalidateMapSize />
            {children}
        </MapContainer>
    );
}