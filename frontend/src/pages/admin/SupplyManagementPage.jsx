import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Calendar, Clock, Plus, Trash2, Edit2, X, AlertTriangle, CheckCircle } from 'lucide-react';

const SupplyManagementPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [formData, setFormData] = useState({
    area_name: 'Block A',
    supply_date: new Date().toISOString().split('T')[0],
    start_time: '06:00',
    end_time: '09:30',
    availability_status: 'Scheduled',
  });

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/supply');
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const openCreateModal = () => {
    setEditingSchedule(null);
    setFormData({
      area_name: 'Block A',
      supply_date: new Date().toISOString().split('T')[0],
      start_time: '06:00',
      end_time: '09:30',
      availability_status: 'Scheduled',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingSchedule(item);
    setFormData({
      area_name: item.area_name,
      supply_date: item.supply_date,
      start_time: item.start_time?.slice(0, 5) || '06:00',
      end_time: item.end_time?.slice(0, 5) || '09:30',
      availability_status: item.availability_status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure time string has seconds formatted if needed
      const payload = {
        ...formData,
        start_time: formData.start_time.length === 5 ? `${formData.start_time}:00` : formData.start_time,
        end_time: formData.end_time.length === 5 ? `${formData.end_time}:00` : formData.end_time,
      };

      if (editingSchedule) {
        await api.put(`/supply/${editingSchedule.supply_id}`, payload);
      } else {
        await api.post('/supply', payload);
      }
      setIsModalOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error('Failed to save schedule', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this water supply schedule?')) {
      try {
        await api.delete(`/supply/${id}`);
        fetchSchedules();
      } catch (err) {
        console.error('Failed to delete schedule', err);
      }
    }
  };

  const handleQuickStatus = async (id, newStatus) => {
    try {
      await api.put(`/supply/${id}`, { availability_status: newStatus });
      fetchSchedules();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Water Supply & Schedule Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish distribution timings and broadcast interruption alerts to community blocks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Supply Schedule</span>
        </button>
      </div>

      {/* Table of Schedules */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No supply schedules configured.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Area / Block</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Timings</th>
                  <th className="py-3.5 px-4">Availability Status</th>
                  <th className="py-3.5 px-4">Quick Toggle</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((s) => (
                  <tr key={s.supply_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-800">{s.area_name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.supply_date}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          s.availability_status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.availability_status === 'Interrupted'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.availability_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={s.availability_status}
                        onChange={(e) => handleQuickStatus(s.supply_id, e.target.value)}
                        className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-1 font-medium"
                      >
                        <option value="Available">Available</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Interrupted">Interrupted</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.supply_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingSchedule ? 'Edit Schedule Slot' : 'Add Water Supply Slot'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Area / Block</label>
                <input
                  type="text"
                  required
                  value={formData.area_name}
                  onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                  placeholder="e.g. Block A / Campus Hostels"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.supply_date}
                  onChange={(e) => setFormData({ ...formData, supply_date: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.availability_status}
                  onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 font-semibold"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Available">Available</option>
                  <option value="Interrupted">Interrupted</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl shadow-xs"
                >
                  {editingSchedule ? 'Save Changes' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyManagementPage;
