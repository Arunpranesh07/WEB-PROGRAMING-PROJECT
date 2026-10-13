import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

const WaterSupplyPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/supply', {
        params: {
          area: areaFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [areaFilter, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Community Water Supply Timetable</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor scheduled overhead tank and municipal pipeline supply distribution across blocks.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          placeholder="Filter by Block or Area..."
          className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 w-full sm:w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 text-slate-700 font-medium"
        >
          <option value="">All Availability Statuses</option>
          <option value="Available">Available</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Interrupted">Interrupted</option>
        </select>
      </div>

      {/* Schedules Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading water supply timetable...</div>
      ) : schedules.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No water supply schedules found for the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((s) => {
            const isAvailable = s.availability_status === 'Available';
            const isInterrupted = s.availability_status === 'Interrupted';

            return (
              <div
                key={s.supply_id}
                className={`p-5 rounded-2xl border transition shadow-2xs ${
                  isAvailable
                    ? 'bg-white border-emerald-200'
                    : isInterrupted
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-700'
                          : isInterrupted
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-ocean-100 text-ocean-700'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{s.area_name}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInterrupted
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {s.availability_status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Timing:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Date:
                    </span>
                    <span className="font-medium text-slate-700">{s.supply_date}</span>
                  </div>
                </div>

                {isInterrupted && (
                  <p className="text-[11px] text-rose-600 mt-3 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Supply interrupted due to pipeline maintenance.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WaterSupplyPage;
