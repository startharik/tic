import React from 'react';
import { 
  Video, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle,
  Clock,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

const MediaManagementPage: React.FC = () => {
  const mediaItems = [
    { id: 1, type: 'photo', jobId: 'JB-2024-001', client: 'Saudi Aramco', date: '2026-05-12 10:45 AM', status: 'Approved', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop' },
    { id: 2, type: 'photo', jobId: 'JB-2024-001', client: 'Saudi Aramco', date: '2026-05-12 10:46 AM', status: 'Pending', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?w=400&h=300&fit=crop' },
    { id: 3, type: 'video', jobId: 'JB-2024-002', client: 'SABIC', date: '2026-05-12 02:15 PM', status: 'In Review', url: 'https://images.unsplash.com/photo-1504328332780-fe4d7ec097f5?w=400&h=300&fit=crop' },
    { id: 4, type: 'photo', jobId: 'JB-2024-003', client: 'NEOM', date: '2026-05-11 09:30 AM', status: 'Rejected', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop' },
    { id: 5, type: 'photo', jobId: 'JB-2024-004', client: 'Maaden', date: '2026-05-10 11:20 AM', status: 'Approved', url: 'https://images.unsplash.com/photo-1504328332780-fe4d7ec097f5?w=400&h=300&fit=crop' },
    { id: 6, type: 'photo', jobId: 'JB-2024-005', client: 'STC', date: '2026-05-09 04:45 PM', status: 'Approved', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Media Management</h1>
          <p className="text-slate-500 mt-1">Review and approve inspection photos and videos with watermarks.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Bulk Download</span>
          </button>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button className="px-4 py-2 bg-white rounded-lg text-sm font-bold text-primary-600 shadow-sm">All Media</button>
        <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Photos</button>
        <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Videos</button>
        <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Pending Approval</button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Filter by Job ID, Client..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Date Range</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaItems.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
              <img src={item.url} alt={item.jobId} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                  item.status === 'Approved' ? 'bg-emerald-500 text-white border-emerald-400' :
                  item.status === 'Rejected' ? 'bg-rose-500 text-white border-rose-400' :
                  item.status === 'In Review' ? 'bg-amber-500 text-white border-amber-400' : 'bg-blue-500 text-white border-blue-400'
                }`}>
                  {item.status}
                </span>
              </div>
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center justify-between">
                  <button className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 transition-colors shadow-lg">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-rose-500 rounded-lg text-white hover:bg-rose-600 transition-colors shadow-lg">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-slate-900">{item.jobId}</h3>
                <MoreVertical className="h-4 w-4 text-slate-400 cursor-pointer" />
              </div>
              <p className="text-xs font-semibold text-slate-600 truncate">{item.client}</p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.date.split(' ')[0]}
                </div>
                {item.type === 'photo' ? 'Image' : 'Video'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center py-4">
        <button className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          Load More Media
        </button>
      </div>
    </div>
  );
};

export default MediaManagementPage;
