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
import 'ol/ol.css';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Overlay from 'ol/Overlay';

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
        features: [
          new Feature({
            geometry: new Point(fromLonLat([18.0686, 59.3293])),
            name: 'Marker 1',
            description: 'This is marker 1'
          }),
          new Feature({
            geometry: new Point(fromLonLat([18.0686, 59.3293])),
            name: 'Marker 2',
            description: 'This is marker 2<br> sdflasfasdfsdfsadf'
          })
        ]
      })
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

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div id="map" style={{ 
      width: '100%', 
      height: 'calc(100vh - 130px)',
      filter: 'grayscale(30%)'
    }}></div>
  );
};
