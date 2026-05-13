import React from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  User, 
  Clock, 
  Eye,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const AuditLogsPage: React.FC = () => {
  const logs = [
    { id: 1, action: 'User Login', user: 'admin@aig.com', entity: 'Auth', ip: '192.168.1.1', time: '2026-05-13 09:00:15 AM', status: 'Success' },
    { id: 2, action: 'Update Job Details', user: 'sarah.manager', entity: 'Job #JB-2024-001', ip: '192.168.1.45', time: '2026-05-13 09:15:22 AM', status: 'Success' },
    { id: 3, action: 'Delete User Account', user: 'super.admin', entity: 'User #USR-882', ip: '10.0.0.5', time: '2026-05-13 10:05:10 AM', status: 'Success' },
    { id: 4, action: 'Export Reports', user: 'robert.wilson', entity: 'Monthly Reports', ip: '192.168.1.12', time: '2026-05-13 10:30:45 AM', status: 'Success' },
    { id: 5, action: 'System Config Change', user: 'super.admin', entity: 'Email Gateway', ip: '10.0.0.5', time: '2026-05-13 11:12:05 AM', status: 'Warning' },
    { id: 6, action: 'Failed Login Attempt', user: 'unknown', entity: 'Auth', ip: '45.12.88.23', time: '2026-05-13 11:45:30 AM', status: 'Failed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary-600" />
            System Audit Logs
          </h1>
          <p className="text-slate-500 mt-1">Trace all system activities, data changes, and security events.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Filter by user, action, or entity ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
            <option>All Events</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Failed</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Advanced</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{log.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-full bg-primary-50 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{log.action}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {log.entity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.ip}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      log.status === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                      log.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        log.status === 'Success' ? 'bg-emerald-500' :
                        log.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page 1 of 124</span>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-400 disabled:opacity-50" disabled>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-400">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-center justify-between overflow-hidden relative group">
        <div className="relative z-10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Compliance Verified
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md">Your audit logging system is currently compliant with ISO 27001 data integrity standards.</p>
        </div>
        <div className="relative z-10">
          <button className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
            Generate Compliance Report
          </button>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
      </div>
    </div>
  );
};

export default AuditLogsPage;
