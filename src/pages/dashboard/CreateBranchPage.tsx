import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateBranchPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/branches')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add Branch</h1>
            <p className="text-slate-500 text-sm">Create a new branch / country unit for operations.</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
          <Save className="h-4 w-4" />
          <span>Save</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Branch Name</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., Riyadh Branch" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Country</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option>Select country</option>
              <option>Saudi Arabia</option>
              <option>UAE</option>
              <option>Bahrain</option>
              <option>Kuwait</option>
              <option>Oman</option>
              <option>India</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">City</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., Riyadh" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Timezone</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option>Asia/Riyadh</option>
              <option>Asia/Dubai</option>
              <option>Asia/Kolkata</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Address</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Street, district, building" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
          <div className="text-sm font-bold text-slate-900">Operational Settings</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Enable renewals', 'Enable documents', 'Enable live tracking'].map((s) => (
              <label key={s} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200">
                <input type="checkbox" className="h-4 w-4" defaultChecked />
                <span className="text-sm font-semibold text-slate-700">{s}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBranchPage;
