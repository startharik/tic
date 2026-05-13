import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  History, 
  MessageSquare, 
  MoreVertical,
  Edit,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Download,
  ExternalLink
} from 'lucide-react';

const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Mock data for the job
  const job = {
    id: jobId || 'JB-2024-001',
    client: 'Saudi Aramco',
    type: 'Pressure Vessel Inspection',
    status: 'In Progress',
    priority: 'High',
    scheduledDate: '2026-05-12',
    scheduledTime: '09:00 AM',
    engineer: 'John Doe',
    site: 'Dhahran Oil Field, Sector 4',
    location: '26.2828° N, 50.1105° E',
    description: 'Annual inspection and certification of pressure vessel unit PV-902. Check for corrosion, structural integrity, and valve functionality.',
    equipment: {
      name: 'Pressure Vessel PV-902',
      id: 'EQ-8821',
      lastInspected: '2025-05-15',
      model: 'PX-500 High Pressure',
    },
    timeline: [
      { event: 'Job Created', time: '2026-05-01 10:30 AM', user: 'Admin' },
      { event: 'Assigned to John Doe', time: '2026-05-02 02:15 PM', user: 'Admin' },
      { event: 'Job Started', time: '2026-05-12 09:05 AM', user: 'John Doe' },
      { event: 'Site Check-in', time: '2026-05-12 09:10 AM', user: 'John Doe' },
    ],
    attachments: [
      { name: 'Unit_Manual_PV902.pdf', size: '2.4 MB', type: 'PDF' },
      { name: 'Previous_Report_2025.pdf', size: '1.8 MB', type: 'PDF' },
      { name: 'Site_Safety_Protocol.pdf', size: '0.5 MB', type: 'PDF' },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Overdue': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/jobs')}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">{job.id}</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
            <p className="text-slate-500">{job.type} • {job.client}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Job</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
            <CheckCircle className="h-4 w-4" />
            <span>Approve Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900">Job Overview</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Assigned Engineer</p>
                    <p className="text-sm font-semibold text-slate-900">{job.engineer}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-emerald-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Scheduled Date</p>
                    <p className="text-sm font-semibold text-slate-900">{job.scheduledDate}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-amber-50 rounded-lg">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Scheduled Time</p>
                    <p className="text-sm font-semibold text-slate-900">{job.scheduledTime}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-rose-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Site Location</p>
                    <p className="text-sm font-semibold text-slate-900">{job.site}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-indigo-50 rounded-lg">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Priority Level</p>
                    <span className={`text-xs font-bold ${job.priority === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {job.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 pt-4 border-t border-slate-50">
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Description / Instructions</p>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {job.description}
                </p>
              </div>
            </div>
          </div>

          {/* Equipment & Inspection Progress */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-900">Equipment Information</h2>
              <button className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
                View Asset Details <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                    <Paperclip className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{job.equipment.name}</h3>
                    <p className="text-xs text-slate-500">ID: {job.equipment.id} • Model: {job.equipment.model}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-slate-500 uppercase">Last Inspection</p>
                  <p className="text-xs font-semibold text-slate-700">{job.equipment.lastInspected}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Inspection Checklist Progress</h3>
                <div className="space-y-4">
                  {[
                    { label: 'External Visual Inspection', status: 'Completed' },
                    { label: 'Pressure Relief Valve Test', status: 'In Progress' },
                    { label: 'Wall Thickness Measurement', status: 'Pending' },
                    { label: 'Corrosion Assessment', status: 'Pending' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${
                          item.status === 'Completed' ? 'bg-emerald-500' : 
                          item.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'
                        }`} />
                        <span className="text-sm text-slate-700">{item.label}</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        item.status === 'Completed' ? 'text-emerald-600' : 
                        item.status === 'In Progress' ? 'text-blue-600' : 'text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Attachments */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4" />
                Job Timeline
              </h2>
              <button onClick={() => navigate(`/admin/jobs/${job.id}/timeline`)} className="text-[10px] font-bold text-primary-600 uppercase tracking-wider hover:underline">
                View Full
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {job.timeline.map((item, idx) => (
                  <div key={idx} className="relative flex gap-4">
                    {idx !== job.timeline.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-100" />
                    )}
                    <div className={`mt-1.5 h-[22px] w-[22px] rounded-full border-2 border-white ring-2 ring-slate-50 flex-shrink-0 ${
                      idx === job.timeline.length - 1 ? 'bg-primary-500 ring-primary-100' : 'bg-slate-200'
                    }`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.event}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.time}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" /> {item.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments
              </h2>
              <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {job.attachments.length}
              </span>
            </div>
            <div className="p-4 space-y-2">
              {job.attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-100 rounded text-slate-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{file.size}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button className="w-full mt-2 py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all">
                + Upload New File
              </button>
            </div>
          </div>

          {/* Quick Actions / Chat */}
          <div className="bg-primary-600 rounded-xl p-6 text-white shadow-lg shadow-primary-200 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication
              </h3>
              <p className="text-xs text-primary-100 mb-4">Chat with the assigned engineer regarding this job.</p>
              <button 
                onClick={() => navigate('/admin/chat')}
                className="w-full py-2 bg-white text-primary-600 rounded-lg text-sm font-bold hover:bg-primary-50 transition-colors"
              >
                Open Chat
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary-500 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
