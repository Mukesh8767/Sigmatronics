import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapComponentProps {
  latlngs: [number, number][];
}

const ChangeView: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 13, {
      duration: 1.5,
    });
  }, [coords, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ latlngs }) => {
  if (latlngs.length === 0) return null;

  const lastCoord = latlngs[latlngs.length - 1];

  return (
    <MapContainer
      center={lastCoord}
      zoom={13}
      scrollWheelZoom={true}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '12px',
        marginBottom: '2rem',
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {latlngs.map((pos, idx) => (
        <Marker key={idx} position={pos} icon={markerIcon} />
      ))}
      <Polyline positions={latlngs} color="blue" />
      <ChangeView coords={lastCoord} />
    </MapContainer>
  );
};

export default React.memo(MapComponent);
