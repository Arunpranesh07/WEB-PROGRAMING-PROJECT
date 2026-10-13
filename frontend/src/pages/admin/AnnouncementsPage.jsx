import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Megaphone, Send, AlertTriangle, Info, Wrench, CheckCircle } from 'lucide-react';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Shortage',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');
    try {
      await api.post('/announcements', formData);
      setFormData({ title: '', message: '', type: 'Shortage' });
      setSuccessMsg('Announcement successfully published! All registered residents have received an alert notification.');
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to post announcement', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Community Announcements & Emergency Broadcasts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Issue water shortage alerts, booster maintenance notices, or conservation advisories to all residents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-ocean-700">
            <Megaphone className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">Broadcast Notice</h2>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handlePost} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notice Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 font-semibold"
              >
                <option value="Shortage">Water Shortage Alert (Critical)</option>
                <option value="Maintenance">Maintenance & Pump Servicing</option>
                <option value="General">General Community Advisory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Headline</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Low Pressure Notice for Block B"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Explain the disruption cause, expected resumption timeline, and instructions for residents..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-ocean-600 hover:bg-ocean-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Broadcasting...' : 'Broadcast to All Residents'}</span>
            </button>
          </form>
        </div>

        {/* Existing Announcements Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Broadcast History</h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading announcements feed...</div>
          ) : announcements.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No announcements broadcasted yet.</div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => {
                const isShortage = a.type === 'Shortage';
                const isMaintenance = a.type === 'Maintenance';

                return (
                  <div
                    key={a.announcement_id}
                    className={`p-4 rounded-xl border transition ${
                      isShortage
                        ? 'bg-rose-50/40 border-rose-200'
                        : isMaintenance
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isShortage
                            ? 'bg-rose-100 text-rose-800'
                            : isMaintenance
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-ocean-100 text-ocean-800'
                        }`}
                      >
                        {a.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900">{a.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
