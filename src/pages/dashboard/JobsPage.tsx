import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2,
  Trash2,
  Download,
  Calendar,
  Loader2,
  ChevronDown,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { getJobs, getUsers, getClients, deleteJob } from '../../services/supabaseService';
import type { Job, User, Client } from '../../services/supabaseService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    'in_progress': 'bg-blue-100 text-blue-700',
    'assigned': 'bg-indigo-100 text-indigo-700',
    'submitted': 'bg-purple-100 text-purple-700',
    'approved': 'bg-emerald-100 text-emerald-700',
    'completed': 'bg-emerald-100 text-emerald-700',
    'rejected': 'bg-rose-100 text-rose-700',
    'closed': 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, usersData, clientsData] = await Promise.all([
        getJobs(),
        getUsers(),
        getClients(),
      ]);
      setJobs(jobsData);
      setUsers(usersData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const getUserName = (userId?: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unassigned' : 'Unassigned';
  };

  const getClientName = (clientId?: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      getClientName(job.client_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getUserName(job.assigned_to).toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All Status' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportToExcel = () => {
    const data = filteredJobs.map(job => ({
      'Job ID': job.id.slice(0, 8).toUpperCase(),
      'Client': getClientName(job.client_id),
      'Job Title': job.title,
      'Engineer': getUserName(job.assigned_to),
      'Scheduled Date': job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'Not scheduled',
      'Priority': job.priority.toUpperCase(),
      'Status': job.status.replace('_', ' ').toUpperCase(),
      'Site Address': job.site_address || '',
      'Site Latitude': job.site_latitude || '',
      'Site Longitude': job.site_longitude || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs');
    XLSX.writeFile(workbook, `jobs_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Management Report', 14, yPosition);
    yPosition += 10;
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, yPosition);
    yPosition += 15;
    
    // Table header
    doc.setFont('helvetica', 'bold');
    const headers = ['Job ID', 'Client', 'Engineer', 'Date', 'Priority', 'Status'];
    const columnWidths = [20, 40, 35, 30, 20, 25];
    let xPosition = 14;
    
    headers.forEach((header, i) => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidths[i];
    });
    yPosition += 8;
    
    doc.setLineWidth(0.5);
    doc.line(14, yPosition - 3, 194, yPosition - 3);
    yPosition += 6;
    
    // Table data
    doc.setFont('helvetica', 'normal');
    
    filteredJobs.forEach((job) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      const rowData = [
        job.id.slice(0, 8).toUpperCase(),
        getClientName(job.client_id).substring(0, 15),
        getUserName(job.assigned_to).substring(0, 15),
        job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'N/A',
        job.priority.toUpperCase(),
        job.status.replace('_', ' ').toUpperCase()
      ];
      
      xPosition = 14;
      rowData.forEach((cell, i) => {
        doc.text(String(cell), xPosition, yPosition);
        xPosition += columnWidths[i];
      });
      
      yPosition += 7;
    });
    
    doc.save(`jobs_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Management</h1>
          <p className="text-slate-500 mt-1">Manage and track all testing and inspection jobs.</p>
        </div>
        <div className="flex items-center space-x-3">
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
                    exportToExcel();
                    setShowExportDropdown(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Export to Excel</span>
                </button>
                
                <button 
                  onClick={() => {
                    exportToPDF();
                    setShowExportDropdown(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                >
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Export to PDF</span>
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/admin/jobs/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Job</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Job ID, Client, or Engineer..."
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
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 text-slate-300 mx-auto mb-4">
              <Calendar className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No jobs found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search or filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All Status');
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client & Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engineer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trainer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales Person</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job, index) => {
                    const assignedEngineer = getUserName(job.assigned_to);
                    const assignedTrainer = job.trainer ? `${job.trainer.first_name || ''} ${job.trainer.last_name || ''}`.trim() || 'Unassigned' : 'Unassigned';
                    const assignedSalesPerson = getUserName(job.sales_person_id);
                    const clientName = getClientName(job.client_id);
                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/admin/jobs/${encodeURIComponent(job.id)}`)}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            className="text-sm font-bold text-primary-600 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/jobs/${encodeURIComponent(job.id)}`);
                            }}
                          >
                            {job.id.slice(0, 8).toUpperCase()}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">{clientName}</span>
                            <span className="text-xs text-slate-500">{job.title}</span>
                            <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${job.type === 'training' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {job.type === 'training' ? 'Training' : 'Inspection'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {assignedEngineer === 'Unassigned' ? '?' : assignedEngineer.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={`text-sm ${assignedEngineer === 'Unassigned' ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                              {assignedEngineer}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">
                              {assignedTrainer === 'Unassigned' ? '?' : assignedTrainer.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={`text-sm ${assignedTrainer === 'Unassigned' ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                              {assignedTrainer}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-600">
                              {assignedSalesPerson === 'Unassigned' ? '?' : assignedSalesPerson.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={`text-sm ${assignedSalesPerson === 'Unassigned' ? 'text-slate-400 italic' : 'text-slate-600'}`}>
                              {assignedSalesPerson}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'Not scheduled'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold ${
                            job.priority === 'high' || job.priority === 'urgent' ? 'text-rose-600' : 
                            job.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {job.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/jobs/${encodeURIComponent(job.id)}/edit`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit job"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this job?')) {
                                  try {
                                    await deleteJob(job.id);
                                    fetchData();
                                  } catch (err) {
                                    console.error('Error deleting job:', err);
                                    alert('Failed to delete job.');
                                  }
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete job"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Showing 1 to {filteredJobs.length} of {jobs.length} jobs</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
