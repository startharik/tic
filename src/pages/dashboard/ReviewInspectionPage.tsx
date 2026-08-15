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
import { getInspectionById, updateInspection, updateJob, type Inspection, createNotification } from '../../services/supabaseService';
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
  const [media, setMedia] = useState<Array<{ 
    id: string; 
    file_url: string; 
    file_type: string; 
    file_name: string;
    watermark_data?: any;
    created_at: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);

  const parseWatermarkTimestamp = (value: any): string => {
    if (!value) return '';
    const raw = value.toString();
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();

    const match = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, day, month, year, hour, minute, second] = match;
      const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}:${second}`;
      const fallback = new Date(iso);
      if (!Number.isNaN(fallback.getTime())) return fallback.toLocaleString();
    }

    return raw;
  };

  const parseWatermarkGps = (gps: any): { latitude: number; longitude: number } | null => {
    if (!gps) return null;
    if (typeof gps === 'string') {
      const match = gps.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (match) {
        return { latitude: Number(match[1]), longitude: Number(match[2]) };
      }
      const cleaned = gps.replace(/GPS:\s*/i, '').trim();
      const cleanedMatch = cleaned.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      if (cleanedMatch) {
        return { latitude: Number(cleanedMatch[1]), longitude: Number(cleanedMatch[2]) };
      }
      return null;
    }
    if (typeof gps === 'object') {
      if (gps.latitude != null && gps.longitude != null) {
        return { latitude: Number(gps.latitude), longitude: Number(gps.longitude) };
      }
      if (gps.gps_coordinates && typeof gps.gps_coordinates === 'object' && gps.gps_coordinates.latitude != null && gps.gps_coordinates.longitude != null) {
        return {
          latitude: Number(gps.gps_coordinates.latitude),
          longitude: Number(gps.gps_coordinates.longitude),
        };
      }
    }
    return null;
  };

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
          .select('id,file_url,file_type,file_name,watermark_data,created_at,inspection_id,job_id')
          .or(`inspection_id.eq.${id},job_id.eq.${data?.job_id}`)
          .order('created_at', { ascending: false });
        if (mediaError) throw mediaError;
        setMedia((mediaRows || []).filter((row: any) => row.inspection_id === id || row.job_id === data?.job_id));
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

  const isDecisionLocked = !!inspection && (inspection.status === 'approved' || inspection.status === 'rejected' || isApproving || isRejecting);

  const getOverallResultClass = (result?: string) => {
    const normalized = (result || '').toLowerCase();
    if (normalized === 'pass') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (normalized === 'fail' || normalized === 'failed') return 'bg-rose-100 text-rose-700 border border-rose-200';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const getOverallResultLabel = (result?: string) => {
    const normalized = (result || '').toLowerCase();
    if (normalized === 'pass') return 'PASSED';
    if (normalized === 'fail' || normalized === 'failed') return 'FAILED';
    return (result || 'N/A').toUpperCase();
  };

  const handleApprove = async () => {
    if (!id || !userProfile?.id || !inspection || isDecisionLocked) return;
    setError(null);
    setIsApproving(true);
    try {
      const updated = await updateInspection(id, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userProfile.id,
        rejection_reason: null as any,
      });
      setInspection(updated);

      // Update job status to completed
      if (inspection?.job_id) {
        await updateJob(inspection.job_id, {
          status: 'completed',
        });
      }

      // Send notification to inspector
      if (inspection?.inspector_id) {
        await createNotification({
          user_id: inspection.inspector_id,
          title: 'Inspection Approved!',
          message: `Your inspection for job "${inspection.jobs?.title || 'N/A'}" has been approved!`,
          type: 'success',
          is_read: false,
          related_job_id: inspection.job_id,
        });
      }

      // Send notification to sales person
      if (inspection?.jobs?.sales_person_id) {
        await createNotification({
          user_id: inspection.jobs.sales_person_id,
          title: 'Job Completed!',
          message: `Job "${inspection.jobs?.title || 'N/A'}" has been approved! You can now download the photos.`,
          type: 'success',
          is_read: false,
          related_job_id: inspection.job_id,
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to approve inspection');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!id || !inspection?.job_id || isDecisionLocked) return;

    const reason = reviewNote.trim();
    if (!reason) {
      setError('Please add a reason for rejection before submitting.');
      return;
    }

    setError(null);
    setIsRejecting(true);
    try {
      const updated = await updateInspection(id, {
        status: 'rejected',
        approved_at: new Date().toISOString(),
        approved_by: userProfile?.id,
        rejection_reason: reason,
      });
      setInspection(updated);

      // Update job status to rejected
      await updateJob(inspection.job_id, {
        status: 'rejected',
      });

      // Send notification to inspector
      if (inspection?.inspector_id) {
        await createNotification({
          user_id: inspection.inspector_id,
          title: 'Inspection Rejected',
          message: `Your inspection for job "${inspection.jobs?.title || 'N/A'}" has been rejected. Please rework: ${reviewNote || 'See review notes'}`,
          type: 'error',
          is_read: false,
          related_job_id: inspection.job_id,
        });
      }

      // Send notification to sales person
      if (inspection?.jobs?.sales_person_id) {
        await createNotification({
          user_id: inspection.jobs.sales_person_id,
          title: 'Inspection Rejected',
          message: `Inspection for job "${inspection.jobs?.title || 'N/A'}" has been rejected: ${reviewNote || 'See review notes'}`,
          type: 'error',
          is_read: false,
          related_job_id: inspection.job_id,
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
            {inspection?.timesheet_no && (
              <p className="text-sm text-slate-500 mt-1">Timesheet No.: <span className="font-medium text-slate-700">{inspection.timesheet_no}</span></p>
            )}
            {(inspection?.submitted_at || inspection?.created_at) && (inspection?.status === 'submitted' || inspection?.status === 'approved' || inspection?.status === 'rejected') && (
              <p className="text-sm text-slate-500 mt-1">
                Submitted At: <span className="font-medium text-slate-700">{new Date(inspection.submitted_at || inspection.created_at).toLocaleString()}</span>
              </p>
            )}
            {inspection?.approver && (
              <p className="text-sm text-slate-500 mt-1">
                {inspection.status === 'rejected' ? 'Rejected By' : 'Approved By'}: <span className="font-medium text-slate-700">{`${inspection.approver.first_name || ''} ${inspection.approver.last_name || ''}`.trim()}</span>
              </p>
            )}
            {(inspection?.status === 'approved' || inspection?.status === 'rejected') && inspection?.approved_at && (
              <p className="text-sm text-slate-500 mt-1">
                {inspection.status === 'rejected' ? 'Rejected At' : 'Approved At'}: <span className="font-medium text-slate-700">{new Date(inspection.approved_at).toLocaleString()}</span>
              </p>
            )}
            {inspection?.status === 'rejected' && inspection?.rejection_reason && (
              <p className="text-sm text-rose-600 mt-1 bg-rose-50 px-2 py-1 rounded-lg inline-block">
                Rejection Reason: {inspection.rejection_reason}
              </p>
            )}
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
              { label: 'Overall Result', value: getOverallResultLabel(inspection?.overall_result), color: 'text-slate-900', bg: getOverallResultClass(inspection?.overall_result) },
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

              {/* Job & Contacts */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-slate-400" />
                    Job & Contacts
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <div className="text-sm text-slate-700">
                    <div><span className="text-slate-500">Site Contact: </span><span className="font-medium">{inspection?.jobs?.site_person_name || '—'}</span></div>
                    {inspection?.jobs?.site_person_phone && <div className="text-sm text-slate-500">Phone: <span className="font-medium text-slate-700">{inspection.jobs.site_person_phone}</span></div>}
                    {inspection?.jobs?.site_person_email && <div className="text-sm text-slate-500">Email: <span className="font-medium text-slate-700">{inspection.jobs.site_person_email}</span></div>}
                    <div className="mt-2"><span className="text-slate-500">Sales Person: </span><span className="font-medium">{inspection?.jobs?.sales_person ? `${inspection.jobs.sales_person.first_name || ''} ${inspection.jobs.sales_person.last_name || ''}`.trim() : '—'}</span></div>
                    <div className="mt-2"><span className="text-slate-500">Engineer/Trainer: </span><span className="font-medium">{inspection?.jobs?.assigned_user ? `${inspection.jobs.assigned_user.first_name || ''} ${inspection.jobs.assigned_user.last_name || ''}`.trim() : (inspection?.jobs?.trainer ? `${inspection.jobs.trainer.first_name || ''} ${inspection.jobs.trainer.last_name || ''}`.trim() : '—')}</span></div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {media
                    .filter((m) => m.file_type === 'image')
                    .slice(0, 12)
                    .map((m) => {
                      const timestamp = parseWatermarkTimestamp(m.watermark_data?.timestamp ?? m.created_at);
                      const gpsPoint = parseWatermarkGps(m.watermark_data?.gps);
                      const mapsUrl = gpsPoint ? `https://www.google.com/maps?q=${gpsPoint.latitude},${gpsPoint.longitude}` : null;
                      
                      return (
                        <div key={m.id} className="group flex flex-col gap-2">
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                            title={m.file_name}
                          >
                            <img src={m.file_url} className="w-full h-28 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                          </a>
                          <div className="flex flex-col gap-1 px-1">
                            <span className="text-xs text-slate-500">{timestamp}</span>
                            {mapsUrl && gpsPoint ? (
                              <a 
                                href={mapsUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span>📍</span>
                                {gpsPoint.latitude.toFixed(6)}, {gpsPoint.longitude.toFixed(6)}
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <span>📍</span>
                                Location not available
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Signature (if any) */}
          {(() => {
            const sig = media.find((m) => (m.file_type && m.file_type.toLowerCase().includes('signature')) || (m.file_name && m.file_name.toLowerCase().includes('signature')));
            if (!sig) return null;
            return (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-400" />
                    Signature
                  </h2>
                </div>
                <div className="p-6">
                  <a href={sig.file_url} target="_blank" rel="noreferrer">
                    <img src={sig.file_url} alt={sig.file_name} className="max-h-48 object-contain" />
                  </a>
                </div>
              </div>
            );
          })()}
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
                  onChange={(e) => {
                    setReviewNote(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Add feedback or reasons for rejection..."
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none ${error ? 'border-rose-300' : 'border-transparent'}`}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={isDecisionLocked}
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
                  disabled={isDecisionLocked}
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
