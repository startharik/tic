import React from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  Mail, 
  Smartphone, 
  Database,
  CreditCard,
  Building
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-1">Configure global application settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-1">
          {[
            { id: 'general', icon: SettingsIcon, label: 'General' },
            { id: 'branding', icon: Building, label: 'Branding' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'security', icon: Shield, label: 'Security' },
            { id: 'email', icon: Mail, label: 'Email Config' },
            { id: 'mobile', icon: Smartphone, label: 'Mobile App' },
            { id: 'integrations', icon: Database, label: 'Integrations' },
            { id: 'billing', icon: CreditCard, label: 'Subscription' },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.id === 'general' 
                  ? 'bg-primary-50 text-primary-600 shadow-sm shadow-primary-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`h-4 w-4 ${item.id === 'general' ? 'text-primary-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">General Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Company Name</label>
                <input type="text" defaultValue="Alliance TIC Operations" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">System Email</label>
                <input type="email" defaultValue="admin@alliance-tic.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Timezone</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>(GMT+03:00) Riyadh</option>
                  <option>(GMT+04:00) Dubai</option>
                  <option>(GMT+00:00) London</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Language</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option>English (US)</option>
                  <option>Arabic (KSA)</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Regional Settings</h4>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Globe className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Multi-Currency Support</p>
                      <p className="text-xs text-slate-500">Enable SAR, AED, and USD for invoicing</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500" />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200">
                Save Changes
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Security & Authentication</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Add an extra layer of security to admin accounts.</p>
                </div>
                <button className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Password Policy</p>
                  <p className="text-xs text-slate-500">Enforce strong passwords for all users.</p>
                </div>
                <button className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                  Configure
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
