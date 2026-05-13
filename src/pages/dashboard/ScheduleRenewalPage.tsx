import React from 'react';
import { 
  ArrowLeft,
  Save,
  Calendar as CalendarIcon,
  MapPin,
  Info,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScheduleRenewalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/renewals')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule Renewal</h1>
            <p className="text-slate-500 text-sm">Schedule a new inspection job for an expiring asset.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/admin/renewals')}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => navigate('/admin/renewals')}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Confirm Renewal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Info className="h-5 w-5 text-primary-500" />
              <span>Asset & Client Information</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Expiring Asset</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option>Select Asset</option>
                    <option>EQ-4421 - Centrifugal Pump</option>
                    <option>EQ-1102 - Storage Tank</option>
                    <option>EQ-8892 - Pressure Vessel</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Client</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none text-slate-500" 
                    value="Auto-filled based on asset"
                    disabled 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Renewal Notes</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Provide any specific instructions for this renewal inspection..."
                ></textarea>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-rose-500" />
              <span>Site Details</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Site Location / Address</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Enter full site address"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Form */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-emerald-500" />
              <span>Scheduling</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Renewal Date</label>
                <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Time Window</label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <select className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option>Morning (08:00 - 12:00)</option>
                    <option>Afternoon (13:00 - 17:00)</option>
                    <option>Full Day</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button 
                      key={p}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        p === 'High' 
                          ? 'bg-rose-50 border-rose-200 text-rose-600' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>Assignment</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Engineer</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>Select Engineer</option>
                  <option>John Doe (Available)</option>
                  <option>Jane Smith (Busy)</option>
                  <option>Michael Brown (Available)</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ScheduleRenewalPage;