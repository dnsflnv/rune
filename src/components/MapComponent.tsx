import { useEffect, useRef, useState, useCallback } from 'react';
import { GeolocateControl, Map, GeoJSONSource } from 'maplibre-gl';
import { supabaseRunestones } from '../services/supabaseRunestones';
import { runestonesCache } from '../services/runestonesCache';
import { Runestone, RunestoneFeature, RunestoneGeoJSON } from '../types';
import { RunestoneModal } from './RunestoneModal';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';
import { searchStore } from '../stores/searchStore';

// Cluster styling constants
const CLUSTER_COLORS = {
  SMALL: '#8B4513', // Dark brown for clusters with < 100 points
  MEDIUM: '#A0522D', // Medium brown for clusters with 100-750 points
  LARGE: '#CD853F', // Light brown for clusters with > 750 points
} as const;

const CLUSTER_RADIUSES = {
  SMALL: 20, // Radius for clusters with < 100 points
  MEDIUM: 30, // Radius for clusters with 100-750 points
  LARGE: 40, // Radius for clusters with > 750 points
} as const;

const CLUSTER_THRESHOLDS = {
  MEDIUM: 100, // Threshold for medium clusters
  LARGE: 750, // Threshold for large clusters
} as const;

interface MapComponentProps {
  onVisitedCountChange?: (count: number) => void;
}

