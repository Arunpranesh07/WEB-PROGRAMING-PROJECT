import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';

// Fix for default Leaflet icon paths in React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin markers
const createColorIcon = (color) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const statusColors = {
  'Pending': '#f59e0b',     // Amber
  'In Progress': '#0284c7', // Sky Blue
  'Resolved': '#10b981',    // Emerald Green
};

const CommunityMap = ({ complaints = [], center = [13.0827, 80.2707], zoom = 15 }) => {
  // Find leakage locations for hotspot circles
  const leakages = complaints.filter(
    (c) => c.category === 'Leakage' && c.status !== 'Resolved' && c.latitude && c.longitude
  );

  return (
    <div className="w-full h-full min-h-[450px] relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full min-h-[450px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Leakage Hotspots Circles */}
        {leakages.map((leak) => (
          <Circle
            key={`circle-${leak.complaint_id}`}
            center={[leak.latitude, leak.longitude]}
            radius={80}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#f87171',
              fillOpacity: 0.25,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />
        ))}

        {/* Complaint Markers */}
        {complaints.map((c) => {
          if (!c.latitude || !c.longitude) return null;
          const markerColor = statusColors[c.status] || '#64748b';
          const icon = createColorIcon(markerColor);

          return (
            <Marker key={c.complaint_id} position={[c.latitude, c.longitude]} icon={icon}>
              <Popup>
                <div className="p-1 space-y-1.5 min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ocean-700 text-xs">{c.display_id}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800">{c.category}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{c.description}</p>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
                    <span>📍 {c.location}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default CommunityMap;
