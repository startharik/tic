import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Download, Loader2, LogIn, LogOut, Search } from 'lucide-react';
import { getAttendanceLogs, type AttendanceLog } from '../../services/supabaseService';

const getUserName = (log: AttendanceLog) => {
  const first = log.users?.first_name || '';
  const last = log.users?.last_name || '';
  const fullName = `${first} ${last}`.trim();
  return fullName || log.users?.email || 'Unknown User';
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const AttendancePage: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('');
  const [source, setSource] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      setLogs(await getAttendanceLogs());
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesQuery =
        !normalizedQuery ||
        getUserName(log).toLowerCase().includes(normalizedQuery) ||
        (log.users?.email || '').toLowerCase().includes(normalizedQuery) ||
        (log.users?.role || '').toLowerCase().includes(normalizedQuery);
      const matchesEventType = !eventType || log.event_type === eventType;
      const matchesSource = !source || log.source === source;
      return matchesQuery && matchesEventType && matchesSource;
    });
  }, [logs, query, eventType, source]);

  const sources = useMemo(() => Array.from(new Set(logs.map((log) => log.source))).sort(), [logs]);
  const signedInCount = logs.filter((log) => log.event_type === 'sign_in').length;
  const signedOutCount = logs.filter((log) => log.event_type === 'sign_out').length;

  const handleExportCsv = () => {
    const rows = [
      ['User', 'Email', 'Role', 'Event', 'Source', 'Recorded At'],
      ...filteredLogs.map((log) => [
        getUserName(log),
        log.users?.email || '',
        log.users?.role || '',
        log.event_type,
        log.source,
        new Date(log.recorded_at).toISOString(),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading attendance: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500 mt-1">Track user sign-in and sign-out records.</p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Clock3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Records</p>
            <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <LogIn className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Sign Ins</p>
            <p className="text-2xl font-bold text-slate-900">{signedInCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl">
            <LogOut className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Sign Outs</p>
            <p className="text-2xl font-bold text-slate-900">{signedOutCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by user, email, or role..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">All Events</option>
            <option value="sign_in">Sign In</option>
            <option value="sign_out">Sign Out</option>
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">All Sources</option>
            {sources.map((item) => (
              <option key={item} value={item}>{item.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{getUserName(log)}</span>
                        <span className="text-xs text-slate-500">{log.users?.email || log.users?.role || 'No profile details'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold uppercase ${
                        log.event_type === 'sign_in'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.event_type === 'sign_in' ? <LogIn className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />}
                        {log.event_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{log.source.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(log.recorded_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
