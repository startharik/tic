import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Download, Filter, Plus, Search } from 'lucide-react';

const renewals = [
  {
    id: 'RN-2026-001',
    assetId: 'EQ-4421',
    assetName: 'Centrifugal Pump',
    client: 'SABIC',
    branch: 'Jeddah',
    expiryDate: '2026-05-28',
    status: 'Expiring Soon',
  },
  {
    id: 'RN-2026-002',
    assetId: 'EQ-1102',
    assetName: 'Storage Tank',
    client: 'Maaden',
    branch: 'Dammam',
    expiryDate: '2026-05-14',
    status: 'Expired',
  },
  {
    id: 'RN-2026-003',
    assetId: 'EQ-8892',
    assetName: 'Pressure Vessel',
    client: 'Saudi Aramco',
    branch: 'Riyadh',
    expiryDate: '2026-06-10',
    status: 'Upcoming',
  },
];

const statusStyles: Record<string, string> = {
  'Upcoming': 'bg-blue-100 text-blue-700',
  'Expiring Soon': 'bg-amber-100 text-amber-700',
  'Expired': 'bg-rose-100 text-rose-700',
};

const RenewalsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
          <p className="text-slate-500 mt-1">Track expiring certificates and schedule renewal inspections.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/renewals/schedule')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Renewal</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by Asset, Client, Branch, or Renewal ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
            <option>All Status</option>
            <option>Upcoming</option>
            <option>Expiring Soon</option>
            <option>Expired</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Renewal ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renewals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-primary-600">{r.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                        <CalendarClock className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{r.assetName}</div>
                        <div className="text-xs text-slate-500">{r.assetId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{r.client}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{r.branch}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{r.expiryDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[r.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/renewals/schedule')}
                      className="px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 shadow shadow-primary-200"
                    >
                      Create Job
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RenewalsPage;
