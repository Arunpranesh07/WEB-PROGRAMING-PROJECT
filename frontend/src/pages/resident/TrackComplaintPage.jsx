import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { 
  Search, CheckCircle2, Clock, Wrench, AlertCircle, 
  MapPin, UserCheck, Calendar, Phone, Image as ImageIcon 
} from 'lucide-react';

const TrackComplaintPage = () => {
  const [searchParams] = useSearchParams();
  const [queryId, setQueryId] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaint = async (idToSearch) => {
    const id = idToSearch || queryId;
    if (!id.trim()) return;

    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const res = await api.get(`/complaints/${id.trim()}`);
      setComplaint(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'No complaint found with this ID');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialId = searchParams.get('id');
    if (initialId) {
      setQueryId(initialId);
      fetchComplaint(initialId);
    }
  }, [searchParams]);

  const getTimelineSteps = () => {
    if (!complaint) return [];

    const isAssigned = complaint.assignments && complaint.assignments.length > 0;
    const isInProgress = complaint.status === 'In Progress' || complaint.status === 'Resolved';
    const isResolved = complaint.status === 'Resolved';

    return [
      {
        title: 'Report Submitted',
        desc: complaint.created_at ? new Date(complaint.created_at).toLocaleString() : 'Registered',
        status: 'done',
        icon: CheckCircle2,
      },
      {
        title: 'Staff Assigned',
        desc: isAssigned
          ? `${complaint.assignments[0].staff_name} (${complaint.assignments[0].specialization})`
          : 'Pending staff assignment',
        status: isAssigned ? 'done' : 'pending',
        icon: UserCheck,
      },
      {
        title: 'Work In Progress',
        desc: isInProgress ? 'Technician attending on site' : 'Queued for maintenance',
        status: isInProgress ? 'done' : 'pending',
        icon: Wrench,
      },
      {
        title: 'Resolved',
        desc: isResolved
          ? complaint.assignments?.[0]?.completed_at
            ? `Completed at ${new Date(complaint.assignments[0].completed_at).toLocaleString()}`
            : 'Issue marked resolved'
          : 'Final resolution pending verification',
        status: isResolved ? 'done' : 'pending',
        icon: CheckCircle2,
      },
    ];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Track Water Complaint</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your WCP Complaint ID to view live repair progress and assigned staff details.
        </p>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchComplaint();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            placeholder="Enter Complaint ID (e.g. WCP1001)"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 shadow-2xs font-mono uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !queryId.trim()}
          className="px-6 py-2.5 bg-ocean-600 hover:bg-ocean-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xs transition"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaint Detail Card */}
      {complaint && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold text-ocean-900 tracking-wider">
                  {complaint.display_id}
                </span>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Reported on {new Date(complaint.created_at).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Category</span>
              <span className="text-sm font-bold text-slate-800">{complaint.category}</span>
            </div>
          </div>

          {/* Visual Step Tracker Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
              Resolution Milestone Timeline
            </h3>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-ocean-100 space-y-8 ml-3">
              {getTimelineSteps().map((step, idx) => {
                const Icon = step.icon;
                const isDone = step.status === 'done';
                return (
                  <div key={idx} className="relative group">
                    {/* Circle marker on line */}
                    <div
                      className={`absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition ${
                        isDone
                          ? 'bg-ocean-600 text-white shadow-xs shadow-ocean-600/30'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <h4 className={`text-sm font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Staff Assignment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-xs">
            {/* Description & Location */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Location</span>
                <span className="text-slate-800 font-medium">📍 {complaint.location}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Description</span>
                <p className="text-slate-700 leading-relaxed mt-0.5">{complaint.description}</p>
              </div>
              {complaint.duplicate_display_id && (
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  Linked as duplicate with parent complaint: <strong>{complaint.duplicate_display_id}</strong>
                </div>
              )}
            </div>

            {/* Assigned Staff or Image Preview */}
            <div className="space-y-3">
              {complaint.assignments && complaint.assignments.length > 0 ? (
                <div className="bg-ocean-50/60 border border-ocean-100 p-4 rounded-2xl space-y-2">
                  <span className="text-ocean-800 font-bold uppercase text-[10px] block">
                    Assigned Technician
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-ocean-200 text-ocean-800 flex items-center justify-center font-bold">
                      {complaint.assignments[0].staff_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{complaint.assignments[0].staff_name}</h4>
                      <p className="text-slate-500 text-[11px]">{complaint.assignments[0].specialization}</p>
                      <p className="text-ocean-700 font-semibold text-[11px] mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {complaint.assignments[0].phone}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl text-center text-slate-400 py-6">
                  Technician assignment in progress. Facility admin will designate a specialist shortly.
                </div>
              )}

              {/* Photo attachment preview */}
              {complaint.image_url && (
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px] mb-1">
                    Attached Incident Photo
                  </span>
                  <img
                    src={complaint.image_url}
                    alt="Complaint"
                    className="max-h-40 rounded-xl border border-slate-200 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaintPage;
