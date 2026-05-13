import React from 'react';
import { 
  Shield, 
  Globe, 
  Settings, 
  Users, 
  Database, 
  Activity, 
  Lock, 
  Download,
  MoreVertical,
  TrendingUp,
  Server
} from 'lucide-react';

const SuperAdminPanel: React.FC = () => {
  const regions = [
    { name: 'Saudi Arabia', branches: 12, engineers: 85, status: 'Active' },
    { name: 'United Arab Emirates', branches: 4, engineers: 32, status: 'Active' },
    { name: 'Qatar', branches: 2, engineers: 15, status: 'Active' },
    { name: 'Kuwait', branches: 1, engineers: 8, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary-600" />
            Super Admin Control Panel
          </h1>
          <p className="text-slate-500 mt-1">Global system management, multi-region configuration, and compliance.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Database className="h-4 w-4" />
            <span>System Backup</span>
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Global Regions', value: '4', icon: <Globe className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Total Branches', value: '19', icon: <Activity className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'System Users', value: '1,240', icon: <Users className="h-5 w-5 text-indigo-600" />, bg: 'bg-indigo-50' },
          { label: 'Server Status', value: '99.9%', icon: <Server className="h-5 w-5 text-primary-600" />, bg: 'bg-primary-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Management */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-400" />
              Regional Management
            </h2>
            <button className="text-xs font-bold text-primary-600 hover:underline">Add Region</button>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Branches</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Engineers</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {regions.map((region, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">{region.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-semibold text-slate-600">{region.branches}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-semibold text-slate-600">{region.engineers}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                        <Settings className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Settings & Compliance */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" />
              Security & Compliance
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', status: 'Required', type: 'System-wide' },
                { label: 'Password Rotation Policy', status: '90 Days', type: 'Admin only' },
                { label: 'Data Retention Period', status: '7 Years', type: 'Compliance' },
                { label: 'Audit Log Archiving', status: 'Enabled', type: 'System' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">{item.type}</p>
                  </div>
                  <span className="text-xs font-bold text-primary-600 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg">
              Update Security Policies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
