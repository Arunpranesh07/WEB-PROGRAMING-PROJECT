import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import CommunityMap from '../../components/map/CommunityMap';
import { MapPin, AlertCircle, Layers, Droplets } from 'lucide-react';

const CommunityMapPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapComplaints = async () => {
      setLoading(true);
      try {
        const res = await api.get('/complaints', {
          params: { category: categoryFilter || undefined },
        });
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapComplaints();
  }, [categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community GIS Water Map</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing reported pipeline leakages, quality issues, and active repair zones on OpenStreetMap.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {['', 'Leakage', 'Shortage', 'Water Quality'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-ocean-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === '' ? 'All Reports' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Map Card */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs h-[560px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Rendering OpenStreetMap geospatial layers...
          </div>
        ) : (
          <CommunityMap complaints={complaints} />
        )}
      </div>

      {/* Map Legend & Diagnostics Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
          <span className="text-slate-700 font-medium">Pending Inspection</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-xs" />
          <span className="text-slate-700 font-medium">In Progress (Technician Active)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" />
          <span className="text-slate-700 font-medium">Resolved Pipeline</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-rose-500 bg-rose-200/50" />
          <span className="text-slate-700 font-medium">Active Leakage Hotspot Radius</span>
        </div>
      </div>
    </div>
  );
};

export default CommunityMapPage;
