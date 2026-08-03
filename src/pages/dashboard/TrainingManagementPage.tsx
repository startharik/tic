import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Layout,
  Loader2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Send,
} from 'lucide-react';
import { getTrainings, updateTraining, type Training } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

const TrainingManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTrainings();
        setTrainings(data);
      } catch (error) {
        console.error('Error fetching trainings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (trainingId: string) => {
    const training = trainings.find((t) => t.id === trainingId);
    if (!userProfile?.id || !training) return;

    try {
      await updateTraining(trainingId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userProfile.id,
      });
      const data = await getTrainings();
      setTrainings(data);
    } catch (error) {
      console.error('Error approving training:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedTraining || !userProfile?.id) return;
    try {
      await updateTraining(selectedTraining.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      setShowRejectModal(false);
      setRejectionReason('');
      const data = await getTrainings();
      setTrainings(data);
    } catch (error) {
      console.error('Error rejecting training:', error);
    }
  };

  const stats = {
    total: trainings.length,
    draft: trainings.filter((t) => t.status === 'draft').length,
    submitted: trainings.filter((t) => t.status === 'submitted').length,
    approved: trainings.filter((t) => t.status === 'approved').length,
    rejected: trainings.filter((t) => t.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Training Management</h1>
          <p className="text-slate-500 mt-1">Review and manage training reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Trainings', value: stats.total, icon: <GraduationCap className="h-5 w-5 text-violet-600" />, bg: 'bg-violet-50' },
          { label: 'Drafts', value: stats.draft, icon: <FileText className="h-5 w-5 text-slate-600" />, bg: 'bg-slate-50' },
          { label: 'Submitted', value: stats.submitted, icon: <Send className="h-5 w-5 text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Approved', value: stats.approved, icon: <CheckCircle className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Rejected', value: stats.rejected, icon: <XCircle className="h-5 w-5 text-rose-600" />, bg: 'bg-rose-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search trainings..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
            <option>All Status</option>
            <option>Draft</option>
            <option>Submitted</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">S.No</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job / Equipment</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trainer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Result</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted At</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trainings.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Layout className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-bold text-slate-900">{item.jobs?.title || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-slate-500">{item.equipment?.name || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.trainer ? `${item.trainer.first_name || ''} ${item.trainer.last_name || ''}`.trim() || 'Unassigned' : 'Unassigned'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.overall_result ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      item.overall_result === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.overall_result}
                    </span>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                    item.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {item.submitted_at
                    ? new Date(item.submitted_at).toLocaleString()
                    : item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/admin/trainings/${item.id}/review`)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {item.status === 'submitted' && (hasPermission('*') || userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTraining(item);
                            setShowRejectModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md z-10 mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Reject Training</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Enter reason..."
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-slate-600 font-medium rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700"
              >
                Reject Training
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManagementPage;
