import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, ShieldCheck, Cpu, MapPin, BarChart3, 
  Clock, CheckCircle2, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ocean-50 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-ocean-100 text-ocean-800 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-ocean-500 animate-ping"></span>
              <span>Smart Community Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Smarter Water Management for{' '}
              <span className="bg-gradient-to-r from-ocean-600 to-aqua-500 bg-clip-text text-transparent">
                Connected Communities
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              Empowering residential apartments and campuses with real-time supply scheduling,
              AI-assisted complaint classification, interactive leak localization, and smart IoT telemetry.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {user ? (
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/resident/dashboard'}
                  className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-semibold shadow-lg shadow-ocean-600/25 transition transform hover:-translate-y-0.5"
                >
                  <span>Go to {isAdmin ? 'Admin Dashboard' : 'Resident Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-semibold shadow-lg shadow-ocean-600/25 transition transform hover:-translate-y-0.5 text-center"
                  >
                    Resident & Admin Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-xs transition text-center"
                  >
                    Register New Resident
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Access Box */}
            <div className="mt-8 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-ocean-200/80 max-w-lg mx-auto shadow-sm text-left">
              <p className="text-xs font-bold text-ocean-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ocean-600" />
                Pre-configured Demo Credentials
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-ocean-50/70 p-2.5 rounded-lg border border-ocean-100">
                  <span className="font-semibold text-ocean-900 block">Admin Portal</span>
                  <span className="text-slate-600 block">Email: admin@waterhub.com</span>
                  <span className="text-slate-500 block">Pass: admin123</span>
                </div>
                <div className="bg-teal-50/70 p-2.5 rounded-lg border border-teal-100">
                  <span className="font-semibold text-teal-900 block">Resident Portal</span>
                  <span className="text-slate-600 block">Email: resident1@waterhub.com</span>
                  <span className="text-slate-500 block">Pass: resident123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered for Transparency & Conservation
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every feature is purpose-built to eliminate water outages and fast-track leak repairs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-ocean-300 transition">
            <div className="w-12 h-12 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">AI Problem Classification</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Machine learning models accurately categorize resident complaints as Leakage, Shortage, or Water Quality in real-time, preventing misrouting.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-ocean-300 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">GIS Leakage Hotspots</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              OpenStreetMap integration visualizes open pipeline breaches, helping technicians localize underground seepages before catastrophic water loss.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-ocean-300 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">7-Day Demand Forecasting</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Predictive moving average algorithms analyze historical usage trends to estimate community water requirements for the upcoming week.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
