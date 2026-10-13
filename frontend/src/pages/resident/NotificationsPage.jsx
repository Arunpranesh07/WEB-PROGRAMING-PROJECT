import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Clock, CheckCircle } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding your complaint status and community water supply announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-ocean-700 bg-ocean-50 hover:bg-ocean-100 rounded-xl transition border border-ocean-200"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No notifications in your inbox.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.notification_id}
              onClick={() => !n.is_read && markAsRead(n.notification_id)}
              className={`p-4 flex items-start justify-between gap-3 transition cursor-pointer ${
                n.is_read ? 'bg-white hover:bg-slate-50/50' : 'bg-ocean-50/40 hover:bg-ocean-50/70'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    n.is_read ? 'bg-transparent' : 'bg-ocean-500 ring-4 ring-ocean-100'
                  }`}
                />
                <div className="space-y-1">
                  <p className={`text-xs ${n.is_read ? 'text-slate-700' : 'text-slate-900 font-semibold'}`}>
                    {n.message}
                  </p>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(n.notification_id);
                  }}
                  className="text-[11px] text-ocean-600 hover:text-ocean-800 font-medium whitespace-nowrap"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
