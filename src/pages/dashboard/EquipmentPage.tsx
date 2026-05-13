import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  QrCode, 
  History
} from 'lucide-react';

const equipmentData = [
  { id: 'EQ-8892', name: 'Pressure Vessel', category: 'Static Equipment', lastInspected: '2026-05-10', status: 'Certified', location: 'Riyadh Site A' },
  { id: 'EQ-4421', name: 'Centrifugal Pump', category: 'Rotating Equipment', lastInspected: '2026-04-15', status: 'Expiring Soon', location: 'Jeddah Site B' },
  { id: 'EQ-1102', name: 'Storage Tank', category: 'Static Equipment', lastInspected: '2025-11-20', status: 'Expired', location: 'Dammam Site C' },
  { id: 'EQ-5567', name: 'Overhead Crane', category: 'Lifting Equipment', lastInspected: '2026-05-01', status: 'Certified', location: 'Yanbu Site D' },
];

const EquipmentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
          <p className="text-slate-500 mt-1">Track and manage all industrial assets and their certification status.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/assets/create')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Asset</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by ID, Name, or Category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <QrCode className="h-4 w-4" />
            <span>Scan QR</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {equipmentData.map((eq) => (
          <div key={eq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="p-5 border-b border-slate-50">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Package className="h-6 w-6 text-slate-400" />
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  eq.status === 'Certified' ? 'bg-emerald-100 text-emerald-700' :
                  eq.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {eq.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-slate-400 font-bold tracking-wider">{eq.id}</p>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{eq.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{eq.category}</p>
              </div>
            </div>
            <div className="p-5 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Last Inspected</span>
                <span className="font-semibold text-slate-700">{eq.lastInspected}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-700">{eq.location}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <button className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center space-x-1">
                  <History className="h-3 w-3" />
                  <span>View History</span>
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentPage;
