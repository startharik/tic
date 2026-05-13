import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Download,
  Calendar
} from 'lucide-react';

const jobsData = [
  { id: 'JB-2024-001', client: 'Saudi Aramco', type: 'Pressure Vessel', engineer: 'John Doe', date: '2026-05-12', status: 'In Progress', priority: 'High' },
  { id: 'JB-2024-002', client: 'SABIC', type: 'Safety Audit', engineer: 'Jane Smith', date: '2026-05-13', status: 'Assigned', priority: 'Medium' },
  { id: 'JB-2024-003', client: 'NEOM', type: 'Structural', engineer: 'Robert Wilson', date: '2026-05-11', status: 'Completed', priority: 'Low' },
  { id: 'JB-2024-004', client: 'Maaden', type: 'Certification', engineer: 'Michael Brown', date: '2026-05-09', status: 'Overdue', priority: 'High' },
  { id: 'JB-2024-005', client: 'STC', type: 'Fire Safety', engineer: 'Unassigned', date: '2026-05-15', status: 'Pending', priority: 'Medium' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    'In Progress': 'bg-blue-100 text-blue-700',
    'Assigned': 'bg-indigo-100 text-indigo-700',
    'Completed': 'bg-emerald-100 text-emerald-700',
    'Overdue': 'bg-rose-100 text-rose-700',
    'Pending': 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
};

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Management</h1>
          <p className="text-slate-500 mt-1">Manage and track all testing and inspection jobs.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => navigate('/admin/jobs/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Job</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by Job ID, Client, or Engineer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
            <option>All Status</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Overdue</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client & Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engineer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobsData.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/admin/jobs/${encodeURIComponent(job.id)}`)}
                >
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="text-sm font-bold text-primary-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/jobs/${encodeURIComponent(job.id)}`);
                      }}
                    >
                      {job.id}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{job.client}</span>
                      <span className="text-xs text-slate-500">{job.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {job.engineer === 'Unassigned' ? '?' : job.engineer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`text-sm ${job.engineer === 'Unassigned' ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                        {job.engineer}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{job.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold ${
                      job.priority === 'High' ? 'text-rose-600' : 
                      job.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/jobs/${encodeURIComponent(job.id)}/edit`);
                        }}
                        className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700 shadow shadow-primary-200"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing 1 to 5 of 24 jobs</span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-sm">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
