import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Droplets, Bell, User, LogOut, Menu, X, 
  LayoutDashboard, PlusCircle, Search, History, Calendar, 
  MapPin, Users, Megaphone, BarChart3, ShieldCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const residentNav = [
    { name: 'Dashboard', path: '/resident/dashboard', icon: LayoutDashboard },
    { name: 'Submit Complaint', path: '/resident/submit', icon: PlusCircle },
    { name: 'Track', path: '/resident/track', icon: Search },
    { name: 'History', path: '/resident/history', icon: History },
    { name: 'Water Supply', path: '/resident/supply', icon: Calendar },
    { name: 'Community Map', path: '/resident/map', icon: MapPin },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Complaints', path: '/admin/complaints', icon: Search },
    { name: 'Staff', path: '/admin/staff', icon: Users },
    { name: 'Supply Schedules', path: '/admin/supply', icon: Calendar },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const currentNav = isAdmin ? adminNav : residentNav;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to={user ? (isAdmin ? '/admin/dashboard' : '/resident/dashboard') : '/'} className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-600 to-aqua-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20">
                <Droplets className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-ocean-700 to-aqua-600 bg-clip-text text-transparent">
                  AquaFlow
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider -mt-1">
                  {isAdmin ? 'Admin Console' : 'Community Portal'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-1">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-ocean-50 text-ocean-700 font-semibold'
                        : 'text-slate-600 hover:text-ocean-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-ocean-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Icons & User Info */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <Link
                  to="/resident/notifications"
                  className="relative p-2 text-slate-600 hover:text-ocean-600 hover:bg-slate-100 rounded-full transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Pill & Role Badge */}
                <div className="hidden sm:flex items-center pl-3 border-l border-slate-200 space-x-2">
                  <div className="w-8 h-8 rounded-full bg-ocean-100 text-ocean-700 flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name || 'Resident'}</p>
                    <span className="text-[11px] text-slate-500 capitalize">{user?.role || 'resident'}</span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-ocean-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-ocean-600 hover:bg-ocean-700 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {user && mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-ocean-50 text-ocean-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-ocean-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
