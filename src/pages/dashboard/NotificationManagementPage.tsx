import React from 'react';
import { 
  Send, 
  Plus, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Settings
} from 'lucide-react';

const NotificationManagementPage: React.FC = () => {
  const templates = [
    { id: 1, name: 'Job Assigned', channels: ['Email', 'Push'], status: 'Active', lastSent: '2024-05-12 10:30 AM' },
    { id: 2, name: 'Job Overdue Alert', channels: ['Push', 'SMS'], status: 'Active', lastSent: '2024-05-11 09:00 AM' },
    { id: 3, name: 'Report Approved', channels: ['Email'], status: 'Active', lastSent: '2024-05-12 04:15 PM' },
    { id: 4, name: 'System Maintenance', channels: ['Push'], status: 'Draft', lastSent: '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notification Center</h1>
          <p className="text-slate-500 mt-1">Manage notification templates, delivery logs, and system alerts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="h-4 w-4" />
            <span>Config</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
            <Send className="h-4 w-4" />
            <span>Send New Alert</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emails Sent</p>
              <p className="text-2xl font-bold text-slate-900">1,284</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Smartphone className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Push Delivery</p>
              <p className="text-2xl font-bold text-slate-900">3,450</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <MessageSquare className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SMS Credits</p>
              <p className="text-2xl font-bold text-slate-900">850 <span className="text-xs font-medium text-slate-400">/ 5000</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Notification Templates</h2>
          <button className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add Template
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Template Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Channels</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Sent</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates.map((template) => (
              <tr key={template.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{template.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {template.channels.map(c => (
                      <span key={c} className="p-1.5 bg-slate-100 rounded text-slate-500" title={c}>
                        {c === 'Email' && <Mail className="h-3.5 w-3.5" />}
                        {c === 'Push' && <Smartphone className="h-3.5 w-3.5" />}
                        {c === 'SMS' && <MessageSquare className="h-3.5 w-3.5" />}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    template.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {template.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">{template.lastSent}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                      <Send className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent Delivery Logs</h2>
            <button className="text-[10px] font-bold text-primary-600 uppercase tracking-wider hover:underline">View All Logs</button>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Job Assigned #JB-2024-001</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Recipient: John Doe (Engineer)</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400">2 mins ago</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">System Alerts</h2>
            <button className="text-[10px] font-bold text-primary-600 uppercase tracking-wider hover:underline">Settings</button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100">
              <AlertCircle className="h-8 w-8 text-rose-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-900">Critical Error: SMS Gateway</p>
                <p className="text-[10px] text-rose-700 mt-0.5">SMS delivery failed for 12 pending notifications. Check API credentials.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <Clock className="h-8 w-8 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">Queue Processing Delay</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Notification queue is currently 5 minutes behind. Server load is high.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagementPage;
