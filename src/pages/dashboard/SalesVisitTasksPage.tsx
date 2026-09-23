import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Loader2, Search } from 'lucide-react';
import { getSalesVisitTasks, type SalesVisitTask } from '../../services/supabaseService';

const getSalesPersonName = (task: SalesVisitTask) =>
  `${task.users?.first_name || ''} ${task.users?.last_name || ''}`.trim() ||
  task.users?.email ||
  'Unknown sales person';

const SalesVisitTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<SalesVisitTask[]>([]);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSalesVisitTasks()
      .then(setTasks)
      .catch((err: Error) => setError(err.message || 'Failed to load sales visit tasks'))
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesQuery = !normalized ||
        getSalesPersonName(task).toLowerCase().includes(normalized) ||
        task.client_name.toLowerCase().includes(normalized) ||
        task.area.toLowerCase().includes(normalized) ||
        task.purpose.toLowerCase().includes(normalized);
      return matchesQuery && (!date || task.visit_date === date);
    });
  }, [tasks, query, date]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  if (error) return <div className="py-12 text-center text-rose-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sales Visit Tasks</h1>
        <p className="mt-1 text-slate-500">Review client visits and activities submitted by sales persons.</p>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search salesperson, client, area, or purpose..." className="w-full rounded-lg bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Sales Person</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Area</th><th className="px-5 py-3">Purpose</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{getSalesPersonName(task)}</td>
                  <td className="px-5 py-4 text-slate-700">{task.client_name}</td>
                  <td className="px-5 py-4 text-slate-700">{task.area}</td>
                  <td className="max-w-sm px-5 py-4 text-slate-700">{task.purpose}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">{task.visit_date}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{task.status}</span></td>
                </tr>
              ))}
              {filteredTasks.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500"><ClipboardList className="mx-auto mb-2 h-8 w-8 text-slate-300" />No sales visit tasks found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesVisitTasksPage;
