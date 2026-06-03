import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Download, Filter, Plus, Search, Loader2 } from 'lucide-react';
import { getEquipment, getJobs } from '../../services/supabaseService';
import type { Equipment, Job } from '../../services/supabaseService';

const statusStyles: Record<string, string> = {
  'Upcoming': 'bg-blue-100 text-blue-700',
  'Expiring Soon': 'bg-amber-100 text-amber-700',
  'Expired': 'bg-rose-100 text-rose-700',
  'No Date': 'bg-slate-100 text-slate-700',
};

type RenewalRow = {
  id: string;
  assetId: string;
  assetName: string;
  client: string;
  branch: string;
  expiryDate: string | null;
  status: 'Upcoming' | 'Expiring Soon' | 'Expired' | 'No Date';
  daysRemaining: number | null;
  equipmentId: string;
};

const toDateOnly = (value: string | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const formatDateOnly = (value: string | null): string => {
  if (!value) return 'N/A';
  const date = toDateOnly(value);
  if (!date) return 'N/A';
  return date.toLocaleDateString();
};

const daysFromToday = (date: Date): number => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const RenewalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RenewalRow['status']>('All');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentData, jobsData] = await Promise.all([getEquipment(), getJobs()]);
      setEquipment(equipmentData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching renewals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renewals: RenewalRow[] = useMemo(() => {
    const latestJobByEquipmentId: Record<string, Job> = {};
    jobs.forEach((job) => {
      if (!job.equipment_id) return;
      const existing = latestJobByEquipmentId[job.equipment_id];
      if (!existing) {
        latestJobByEquipmentId[job.equipment_id] = job;
        return;
      }
      const existingTime = new Date(existing.created_at).getTime();
      const nextTime = new Date(job.created_at).getTime();
      if (nextTime > existingTime) latestJobByEquipmentId[job.equipment_id] = job;
    });

    return equipment.map((eq) => {
      const date = toDateOnly(eq.next_inspection_date);
      const days = date ? daysFromToday(date) : null;
      const status: RenewalRow['status'] =
        days === null ? 'No Date' : days < 0 ? 'Expired' : days <= 30 ? 'Expiring Soon' : 'Upcoming';
      const year = date ? date.getFullYear() : new Date().getFullYear();
      const renewalId = `RN-${year}-${eq.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
      const latestJob = latestJobByEquipmentId[eq.id];
      const branchName = eq.branches?.name || latestJob?.branches?.name || '—';

      return {
        id: renewalId,
        assetId: eq.id,
        assetName: eq.name,
        client: eq.clients?.name || 'Unknown',
        branch: branchName,
        expiryDate: eq.next_inspection_date ?? null,
        status,
        daysRemaining: days,
        equipmentId: eq.id,
      };
    });
  }, [equipment, jobs]);

  const filteredRenewals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return renewals
      .filter((r) => (statusFilter === 'All' ? true : r.status === statusFilter))
      .filter((r) => {
        if (!normalizedSearch) return true;
        return (
          r.id.toLowerCase().includes(normalizedSearch) ||
          r.assetName.toLowerCase().includes(normalizedSearch) ||
          r.assetId.toLowerCase().includes(normalizedSearch) ||
          r.client.toLowerCase().includes(normalizedSearch) ||
          r.branch.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        const aDate = a.expiryDate ? toDateOnly(a.expiryDate)?.getTime() ?? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY;
        const bDate = b.expiryDate ? toDateOnly(b.expiryDate)?.getTime() ?? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY;
        return aDate - bDate;
      });
  }, [renewals, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: renewals.length,
      upcoming: renewals.filter((r) => r.status === 'Upcoming').length,
      expiringSoon: renewals.filter((r) => r.status === 'Expiring Soon').length,
      expired: renewals.filter((r) => r.status === 'Expired').length,
    };
  }, [renewals]);

  const handleExport = () => {
    if (filteredRenewals.length === 0) return;

    const headers = ['renewal_id', 'asset_id', 'asset_name', 'client', 'branch', 'expiry_date', 'status', 'days_remaining'];
    const rows = filteredRenewals.map((r) => [
      r.id,
      r.assetId,
      r.assetName,
      r.client,
      r.branch,
      r.expiryDate ?? '',
      r.status,
      r.daysRemaining === null ? '' : String(r.daysRemaining),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((v) => JSON.stringify(v)).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `renewals_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-2xl font-bold text-slate-900">Renewals</h1>
          <p className="text-slate-500 mt-1">Track expiring certificates and schedule renewal inspections.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/renewals/schedule')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Renewal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{stats.upcoming}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiring Soon</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{stats.expiringSoon}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Expired</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{stats.expired}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by Asset, Client, Branch, or Renewal ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="No Date">No Date</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Renewal ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRenewals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-primary-600">{r.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                        <CalendarClock className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{r.assetName}</div>
                        <div className="text-xs text-slate-500">{r.assetId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{r.client}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{r.branch}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDateOnly(r.expiryDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[r.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/renewals/schedule?equipmentId=${encodeURIComponent(r.equipmentId)}`)}
                      className="px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 shadow shadow-primary-200"
                    >
                      Create Job
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RenewalsPage;
