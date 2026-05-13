import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  FileText,
  AlertCircle
} from 'lucide-react';

const EditJobPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Mock initial state
  const [formData, setFormData] = useState({
    client: 'Saudi Aramco',
    type: 'Pressure Vessel Inspection',
    engineer: 'John Doe',
    date: '2026-05-12',
    time: '09:00',
    priority: 'High',
    site: 'Dhahran Oil Field, Sector 4',
    description: 'Annual inspection and certification of pressure vessel unit PV-902. Check for corrosion, structural integrity, and valve functionality.',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be an API call
    console.log('Updating job:', formData);
    navigate(`/admin/jobs/${jobId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Job: {jobId}</h1>
            <p className="text-slate-500">Update job details and assignments.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Info Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-50 pb-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-900">General Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Client Name</label>
                <select 
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                >
                  <option value="Saudi Aramco">Saudi Aramco</option>
                  <option value="SABIC">SABIC</option>
                  <option value="NEOM">NEOM</option>
                  <option value="Maaden">Maaden</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Inspection Type</label>
                <input 
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description / Instructions</label>
                <textarea 
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Schedule & Assignment Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-50 pb-2">
              <CalendarIcon className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-900">Schedule & Assignment</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Scheduled Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Priority</label>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-semibold"
                >
                  <option value="High" className="text-rose-600 font-bold">High Priority</option>
                  <option value="Medium" className="text-amber-600 font-bold">Medium Priority</option>
                  <option value="Low" className="text-emerald-600 font-bold">Low Priority</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Engineer</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select 
                    name="engineer"
                    value={formData.engineer}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Robert Wilson">Robert Wilson</option>
                    <option value="Michael Brown">Michael Brown</option>
                    <option value="Unassigned">Leave Unassigned</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Site Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    name="site"
                    value={formData.site}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-6 border-t border-slate-100">
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-900">Cancel Job</h3>
                <p className="text-xs text-rose-700 mt-1">Cancelling this job will notify the assigned engineer and mark it as cancelled in the system.</p>
                <button type="button" className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm">
                  Cancel Job
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default EditJobPage;
