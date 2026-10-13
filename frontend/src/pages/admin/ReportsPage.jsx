import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { BarChart3, Clock, TrendingUp, Users, Droplet, CheckCircle } from 'lucide-react';

const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#ef4444', '#8b5cf6'];

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sumRes, foreRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/usage/forecast'),
        ]);
        setSummary(sumRes.data);
        setForecastData(foreRes.data);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Aggregating water usage analytics and AI predictions...</p>
      </div>
    );
  }

  // Combine historical and forecast points for the chart
  const combinedUsage = [
    ...(forecastData?.historical?.slice(-14) || []),
    ...(forecastData?.forecast || []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Operations Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical community water demand, resolution turnaround benchmarks, and technician efficiency.
        </p>
      </div>

      {/* Highlights Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-ocean-600" /> Total Complaints
          </span>
          <div className="text-3xl font-extrabold text-slate-900">
            {summary?.total_complaints || 0}
          </div>
          <span className="text-[11px] text-slate-400">Total tickets logged in system</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600" /> Avg. Resolution Time
          </span>
          <div className="text-3xl font-extrabold text-teal-700">
            {summary?.average_resolution_hours || 0} hrs
          </div>
          <span className="text-[11px] text-slate-400">Assignment to completion turnaround</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Forecasting Engine
          </span>
          <div className="text-sm font-bold text-slate-800 pt-1">
            7-Day Demand Projection
          </div>
          <span className="text-[11px] text-slate-400">Moving average with day-of-week seasonality</span>
        </div>
      </div>

      {/* 7-Day Predictive Water Demand Forecast Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Community Water Consumption & 7-Day Demand Forecast
            </h2>
            <p className="text-xs text-slate-500">
              Comparing past 14 days actual usage with next 7 days projected reservoir draw (Liters)
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 bg-ocean-500 rounded-sm"></span> Actual Consumption
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 bg-teal-400 rounded-sm border border-dashed border-teal-600"></span> 7-Day Predicted
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedUsage}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActual)"
                name="Actual Consumption (L)"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#0d9488"
                strokeDasharray="4 4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPredicted)"
                name="Predicted Draw (L)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: Category Breakdown (Pie) & Status Breakdown (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Complaints by Category</h2>
          <p className="text-xs text-slate-500">Distribution across Leakage, Shortage, and Quality</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.by_category || []}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(summary?.by_category || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Complaints by Status</h2>
          <p className="text-xs text-slate-500">Pending vs In Progress vs Resolved Tickets</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.by_status || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} name="Ticket Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Workload Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Technician Workload & Completion Benchmarks</h2>
        <p className="text-xs text-slate-500">
          Comparing active tickets vs resolved repairs across maintenance staff members
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary?.staff_workload || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="staff_name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="active_assignments" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Active Tickets" />
              <Bar dataKey="completed_assignments" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
