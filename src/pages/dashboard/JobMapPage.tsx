import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { 
  Map as MapIcon, 
  Search, 
  Filter, 
  Plus, 
  Navigation,
  Layers,
  MoreVertical
} from 'lucide-react';

// Custom marker icon for active jobs
const createJobIcon = (status: string) => {
  const color = status === 'In Progress' ? '#0284C7' : status === 'Completed' ? '#10B981' : '#F59E0B';
  return L.divIcon({
    className: 'custom-job-marker',
    html: `<div style="
      background-color: white;
      padding: 4px;
      border-radius: 999px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border: 2px solid ${color};
    ">
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const JobMapPage: React.FC = () => {
  const navigate = useNavigate();

  const activeJobs = [
    { id: 'JB-2024-001', client: 'Saudi Aramco', engineer: 'John Doe', status: 'In Progress', type: 'Pressure Vessel', lat: 26.2828, lng: 50.1105 },
    { id: 'JB-2024-002', client: 'SABIC', engineer: 'Jane Smith', status: 'Assigned', type: 'Safety Audit', lat: 24.7136, lng: 46.6753 },
    { id: 'JB-2024-003', client: 'NEOM', engineer: 'Robert Wilson', status: 'Completed', type: 'Structural', lat: 28.5283, lng: 34.8217 },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapIcon className="h-6 w-6 text-primary-600" />
            Live Job Map
          </h1>
          <p className="text-slate-500 mt-1">Visualize active jobs and engineer locations in real-time.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Layers className="h-4 w-4" />
            <span>Map Layers</span>
          </button>
          <button 
            onClick={() => navigate('/admin/jobs/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Job</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar - Job List */}
        <div className="w-80 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search active jobs..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all" />
            </div>
            <div className="flex gap-2">
              <select className="flex-1 bg-slate-50 border-transparent rounded-lg text-[10px] font-bold px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none uppercase tracking-wider">
                <option>All Regions</option>
                <option>Central</option>
                <option>Eastern</option>
                <option>Western</option>
              </select>
              <button className="p-1.5 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeJobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                className="p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-primary-600">{job.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                    job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    job.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{job.client}</h3>
                <p className="text-xs text-slate-500 mb-3">{job.type}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {job.engineer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{job.engineer}</span>
                  </div>
                  <Navigation className="h-3 w-3 text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Map Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 relative overflow-hidden group">
          <MapContainer 
            center={[24.7136, 46.6753]} 
            zoom={6} 
            scrollWheelZoom={true}
            zoomControl={false}
            className="w-full h-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <ZoomControl position="bottomright" />

            {activeJobs.map((job) => (
              <Marker 
                key={job.id} 
                position={[job.lat as any, job.lng as any]} 
                icon={createJobIcon(job.status)}
              >
                <Popup className="custom-popup">
                  <div className="w-48 p-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-primary-600">{job.id}</span>
                      <MoreVertical className="h-3 w-3 text-slate-400" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{job.client}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{job.type}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold">
                        {job.engineer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[10px] text-slate-600">{job.engineer}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => navigate(`/admin/jobs/${job.id}`)}
                        className="flex-1 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-bold hover:bg-primary-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute top-6 right-6 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-white shadow-xl">
            <button className="px-4 py-2 bg-white rounded-lg text-xs font-bold text-slate-900 shadow-sm border border-slate-100">Standard</button>
            <button className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900">Satellite</button>
            <button className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900">Terrain</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMapPage;
