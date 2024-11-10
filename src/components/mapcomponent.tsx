import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useEffect } from 'react';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';

export const MapComponent = () => {
  useEffect(() => {
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([18.0686, 59.3293]),
        zoom: 13,
      }),
    });

    // Add vector layer for markers
    const markerLayer = new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature({
            geometry: new Point(fromLonLat([18.0686, 59.3293])),
          }),
          new Feature({
            geometry: new Point(fromLonLat([18.0686, 59.3293])), 
          })
        ]
      })
    });

    map.addLayer(markerLayer);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div id="map"></div>
  );
};

