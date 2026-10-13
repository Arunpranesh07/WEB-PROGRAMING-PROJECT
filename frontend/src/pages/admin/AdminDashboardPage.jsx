import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { 
  Droplet, AlertCircle, CheckCircle2, Clock, 
  Activity, Users, Calendar, ArrowRight, Radio, BatteryCharging 
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, complaintsRes, sensorsRes] = await Promise.all([
          api.get('/complaints/stats'),
          api.get('/complaints'),
          api.get('/sensors/latest').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setRecentComplaints(complaintsRes.data.slice(0, 6));
        setSensors(sensorsRes.data);
      } catch (err) {
        console.error('Error fetching admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading Facility Operations console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl font-bold text-slate-900">Facility Operations Command</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time community water dispatch, technician workload, and telemetry overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/complaints"
            className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Manage Complaints
          </Link>
          <Link
            to="/admin/announcements"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Post Announcement
          </Link>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Logged</span>
            <Droplet className="w-4 h-4 text-ocean-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">All recorded tickets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.pending}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Requires staff assignment</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-sky-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-sky-600">{stats.in_progress}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active on-site repairs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.resolved}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Successfully closed</span>
        </div>
      </div>

      {/* IoT Live Sensor Telemetry Monitor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">IoT Flow & Tank Telemetry Monitor</h2>
              <p className="text-xs text-slate-500">Live hardware readings from community booster pumps</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Telemetry Stream Active
          </span>
        </div>

        {sensors.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No sensor telemetry received yet. Run sensor simulation script to stream data.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {sensors.map((sensor) => (
              <div key={sensor.reading_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-ocean-700">{sensor.sensor_id}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(sensor.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 truncate">{sensor.location}</h4>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tank Level</span>
                    <span className="font-bold text-slate-800">{sensor.tank_level}%</span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sensor.tank_level < 30 ? 'bg-rose-500' : sensor.tank_level < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${sensor.tank_level}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Flow Rate</span>
                    <span className="font-bold text-ocean-700">{sensor.flow_rate} L/m</span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      🔋 {sensor.battery_level}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Community Incidents</h2>
            <p className="text-xs text-slate-500">Live queue requiring review and resolution</p>
          </div>
          <Link to="/admin/complaints" className="text-xs font-semibold text-ocean-600 hover:text-ocean-700 flex items-center gap-1">
            Open Full Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Resident</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <tr key={c.complaint_id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-ocean-700">{c.display_id}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-medium">{c.user_name || 'Resident'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{c.category}</td>
                  <td className="py-2.5 px-3 text-slate-500">{c.location}</td>
                  <td className="py-2.5 px-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="py-2.5 px-3"><StatusBadge status={c.status} /></td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {c.assignments && c.assignments.length > 0 ? (
                      <span className="font-semibold text-slate-800">{c.assignments[0].staff_name}</span>
                    ) : (
                      <span className="text-amber-600 font-medium italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
