import React, { useMemo, useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  BarChart3, 
  PieChart as PieIcon,
  Calendar,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Cell, 
  Pie 
} from 'recharts';

const statusData = [
  { name: 'Approved', value: 45, color: '#10B981' },
  { name: 'Rejected', value: 12, color: '#EF4444' },
  { name: 'Pending', value: 24, color: '#F59E0B' },
  { name: 'In Review', value: 19, color: '#0EA5E9' },
];

type ReportType =
  | 'Inspection Approvals'
  | 'Jobs Report'
  | 'Engineers Report'
  | 'Users Report'
  | 'Branches Report'
  | 'Documents Report'
  | 'Renewals Report'
  | 'Audit Logs';

const ReportsDashboard: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('Inspection Approvals');

  const header = useMemo(() => {
    switch (reportType) {
      case 'Jobs Report':
        return { title: 'Jobs Report', subtitle: 'Status distribution, branch performance, and SLA overview.' };
      case 'Engineers Report':
        return { title: 'Engineers Report', subtitle: 'Utilization, on-site engineers, and completion metrics.' };
      case 'Users Report':
        return { title: 'Users Report', subtitle: 'Users, roles, access scope, and activity snapshot.' };
      case 'Branches Report':
        return { title: 'Branches Report', subtitle: 'Branch capacity, workload distribution, and regional KPIs.' };
      case 'Documents Report':
        return { title: 'Documents Report', subtitle: 'Document library health, versions, and compliance artifacts.' };
      case 'Renewals Report':
        return { title: 'Renewals Report', subtitle: 'Expiring certificates, renewals pipeline, and renewal SLAs.' };
      case 'Audit Logs':
        return { title: 'Audit Logs', subtitle: 'Security-relevant actions, configuration changes, and access events.' };
      default:
        return { title: 'Inspection Approvals', subtitle: 'Review submissions, outcomes, and compliance metrics.' };
    }
  }, [reportType]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{header.title}</h1>
          <p className="text-slate-500 mt-1">{header.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option>Inspection Approvals</option>
            <option>Jobs Report</option>
            <option>Engineers Report</option>
            <option>Users Report</option>
            <option>Branches Report</option>
            <option>Documents Report</option>
            <option>Renewals Report</option>
            <option>Audit Logs</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Select Range</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {reportType === 'Inspection Approvals' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Inspection Status</h3>
              <div className="h-[250px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-500">{item.name}</span>
                    <span className="text-xs font-bold text-slate-700">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Recent Inspection Submissions</h3>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Review All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: 'RPT-101', client: 'Saudi Aramco', type: 'PV Inspection', engineer: 'John Doe', status: 'Pending Review', date: 'May 12, 2026' },
                      { id: 'RPT-102', client: 'SABIC', type: 'Safety Audit', engineer: 'Jane Smith', status: 'Approved', date: 'May 11, 2026' },
                      { id: 'RPT-103', client: 'NEOM', type: 'Structural', engineer: 'Robert Wilson', status: 'Rejected', date: 'May 10, 2026' },
                      { id: 'RPT-104', client: 'Maaden', type: 'Certification', engineer: 'Michael Brown', status: 'In Review', date: 'May 09, 2026' },
                    ].map((rpt) => (
                      <tr key={rpt.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                              <FileText className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{rpt.id}</p>
                              <p className="text-xs text-slate-500">{rpt.client}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{rpt.type}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{rpt.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold ${
                              rpt.status === 'Approved'
                                ? 'text-emerald-600'
                                : rpt.status === 'Rejected'
                                  ? 'text-rose-600'
                                  : rpt.status === 'Pending Review'
                                    ? 'text-amber-600'
                                    : 'text-primary-600'
                            }`}
                          >
                            {rpt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Compliance Rate</h4>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">98.4%</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">+0.5% from last month</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg. Review Time</h4>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">4.2 hrs</p>
              <p className="text-xs text-blue-600 mt-1 font-medium">-15 mins improvement</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">NCR Issued</h4>
                <XCircle className="h-5 w-5 text-rose-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">12</p>
              <p className="text-xs text-rose-600 mt-1 font-medium">+2 new cases this week</p>
            </div>
          </div>
        </>
      )}

      {reportType === 'Jobs Report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Jobs by Status</h3>
            <div className="h-[250px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={84} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 space-y-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-900">Branch Performance</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
            <div className="p-6">
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <BarChart
                    data={[
                      { name: 'Bahrain', jobs: 185 },
                      { name: 'UAE', jobs: 155 },
                      { name: 'India', jobs: 120 },
                      { name: 'Kuwait', jobs: 105 },
                      { name: 'Oman', jobs: 85 },
                    ]}
                    margin={{ left: 8, right: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#1d4ed8" radius={[6, 6, 0, 0]} barSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'Engineers Report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Utilization Snapshot</h3>
            <div className="space-y-4">
              {[
                { label: 'On Site', value: '12', color: 'text-emerald-600', icon: ShieldCheck },
                { label: 'Traveling', value: '7', color: 'text-amber-600', icon: Clock },
                { label: 'Idle', value: '4', color: 'text-slate-700', icon: Users },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <m.icon className={`h-4 w-4 ${m.color}`} />
                    </div>
                    <div className="text-sm font-semibold text-slate-700">{m.label}</div>
                  </div>
                  <div className={`text-xl font-extrabold ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-900">Engineer Performance</h3>
              </div>
              <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engineer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jobs</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg SLA</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'John Doe', jobs: 14, completed: 11, sla: '4.1h', status: 'On Site', badge: 'bg-emerald-100 text-emerald-700' },
                    { name: 'Jane Smith', jobs: 12, completed: 10, sla: '4.6h', status: 'Traveling', badge: 'bg-amber-100 text-amber-700' },
                    { name: 'Michael Brown', jobs: 9, completed: 7, sla: '5.2h', status: 'Idle', badge: 'bg-slate-100 text-slate-700' },
                  ].map((e) => (
                    <tr key={e.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{e.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{e.jobs}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{e.completed}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{e.sla}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${e.badge}`}>{e.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'Users Report' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Users & Roles</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Super Admin', role: 'Super Admin', branch: 'Global', last: '2 mins ago', badge: 'bg-emerald-100 text-emerald-700' },
                  { name: 'Operations Manager', role: 'Admin', branch: 'Riyadh', last: '18 mins ago', badge: 'bg-emerald-100 text-emerald-700' },
                  { name: 'John Doe', role: 'Engineer', branch: 'Dammam', last: '1 hr ago', badge: 'bg-amber-100 text-amber-700' },
                ].map((u) => (
                  <tr key={u.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{u.role}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{u.branch}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{u.last}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.badge}`}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'Audit Logs' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Audit Events</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { time: '2026-05-12 10:42', actor: 'Super Admin', action: 'Updated role permissions', entity: 'Role: Engineer', result: 'Success' },
                  { time: '2026-05-12 09:14', actor: 'Ops Manager', action: 'Created job', entity: 'Job: JB-2024-006', result: 'Success' },
                  { time: '2026-05-11 17:36', actor: 'Ops Manager', action: 'Rejected report', entity: 'Report: RPT-103', result: 'Success' },
                ].map((a, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{a.time}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{a.actor}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.entity}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{a.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'Branches Report' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Branch KPIs</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engineers</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Jobs</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { branch: 'Riyadh Head Office', country: 'Saudi Arabia', engineers: 18, active: 12, overdue: 2 },
                  { branch: 'Jeddah Office', country: 'Saudi Arabia', engineers: 10, active: 8, overdue: 1 },
                  { branch: 'Dammam Branch', country: 'Saudi Arabia', engineers: 8, active: 5, overdue: 1 },
                  { branch: 'Dubai Office', country: 'UAE', engineers: 6, active: 4, overdue: 0 },
                ].map((b) => (
                  <tr key={b.branch} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{b.branch}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{b.country}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{b.engineers}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{b.active}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.overdue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {b.overdue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'Documents Report' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Document Library</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Updates</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { type: 'Procedures', total: 38, latest: '2026-05-10', compliance: 'OK' },
                  { type: 'Drawings', total: 124, latest: '2026-05-02', compliance: 'OK' },
                  { type: 'Certificates', total: 56, latest: '2026-04-27', compliance: 'Review' },
                  { type: 'Templates', total: 22, latest: '2026-04-18', compliance: 'OK' },
                ].map((d) => (
                  <tr key={d.type} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{d.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{d.total}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{d.latest}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${d.compliance === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {d.compliance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'Renewals Report' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Renewals Pipeline</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { label: 'Upcoming (30d)', value: 24, style: 'bg-blue-50 border-blue-100 text-blue-700' },
              { label: 'Expiring Soon', value: 12, style: 'bg-amber-50 border-amber-100 text-amber-700' },
              { label: 'Expired', value: 5, style: 'bg-rose-50 border-rose-100 text-rose-700' },
            ].map((k) => (
              <div key={k.label} className={`rounded-2xl border p-5 ${k.style}`}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-80">{k.label}</div>
                <div className="mt-2 text-3xl font-extrabold">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
