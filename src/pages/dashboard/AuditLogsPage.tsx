import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Clock, Download, Eye, Loader2, Search, User, X } from 'lucide-react';
import { getAuditLogs } from '../../services/supabaseService';
import type { AuditLog } from '../../services/supabaseService';

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAuditLogs();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, userFilter, actionFilter, tableFilter, fromDate, toDate, pageSize]);

  const dateInRange = (createdAt: string, from: string, to: string) => {
    if (!from && !to) return true;
    const dt = new Date(createdAt);
    if (Number.isNaN(dt.getTime())) return false;
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? new Date(`${to}T23:59:59`) : null;
    if (start && dt < start) return false;
    if (end && dt > end) return false;
    return true;
  };

  const usersForFilter = useMemo(() => {
    const map = new Map<string, string>();
    for (const log of logs) {
      if (!log.user_id) continue;
      const name = `${log.users?.first_name || ''} ${log.users?.last_name || ''}`.trim() || log.user_id;
      map.set(log.user_id, name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [logs]);

  const actionsForFilter = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [logs]);

  const tablesForFilter = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.table_name).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        (log.table_name || '').toLowerCase().includes(q) ||
        (log.record_id || '').toLowerCase().includes(q) ||
        (log.ip_address || '').toLowerCase().includes(q) ||
        (log.user_agent || '').toLowerCase().includes(q) ||
        (log.users?.first_name || '').toLowerCase().includes(q) ||
        (log.users?.last_name || '').toLowerCase().includes(q);

      const matchesUser = userFilter === 'all' || (log.user_id || '') === userFilter;
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesTable = tableFilter === 'all' || (log.table_name || '') === tableFilter;
      const matchesDate = dateInRange(log.created_at, fromDate, toDate);

      return matchesSearch && matchesUser && matchesAction && matchesTable && matchesDate;
    });
  }, [logs, searchTerm, userFilter, actionFilter, tableFilter, fromDate, toDate]);

  const dashboardStats = useMemo(() => {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let last24h = 0;
    let last7d = 0;
    const userIds = new Set<string>();

    for (const log of filteredLogs) {
      const t = new Date(log.created_at).getTime();
      if (!Number.isNaN(t)) {
        if (t >= dayAgo) last24h += 1;
        if (t >= weekAgo) last7d += 1;
      }
      if (log.user_id) userIds.add(log.user_id);
    }

    return {
      total: filteredLogs.length,
      uniqueUsers: userIds.size,
      last24h,
      last7d,
    };
  }, [filteredLogs]);

  const logsByUser = useMemo(() => {
    type Row = {
      key: string;
      name: string;
      count: number;
      lastAt: string | null;
      topAction: string | null;
      topEntity: string | null;
    };

    const map = new Map<
      string,
      {
        name: string;
        count: number;
        lastAt: string | null;
        actions: Record<string, number>;
        entities: Record<string, number>;
      }
    >();

    for (const log of filteredLogs) {
      const key = log.user_id || '__system__';
      const name = log.user_id
        ? `${log.users?.first_name || ''} ${log.users?.last_name || ''}`.trim() || log.user_id
        : 'System';

      const row =
        map.get(key) || {
          name,
          count: 0,
          lastAt: null,
          actions: {},
          entities: {},
        };

      row.count += 1;
      row.actions[log.action] = (row.actions[log.action] || 0) + 1;
      if (log.table_name) row.entities[log.table_name] = (row.entities[log.table_name] || 0) + 1;

      if (!row.lastAt || new Date(log.created_at) > new Date(row.lastAt)) {
        row.lastAt = log.created_at;
      }

      map.set(key, row);
    }

    const pickTop = (m: Record<string, number>) => {
      let bestKey: string | null = null;
      let bestVal = -1;
      for (const [k, v] of Object.entries(m)) {
        if (v > bestVal) {
          bestKey = k;
          bestVal = v;
        }
      }
      return bestKey;
    };

    const rows: Row[] = Array.from(map.entries()).map(([key, v]) => ({
      key,
      name: v.name,
      count: v.count,
      lastAt: v.lastAt,
      topAction: pickTop(v.actions),
      topEntity: pickTop(v.entities),
    }));

    return rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [filteredLogs]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Timestamp',
      'User ID',
      'User Name',
      'Action',
      'Entity',
      'Record ID',
      'IP Address',
      'User Agent',
      'Old Data',
      'New Data',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map((log) =>
        [
          log.created_at,
          log.user_id || '',
          `${log.users?.first_name || ''} ${log.users?.last_name || ''}`.trim() || (log.user_id ? 'Unknown' : 'System'),
          log.action,
          log.table_name || '',
          log.record_id || '',
          log.ip_address || '',
          log.user_agent || '',
          log.old_data ? JSON.stringify(log.old_data) : '',
          log.new_data ? JSON.stringify(log.new_data) : '',
        ]
          .map((field) => JSON.stringify(field))
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'audit_logs_export.csv');
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary-600" />
            System Audit Logs
          </h1>
          <p className="text-slate-500 mt-1">User activity dashboard + complete audit log report.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Events</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{dashboardStats.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Users</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{dashboardStats.uniqueUsers}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Last 24 Hours</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{dashboardStats.last24h}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Last 7 Days</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{dashboardStats.last7d}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search (user, action, entity, record, IP, agent)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="lg:col-span-2">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full bg-slate-50 border-transparent rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">All Users</option>
            {usersForFilter.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-slate-50 border-transparent rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">All Actions</option>
            {actionsForFilter.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="w-full bg-slate-50 border-transparent rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">All Entities</option>
            {tablesForFilter.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-slate-50 border-transparent rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-slate-50 border-transparent rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="text-sm font-extrabold text-slate-900">Logs by User</div>
          <div className="text-xs text-slate-500 mt-1">Most active users in the selected filters/date range.</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Top Action</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Top Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsByUser.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No activity in this range.
                  </td>
                </tr>
              ) : (
                logsByUser.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-primary-50 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-primary-600" />
                        </div>
                        <div className="text-sm font-bold text-slate-900">{row.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{row.count}</td>
                    <td className="px-6 py-4">
                      {row.lastAt ? (
                        <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(row.lastAt).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{row.topAction || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {row.topEntity || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Record</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-primary-50 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-primary-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {log.user_id ? `${log.users?.first_name || ''} ${log.users?.last_name || ''}`.trim() || 'Unknown' : 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{log.action}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {log.table_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.record_id || '—'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.ip_address || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredLogs.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-xs text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 disabled:opacity-50"
                disabled={currentPage <= 1}
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 disabled:opacity-50"
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedLog(null)}>
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Audit Event Details</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(selectedLog.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">User</div>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  {selectedLog.user_id
                    ? `${selectedLog.users?.first_name || ''} ${selectedLog.users?.last_name || ''}`.trim() || 'Unknown'
                    : 'System'}
                </div>
                {selectedLog.user_id && <div className="mt-1 text-xs font-mono text-slate-500">{selectedLog.user_id}</div>}
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Action</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{selectedLog.action}</div>
                <div className="mt-1 text-xs text-slate-500">{selectedLog.table_name || 'N/A'}</div>
                {selectedLog.record_id && <div className="mt-1 text-xs font-mono text-slate-500">{selectedLog.record_id}</div>}
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">IP Address</div>
                <div className="mt-1 text-xs font-mono text-slate-700">{selectedLog.ip_address || 'N/A'}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">User Agent</div>
                <div className="mt-1 text-xs text-slate-700 break-words">{selectedLog.user_agent || 'N/A'}</div>
              </div>
              <div className="md:col-span-2 bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Old Data</div>
                <pre className="mt-2 text-xs text-slate-700 whitespace-pre-wrap break-words">
                  {selectedLog.old_data ? JSON.stringify(selectedLog.old_data, null, 2) : 'N/A'}
                </pre>
              </div>
              <div className="md:col-span-2 bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">New Data</div>
                <pre className="mt-2 text-xs text-slate-700 whitespace-pre-wrap break-words">
                  {selectedLog.new_data ? JSON.stringify(selectedLog.new_data, null, 2) : 'N/A'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
