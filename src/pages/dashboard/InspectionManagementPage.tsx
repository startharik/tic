import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
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
  Download,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import { getInspections, updateInspection, type Inspection } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/export';

const InspectionManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getInspections();
        setInspections(data);
      } catch (error) {
        console.error('Error fetching inspections:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (inspectionId: string) => {
    const targetInspection = inspections.find(i => i.id === inspectionId);
    if (!userProfile?.id || !targetInspection || targetInspection.status === 'approved' || targetInspection.status === 'rejected') return;

    setSelectedInspection(targetInspection);
    
    try {
      await updateInspection(inspectionId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userProfile.id
      });
      // Refresh the list
      const data = await getInspections();
      setInspections(data);
    } catch (error) {
      console.error('Error approving inspection:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedInspection || !userProfile?.id) return;
    const reason = rejectionReason.trim();
    if (!reason) {
      alert('Please enter a reason for rejection before submitting.');
      return;
    }
    try {
      await updateInspection(selectedInspection.id, {
        status: 'rejected',
        rejection_reason: reason
      });
      setShowRejectModal(false);
      setRejectionReason('');
      // Refresh the list
      const data = await getInspections();
      setInspections(data);
    } catch (error) {
      console.error('Error rejecting inspection:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = searchQuery === '' || 
      (inspection.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       inspection.equipment?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (inspection.inspector && `${inspection.inspector.first_name || ''} ${inspection.inspector.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (inspection.timesheet_no || '').toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === 'All Status' || inspection.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getExportData = () => {
    return filteredInspections.map(inspection => ({
      'Job Title': inspection.jobs?.title || 'N/A',
      'Equipment': inspection.equipment?.name || 'N/A',
      'Timesheet No.': inspection.timesheet_no || 'N/A',
      'Inspector': inspection.inspector ? `${inspection.inspector.first_name || ''} ${inspection.inspector.last_name || ''}`.trim() : 'Unassigned',
      'Overall Result': inspection.overall_result || 'N/A',
      'Status': inspection.status.toUpperCase(),
      'Created At': new Date(inspection.created_at).toLocaleString(),
      'Submitted At': inspection.submitted_at ? new Date(inspection.submitted_at).toLocaleString() : 'N/A',
      'Approved At': inspection.approved_at ? new Date(inspection.approved_at).toLocaleString() : 'N/A',
      'Notes': inspection.notes || 'N/A'
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    if (data.length === 0) return;
    exportToCSV({ data, fileName: 'inspections' });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    if (data.length === 0) return;
    exportToExcel({ data, fileName: 'inspections', sheetName: 'Inspections' });
  };

  const handleExportPDF = () => {
    const data = getExportData();
    if (data.length === 0) return;
    exportToPDF({ data, fileName: 'inspections', title: 'Inspections Report' });
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
          <h1 className="text-2xl font-bold text-slate-900">Inspection Management</h1>
          <p className="text-slate-500 mt-1">Review and manage inspection reports.</p>
        </div>
        <div className="relative" ref={exportDropdownRef}>
          <button 
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <button 
                onClick={() => {
                  handleExportCSV();
                  setShowExportDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Export to CSV</span>
              </button>
              
              <button 
                onClick={() => {
                  handleExportExcel();
                  setShowExportDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Export to Excel</span>
              </button>
              
              <button 
                onClick={() => {
                  handleExportPDF();
                  setShowExportDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
              >
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Export to PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Inspections', value: filteredInspections.length, icon: <ClipboardList className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
          { label: 'Drafts', value: filteredInspections.filter(i => i.status === 'draft').length, icon: <FileText className="h-5 w-5 text-slate-600" />, bg: 'bg-slate-50' },
          { label: 'Submitted', value: filteredInspections.filter(i => i.status === 'submitted').length, icon: <Send className="h-5 w-5 text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Approved', value: filteredInspections.filter(i => i.status === 'approved').length, icon: <CheckCircle className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50' },
          { label: 'Rejected', value: filteredInspections.filter(i => i.status === 'rejected').length, icon: <XCircle className="h-5 w-5 text-rose-600" />, bg: 'bg-rose-50' },
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inspections..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
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

      {/* Inspections Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">S.No</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job / Equipment</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timesheet</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inspector</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Result</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted At</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInspections.map((item, index) => {
              const normalizedResult = (item.overall_result || '').toLowerCase();
              const resultClass = normalizedResult === 'pass'
                ? 'bg-emerald-100 text-emerald-700'
                : normalizedResult === 'fail' || normalizedResult === 'failed'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-600';
              const resultLabel = normalizedResult === 'pass'
                ? 'PASSED'
                : normalizedResult === 'fail' || normalizedResult === 'failed'
                  ? 'FAILED'
                  : (item.overall_result || 'N/A').toUpperCase();

              return (
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
                    {item.timesheet_no || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.inspector ? `${item.inspector.first_name || ''} ${item.inspector.last_name || ''}`.trim() || 'Unassigned' : 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.overall_result ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${resultClass}`}>
                        {resultLabel}
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
                    : <span className="text-slate-400 italic">{new Date(item.created_at).toLocaleString()}</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/admin/inspections/${item.id}/review`)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {item.status === 'submitted' && (hasPermission('write:inspections') || userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || userProfile?.role === 'coordinator') && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInspection(item);
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md z-10 mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Reject Inspection</h3>
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
                Reject Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionManagementPage;
