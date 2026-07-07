import { useState } from 'react';
import { TileLayer, LayerGroup } from 'react-leaflet';
import { useTileFallback } from './useTileFallback';

type BaseLayerType = 'satellite' | 'street';
const STORAGE_KEY = 'iup-map-base-layer';

export default function MapLayersControl() {
    const [activeLayer, setActiveLayer] = useState<BaseLayerType>(() => {
        return (localStorage.getItem(STORAGE_KEY) as BaseLayerType) || 'satellite';
    });
    const [fallbackNotice, setFallbackNotice] = useState(false);

    const { handleTileError, reset } = useTileFallback(() => {
        setActiveLayer('street');
        setFallbackNotice(true);
        setTimeout(() => setFallbackNotice(false), 6000);
    });

    const switchLayer = (layer: BaseLayerType) => {
        setActiveLayer(layer);
        setFallbackNotice(false);
        reset();
        localStorage.setItem(STORAGE_KEY, layer);
    };
    return (<>
        <div className="map-layer-switcher">
            <button
                type="button"
                className={activeLayer === 'satellite' ? 'active' : ''}
                onClick={() => switchLayer('satellite')}
            >
                Satelit Hybrid
            </button>
            <button
                type="button"
                className={activeLayer === 'street' ? 'active' : ''}
                onClick={() => switchLayer('street')}
            >
                Peta Jalan
            </button>
        </div>

        {fallbackNotice && (
            <div className="map-fallback-notice">
                Satelit gagal dimuat, beralih otomatis ke Peta Jalan.
            </div>
        )}

        {activeLayer === 'satellite' ? (
            <LayerGroup>
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri"
                    maxZoom={19}
                    eventHandlers={{ tileerror: handleTileError }}
                />
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                    eventHandlers={{ tileerror: handleTileError }}
                />
            </LayerGroup>
        ) : (
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
        )}
        </>
    );
}