export const MapComponent = observer(({ onVisitedCountChange }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const eventListenersAddedRef = useRef<boolean>(false);
  const styleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [runestones, setRunestones] = useState<Runestone[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [selectedRunestone, setSelectedRunestone] = useState<Runestone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open modal with a runestone
  const openModal = (runestone: Runestone) => {
    setSelectedRunestone(runestone);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRunestone(null);
  };

  // Function to refresh visited status
  const refreshVisitedStatus = useCallback(async () => {
    if (runestones.length === 0 || !authStore.user) return;

    try {
      // Fetch visited runestones
      const visitedRunestones = await supabaseRunestones.getAllVisitedRunestones();

      // Create a set of visited runestone IDs for quick lookup
      const visitedIds = new Set(visitedRunestones.map((rs) => rs.id));

      // Update runestones with new visited status
      setRunestones((prevRunestones) =>
        prevRunestones.map((runestone) => ({
          ...runestone,
          visited: visitedIds.has(runestone.id),
        }))
      );
    } catch (error) {
      console.error('Error refreshing visited status:', error);
    }
  }, [runestones.length]);

  const fetchAllRunestones = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all runestones from IDB cache (which will fall back to Supabase if needed)
      const allRunestones = await runestonesCache.getAllRunestones();

      // Fetch visited runestones only if user is logged in
      let visitedRunestones: Runestone[] = [];
      if (authStore.user) {
        try {
          visitedRunestones = await supabaseRunestones.getAllVisitedRunestones();
        } catch (error) {
          console.error('Error fetching visited runestones:', error);
        }
      }

      // Create a set of visited runestone IDs for quick lookup
      const visitedIds = new Set(visitedRunestones.map((rs) => rs.id));

      // Merge visited status with runestone data
      const runestonesWithVisitedStatus = allRunestones.map((runestone) => ({
        ...runestone,
        visited: visitedIds.has(runestone.id),
      }));

      setRunestones(runestonesWithVisitedStatus);
    } catch (error) {
      console.error('Error fetching runestones:', error);
    } finally {
      setLoading(false);
    }
  }, [authStore.user]);

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
            visited: stone.visited || false,
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
      if (map.getLayer('unclustered-point-unvisited')) {
        map.removeLayer('unclustered-point-unvisited');
      }
      if (map.getLayer('unclustered-point-visited')) {
        map.removeLayer('unclustered-point-visited');
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
            CLUSTER_COLORS.SMALL,
            CLUSTER_THRESHOLDS.MEDIUM,
            CLUSTER_COLORS.MEDIUM,
            CLUSTER_THRESHOLDS.LARGE,
            CLUSTER_COLORS.LARGE,
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            CLUSTER_RADIUSES.SMALL,
            CLUSTER_THRESHOLDS.MEDIUM,
            CLUSTER_RADIUSES.MEDIUM,
            CLUSTER_THRESHOLDS.LARGE,
            CLUSTER_RADIUSES.LARGE,
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

      // Add individual runestone points (unclustered) - unvisited runestones
      map.addLayer({
        id: 'unclustered-point-unvisited',
        type: 'circle',
        source: 'runestones',
        filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'visited'], false]],
        paint: {
          'circle-color': '#FF0000',
          'circle-radius': 9,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
        },
      });

      // Add individual runestone points (unclustered) - visited runestones
      map.addLayer({
        id: 'unclustered-point-visited',
        type: 'circle',
        source: 'runestones',
        filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'visited'], true]],
        paint: {
          'circle-color': '#00FF00',
          'circle-radius': 9,
          'circle-stroke-width': 3,
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

        // Click event for individual runestones - open modal (both visited and unvisited)
        map.on('click', 'unclustered-point-unvisited', (e) => {
          const feature = e.features?.[0];
          if (!feature || !feature.geometry || feature.geometry.type !== 'Point') return;

          const properties = feature.properties!;

          // Find the full runestone data using the id
          const runestone = runestones.find((stone) => stone.id === properties.id);
          if (!runestone) return;

          // Open the modal with this runestone
          openModal(runestone);
        });

        map.on('click', 'unclustered-point-visited', (e) => {
          const feature = e.features?.[0];
          if (!feature || !feature.geometry || feature.geometry.type !== 'Point') return;

          const properties = feature.properties!;

          // Find the full runestone data using the id
          const runestone = runestones.find((stone) => stone.id === properties.id);
          if (!runestone) return;

          // Open the modal with this runestone
          openModal(runestone);
        });

        // Change cursor to pointer when hovering over clusters or points
        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'unclustered-point-unvisited', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point-unvisited', () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'unclustered-point-visited', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point-visited', () => {
          map.getCanvas().style.cursor = '';
        });
      }
    } catch (error) {
      console.error('Error adding clustering layers:', error);
    }
  }, [runestones, createGeoJSONData]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      const map = new Map({
        container: mapContainer.current!,
        center: [18.0686, 59.4293], // Jarlabanke bridge
        zoom: 13,
        style: 'https://tiles.openfreemap.org/styles/bright',
      });

      mapRef.current = map;

      // Fetch all runestones when map loads initially
      map.on('load', () => {
        fetchAllRunestones();
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
      if (styleTimeoutRef.current) {
        clearTimeout(styleTimeoutRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [fetchAllRunestones]);

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

  // Refresh visited status when authentication state changes
  useEffect(() => {
    if (runestones.length > 0 && !authStore.loading) {
      refreshVisitedStatus();
    }
  }, [authStore.user, authStore.loading, runestones.length, refreshVisitedStatus]);

  // Immediately refresh visited status when user logs in
  useEffect(() => {
    if (authStore.user && runestones.length > 0 && !authStore.loading) {
      // Small delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        refreshVisitedStatus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authStore.user, runestones.length, authStore.loading, refreshVisitedStatus]);

  // Clear visited status when user logs out
  useEffect(() => {
    if (runestones.length > 0 && !authStore.user && !authStore.loading) {
      // When user logs out, mark all runestones as unvisited
      setRunestones((prevRunestones) =>
        prevRunestones.map((runestone) => ({
          ...runestone,
          visited: false,
        }))
      );
    }
  }, [authStore.user, authStore.loading, runestones.length]);

  // Refetch runestones when authentication state changes (to get visited status)
  useEffect(() => {
    if (!authStore.loading && runestones.length > 0) {
      fetchAllRunestones();
    }
  }, [authStore.user, authStore.loading, fetchAllRunestones]);

  useEffect(() => {
    if (onVisitedCountChange) {
      const visitedCount = runestones.filter((runestone) => runestone.visited).length;
      onVisitedCountChange(visitedCount);
    }
  }, [onVisitedCountChange, runestones]);

  // Navigate to selected runestone
  useEffect(() => {
    if (searchStore.selectedRunestone && mapRef.current) {
      const map = mapRef.current;

      // Fly to the runestone's location
      map.flyTo({
        center: [searchStore.selectedRunestone.longitude, searchStore.selectedRunestone.latitude],
        zoom: 16, // Close zoom to show the runestone clearly
        duration: 2000, // 2 second animation
      });

      // Open the modal for the selected runestone
      openModal(searchStore.selectedRunestone);
      searchStore.setSelectedRunestone(null); // Clear selected runestone after navigation
    }
  }, [searchStore.selectedRunestone]);

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

      {/* Runestone Modal */}
      <RunestoneModal
        runestone={selectedRunestone}
        isOpen={isModalOpen}
        onClose={closeModal}
        onVisitedStatusChange={refreshVisitedStatus}
      />
    </div>
  );
});
