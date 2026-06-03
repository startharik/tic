import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  History, 
  FileText, 
  ShieldCheck, 
  Activity, 
  QrCode,
  Edit,
  Download,
  ExternalLink,
  MapPin,
  Calendar,
  Wrench
} from 'lucide-react';

const AssetDetailsPage: React.FC = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();

  // Mock data for the asset
  const asset = {
    id: assetId || 'EQ-8821',
    name: 'Pressure Vessel PV-902',
    model: 'PX-500 High Pressure',
    serialNumber: 'SN-99283-AIG',
    client: 'Saudi Aramco',
    branch: 'Dammam Branch',
    location: 'Dhahran Oil Field, Sector 4',
    status: 'Operational',
    lastInspection: '2025-05-15',
    nextInspection: '2026-05-15',
    installationDate: '2020-10-10',
    specifications: [
      { label: 'Capacity', value: '500 Liters' },
      { label: 'Max Pressure', value: '15 Bar' },
      { label: 'Operating Temp', value: '-10°C to 120°C' },
      { label: 'Material', value: 'Stainless Steel 316L' },
    ],
    history: [
      { id: 'JB-2025-102', date: '2025-05-15', type: 'Annual Inspection', status: 'Passed', engineer: 'Robert Wilson' },
      { id: 'JB-2024-098', date: '2024-05-20', type: 'Maintenance', status: 'Repaired', engineer: 'Michael Brown' },
      { id: 'JB-2023-045', date: '2023-05-12', type: 'Annual Inspection', status: 'Passed', engineer: 'John Doe' },
    ],
    documents: [
      { name: 'Manufacturer_Certificate.pdf', type: 'PDF', size: '1.2 MB' },
      { name: 'PV902_Technical_Drawing.dwg', type: 'DWG', size: '4.5 MB' },
      { name: 'Maintenance_Manual_v2.pdf', type: 'PDF', size: '3.8 MB' },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
              <span className="px-3 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                {asset.status}
              </span>
            </div>
            <p className="text-slate-500">Asset ID: {asset.id} • {asset.client}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <QrCode className="h-4 w-4" />
            <span>Generate QR</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
            <Edit className="h-4 w-4" />
            <span>Edit Asset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Details & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-400" />
                Asset Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Wrench className="h-4 w-4 text-blue-600" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacturer / Model</p>
                    <p className="text-sm font-bold text-slate-900">{asset.model}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg"><Activity className="h-4 w-4 text-indigo-600" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serial Number</p>
                    <p className="text-sm font-bold text-slate-900">{asset.serialNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg"><MapPin className="h-4 w-4 text-rose-600" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Site Location</p>
                    <p className="text-sm font-bold text-slate-900">{asset.location}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg"><Calendar className="h-4 w-4 text-emerald-600" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Inspection</p>
                    <p className="text-sm font-bold text-slate-900">{asset.lastInspection}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg"><Calendar className="h-4 w-4 text-amber-600" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Due Date</p>
                    <p className="text-sm font-bold text-amber-600">{asset.nextInspection}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg"><ShieldCheck className="h-4 w-4 text-slate-600" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance Branch</p>
                    <p className="text-sm font-bold text-slate-900">{asset.branch}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-6 border-t border-slate-50 bg-slate-50/20">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {asset.specifications.map((spec, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-medium mb-1">{spec.label}</p>
                    <p className="text-xs font-bold text-slate-900">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inspection History */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-slate-400" />
                Inspection History
              </h2>
              <button className="text-xs font-bold text-primary-600 hover:underline">View All</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job ID</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Result</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engineer</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {asset.history.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{log.date}</td>
                    <td className="px-6 py-4 text-xs font-bold text-primary-600 hover:underline cursor-pointer">{log.id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        log.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{log.engineer}</td>
                    <td className="px-6 py-4 text-right">
                      <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary-600 transition-colors cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right - Documents */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                Asset Documents
              </h2>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {asset.documents.length}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {asset.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:text-primary-600 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{doc.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-tighter">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-primary-600 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button className="w-full mt-2 py-3 border-2 border-dashed border-slate-100 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-600 transition-all">
                + Upload New Doc
              </button>
            </div>
          </div>

          <div className="bg-primary-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-200 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                Asset QR Code
              </h3>
              <p className="text-xs text-primary-100 leading-relaxed mb-6">Every asset has a unique QR code for instant identification on-site via the mobile app.</p>
              <div className="bg-white p-3 rounded-2xl w-fit mx-auto mb-6 shadow-inner">
                <div className="h-32 w-32 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-50">
                   <QrCode className="h-16 w-16 text-slate-300" />
                </div>
              </div>
              <button className="w-full py-3 bg-white text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-50 transition-colors shadow-lg">
                Print Label
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-primary-500 rounded-full opacity-50 blur-2xl group-hover:scale-125 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsPage;
