import { INDONESIA_BOUNDS } from '../constants/constant';

export function isInsideIndonesia(lat: number, lng: number): boolean {
    const [[swLat, swLng], [neLat, neLng]] = INDONESIA_BOUNDS;
    return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
}