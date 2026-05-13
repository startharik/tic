import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, Filter, Plus, Search } from 'lucide-react';

type Variant = 'table' | 'form' | 'detail' | 'dashboard';

type PlaceholderPageProps = {
  title: string;
  subtitle?: string;
  variant?: Variant;
  primaryActionLabel?: string;
  primaryActionTo?: string;
};

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  variant = 'table',
  primaryActionLabel,
  primaryActionTo,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const contextLine = useMemo(() => {
    const ids = Object.entries(params)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' • ');
    if (!ids) return `Route: ${location.pathname}`;
    return `Route: ${location.pathname} • ${ids}`;
  }, [location.pathname, params]);

  const showBack = location.pathname !== '/admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-slate-500">{subtitle ?? contextLine}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          {primaryActionLabel && (
            <button
              type="button"
              onClick={() => (primaryActionTo ? navigate(primaryActionTo) : undefined)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              {primaryActionLabel}
            </button>
          )}
        </div>
      </div>

      {variant === 'dashboard' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: 'Open', value: '18' },
            { label: 'In Review', value: '7' },
            { label: 'Completed', value: '42' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{kpi.value}</div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 w-2/3 rounded-full bg-primary-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {(variant === 'table' || variant === 'dashboard') && (
        <>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <select className="rounded-lg bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                  <option>All</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Closed</option>
                </select>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Calendar className="h-4 w-4" />
                  Date
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50">
                    {['ID', 'Title', 'Owner', 'Updated', 'Status', 'Action'].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                        {`AI-${String(idx + 1).padStart(3, '0')}`}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{`${title} Item ${idx + 1}`}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">Operations</td>
                      <td className="px-6 py-4 text-sm text-slate-600">2026-05-12</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Open
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {variant === 'form' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-sm font-bold text-slate-900">General</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-500">
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Notes</label>
                  <textarea
                    rows={5}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-sm font-bold text-slate-900">Actions</div>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {variant === 'detail' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-sm font-bold text-slate-900">Overview</div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { label: 'Reference', value: params.jobId ?? params.assetId ?? params.id ?? '—' },
                  { label: 'Owner', value: 'Operations' },
                  { label: 'Priority', value: 'Medium' },
                  { label: 'Updated', value: '2026-05-12' },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.label}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{row.value}</div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-sm font-bold text-slate-900">Timeline</div>
              <div className="mt-4 space-y-3">
                {[
                  { t: 'Created', d: '2026-05-10 09:12' },
                  { t: 'Assigned', d: '2026-05-10 10:04' },
                  { t: 'Updated', d: '2026-05-12 08:31' },
                ].map((e) => (
                  <div key={e.t} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">{e.t}</div>
                    <div className="text-sm text-slate-600">{e.d}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="text-sm font-bold text-slate-900">Quick Actions</div>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate(`${location.pathname}/edit`)}
                  className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`${location.pathname}/timeline`)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Timeline
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceholderPage;
