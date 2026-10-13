import React from 'react';
import { Droplets, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <Droplets className="w-5 h-5 text-aqua-400" />
              <span>AquaFlow Smart Water Platform</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Comprehensive community water distribution tracking, complaint resolution management, 
              AI-driven incident classification, and smart leakage diagnostics for residential complexes and campuses.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Community Hub</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-400">Emergency Water Helpline: 1800-425-WATER</span></li>
              <li><span className="text-slate-400">Pump Room Monitoring: 24/7 Active</span></li>
              <li><span className="text-slate-400">Chlorine & Quality Tests: Daily 08:00</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Platform Reliability</h4>
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>All Systems Operational</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Powered by AI telemetry & real-time GIS community mapping.
            </p>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div>© {new Date().getFullYear()} AquaFlow Inc. Designed for sustainable community water security.</div>
          <div className="flex items-center space-x-1">
            <span>Built with precision for Smart Communities</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
