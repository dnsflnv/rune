import { useRef, useEffect } from 'react';
import { Map, Marker } from 'maplibre-gl';
import { Runestone } from '../types';

interface MiniMapProps {
  runestone: Runestone;
}

export const MiniMap = ({ runestone }: MiniMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !runestone.latitude || !runestone.longitude) return;

    const map = new Map({
      container: mapContainer.current,
      center: [runestone.longitude, runestone.latitude],
      zoom: 14,
      style: 'https://tiles.openfreemap.org/styles/bright',
      interactive: false, // Disable interactions for mini-map
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add a marker for the runestone
      const marker = document.createElement('div');
      marker.className = 'w-6 h-6 bg-red-500 border-2 border-white rounded-full shadow-lg';
      marker.style.transform = 'translate(-50%, -50%)';

      new Marker(marker).setLngLat([runestone.longitude, runestone.latitude]).addTo(map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [runestone]);

  if (!runestone.latitude || !runestone.longitude) {
    return (
      <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Location data not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-primary-700 text-lg">Location</h3>
      </div>
      <div ref={mapContainer} className="h-48 w-full" />
    </div>
  );
};
