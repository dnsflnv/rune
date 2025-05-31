import { useEffect, useRef, useState, useCallback } from 'react';
import { GeolocateControl, Map, Popup, GeoJSONSource, Marker } from 'maplibre-gl';
import { runestonesCache } from '../services/runestonesCache';

interface Runestone {
  id: number;
  signature_text: string;
  found_location: string;
  parish: string;
  district: string;
  municipality: string;
  current_location: string;
  material: string;
  material_type?: string;
  rune_type: string;
  dating: string;
  style: string;
  carver: string;
  latitude: number;
  longitude: number;
  english_translation?: string;
  swedish_translation?: string;
  norse_text?: string;
  transliteration?: string;
  lost: boolean;
  ornamental: boolean;
  recent: boolean;
}

interface RunestoneFeature {
  type: 'Feature';
  properties: {
    id: number;
    signature_text: string;
    found_location: string;
    parish: string;
    material: string;
    material_type?: string;
    rune_type: string;
    dating: string;
    english_translation?: string;
    swedish_translation?: string;
    norse_text?: string;
    transliteration?: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface RunestoneGeoJSON {
  type: 'FeatureCollection';
  features: RunestoneFeature[];
}

interface MapComponentProps {
  onRunestoneCountChange?: (count: number) => void;
}

export const MapComponent = ({ onRunestoneCountChange }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentPopupRef = useRef<Popup | null>(null);
  const [runestones, setRunestones] = useState<Runestone[]>([]);
  const [loading, setLoading] = useState(false);

  const closeCurrentPopup = useCallback(() => {
    if (currentPopupRef.current) {
      currentPopupRef.current.remove();
      currentPopupRef.current = null;
    }
  }, []);

  const createPopup = useCallback((coordinates: [number, number], htmlContent: string) => {
    closeCurrentPopup();
    const popup = new Popup({ closeButton: true, closeOnClick: false })
      .setLngLat(coordinates)
      .setHTML(htmlContent);
    
    currentPopupRef.current = popup;
    return popup;
  }, [closeCurrentPopup]);

  const fetchVisibleRunestones = useCallback(async (bounds: [number, number, number, number]) => {
    console.log('fetchVisibleRunestones called with bounds:', bounds);
    setLoading(true);
    try {
      // Try to get data from cache first
      const cachedData = await runestonesCache.getRunestones(bounds);
      console.log(`Loaded ${cachedData.length} runestones from cache/database`);
      console.log('Sample runestone data:', cachedData.slice(0, 2));
      setRunestones(cachedData);
    } catch (error) {
      console.error('Error fetching runestones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchVisibleRunestones = useCallback((bounds: [number, number, number, number]) => {
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
    
    moveTimeoutRef.current = setTimeout(() => {
      fetchVisibleRunestones(bounds);
    }, 300); // 300ms debounce
  }, [fetchVisibleRunestones]);

  const createGeoJSONData = useCallback((stones: Runestone[]): RunestoneGeoJSON => {
    return {
      type: 'FeatureCollection',
      features: stones.map((stone): RunestoneFeature => ({
        type: 'Feature',
        properties: {
          id: stone.id,
          signature_text: stone.signature_text,
          found_location: stone.found_location,
          parish: stone.parish,
          material: stone.material,
          material_type: stone.material_type,
          rune_type: stone.rune_type,
          dating: stone.dating,
          english_translation: stone.english_translation,
          swedish_translation: stone.swedish_translation,
          norse_text: stone.norse_text,
          transliteration: stone.transliteration,
        },
        geometry: {
          type: 'Point',
          coordinates: [stone.longitude, stone.latitude],
        },
      })),
    };
  }, []);

  const updateClusters = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    // Make sure the map style is loaded before adding layers
    if (!map.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting...');
      map.once('styledata', () => {
        updateClusters();
      });
      return;
    }

    console.log(`Updating with ${runestones.length} runestones`);

    // Remove existing layers and sources
    try {
      if (map.getLayer('clusters')) {
        map.removeLayer('clusters');
      }
      if (map.getLayer('cluster-count')) {
        map.removeLayer('cluster-count');
      }
      if (map.getLayer('unclustered-point')) {
        map.removeLayer('unclustered-point');
      }
      if (map.getSource('runestones')) {
        map.removeSource('runestones');
      }
    } catch (error) {
      console.log('Error removing existing layers/sources:', error);
    }

    // Create clustering approach
    const geoJsonData = createGeoJSONData(runestones);
    console.log('GeoJSON data sample:', geoJsonData.features.slice(0, 2));

    try {
      // Add source with clustering
      map.addSource('runestones', {
        type: 'geojson',
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

      console.log('Added runestones source successfully');

      // Add cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'runestones',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6', // Color for clusters with < 100 points
            100,
            '#f1f075', // Color for clusters with 100-750 points
            750,
            '#f28cb1', // Color for clusters with > 750 points
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // Radius for clusters with < 100 points
            100,
            30, // Radius for clusters with 100-750 points
            750,
            40, // Radius for clusters with > 750 points
          ],
        },
      });

      console.log('Added clusters layer successfully');

      // Add cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'runestones',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      console.log('Added cluster-count layer successfully');

      // Add individual runestone points (unclustered)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'runestones',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#FF0000',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      console.log('Added unclustered-point layer successfully');

      // Only add event listeners once
      if (!map.listens('click')) {
        // Click event for clusters - zoom in
        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          });
          const clusterId = features[0].properties?.cluster_id;
          const source = map.getSource('runestones') as GeoJSONSource;
          
          if (source && clusterId !== undefined) {
            source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
              const coordinates = (features[0].geometry as any).coordinates as [number, number];
              map.easeTo({
                center: coordinates,
                zoom: zoom,
              });
            }).catch((err: any) => {
              console.error('Error getting cluster expansion zoom:', err);
            });
          }
        });

        // Click event for individual runestones - show popup
        map.on('click', 'unclustered-point', (e) => {
          const feature = e.features?.[0];
          if (!feature || !feature.geometry || feature.geometry.type !== 'Point') return;
          
          const coordinates = feature.geometry.coordinates.slice() as [number, number];
          const properties = feature.properties!;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          const popupContent = `
            <div class="p-4 max-w-sm">
              <h3 class="font-bold text-xl mb-3 text-primary border-b border-gray-200 pb-2">${properties.signature_text}</h3>
              
              <div class="space-y-3">
                <div>
                  <h4 class="font-semibold text-sm text-gray-700 mb-1">Location</h4>
                  <p class="text-sm text-gray-600">${properties.found_location}</p>
                  <p class="text-xs text-gray-500">${properties.parish}</p>
                </div>
                
                <div>
                  <h4 class="font-semibold text-sm text-gray-700 mb-1">Details</h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div><span class="font-medium">Material:</span> ${properties.material || 'Unknown'}</div>
                    <div><span class="font-medium">Dating:</span> ${properties.dating || 'Unknown'}</div>
                    <div><span class="font-medium">Type:</span> ${properties.rune_type || 'Unknown'}</div>
                    <div><span class="font-medium">Style:</span> ${properties.material_type || 'Unknown'}</div>
                  </div>
                </div>
                
                ${properties.english_translation ? `
                <div>
                  <h4 class="font-semibold text-sm text-gray-700 mb-1">English Translation</h4>
                  <p class="text-sm text-gray-600 leading-relaxed">${properties.english_translation}</p>
                </div>
                ` : ''}
                
                ${properties.swedish_translation ? `
                <div>
                  <h4 class="font-semibold text-sm text-gray-700 mb-1">Swedish Translation</h4>
                  <p class="text-sm text-gray-600 leading-relaxed">${properties.swedish_translation}</p>
                </div>
                ` : ''}
                
                ${properties.norse_text ? `
                <div>
                  <h4 class="font-semibold text-sm text-gray-700 mb-1">Norse Text</h4>
                  <p class="text-sm text-gray-600 italic leading-relaxed">${properties.norse_text}</p>
                </div>
                ` : ''}
              </div>
            </div>
          `;

          createPopup(coordinates, popupContent).addTo(map);
        });

        // Change cursor to pointer when hovering over clusters or points
        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'unclustered-point', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point', () => {
          map.getCanvas().style.cursor = '';
        });
      }

    } catch (error) {
      console.error('Error adding clustering layers:', error);
    }
  }, [runestones, createGeoJSONData, createPopup]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      // Ensure cache is initialized before creating the map
      await runestonesCache.ensureCacheInitialized();
      const map = new Map({
        container: mapContainer.current!,
        center: [18.0686, 59.4293], // Jarlabanke bridge
        zoom: 13,
        style: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json',
      });

      mapRef.current = map;

      // Fetch runestones when map loads initially
      map.on('load', () => {
        const bounds = map.getBounds();
        // Smaller expansion for better performance
        const expandedBounds: [number, number, number, number] = [
          bounds.getWest() - 0.1, // Smaller expansion (~11km)
          bounds.getSouth() - 0.1,
          bounds.getEast() + 0.1,
          bounds.getNorth() + 0.1
        ];
        console.log('Fetching runestones for initial load with bounds:', expandedBounds);
        fetchVisibleRunestones(expandedBounds);
      });

      // Debounced fetch on map move
      map.on('moveend', () => {
        const bounds = map.getBounds();
        // Smaller expansion for better performance
        const expandedBounds: [number, number, number, number] = [
          bounds.getWest() - 0.1,
          bounds.getSouth() - 0.1,
          bounds.getEast() + 0.1,
          bounds.getNorth() + 0.1
        ];
        console.log('Map moved, debouncing fetch for bounds:', expandedBounds);
        debouncedFetchVisibleRunestones(expandedBounds);
      });

      map.addControl(
        new GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })
      );
    };

    initMap();

    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      closeCurrentPopup();
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [debouncedFetchVisibleRunestones, fetchVisibleRunestones]);

  // Update clusters when runestones change
  useEffect(() => {
    if (mapRef.current && runestones.length > 0) {
      // Add a small delay to ensure map is fully ready
      const timer = setTimeout(() => {
        updateClusters();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [updateClusters, runestones.length]);

  useEffect(() => {
    if (onRunestoneCountChange) {
      onRunestoneCountChange(runestones.length);
    }
  }, [onRunestoneCountChange, runestones.length]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg z-[1001]">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Loading runestones...</span>
          </div>
        </div>
      )}
    </div>
  );
};
