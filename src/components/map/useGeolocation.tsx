// src/components/map/useGeolocation.ts
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { isInsideIndonesia } from './utils/geoValidation';

interface UseGeolocationOptions {
    onLocate: (lat: number, lng: number) => void;
    zoomOnLocate?: number;
}

export function useGeolocation({ onLocate, zoomOnLocate = 15 }: UseGeolocationOptions) {
  const map = useMap();

    useEffect(() => {
        const handleFound = (e: L.LocationEvent) => {
            const { lat, lng } = e.latlng;
            if (!isInsideIndonesia(lat, lng)) {
                alert('Lokasi Anda terdeteksi di luar wilayah Indonesia.');
                return;
            }
            map.setView(e.latlng, zoomOnLocate);
            onLocate(lat, lng);
        };
        const handleError = () => alert('Gagal mendapatkan lokasi. Cek izin GPS/browser Anda.');

        map.on('locationfound', handleFound);
        map.on('locationerror', handleError);
        return () => {
            map.off('locationfound', handleFound);
            map.off('locationerror', handleError);
        };
    }, [map, onLocate, zoomOnLocate]);

    const locate = () => map.locate({ setView: false, enableHighAccuracy: true });

    return { locate };
}