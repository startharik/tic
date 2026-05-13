import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Layout
} from 'lucide-react';

const InspectionManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const inspections = [
    { id: 'INS-001', type: 'Pressure Vessel', template: 'PV-Standard-v2', status: 'Active', questions: 24, lastUpdated: '2024-05-10' },
    { id: 'INS-002', type: 'Safety Audit', template: 'HSE-Full-Audit', status: 'Active', questions: 45, lastUpdated: '2024-05-08' },
    { id: 'INS-003', type: 'Lifting Equipment', template: 'LE-Crane-Check', status: 'Draft', questions: 18, lastUpdated: '2024-05-12' },
    { id: 'INS-004', type: 'Structural Integrity', template: 'SI-Beam-v1', status: 'Archived', questions: 30, lastUpdated: '2024-04-20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inspection Management</h1>
          <p className="text-slate-500 mt-1">Design and manage dynamic inspection forms and checklists.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/admin/inspections/forms/builder')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Template</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Templates', value: '12', icon: <ClipboardList className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Active Forms', value: '8', icon: <CheckCircle className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Submissions Today', value: '24', icon: <FileText className="h-5 w-5 text-indigo-600" />, bg: 'bg-indigo-50' },
          { label: 'Pending Reviews', value: '7', icon: <AlertCircle className="h-5 w-5 text-amber-600" />, bg: 'bg-amber-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+12%</span>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search templates by name or type..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Template Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Questions</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inspections.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 rounded text-slate-500">
                      <Layout className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.template}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.type}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.questions} fields</td>
                <td className="px-6 py-4 text-sm text-slate-500">{item.lastUpdated}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                    item.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                      <FileText className="h-4 w-4" />
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
    </div>
  );
};

export default InspectionManagementPage;
