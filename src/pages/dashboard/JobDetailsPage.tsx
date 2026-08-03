import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  FileText, 
  MessageSquare, 
  Edit,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { getJob, getUsers, getClients, updateJob, createNotification } from '../../services/supabaseService';
import type { Job, User, Client } from '../../services/supabaseService';

const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!jobId) return;
        setLoading(true);
        const [jobData, usersData, clientsData] = await Promise.all([
          getJob(jobId),
          getUsers(),
          getClients()
        ]);
        setJob(jobData);
        setUsers(usersData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const getUserName = (userId?: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}`.trim() || 'Unassigned' : 'Unassigned';
  };

  const getClientName = (clientId?: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'submitted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const jobNumber = (id: string) => {
    const raw = (id || '').toString();
    const short = raw.length >= 8 ? raw.slice(0, 8).toUpperCase() : raw.toUpperCase();
    return `JB-${short}`;
  };

  const handleApproveReport = async () => {
    if (!job) return;
    try {
      setActionLoading(true);
      const updatedJob = await updateJob(job.id, { status: 'approved' });
      setJob(updatedJob);
      
      // Send notifications
      if (updatedJob.assigned_to) {
        await createNotification({
          user_id: updatedJob.assigned_to,
          title: 'Job Approved!',
          message: `Your inspection for job "${updatedJob.title}" has been approved by admin.`,
          type: 'success',
          related_job_id: updatedJob.id,
          is_read: false,
        });
      }
      if (updatedJob.sales_person_id) {
        await createNotification({
          user_id: updatedJob.sales_person_id,
          title: 'Job Approved!',
          message: `The job "${updatedJob.title}" has been approved. You can download photos now.`,
          type: 'success',
          related_job_id: updatedJob.id,
          is_read: false,
        });
      }
      alert('Report approved successfully!');
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Failed to approve report. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Job not found</p>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                {formatStatus(job.status)}
              </span>
            </div>
            <p className="text-slate-500">{jobNumber(job.id)} • {getClientName(job.client_id)}</p>
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
          {job.status === 'submitted' && (
            <button 
              onClick={handleApproveReport}
              disabled={actionLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span>Approve Report</span>
            </button>
          )}
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
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Assigned Engineer</p>
                    <p className="text-sm font-semibold text-slate-900">{getUserName(job.assigned_to)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-purple-50 rounded-lg">
                    <UserIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Trainer</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {job.trainer ? `${job.trainer.first_name || ''} ${job.trainer.last_name || ''}`.trim() || 'Unassigned' : 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-pink-50 rounded-lg">
                    <UserIcon className="h-4 w-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Sales Person</p>
                    <p className="text-sm font-semibold text-slate-900">{getUserName(job.sales_person_id)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-emerald-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Scheduled Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'Not Scheduled'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-amber-50 rounded-lg">
                    <FileText className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">JO Number</p>
                    <p className="text-sm font-semibold text-slate-900 font-mono">
                      {job.jo_number || <span className="text-slate-400 font-sans">Not assigned</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-teal-50 rounded-lg">
                    <FileText className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Task Number</p>
                    <p className="text-sm font-semibold text-slate-900 font-mono">
                      {job.task_number || <span className="text-slate-400 font-sans">Not assigned</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-cyan-50 rounded-lg">
                    <FileText className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Job Type</p>
                    <span className={`text-sm font-semibold inline-block px-2 py-1 rounded-full ${job.type === 'training' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {job.type === 'training' ? 'Training' : 'Inspection'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-rose-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Site Location</p>
                    <p className="text-sm font-semibold text-slate-900">{job.site_address || 'N/A'}</p>
                    {typeof job.site_latitude === 'number' &&
                      typeof job.site_longitude === 'number' &&
                      !(job.site_latitude === 0 && job.site_longitude === 0) && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {job.site_latitude.toFixed(6)}, {job.site_longitude.toFixed(6)}
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-indigo-50 rounded-lg">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Priority Level</p>
                    <span className={`text-xs font-bold ${
                      job.priority === 'high' || job.priority === 'urgent' ? 'text-rose-600' : 
                      job.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 pt-4 border-t border-slate-50">
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Description / Instructions</p>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {job.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-primary-600 rounded-xl p-6 text-white shadow-lg shadow-primary-200 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication
              </h3>
              <p className="text-xs text-primary-100 mb-4">Chat with the assigned engineer regarding this job.</p>
              <button 
                onClick={() => navigate(`/admin/chat?jobId=${jobId}`)}
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
