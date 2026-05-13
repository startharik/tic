import React from 'react';
import { 
  ArrowLeft,
  Save,
  Calendar as CalendarIcon,
  MapPin,
  User,
  Info,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/jobs')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create New Job</h1>
            <p className="text-slate-500 text-sm">Fill in the details to schedule a new inspection job.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/admin/jobs')}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => navigate('/admin/jobs')}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Create Job</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Info className="h-5 w-5 text-primary-500" />
              <span>General Information</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Client Name</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option>Select Client</option>
                    <option>Saudi Aramco</option>
                    <option>SABIC</option>
                    <option>NEOM</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Inspection Type</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option>Select Type</option>
                    <option>Pressure Vessel</option>
                    <option>Safety Audit</option>
                    <option>Structural Inspection</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Description</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Provide detailed description of the job..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">City</label>
                  <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Postal Code</label>
                  <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
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
                <label className="text-sm font-semibold text-slate-700">Scheduled Date</label>
                <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button 
                      key={p}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        p === 'Medium' 
                          ? 'bg-primary-50 border-primary-200 text-primary-600' 
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
              <User className="h-5 w-5 text-indigo-500" />
              <span>Assignment</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Engineer</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>Select Engineer</option>
                  <option>John Doe</option>
                  <option>Jane Smith</option>
                </select>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-700 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>The engineer will be notified immediately upon job creation.</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;
