import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  User, 
  Clock, 
  MapPin, 
  CheckCircle, 
  MessageSquare,
  Camera,
  FileText
} from 'lucide-react';

const JobTimelinePage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const timelineData = [
    {
      id: 1,
      type: 'status',
      title: 'Job Completed',
      description: 'Job has been successfully completed and report is ready for review.',
      time: '2026-05-12 04:30 PM',
      user: 'John Doe (Engineer)',
      icon: <CheckCircle className="h-4 w-4 text-white" />,
      iconBg: 'bg-emerald-500'
    },
    {
      id: 2,
      type: 'media',
      title: 'Photos Uploaded',
      description: 'Uploaded 12 inspection photos with auto-watermarks.',
      time: '2026-05-12 03:45 PM',
      user: 'John Doe (Engineer)',
      icon: <Camera className="h-4 w-4 text-white" />,
      iconBg: 'bg-blue-500'
    },
    {
      id: 3,
      type: 'form',
      title: 'Checklist Submitted',
      description: 'Final inspection checklist submitted with 2 minor defects noted.',
      time: '2026-05-12 03:15 PM',
      user: 'John Doe (Engineer)',
      icon: <FileText className="h-4 w-4 text-white" />,
      iconBg: 'bg-indigo-500'
    },
    {
      id: 4,
      type: 'tracking',
      title: 'Site Check-out',
      description: 'Engineer checked out from Dhahran Oil Field.',
      time: '2026-05-12 04:35 PM',
      user: 'John Doe (Engineer)',
      icon: <MapPin className="h-4 w-4 text-white" />,
      iconBg: 'bg-rose-500'
    },
    {
      id: 5,
      type: 'comment',
      title: 'Note Added',
      description: 'Customer requested a follow-up for the pressure relief valve next month.',
      time: '2026-05-12 01:20 PM',
      user: 'John Doe (Engineer)',
      icon: <MessageSquare className="h-4 w-4 text-white" />,
      iconBg: 'bg-amber-500'
    },
    {
      id: 6,
      type: 'tracking',
      title: 'Site Check-in',
      description: 'Engineer checked in at Dhahran Oil Field.',
      time: '2026-05-12 09:10 AM',
      user: 'John Doe (Engineer)',
      icon: <MapPin className="h-4 w-4 text-white" />,
      iconBg: 'bg-emerald-500'
    },
    {
      id: 7,
      type: 'status',
      title: 'Job Started',
      description: 'Engineer started the job on site.',
      time: '2026-05-12 09:05 AM',
      user: 'John Doe (Engineer)',
      icon: <Clock className="h-4 w-4 text-white" />,
      iconBg: 'bg-blue-600'
    },
    {
      id: 8,
      type: 'system',
      title: 'Assigned to Engineer',
      description: 'Job assigned to John Doe by Admin.',
      time: '2026-05-02 02:15 PM',
      user: 'Admin',
      icon: <User className="h-4 w-4 text-white" />,
      iconBg: 'bg-slate-500'
    },
    {
      id: 9,
      type: 'system',
      title: 'Job Created',
      description: 'Initial job request created in system.',
      time: '2026-05-01 10:30 AM',
      user: 'Admin',
      icon: <FileText className="h-4 w-4 text-white" />,
      iconBg: 'bg-slate-400'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <History className="h-6 w-6 text-primary-600" />
            Job Timeline: {jobId}
          </h1>
          <p className="text-slate-500">Comprehensive history of all actions and updates.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />

          <div className="space-y-10">
            {timelineData.map((item) => (
              <div key={item.id} className="relative flex gap-6">
                <div className={`z-10 h-10 w-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <div className="flex items-center text-xs font-medium text-slate-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.time}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <User className="h-3 w-3" />
                      {item.user}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center pt-4">
        <button className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          Download Full Activity Log (PDF)
        </button>
      </div>
    </div>
  );
};

export default JobTimelinePage;
