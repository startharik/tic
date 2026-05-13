import React from 'react';
import { Download, FileText, Filter, FolderOpen, Plus, Search, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const docs = [
  { id: 'DOC-001', name: 'Safety Procedures v2.1', type: 'Procedure', version: '2.1', updated: '2026-05-10', size: '2.4 MB' },
  { id: 'DOC-002', name: 'Standard Inspection Checklist', type: 'Checklist', version: '1.4', updated: '2026-04-28', size: '0.8 MB' },
  { id: 'DOC-003', name: 'ISO 9001 Certificate', type: 'Certificate', version: '2026', updated: '2026-03-12', size: '1.2 MB' },
  { id: 'DOC-004', name: 'P&ID Drawing Set (Unit 4)', type: 'Drawing', version: 'A12', updated: '2026-02-22', size: '15.8 MB' },
];

const typeBadge: Record<string, string> = {
  Procedure: 'bg-blue-100 text-blue-700',
  Checklist: 'bg-indigo-100 text-indigo-700',
  Certificate: 'bg-emerald-100 text-emerald-700',
  Drawing: 'bg-amber-100 text-amber-700',
};

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">Store and manage drawings, procedures, certificates, and templates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/documents/upload')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, type, version, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
            <option>All Types</option>
            <option>Procedures</option>
            <option>Drawings</option>
            <option>Certificates</option>
            <option>Templates</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{d.name}</div>
                          <div className="text-xs text-slate-500">{d.id} • {d.size}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeBadge[d.type] ?? 'bg-slate-100 text-slate-700'}`}>
                        {d.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{d.version}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.updated}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                          View
                        </button>
                        <button className="px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 shadow shadow-primary-200">
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900">Folders</div>
            <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {['Procedures', 'Drawings', 'Certificates', 'Templates', 'Client Attachments'].map((f) => (
              <button
                key={f}
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-semibold text-slate-800">{f}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
