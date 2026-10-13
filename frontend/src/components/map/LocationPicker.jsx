import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

const LocationPicker = ({ position, onSelectPosition, defaultCenter = [13.0827, 80.2707] }) => {
  const [markerPos, setMarkerPos] = useState(position || defaultCenter);

  const handleClick = (latlng) => {
    const coords = [latlng.lat, latlng.lng];
    setMarkerPos(coords);
    if (onSelectPosition) {
      onSelectPosition({ lat: latlng.lat, lng: latlng.lng });
    }
  };

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-300 relative">
      <MapContainer
        center={markerPos}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={handleClick} />
        {markerPos && <Marker position={markerPos} />}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] text-slate-700 shadow-xs border border-slate-200">
        Click map to pinpoint precise location
      </div>
    </div>
  );
};

export default LocationPicker;
