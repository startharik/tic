import React, { useMemo, useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  BarChart3, 
  PieChart as PieIcon,
  Calendar,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ClipboardList,
  MoreVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Cell, 
  Pie 
} from 'recharts';
import {
  getChatMessagesLite,
  getAuditLogs,
  getDashboardStats,
  getDocuments,
  getInspections,
  getEquipment,
  getJobs,
  getBranches,
  getMedia,
  getUsers,
} from '../../services/supabaseService';
import type { AuditLog, Branch, ChatMessageLite, Document, Equipment, Inspection, Job, Media, User } from '../../services/supabaseService';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/export';

type ReportType =
  | 'Inspection Approvals'
  | 'Jobs Report'
  | 'Engineers Report'
  | 'Users Report'
  | 'Branches Report'
  | 'Documents Report'
  | 'Renewals Report'
  | 'Audit Logs';

type UserReportRow = {
  user_id: string;
  name: string;
  role: string;
  jobs_assigned: number;
  jobs_completed: number;
  inspections_submitted: number;
  inspections_approved: number;
  media_uploaded: number;
  documents_uploaded: number;
  messages_sent: number;
};

const formatIsoDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtDateTime = (value: string) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const dateInRange = (value: string | undefined, from: string, to: string) => {
  if (!value) return false;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return false;
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T23:59:59`);
  return dt >= start && dt <= end;
};

const displayName = (u: Pick<User, 'first_name' | 'last_name'>) => {
  const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
  return name || 'User';
};

const ReportsDashboard: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>(() => {
    const stored = window.localStorage.getItem('tic_reports_reportType');
    const allowed: ReportType[] = [
      'Inspection Approvals',
      'Jobs Report',
      'Engineers Report',
      'Users Report',
      'Branches Report',
      'Documents Report',
      'Renewals Report',
      'Audit Logs',
    ];
    if (stored && (allowed as string[]).includes(stored)) return stored as ReportType;
    return 'Users Report';
  });
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [messages, setMessages] = useState<ChatMessageLite[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [dateFrom, setDateFrom] = useState(() => formatIsoDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  const [dateTo, setDateTo] = useState(() => formatIsoDate(new Date()));
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin' | 'engineer' | 'sales'>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  useEffect(() => {
    if (reportType === 'Engineers Report') {
      setRoleFilter('engineer');
      setUserFilter('all');
    }
    if (reportType === 'Users Report') {
      setRoleFilter('all');
      setUserFilter('all');
    }
  }, [reportType]);

  useEffect(() => {
    window.localStorage.setItem('tic_reports_reportType', reportType);
  }, [reportType]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          dashboardStats,
          jobsData,
          usersData,
          inspectionsData,
          documentsData,
          branchesData,
          equipmentData,
          mediaData,
          messagesData,
          auditLogsData,
        ] = await Promise.all([
          getDashboardStats(),
          getJobs(),
          getUsers(),
          getInspections(),
          getDocuments(),
          getBranches(),
          getEquipment(),
          getMedia(),
          getChatMessagesLite(),
          getAuditLogs(),
        ]);

        setStats(dashboardStats);
        setJobs(jobsData);
        setUsers(usersData);
        setInspections(inspectionsData);
        setDocuments(documentsData);
        setBranches(branchesData);
        setEquipment(equipmentData);
        setMedia(mediaData);
        setMessages(messagesData);
        setAuditLogs(auditLogsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const statusData = [
    { name: 'Approved', value: stats?.approvedInspections || 0, color: '#10B981' },
    { name: 'Rejected', value: stats?.rejectedInspections || 0, color: '#EF4444' },
    { name: 'Pending', value: stats?.submittedInspections || 0, color: '#F59E0B' },
    { name: 'In Review', value: stats?.draftInspections || 0, color: '#0EA5E9' },
  ].filter(item => item.value > 0);

  const branchJobData = useMemo(() => {
    const branchCounts: Record<string, number> = {};
    jobs.forEach(job => {
      const branchName = job.branches?.name || 'Unknown';
      branchCounts[branchName] = (branchCounts[branchName] || 0) + 1;
    });

    return Object.entries(branchCounts)
      .map(([name, jobs]) => ({ name, jobs }))
      .sort((a, b) => b.jobs - a.jobs);
  }, [jobs]);

  const inspectionRecentRows = useMemo(() => {
    return inspections
      .filter((i) => dateInRange(i.created_at, dateFrom, dateTo))
      .slice(0, 12)
      .map((i) => {
        const job = i.jobs?.title || i.job_id;
        const eq = i.equipment?.name || i.equipment_id;
        const engineer = i.inspector ? `${i.inspector.first_name || ''} ${i.inspector.last_name || ''}`.trim() : '—';
        return {
          id: i.id,
          job,
          eq,
          engineer: engineer || '—',
          status: i.status,
          created_at: i.created_at,
        };
      });
  }, [inspections, dateFrom, dateTo]);

  const inspectionKpis = useMemo(() => {
    const inRange = inspections.filter((i) => dateInRange(i.created_at, dateFrom, dateTo));
    const submitted = inRange.filter((i) => i.status === 'submitted');
    const approved = inRange.filter((i) => i.status === 'approved');
    const rejected = inRange.filter((i) => i.status === 'rejected');

    const reviewed = [...approved, ...rejected];
    const complianceRate = reviewed.length === 0 ? 0 : Math.round((approved.length / reviewed.length) * 1000) / 10;

    const reviewHours: number[] = [];
    reviewed.forEach((i) => {
      const start = i.submitted_at || i.created_at;
      const end = i.approved_at || i.updated_at;
      const s = new Date(start);
      const e = new Date(end);
      if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
        reviewHours.push((e.getTime() - s.getTime()) / (1000 * 60 * 60));
      }
    });
    const avgReview = reviewHours.length === 0 ? 0 : reviewHours.reduce((a, b) => a + b, 0) / reviewHours.length;

    return {
      submitted: submitted.length,
      approved: approved.length,
      rejected: rejected.length,
      complianceRate,
      avgReviewHours: avgReview,
    };
  }, [inspections, dateFrom, dateTo]);

  const branchRows = useMemo(() => {
    const today = new Date();
    const inRangeJobs = jobs.filter((j) => dateInRange(j.created_at, dateFrom, dateTo));
    const engineersByBranch: Record<string, number> = {};
    users
      .filter((u) => u.role === 'engineer')
      .forEach((u) => {
        if (!u.branch_id) return;
        engineersByBranch[u.branch_id] = (engineersByBranch[u.branch_id] || 0) + 1;
      });

    const activeStatuses = new Set(['open', 'assigned', 'in_progress', 'submitted', 'approved', 'rejected']);
    const activeByBranch: Record<string, number> = {};
    const overdueByBranch: Record<string, number> = {};

    inRangeJobs.forEach((j) => {
      const b = j.branch_id || 'unknown';
      if (activeStatuses.has(j.status)) activeByBranch[b] = (activeByBranch[b] || 0) + 1;
      if (j.due_date) {
        const due = new Date(j.due_date);
        if (!Number.isNaN(due.getTime()) && due < today && j.status !== 'closed') {
          overdueByBranch[b] = (overdueByBranch[b] || 0) + 1;
        }
      }
    });

    return branches
      .map((b) => ({
        id: b.id,
        branch: b.name,
        country: b.countries?.name || '—',
        engineers: engineersByBranch[b.id] || 0,
        active: activeByBranch[b.id] || 0,
        overdue: overdueByBranch[b.id] || 0,
      }))
      .sort((a, b) => b.active - a.active || b.engineers - a.engineers || a.branch.localeCompare(b.branch));
  }, [branches, jobs, users, dateFrom, dateTo]);

  const documentRows = useMemo(() => {
    const inScope = documents.filter((d) => dateInRange(d.created_at, dateFrom, dateTo));
    const byCat: Record<string, { type: string; total: number; latest: string; expired: number; expiringSoon: number }> = {};
    const today = new Date();
    const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    inScope.forEach((d) => {
      const key = (d.category || 'uncategorized').toLowerCase();
      const entry = byCat[key] || { type: key, total: 0, latest: d.created_at, expired: 0, expiringSoon: 0 };
      entry.total += 1;
      entry.latest = new Date(d.created_at) > new Date(entry.latest) ? d.created_at : entry.latest;
      if (d.expiry_date) {
        const ex = new Date(d.expiry_date);
        if (!Number.isNaN(ex.getTime())) {
          if (ex < today) entry.expired += 1;
          else if (ex <= soon) entry.expiringSoon += 1;
        }
      }
      byCat[key] = entry;
    });

    const label = (key: string) => {
      if (key === 'procedure') return 'Procedures';
      if (key === 'drawing') return 'Drawings';
      if (key === 'certificate') return 'Certificates';
      if (key === 'template') return 'Templates';
      if (key === 'client_attachment') return 'Client Attachments';
      if (key === 'uncategorized') return 'Uncategorized';
      return key;
    };

    const compliance = (e: { expired: number; expiringSoon: number }) => {
      if (e.expired > 0) return { label: 'Expired', badge: 'bg-rose-100 text-rose-700' };
      if (e.expiringSoon > 0) return { label: 'Review', badge: 'bg-amber-100 text-amber-700' };
      return { label: 'OK', badge: 'bg-emerald-100 text-emerald-700' };
    };

    return Object.values(byCat)
      .map((e) => {
        const c = compliance(e);
        return { type: label(e.type), total: e.total, latest: fmtDateTime(e.latest), compliance: c.label, badge: c.badge };
      })
      .sort((a, b) => b.total - a.total || a.type.localeCompare(b.type));
  }, [documents, dateFrom, dateTo]);

  const renewalsKpis = useMemo(() => {
    const today = new Date();
    const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const month = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const inScope = equipment.filter((e) => !!e.next_inspection_date);
    let expired = 0;
    let expiringSoon = 0;
    let upcoming = 0;
    inScope.forEach((e) => {
      const d = new Date(e.next_inspection_date as string);
      if (Number.isNaN(d.getTime())) return;
      if (d < today) expired += 1;
      else if (d <= soon) expiringSoon += 1;
      else if (d <= month) upcoming += 1;
    });
    return { expired, expiringSoon, upcoming };
  }, [equipment]);

  const auditRows = useMemo(() => {
    return auditLogs
      .filter((a) => dateInRange(a.created_at, dateFrom, dateTo))
      .slice(0, 50)
      .map((a) => ({
        time: fmtDateTime(a.created_at),
        actor: a.users ? `${a.users.first_name || ''} ${a.users.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
        action: a.action,
        entity: a.table_name ? `${a.table_name}${a.record_id ? `:${a.record_id}` : ''}` : '—',
      }));
  }, [auditLogs, dateFrom, dateTo]);

  const userReportRows = useMemo<UserReportRow[]>(() => {
    const jobAssigned: Record<string, number> = {};
    const jobCompleted: Record<string, number> = {};
    const inspectionsSubmitted: Record<string, number> = {};
    const inspectionsApproved: Record<string, number> = {};
    const mediaUploaded: Record<string, number> = {};
    const documentsUploaded: Record<string, number> = {};
    const messagesSent: Record<string, number> = {};

    jobs.forEach((j) => {
      if (!j.assigned_to) return;
      if (!dateInRange(j.created_at, dateFrom, dateTo)) return;
      jobAssigned[j.assigned_to] = (jobAssigned[j.assigned_to] || 0) + 1;
      const completed = j.completed_date || (j.status === 'closed' ? j.updated_at : undefined);
      if (completed && dateInRange(completed, dateFrom, dateTo)) {
        jobCompleted[j.assigned_to] = (jobCompleted[j.assigned_to] || 0) + 1;
      }
    });

    inspections.forEach((i) => {
      if (i.inspector_id && dateInRange(i.created_at, dateFrom, dateTo)) {
        inspectionsSubmitted[i.inspector_id] = (inspectionsSubmitted[i.inspector_id] || 0) + 1;
      }
      if (i.approved_by && i.approved_at && dateInRange(i.approved_at, dateFrom, dateTo)) {
        inspectionsApproved[i.approved_by] = (inspectionsApproved[i.approved_by] || 0) + 1;
      }
    });

    media.forEach((m) => {
      if (!m.uploaded_by) return;
      if (!dateInRange(m.created_at, dateFrom, dateTo)) return;
      mediaUploaded[m.uploaded_by] = (mediaUploaded[m.uploaded_by] || 0) + 1;
    });

    documents.forEach((d) => {
      if (!d.uploaded_by) return;
      if (!dateInRange(d.created_at, dateFrom, dateTo)) return;
      documentsUploaded[d.uploaded_by] = (documentsUploaded[d.uploaded_by] || 0) + 1;
    });

    messages.forEach((m) => {
      if (!dateInRange(m.created_at, dateFrom, dateTo)) return;
      messagesSent[m.sender_id] = (messagesSent[m.sender_id] || 0) + 1;
    });

    return users
      .filter((u) => (roleFilter === 'all' ? true : u.role === roleFilter))
      .filter((u) => (userFilter === 'all' ? true : u.id === userFilter))
      .map((u) => ({
        user_id: u.id,
        name: displayName(u),
        role: u.role,
        jobs_assigned: jobAssigned[u.id] || 0,
        jobs_completed: jobCompleted[u.id] || 0,
        inspections_submitted: inspectionsSubmitted[u.id] || 0,
        inspections_approved: inspectionsApproved[u.id] || 0,
        media_uploaded: mediaUploaded[u.id] || 0,
        documents_uploaded: documentsUploaded[u.id] || 0,
        messages_sent: messagesSent[u.id] || 0,
      }))
      .sort((a, b) => b.jobs_completed - a.jobs_completed || b.jobs_assigned - a.jobs_assigned);
  }, [jobs, inspections, media, documents, messages, users, dateFrom, dateTo, roleFilter, userFilter]);

  const topUserChart = useMemo(() => {
    return userReportRows
      .slice(0, 10)
      .map((r) => ({ name: r.name, completed: r.jobs_completed, assigned: r.jobs_assigned, inspections: r.inspections_submitted }));
  }, [userReportRows]);

  const getDataToExport = () => {
    const data =
      reportType === 'Users Report' || reportType === 'Engineers Report'
        ? userReportRows
        : reportType === 'Jobs Report'
          ? jobs.map((job) => ({
              ...job,
              branch_name: job.branches?.name || 'N/A',
              sales_person_name: job.sales_person ? `${job.sales_person.first_name || ''} ${job.sales_person.last_name || ''}`.trim() || 'N/A' : 'N/A',
              jo_number: job.jo_number || 'N/A',
              task_number: job.task_number || 'N/A',
            }))
          : reportType === 'Inspection Approvals'
            ? inspections.map((inspection) => ({
                ...inspection,
                branch_name: inspection.jobs?.branches?.name || 'N/A',
                sales_person_name: inspection.jobs?.sales_person ? `${inspection.jobs.sales_person.first_name || ''} ${inspection.jobs.sales_person.last_name || ''}`.trim() || 'N/A' : 'N/A',
                jo_number: inspection.jobs?.jo_number || (inspection as Inspection & { jobs?: { id?: string; jo_number?: string; task_number?: string } }).jobs?.id || 'N/A',
                task_number: inspection.jobs?.task_number || 'N/A',
                timesheet_no: inspection.timesheet_no || 'N/A',
              }))
            : reportType === 'Branches Report'
              ? branchRows
              : reportType === 'Documents Report'
                ? documentRows
                : reportType === 'Renewals Report'
                  ? [{ upcoming_30d: renewalsKpis.upcoming, expiring_7d: renewalsKpis.expiringSoon, expired: renewalsKpis.expired }]
                  : reportType === 'Audit Logs'
                    ? auditRows
            : [];
    return data;
  };

  const handleExportCSV = () => {
    const data = getDataToExport();
    if (data.length === 0) return;
    exportToCSV({ data, fileName: reportType.replace(' ', '_') });
  };

  const handleExportExcel = () => {
    const data = getDataToExport();
    if (data.length === 0) return;
    exportToExcel({ data, fileName: reportType.replace(' ', '_'), sheetName: reportType });
  };

  const handleExportPDF = () => {
    const data = getDataToExport();
    if (data.length === 0) return;
    exportToPDF({ data, fileName: reportType.replace(' ', '_'), title: reportType });
  };

  const header = useMemo(() => {
    switch (reportType) {
      case 'Jobs Report':
        return { title: 'Jobs Report', subtitle: 'Status distribution, branch performance, and SLA overview.' };
      case 'Engineers Report':
        return { title: 'Engineers Report', subtitle: 'Utilization, on-site engineers, and completion metrics.' };
      case 'Users Report':
        return { title: 'Users Report', subtitle: 'Users, roles, access scope, and activity snapshot.' };
      case 'Branches Report':
        return { title: 'Branches Report', subtitle: 'Branch capacity, workload distribution, and regional KPIs.' };
      case 'Documents Report':
        return { title: 'Documents Report', subtitle: 'Document library health, versions, and compliance artifacts.' };
      case 'Renewals Report':
        return { title: 'Renewals Report', subtitle: 'Expiring certificates, renewals pipeline, and renewal SLAs.' };
      case 'Audit Logs':
        return { title: 'Audit Logs', subtitle: 'Security-relevant actions, configuration changes, and access events.' };
      default:
        return { title: 'Inspection Approvals', subtitle: 'Review submissions, outcomes, and compliance metrics.' };
    }
  }, [reportType]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{header.title}</h1>
          <p className="text-slate-500 mt-1">{header.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Users Report">Users Report</option>
            <option value="Engineers Report">Engineers Report</option>
            <option value="Jobs Report">Jobs Report</option>
            <option value="Inspection Approvals">Inspection Approvals</option>
            <option value="Branches Report">Branches Report</option>
            <option value="Documents Report">Documents Report</option>
            <option value="Renewals Report">Renewals Report</option>
            <option value="Audit Logs">Audit Logs</option>
          </select>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm font-semibold text-slate-700 outline-none"
            />
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm font-semibold text-slate-700 outline-none"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
              <MoreVertical className="h-4 w-4" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      handleExportCSV();
                      setShowExportMenu(false);
                    }} 
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Export as CSV
                  </button>
                  <button 
                    onClick={() => {
                      handleExportExcel();
                      setShowExportMenu(false);
                    }} 
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Export as Excel
                  </button>
                  <button 
                    onClick={() => {
                      handleExportPDF();
                      setShowExportMenu(false);
                    }} 
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(reportType === 'Users Report' || reportType === 'Engineers Report') && (
        <>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex-1 text-sm font-semibold text-slate-700">
              Report scope: {dateFrom} → {dateTo}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="engineer">Engineer</option>
                <option value="sales">Sales</option>
              </select>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Users</option>
                {users
                  .filter((u) => (roleFilter === 'all' ? true : u.role === roleFilter))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {displayName(u)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Top Users</h3>
              <div className="h-[260px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <BarChart data={topUserChart} margin={{ left: 0, right: 0, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-xs font-semibold text-slate-500">Sorted by jobs completed</div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">User Activity</h3>
                  <p className="text-sm text-slate-500">Jobs, inspections, uploads, and messages by user.</p>
                </div>
                <div className="text-sm font-semibold text-slate-600">{userReportRows.length} users</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inspections</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Approved</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Media</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Docs</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Msgs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userReportRows.map((r, index) => (
                      <tr key={r.user_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">{r.name}</div>
                          <div className="text-xs text-slate-500">{r.user_id}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">{r.role}</td>
                        <td className="px-6 py-4 text-sm font-extrabold text-slate-900">{r.jobs_assigned}</td>
                        <td className="px-6 py-4 text-sm font-extrabold text-emerald-700">{r.jobs_completed}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{r.inspections_submitted}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{r.inspections_approved}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{r.media_uploaded}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{r.documents_uploaded}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{r.messages_sent}</td>
                      </tr>
                    ))}
                    {userReportRows.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
                          No users found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {reportType === 'Inspection Approvals' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Inspection Status</h3>
              <div className="h-[250px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-500">{item.name}</span>
                    <span className="text-xs font-bold text-slate-700">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Recent Inspection Submissions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job / Equipment</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Engineer</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted At</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectionRecentRows.map((rpt, index) => (
                      <tr key={rpt.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                              <FileText className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{rpt.job}</p>
                              <p className="text-xs text-slate-500">{rpt.eq}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{rpt.engineer}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{fmtDateTime(rpt.created_at)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold ${
                              rpt.status === 'approved'
                                ? 'text-emerald-600'
                                : rpt.status === 'rejected'
                                  ? 'text-rose-600'
                                  : rpt.status === 'submitted'
                                    ? 'text-amber-600'
                                    : 'text-primary-600'
                            }`}
                          >
                            {rpt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {inspectionRecentRows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                          No inspections in this range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Compliance Rate</h4>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{inspectionKpis.complianceRate}%</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Approved / Reviewed</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg. Review Time</h4>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{inspectionKpis.avgReviewHours.toFixed(1)} hrs</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Submitted → decision</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Rejected</h4>
                <XCircle className="h-5 w-5 text-rose-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{inspectionKpis.rejected}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">In selected range</p>
            </div>
          </div>
        </>
      )}

      {reportType === 'Jobs Report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Jobs by Status</h3>
            <div className="h-[250px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={84} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 space-y-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-900">Branch Performance</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            </div>
            <div className="p-6">
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <BarChart
                    data={branchJobData}
                    margin={{ left: 8, right: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#1d4ed8" radius={[6, 6, 0, 0]} barSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'Audit Logs' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Audit Events</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditRows.map((a, index) => (
                  <tr key={`${a.time}-${a.action}-${a.entity}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{a.time}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{a.actor}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{a.entity}</td>
                  </tr>
                ))}
                {auditRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                      No audit logs in this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'Branches Report' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Branch KPIs</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Engineers</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Jobs</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchRows.map((b, index) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{b.branch}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{b.country}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{b.engineers}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{b.active}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.overdue > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {b.overdue}
                      </span>
                    </td>
                  </tr>
                ))}
                {branchRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                      No branches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'Documents Report' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Document Library</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Updates</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentRows.map((d, index) => (
                  <tr key={d.type} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{d.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{d.total}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{d.latest}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${d.badge}`}>{d.compliance}</span>
                    </td>
                  </tr>
                ))}
                {documentRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                      No documents in this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'Renewals Report' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Renewals Pipeline</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { label: 'Upcoming (30d)', value: renewalsKpis.upcoming, style: 'bg-blue-50 border-blue-100 text-blue-700' },
              { label: 'Expiring Soon (7d)', value: renewalsKpis.expiringSoon, style: 'bg-amber-50 border-amber-100 text-amber-700' },
              { label: 'Expired', value: renewalsKpis.expired, style: 'bg-rose-50 border-rose-100 text-rose-700' },
            ].map((k) => (
              <div key={k.label} className={`rounded-2xl border p-5 ${k.style}`}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-80">{k.label}</div>
                <div className="mt-2 text-3xl font-extrabold">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
