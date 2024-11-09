import { LayerGroup, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const MapComponent = () => 
   (
    <MapContainer
        center={[59.4439, 18.0703]}
        zoom={13}
        style={{ height: '80vh', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
      <LayerGroup>
        <Marker position={[59.4439, 18.0703]}>
          <Popup>
            A marker in Stockholm
          </Popup>
        </Marker>
        <Marker position={[59.4429, 18.0723]}>
          <Popup>
            Another nearby marker
          </Popup>
        </Marker>
      </LayerGroup>
    </MapContainer>
  );

