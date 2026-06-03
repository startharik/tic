import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Filter, Plus, Edit2, Trash2, History, Loader2 } from 'lucide-react';
import { getEquipment, deleteEquipment } from '../../services/supabaseService';
import type { Equipment } from '../../services/supabaseService';

const EquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
          <p className="text-slate-500 mt-1">Track and manage all industrial assets and their certification status.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/equipment/create')}
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
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {equipment.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No equipment yet</h3>
          <p className="text-slate-500 mb-4">Add your first asset to get started.</p>
          <button
            onClick={() => navigate('/admin/equipment/create')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Asset</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {equipment.map((eq) => (
            <div key={eq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="p-5 border-b border-slate-50">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-slate-50 rounded-lg overflow-hidden">
                    {eq.qr_code ? (
                      <img src={eq.qr_code} alt={eq.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <Package className="h-12 w-12 text-slate-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin/equipment/${eq.id}/edit`)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit equipment"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this equipment?')) {
                          try {
                            await deleteEquipment(eq.id);
                            fetchData();
                          } catch (err) {
                            console.error('Error deleting equipment:', err);
                            alert('Failed to delete equipment.');
                          }
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete equipment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider">{eq.id.slice(0, 8).toUpperCase()}</p>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors">{eq.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{eq.type || 'Uncategorized'}</p>
                </div>
              </div>
              <div className="p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Last Inspection</span>
                  <span className="font-semibold text-slate-700">
                    {eq.last_inspection_date ? new Date(eq.last_inspection_date).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Client</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">{(eq as any).clients?.name || 'N/A'}</span>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <button className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center space-x-1">
                    <History className="h-3 w-3" />
                    <span>View History</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;
