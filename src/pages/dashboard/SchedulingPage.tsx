import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Filter, Loader2, Search, Users, Eye, RefreshCw, Save, X, Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import { getBranches, getJobs, getUsers, updateJob } from '../../services/supabaseService';
import type { Branch, Job, User } from '../../services/supabaseService';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/export';

type AssignModalState =
  | { open: false }
  | {
      open: true;
      job: Job;
      assignedTo: string;
      scheduledAt: string;
    };

const toDateInput = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toLocalDateTimeInput = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

const localDateTimeToISO = (value: string): string | null => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const displayName = (u: Pick<User, 'first_name' | 'last_name'>): string => {
  const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
  return name || 'User';
};

const SchedulingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState(() => toDateInput(today));
  const [toDate, setToDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return toDateInput(d);
  });
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const [engineerId, setEngineerId] = useState('');
  const [status, setStatus] = useState<'all' | string>('all');

  const [assignModal, setAssignModal] = useState<AssignModalState>({ open: false });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  const engineers = useMemo(() => users.filter((u) => u.role === 'engineer'), [users]);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [jobData, userData, branchData] = await Promise.all([getJobs(), getUsers(), getBranches()]);
      setJobs(jobData);
      setUsers(userData);
      setBranches(branchData);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load scheduling data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredJobs = useMemo(() => {
    const norm = search.trim().toLowerCase();
    const from = new Date(fromDate + 'T00:00:00');
    const to = new Date(toDate + 'T23:59:59');

    return jobs
      .filter((j) => {
        if (!j.scheduled_date) return false;
        const d = new Date(j.scheduled_date);
        if (Number.isNaN(d.getTime())) return false;
        return d >= from && d <= to;
      })
      .filter((j) => (branchId ? j.branch_id === branchId : true))
      .filter((j) => (engineerId ? j.assigned_to === engineerId : true))
      .filter((j) => (status === 'all' ? true : j.status === status))
      .filter((j) => {
        if (!norm) return true;
        return (
          j.title.toLowerCase().includes(norm) ||
          (j.clients?.name || '').toLowerCase().includes(norm) ||
          (j.branches?.name || '').toLowerCase().includes(norm) ||
          j.id.toLowerCase().includes(norm)
        );
      })
      .sort((a, b) => new Date(a.scheduled_date as string).getTime() - new Date(b.scheduled_date as string).getTime());
  }, [branchId, engineerId, fromDate, jobs, search, status, toDate]);

  const kpis = useMemo(() => {
    const now = new Date();
    const unassigned = filteredJobs.filter((j) => !j.assigned_to).length;
    const overdue = filteredJobs.filter((j) => {
      if (!j.scheduled_date) return false;
      const d = new Date(j.scheduled_date);
      if (Number.isNaN(d.getTime())) return false;
      return d < now && j.status !== 'closed' && j.status !== 'approved';
    }).length;
    return {
      total: filteredJobs.length,
      unassigned,
      overdue,
      engineers: engineers.length,
    };
  }, [engineers.length, filteredJobs]);

  const openAssign = (job: Job) => {
    setAssignModal({
      open: true,
      job,
      assignedTo: job.assigned_to || '',
      scheduledAt: job.scheduled_date ? toLocalDateTimeInput(job.scheduled_date) : '',
    });
  };

  const closeAssign = () => setAssignModal({ open: false });

  const saveAssign = async () => {
    if (!assignModal.open) return;
    const iso = localDateTimeToISO(assignModal.scheduledAt);
    if (!iso) {
      setError('Please choose a valid scheduled date/time.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateJob(assignModal.job.id, {
        assigned_to: assignModal.assignedTo || undefined,
        scheduled_date: iso,
      });
      await fetchData();
      closeAssign();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update job schedule');
    } finally {
      setSaving(false);
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

  const getExportData = () => {
    return filteredJobs.map((j) => {
      const engineer = users.find(u => u.id === j.assigned_to);
      return {
        'Job ID': j.id.slice(0, 8).toUpperCase(),
        'Job Title': j.title,
        'Client': j.clients?.name || 'Unknown',
        'Branch': j.branches?.name || 'Unknown',
        'Engineer': engineer ? displayName(engineer) : 'Unassigned',
        'Scheduled Date': j.scheduled_date ? new Date(j.scheduled_date).toLocaleString() : 'Not Scheduled',
        'Status': j.status.charAt(0).toUpperCase() + j.status.slice(1)
      };
    });
  };

  const handleExportCSV = () => {
    const data = getExportData();
    if (data.length === 0) return;
    exportToCSV({ data, fileName: 'scheduling' });
  };

  const handleExportExcel = () => {
    const data = getExportData();
    if (data.length === 0) return;
    exportToExcel({ data, fileName: 'scheduling', sheetName: 'Scheduling' });
  };

  const handleExportPDF = () => {
    const data = getExportData();
    if (data.length === 0) return;
    exportToPDF({ data, fileName: 'scheduling', title: 'Scheduling Report' });
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
          <h1 className="text-2xl font-bold text-slate-900">Scheduling</h1>
          <p className="text-slate-500 mt-1">Plan and assign jobs across engineers and branches.</p>
        </div>
        <div className="flex items-center gap-3">
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
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{kpis.total}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Unassigned</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{kpis.unassigned}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Overdue</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{kpis.overdue}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Engineers</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{kpis.engineers}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search job title, client, branch, or job id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-sm outline-none"
            />
            <span className="text-slate-400 text-sm">→</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={engineerId}
            onChange={(e) => setEngineerId(e.target.value)}
            className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">All Engineers</option>
            {engineers.map((u) => (
              <option key={u.id} value={u.id}>
                {displayName(u)}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">All Status</option>
            {Array.from(new Set(jobs.map((j) => j.status))).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engineer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((j, index) => {
                const engineer = j.assigned_users
                  ? `${j.assigned_users.first_name} ${j.assigned_users.last_name}`.trim()
                  : '';
                return (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">{j.title}</div>
                      <div className="text-xs text-slate-500">{j.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{j.clients?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{j.branches?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {j.scheduled_date ? new Date(j.scheduled_date).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>{engineer || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{j.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/jobs/${j.id}`)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openAssign(j)}
                          className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700 shadow shadow-primary-200"
                        >
                          Assign / Reschedule
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                    No scheduled jobs in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeAssign} />
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg z-10 mx-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold text-slate-900">Assign / Reschedule</div>
                <div className="text-sm text-slate-500 mt-1">{assignModal.job.title}</div>
              </div>
              <button
                type="button"
                onClick={closeAssign}
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={assignModal.scheduledAt}
                  onChange={(e) => setAssignModal({ ...assignModal, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Engineer</label>
                <select
                  value={assignModal.assignedTo}
                  onChange={(e) => setAssignModal({ ...assignModal, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Unassigned</option>
                  {engineers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {displayName(u)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeAssign}
                className="px-4 py-2 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={saveAssign}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 shadow shadow-primary-200 disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulingPage;
