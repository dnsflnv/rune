import { useEffect, useRef, useState, useCallback } from 'react';
import { GeolocateControl, Map, Popup, GeoJSONSource } from 'maplibre-gl';
import { runestonesCache } from '../services/runestonesCache';
import { getRunestonePopupHTML } from './RunestonePopup';
import { Runestone, RunestoneFeature, RunestoneGeoJSON } from '../types';

interface MapComponentProps {
  onRunestoneCountChange?: (count: number) => void;
}

export const MapComponent = ({ onRunestoneCountChange }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentPopupRef = useRef<Popup | null>(null);
  const eventListenersAddedRef = useRef<boolean>(false);
  const styleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [runestones, setRunestones] = useState<Runestone[]>([]);
  const [loading, setLoading] = useState(false);

  const closeCurrentPopup = useCallback(() => {
    if (currentPopupRef.current) {
      currentPopupRef.current.remove();
      currentPopupRef.current = null;
    }
  }, []);

  const createPopup = useCallback(
    (coordinates: [number, number], htmlContent: string) => {
      closeCurrentPopup();
      const popup = new Popup({ closeButton: true, closeOnClick: false }).setLngLat(coordinates).setHTML(htmlContent);

      currentPopupRef.current = popup;
      return popup;
    },
    [closeCurrentPopup]
  );

  const fetchVisibleRunestones = useCallback(async (bounds: [number, number, number, number]) => {
    setLoading(true);
    try {
      // Try to get data from cache first
      const cachedData = await runestonesCache.getRunestones(bounds);
      setRunestones(cachedData);
    } catch (error) {
      console.error('Error fetching runestones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchVisibleRunestones = useCallback(
    (bounds: [number, number, number, number]) => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }

      moveTimeoutRef.current = setTimeout(() => {
        fetchVisibleRunestones(bounds);
      }, 300); // 300ms debounce
    },
    [fetchVisibleRunestones]
  );

  const createGeoJSONData = useCallback((stones: Runestone[]): RunestoneGeoJSON => {
    // Check for and remove duplicates based on id
    const uniqueStones = stones.filter((stone, index, arr) => arr.findIndex((s) => s.id === stone.id) === index);

    // Group stones by coordinates to handle overlapping locations
    const coordinateGroups = uniqueStones.reduce((acc: Record<string, Runestone[]>, stone) => {
      const coordKey = `${stone.longitude.toFixed(6)},${stone.latitude.toFixed(6)}`;
      acc[coordKey] = acc[coordKey] || [];
      acc[coordKey].push(stone);
      return acc;
    }, {});

    // Create features with slight offsets for overlapping stones
    const features: RunestoneFeature[] = [];
    Object.values(coordinateGroups).forEach((stonesAtLocation) => {
      stonesAtLocation.forEach((stone, index) => {
        // Add small offset for overlapping stones (except the first one)
        const offset = index * 0.00005; // Very small offset (~5.5 meters)
        const offsetLng = stone.longitude + (index > 0 ? offset * Math.cos(index) : 0);
        const offsetLat = stone.latitude + (index > 0 ? offset * Math.sin(index) : 0);

        features.push({
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
            overlapping_count: stonesAtLocation.length,
            original_coordinates: [stone.longitude, stone.latitude],
          },
          geometry: {
            type: 'Point',
            coordinates: [offsetLng, offsetLat],
          },
        });
      });
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }, []);

  const updateClusters = useCallback(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Make sure the map style is loaded before adding layers
    if (!map.isStyleLoaded()) {
      // Reset event listeners flag since style is changing
      eventListenersAddedRef.current = false;

      // Clear any existing timeout to prevent multiple timeouts
      if (styleTimeoutRef.current) {
        clearTimeout(styleTimeoutRef.current);
      }

      // Add timeout fallback in case styledata never fires (e.g., due to OpenFreeMap connectivity issues)
      styleTimeoutRef.current = setTimeout(() => {
        console.warn('Style loading timeout, attempting to add layers anyway');
        styleTimeoutRef.current = null; // Clear the reference
        if (mapRef.current && mapRef.current.isStyleLoaded()) {
          updateClusters();
        } else {
          console.error('Style failed to load completely. Skipping layer addition to prevent infinite loop.');
        }
      }, 10000); // 10 second timeout

      map.once('styledata', () => {
        if (styleTimeoutRef.current) {
          clearTimeout(styleTimeoutRef.current);
          styleTimeoutRef.current = null;
        }
        updateClusters();
      });
      return;
    }

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
      console.error('Error removing layers:', error);
    }

    // Create clustering approach
    const geoJsonData = createGeoJSONData(runestones);

    try {
      // Check if source already exists and try to update it first
      const existingSource = map.getSource('runestones') as GeoJSONSource;
      if (existingSource) {
        existingSource.setData(geoJsonData);
        return;
      }

      // Add source with clustering
      map.addSource('runestones', {
        type: 'geojson',
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

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

      // Add cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'runestones',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count}',
          'text-size': 12,
          'text-font': ['Noto Sans Regular'],
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

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

      // Add event listeners (only add once per component lifecycle)
      if (!eventListenersAddedRef.current) {
        eventListenersAddedRef.current = true;

        // Click event for clusters - zoom in
        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          });
          const clusterId = features[0].properties?.cluster_id;
          const source = map.getSource('runestones') as GeoJSONSource;

          if (source && clusterId !== undefined) {
            source
              .getClusterExpansionZoom(clusterId)
              .then((zoom: number) => {
                const coordinates = (features[0].geometry as unknown as { coordinates: [number, number] }).coordinates;
                map.easeTo({
                  center: coordinates,
                  zoom: zoom,
                });
              })
              .catch((err: Error) => {
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

          // Find the full runestone data using the id
          const runestone = runestones.find((stone) => stone.id === properties.id);
          if (!runestone) return;

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          const popupContent = getRunestonePopupHTML(runestone);

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
        style: 'https://tiles.openfreemap.org/styles/bright',
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
          bounds.getNorth() + 0.1,
        ];
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
          bounds.getNorth() + 0.1,
        ];
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
      if (styleTimeoutRef.current) {
        clearTimeout(styleTimeoutRef.current);
      }
      closeCurrentPopup();
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [debouncedFetchVisibleRunestones, fetchVisibleRunestones, closeCurrentPopup]);

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
