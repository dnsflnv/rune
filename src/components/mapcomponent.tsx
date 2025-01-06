import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useEffect, useState } from 'react';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Overlay from 'ol/Overlay';
import XYZ from 'ol/source/XYZ';
import '/src/style.css';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Marker {
  signum: string;
  geom: {
    type: string;
    coordinates: number[];
  };
}

export const MapComponent = () => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [mapState, setMap] = useState<Map | null>(null);

  const fetchVisibleMarkers = async (extent: number[]) => {
    const [minLon, minLat, maxLon, maxLat] = extent.map((coord, i) => {
      const [lon, lat] = fromLonLat([coord, extent[i + 1]], 'EPSG:4326');
      return i % 2 === 0 ? lon : lat;
    });

    const { data, error } = await supabase.schema('rune').rpc('get_visible_markers', {
      max_lat: maxLat,
      max_lon: maxLon,
      min_lat: minLat,
      min_lon: minLon,
    });

    if (error) {
      console.error('Error fetching markers:', error);
      return;
    }

    if (data) {
      setMarkers(data);
    }
  };

  useEffect(() => {
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
            attributions: '© OpenTopoMap contributors',
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([18.0686, 59.3293]),
        zoom: 13,
      }),
    });

    // Create popup elements
    const container = document.createElement('div');
    container.className = 'ol-popup';
    const content = document.createElement('div');
    content.id = 'popup-content';
    container.appendChild(content);

    // Create overlay for popup
    const overlay = new Overlay({
      element: container,
      autoPan: true,
      positioning: 'bottom-center',
    });
    map.addOverlay(overlay);

    // Add vector layer for markers
    const markerLayer = new VectorLayer({
      source: new VectorSource({
        features: markers.map(
          (marker) =>
            new Feature({
              geometry: new Point(fromLonLat(marker.geom.coordinates)),
              name: marker.signum,
              description: marker.signum,
            })
        ),
      }),
    });

    const markerStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'https://openlayers.org/en/latest/examples/data/icon.png',
      }),
    });

    markerLayer.setStyle(markerStyle);

    map.addLayer(markerLayer);

    // Add click handler
    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);

      if (feature) {
        const geometry = feature.getGeometry();
        const coordinates = geometry instanceof Point ? geometry.getCoordinates() : undefined;
        content.innerHTML = `<div style="
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 7px 1px rgba(0,0,0,0.3);
          font-family: Arial, sans-serif;
          min-width: 200px;
          max-width: 300px;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin: 0 auto;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid white;
            transform: none;
          "></div>
          <h3 style="
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #202124;
          ">${feature.get('name')}</h3>
          <p style="
            margin: 0;
            font-size: 14px;
            color: #5f6368;
            line-height: 1.5;
          ">${feature.get('description')}</p>
        </div>`;
        overlay.setPosition(coordinates);
      } else {
        overlay.setPosition(undefined);
      }
    });

    map.on('moveend', () => {
      const extent = map.getView().calculateExtent(map.getSize());
      fetchVisibleMarkers(extent);
    });

    setMap(map);

    return () => {
      map.setTarget(undefined);
    };
  }, [markers]);

  return <div id="map"></div>;
};
