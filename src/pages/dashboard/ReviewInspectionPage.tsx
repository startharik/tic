import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  User, 
  Camera,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getInspectionById, updateInspection, type Inspection, createNotification } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

const ReviewInspectionPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [media, setMedia] = useState<Array<{ id: string; file_url: string; file_type: string; file_name: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) {
        setError('Missing inspection id');
        setLoading(false);
        return;
      }

      try {
        const data = await getInspectionById(id);
        setInspection(data);

        const { data: mediaRows, error: mediaError } = await supabase
          .from('media')
          .select('id,file_url,file_type,file_name')
          .eq('inspection_id', id)
          .order('created_at', { ascending: false });
        if (mediaError) throw mediaError;
        setMedia(mediaRows || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load inspection');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const inspectorName = useMemo(() => {
    if (!inspection?.inspector) return 'Unassigned';
    return `${inspection.inspector.first_name || ''} ${inspection.inspector.last_name || ''}`.trim() || 'Unassigned';
  }, [inspection]);

  const statusLabel = useMemo(() => {
    if (!inspection) return '';
    const s = inspection.status;
    if (s === 'submitted') return 'Submitted';
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    if (s === 'draft') return 'Draft';
    return s;
  }, [inspection]);

  const statusClass = useMemo(() => {
    if (!inspection) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (inspection.status === 'submitted') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (inspection.status === 'approved') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (inspection.status === 'rejected') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  }, [inspection]);

  const handleApprove = async () => {
    if (!id || !userProfile?.id) return;
    setIsApproving(true);
    try {
      const updated = await updateInspection(id, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userProfile.id,
        rejection_reason: null as any,
      });
      setInspection(updated);

      // Send notification to inspector
      if (inspection?.inspector_id) {
        await createNotification({
          user_id: inspection.inspector_id,
          title: 'Inspection Approved!',
          message: `Your inspection for job "${inspection.jobs?.title || 'N/A'}" has been approved!`,
          type: 'success',
          is_read: false,
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to approve inspection');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setIsRejecting(true);
    try {
      const updated = await updateInspection(id, {
        status: 'rejected',
        rejection_reason: reviewNote || 'Rejected',
      });
      setInspection(updated);

      // Send notification to inspector
      if (inspection?.inspector_id) {
        await createNotification({
          user_id: inspection.inspector_id,
          title: 'Inspection Rejected',
          message: `Your inspection for job "${inspection.jobs?.title || 'N/A'}" has been rejected. Please rework: ${reviewNote || 'See review notes'}`,
          type: 'error',
          is_read: false,
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to reject inspection');
    } finally {
      setIsRejecting(false);
    }
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
              <h1 className="text-2xl font-bold text-slate-900">{inspection?.jobs?.title || 'Inspection'}</h1>
              <span className={`px-3 py-0.5 border rounded-full text-xs font-semibold ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-slate-500">
              Inspection: {inspection?.id || id} • Inspector: {inspectorName}
            </p>
          </div>
        </div>

      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-slate-700">{error}</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overall Result', value: (inspection?.overall_result || 'N/A').toUpperCase(), color: 'text-slate-900', bg: 'bg-slate-50' },
              { label: 'Equipment', value: inspection?.equipment?.name || 'N/A', color: 'text-slate-900', bg: 'bg-slate-50' },
              { label: 'Status', value: statusLabel, color: 'text-slate-900', bg: 'bg-slate-50' },
              { label: 'Media', value: media.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map((stat, idx) => (
              <div key={idx} className={`${stat.bg} p-4 rounded-2xl border border-transparent shadow-sm`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Inspection Details Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                Inspection Notes
              </h2>
            </div>
            <div className="p-0">
              <div className="p-6">
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{inspection?.notes || 'No notes provided.'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Camera className="h-5 w-5 text-slate-400" />
                Evidence
              </h2>
            </div>
            <div className="p-6">
              {media.length === 0 ? (
                <div className="text-sm text-slate-600">No media uploaded.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {media
                    .filter((m) => m.file_type === 'image')
                    .slice(0, 12)
                    .map((m) => (
                      <a
                        key={m.id}
                        href={m.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                        title={m.file_name}
                      >
                        <img src={m.file_url} className="w-full h-28 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                      </a>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - Decision Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
                Reviewer Decision
              </h2>
              <p className="text-xs text-slate-400 mt-1">Submit your final decision on this inspection.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reviewer Notes</label>
                <textarea 
                  rows={4}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add feedback or reasons for rejection..."
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isApproving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Approve & Generate Report
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isApproving || isRejecting}
                  className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isRejecting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Reject & Request Rework
                    </>
                  )}
                </button>
                <button className="w-full py-3 bg-white text-slate-500 rounded-xl text-sm font-bold hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Escalate to Super Admin
                </button>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Reviewing As</p>
                  <p className="text-xs font-bold text-slate-700">
                    {userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : 'Reviewer'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ReviewInspectionPage;
