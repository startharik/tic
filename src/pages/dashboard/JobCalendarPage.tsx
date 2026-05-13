import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin
} from 'lucide-react';

const JobCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 13)); // May 13, 2026

  const daysInMonth = 31;
  const firstDayOfMonth = 5; // Friday
  
  const jobs = [
    { id: 'JB-2024-001', day: 12, title: 'Pressure Vessel Inspection', client: 'Saudi Aramco', time: '09:00 AM', status: 'In Progress' },
    { id: 'JB-2024-002', day: 13, title: 'Safety Audit', client: 'SABIC', time: '10:30 AM', status: 'Assigned' },
    { id: 'JB-2024-003', day: 11, title: 'Structural Integrity', client: 'NEOM', time: '02:00 PM', status: 'Completed' },
    { id: 'JB-2024-004', day: 9, title: 'Certification', client: 'Maaden', time: '11:00 AM', status: 'Overdue' },
    { id: 'JB-2024-005', day: 15, title: 'Fire Safety', client: 'STC', time: '09:30 AM', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Calendar</h1>
          <p className="text-slate-500 mt-1">Schedule and manage inspection jobs across time.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            <button className="px-3 py-1 text-sm font-medium text-slate-600 bg-slate-50 rounded-md">Month</button>
            <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-900">Week</button>
            <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-900">Day</button>
          </div>
          <button 
            onClick={() => navigate('/admin/jobs/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Job</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-slate-900">May 2026</h2>
            <div className="flex items-center space-x-1">
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900"><ChevronLeft className="h-5 w-5" /></button>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <button className="text-xs font-bold text-primary-600 hover:underline px-2">Today</button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search calendar..." className="pl-9 pr-4 py-1.5 bg-slate-50 border-transparent rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all w-48" />
            </div>
            <button className="p-2 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100"><Filter className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-0">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 border-collapse">
          {Array.from({ length: firstDayOfMonth - 1 }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[140px] p-2 bg-slate-50/20 border-r border-b border-slate-100" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayJobs = jobs.filter(j => j.day === day);
            const isToday = day === 13;
            
            return (
              <div key={day} className={`min-h-[140px] p-2 border-r border-b border-slate-100 hover:bg-slate-50/30 transition-colors group ${isToday ? 'bg-primary-50/10' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`h-7 w-7 flex items-center justify-center rounded-full text-sm font-bold ${
                    isToday ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 group-hover:text-slate-900'
                  }`}>
                    {day}
                  </span>
                  {dayJobs.length > 0 && <span className="text-[10px] font-bold text-slate-400">{dayJobs.length} Jobs</span>}
                </div>
                <div className="space-y-1.5">
                  {dayJobs.map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => navigate(`/admin/jobs/${job.id}`)}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        job.status === 'In Progress' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                        job.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        job.status === 'Overdue' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <p className="text-[10px] font-bold truncate">{job.title}</p>
                      <div className="mt-1 flex items-center justify-between text-[8px] font-medium opacity-80">
                        <span>{job.time}</span>
                        <span className="truncate max-w-[50px]">{job.client}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobCalendarPage;
