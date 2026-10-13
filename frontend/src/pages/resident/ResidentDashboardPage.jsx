import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { 
  Droplet, AlertCircle, CheckCircle, Clock, Calendar, 
  PlusCircle, Search, MapPin, ArrowRight, Lightbulb, Bell 
} from 'lucide-react';

const ResidentDashboardPage = () => {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [complaints, setComplaints] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, statsRes, supplyRes] = await Promise.all([
          api.get('/complaints'),
          api.get('/complaints/stats'),
          api.get('/supply'),
        ]);
        setComplaints(complaintsRes.data.slice(0, 5)); // recent 5
        setStats(statsRes.data);
        setSchedules(supplyRes.data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const conservationTips = [
    {
      title: "Check for Hidden Leaks",
      tip: "Monitor your apartment water meter before and after 2 hours of no water use. If it changed, there is an unseen leak."
    },
    {
      title: "Install Faucet Aerators",
      tip: "Aerators can reduce kitchen and sink faucet flow from 15 L/min down to 6 L/min without sacrificing water pressure."
    },
    {
      title: "Report Common Leaks Quickly",
      tip: "A single broken common riser or pump leak can deplete overhead tanks in under 3 hours. Report immediately!"
    }
  ];

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading community water dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-ocean-700 via-ocean-600 to-aqua-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
            <span>Apartment Community Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-ocean-100 leading-relaxed">
            Registered Address: <span className="font-semibold text-white">{user?.address || 'Community Campus'}</span>.
            Check your area water schedule and report any plumbing disruptions below.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/resident/submit"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-ocean-700 hover:bg-ocean-50 rounded-xl font-semibold text-sm shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report New Problem</span>
            </Link>
            <Link
              to="/resident/track"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm backdrop-blur-md transition"
            >
              <Search className="w-4 h-4" />
              <span>Track Complaint ID</span>
            </Link>
            <Link
              to="/resident/map"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm backdrop-blur-md transition"
            >
              <MapPin className="w-4 h-4" />
              <span>Community Map</span>
            </Link>
          </div>
        </div>

        {/* Decorative water icon in banner */}
        <Droplet className="absolute -right-8 -bottom-10 w-64 h-64 text-white/10 pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Filed</span>
            <Droplet className="w-4 h-4 text-ocean-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <span className="text-xs text-slate-400 mt-1 block">Your reported tickets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <span className="text-xs text-slate-400 mt-1 block">Awaiting assignment</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-sky-600">{stats.in_progress}</div>
          <span className="text-xs text-slate-400 mt-1 block">Staff attending to site</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
          <span className="text-xs text-slate-400 mt-1 block">Successfully closed</span>
        </div>
      </div>

      {/* Water Supply Schedules Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-ocean-50 text-ocean-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Current & Upcoming Water Supply</h2>
              <p className="text-xs text-slate-500">Real-time status of pipeline distribution</p>
            </div>
          </div>
          <Link to="/resident/supply" className="text-xs font-semibold text-ocean-600 hover:text-ocean-700 flex items-center gap-1">
            View All Schedules <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {schedules.map((s) => {
            const isAvailable = s.availability_status === 'Available';
            const isInterrupted = s.availability_status === 'Interrupted';
            return (
              <div
                key={s.supply_id}
                className={`p-4 rounded-xl border transition ${
                  isAvailable
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isInterrupted
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-800">{s.area_name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInterrupted
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {s.availability_status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">
                    {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Date: {s.supply_date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Complaints & Conservation Tips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Recent Complaints</h2>
              <p className="text-xs text-slate-500">Track current status of your submitted tickets</p>
            </div>
            <Link to="/resident/history" className="text-xs font-semibold text-ocean-600 hover:text-ocean-700 flex items-center gap-1">
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {complaints.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              You haven't filed any complaints yet. Everything seems normal!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <div key={c.complaint_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ocean-700 text-xs">{c.display_id}</span>
                      <span className="text-xs font-medium text-slate-700">• {c.category}</span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{c.description}</p>
                    <p className="text-[11px] text-slate-400">📍 {c.location}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={c.status} />
                    <Link
                      to={`/resident/track?id=${c.display_id}`}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-ocean-50 hover:text-ocean-700 text-slate-700 rounded-lg transition"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conservation Tips Card */}
        <div className="bg-gradient-to-br from-teal-50/80 to-ocean-50/80 border border-teal-200/60 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-teal-800">
            <Lightbulb className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold">Water Conservation Tips</h2>
          </div>

          <div className="space-y-3">
            {conservationTips.map((tip, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-teal-100 space-y-1">
                <h4 className="text-xs font-bold text-teal-900">{tip.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-teal-700 font-medium">
              💧 Every drop saved secures our community reservoir!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboardPage;
