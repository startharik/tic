import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar,
  Camera,
  MessageSquare,
  ShieldCheck,
  Download,
  Eye
} from 'lucide-react';

const ReviewInspectionPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewNote, setReviewNote] = useState('');

  const inspection = {
    id: id || 'INS-88291',
    jobId: 'JB-2024-001',
    client: 'Saudi Aramco',
    type: 'Pressure Vessel Inspection',
    engineer: 'John Doe',
    date: '2026-05-13',
    status: 'Pending Review',
    summary: { total: 24, passed: 22, failed: 2, flagged: 0 },
    defects: [
      { point: '1.4 External Corrosion', severity: 'Medium', note: 'Surface rust observed on the lower support structure. Requires cleaning and repainting.', photo: true },
      { point: '3.2 Valve Leakage', severity: 'High', note: 'Minor gas leakage detected at the primary pressure relief valve connection.', photo: true },
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
              <h1 className="text-2xl font-bold text-slate-900">Review Inspection: {inspection.id}</h1>
              <span className="px-3 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                {inspection.status}
              </span>
            </div>
            <p className="text-slate-500">Job ID: {inspection.jobId} • Submitted by {inspection.engineer}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Draft Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Checklist Points', value: inspection.summary.total, color: 'text-slate-900', bg: 'bg-slate-50' },
              { label: 'Passed Points', value: inspection.summary.passed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Failed Points', value: inspection.summary.failed, color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'Media Captured', value: '14', color: 'text-blue-600', bg: 'bg-blue-50' },
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
                Defect Report
              </h2>
            </div>
            <div className="p-0">
              {inspection.defects.map((defect, idx) => (
                <div key={idx} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-bold text-slate-900">{defect.point}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      defect.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {defect.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{defect.note}</p>
                  {defect.photo && (
                    <div className="flex items-center gap-3">
                      <div className="h-20 w-32 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="h-20 w-32 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                        <Camera className="h-6 w-6" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Full Checklist Viewer (Placeholder) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center border-dashed">
            <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">View Full Checklist</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Review all 24 data points and recorded measurements.</p>
            <button className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-100">
              Expand All Sections
            </button>
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
                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve & Generate Report
                </button>
                <button className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100">
                  <XCircle className="h-4 w-4" />
                  Reject & Request Rework
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
                  <p className="text-xs font-bold text-slate-700">Sarah Miller (Manager)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              Recent Communication
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-900">John Doe (Engineer)</p>
                <p className="text-xs text-slate-600 mt-1">"Found some corrosion on the lower part, marked as medium severity."</p>
                <p className="text-[9px] text-slate-400 mt-2">Today, 04:30 PM</p>
              </div>
              <button className="w-full py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                View All Messages
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewInspectionPage;
