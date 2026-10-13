import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { 
  Search, Filter, UserCheck, CheckCircle2, Clock, 
  AlertTriangle, Image as ImageIcon, X, ArrowRight, GitMerge 
} from 'lucide-react';

const ComplaintManagementPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [assignModalComplaint, setAssignModalComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [photoModalUrl, setPhotoModalUrl] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const [compRes, staffRes] = await Promise.all([
        api.get('/complaints', {
          params: {
            status: statusFilter || undefined,
            category: categoryFilter || undefined,
            search: search || undefined,
          },
        }),
        api.get('/staff'),
      ]);
      setComplaints(compRes.data);
      setStaffList(staffRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await api.patch(`/complaints/${complaintId}/status`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handlePriorityChange = async (complaintId, newPriority) => {
    try {
      await api.patch(`/complaints/${complaintId}/priority`, { priority: newPriority });
      fetchComplaints();
    } catch (err) {
      console.error('Failed to update priority', err);
    }
  };

  const handleAssignStaff = async () => {
    if (!assignModalComplaint || !selectedStaffId) return;
    try {
      await api.post(`/complaints/${assignModalComplaint.complaint_id}/assign`, {
        staff_id: parseInt(selectedStaffId, 10),
      });
      setAssignModalComplaint(null);
      setSelectedStaffId('');
      fetchComplaints();
    } catch (err) {
      console.error('Failed to assign staff', err);
    }
  };

  const handleMergeDuplicate = async (complaintId, parentId) => {
    try {
      await api.post(`/complaints/${complaintId}/merge`, null, {
        params: { parent_id: parentId },
      });
      fetchComplaints();
    } catch (err) {
      console.error('Failed to merge duplicate', err);
    }
  };

  const handleDismissDuplicate = async (complaintId) => {
    try {
      await api.post(`/complaints/${complaintId}/dismiss-duplicate`);
      fetchComplaints();
    } catch (err) {
      console.error('Failed to dismiss duplicate', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Management Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch technicians, adjust complaint priority, evaluate duplicate reports, and verify resolution.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchComplaints();
          }}
          className="relative w-full md:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, keyword, or location..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 text-slate-700 font-medium"
          >
            <option value="">All Categories</option>
            <option value="Leakage">Leakage</option>
            <option value="Shortage">Shortage</option>
            <option value="Water Quality">Water Quality</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading complaint queue...</div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No complaints match filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-3">ID</th>
                  <th className="py-3.5 px-3">Resident & Location</th>
                  <th className="py-3.5 px-3">Category & Details</th>
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Assigned Staff</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-slate-50/50">
                    {/* ID & Photo thumbnail */}
                    <td className="py-3 px-3 align-top">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-ocean-700 block">{c.display_id}</span>
                        {c.image_url ? (
                          <button
                            onClick={() => setPhotoModalUrl(c.image_url)}
                            className="inline-flex items-center gap-1 text-[10px] text-ocean-600 hover:text-ocean-800 bg-ocean-50 px-2 py-0.5 rounded border border-ocean-200"
                          >
                            <ImageIcon className="w-3 h-3" /> Photo
                          </button>
                        ) : null}
                      </div>
                    </td>

                    {/* Resident & Location */}
                    <td className="py-3 px-3 align-top max-w-[180px]">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 block truncate">{c.user_name || 'Resident'}</span>
                        <span className="text-[11px] text-slate-500 block">📍 {c.location}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </td>

                    {/* Category, Description & Duplicate badge */}
                    <td className="py-3 px-3 align-top max-w-xs">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 text-xs block">{c.category}</span>
                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{c.description}</p>
                        {c.duplicate_display_id && (
                          <div className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                            <GitMerge className="w-3 h-3" /> Duplicate of {c.duplicate_display_id}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Priority Selector */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <select
                        value={c.priority}
                        onChange={(e) => handlePriorityChange(c.complaint_id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1 font-medium focus:ring-1 focus:ring-ocean-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </td>

                    {/* Status Selector */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.complaint_id, e.target.value)}
                        className={`text-xs border rounded-lg p-1 font-semibold focus:ring-1 focus:ring-ocean-500 ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : c.status === 'In Progress'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      {c.assignments && c.assignments.length > 0 ? (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 block">
                            {c.assignments[0].staff_name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {c.assignments[0].specialization}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-medium italic block">
                          Not assigned
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setAssignModalComplaint(c);
                          setSelectedStaffId(c.assignments?.[0]?.staff_id?.toString() || '');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-ocean-50 hover:bg-ocean-100 text-ocean-700 rounded-lg transition"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{c.assignments?.length ? 'Reassign' : 'Assign'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Assignment Modal */}
      {assignModalComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Assign Staff to {assignModalComplaint.display_id}
              </h3>
              <button
                onClick={() => setAssignModalComplaint(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an available maintenance technician. Assigning automatically moves ticket to{' '}
              <strong>In Progress</strong> and notifies the resident.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Technician</label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 font-medium"
              >
                <option value="">-- Choose Technician --</option>
                {staffList.map((s) => (
                  <option key={s.staff_id} value={s.staff_id}>
                    {s.staff_name} — {s.specialization} ({s.active_assignments_count} active tickets)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModalComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStaff}
                disabled={!selectedStaffId}
                className="px-4 py-2 text-xs font-semibold text-white bg-ocean-600 hover:bg-ocean-700 disabled:opacity-50 rounded-xl shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo View Modal */}
      {photoModalUrl && (
        <div
          onClick={() => setPhotoModalUrl(null)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white p-3 rounded-2xl max-w-lg w-full space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-700">Complaint Evidence Photo</span>
              <button onClick={() => setPhotoModalUrl(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={photoModalUrl} alt="Inspection" className="w-full max-h-[70vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagementPage;
