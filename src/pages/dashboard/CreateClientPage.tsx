import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateClientPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/clients')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add Client</h1>
            <p className="text-slate-500 text-sm">Create a client profile for job scheduling and reporting.</p>
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
            <label className="text-sm font-semibold text-slate-700">Client Name</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., Saudi Aramco" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Industry</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option>Select industry</option>
              <option>Oil & Gas</option>
              <option>Petrochemicals</option>
              <option>Construction</option>
              <option>Mining</option>
              <option>Telecom</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Primary Contact</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="contact@client.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Phone</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="+966 ..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Country</label>
            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option>Saudi Arabia</option>
              <option>UAE</option>
              <option>Bahrain</option>
              <option>Kuwait</option>
              <option>Oman</option>
              <option>India</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Address</label>
            <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Full address" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
          <div className="text-sm font-bold text-slate-900">Notes</div>
          <div className="text-xs text-slate-500 mt-1">UI-only for now. Will be used for CRM-style context later.</div>
          <textarea className="mt-4 w-full min-h-[110px] px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Client notes..." />
        </div>
      </div>
    </div>
  );
};

export default CreateClientPage;
