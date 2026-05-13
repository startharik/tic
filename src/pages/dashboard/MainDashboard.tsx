import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Users, ArrowUpRight } from 'lucide-react';
import * as L from 'leaflet';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

type KpiCardProps = {
  label: string;
  value: number;
  accent: 'blue' | 'red' | 'amber' | 'emerald' | 'slate';
};

const kpis = {
  totalJobs: 125,
  openJobs: 28,
  inProgress: 45,
  submitted: 30,
  overdue: 12,
  closed: 98,
};

const branchData = [
  { name: 'Bahrain', jobs: 185 },
  { name: 'UAE', jobs: 155 },
  { name: 'India', jobs: 120 },
  { name: 'Kuwait', jobs: 105 },
  { name: 'Oman', jobs: 85 },
];

const statusData = [
  { name: 'Open', value: kpis.openJobs, color: '#ef4444' },
  { name: 'In Progress', value: kpis.inProgress, color: '#f59e0b' },
  { name: 'Submitted', value: kpis.submitted, color: '#0ea5e9' },
  { name: 'Closed', value: kpis.closed, color: '#10b981' },
  { name: 'Overdue', value: kpis.overdue, color: '#64748b' },
];

const accents: Record<KpiCardProps['accent'], { ring: string; value: string }> = {
  blue: { ring: 'ring-primary-100', value: 'text-primary-700' },
  red: { ring: 'ring-rose-100', value: 'text-rose-600' },
  amber: { ring: 'ring-amber-100', value: 'text-amber-600' },
  emerald: { ring: 'ring-emerald-100', value: 'text-emerald-600' },
  slate: { ring: 'ring-slate-100', value: 'text-slate-700' },
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, accent }) => {
  const a = accents[accent];
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 ring-1 ${a.ring}`}>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-extrabold ${a.value}`}>{value}</div>
    </div>
  );
};

const engineersOnSite = [
  { name: 'John Engineer', location: 'ABC Plant, Bahrain', lat: 26.2285, lng: 50.5861 },
  { name: 'Michael Smith', location: 'JAFZA, UAE', lat: 25.0127, lng: 55.0617 },
  { name: 'Ravi Kumar', location: 'Refinery, India', lat: 22.3446, lng: 71.0363 },
  { name: 'Suresh Babu', location: 'Production, KSA', lat: 26.4207, lng: 50.0888 },
];

const engineerMarkerIcon = L.divIcon({
  className: 'aig-map-marker',
  html: `
    <div class="aig-map-marker__pin">
      <div class="aig-map-marker__inner"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -18],
});

const MainDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <div className="text-sm text-slate-500">Jobs summary, status distribution, and live field activity.</div>
        </div>
        <Link
          to="/admin/tracking"
          className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span>Open Live Tracking</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Jobs" value={kpis.totalJobs} accent="blue" />
        <KpiCard label="Open Jobs" value={kpis.openJobs} accent="red" />
        <KpiCard label="In Progress" value={kpis.inProgress} accent="amber" />
        <KpiCard label="Submitted" value={kpis.submitted} accent="blue" />
        <KpiCard label="Overdue" value={kpis.overdue} accent="slate" />
        <KpiCard label="Closed" value={kpis.closed} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="text-sm font-bold text-slate-900">Jobs by Status</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-[220px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgb(226 232 240)',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="text-sm font-bold text-slate-900">Job by Branch</div>
          <div className="mt-4 h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={branchData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgb(226 232 240)',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
                  }}
                />
                <Bar dataKey="jobs" fill="#1d4ed8" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900">Live Engineer Tracking</div>
            <Link to="/admin/tracking" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              View Live Map
            </Link>
          </div>
          <div className="relative h-[260px]">
            <MapContainer
              center={[26.204, 50.585]}
              zoom={6}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {engineersOnSite.map((e) => (
                <Marker key={e.name} position={[e.lat, e.lng]} icon={engineerMarkerIcon}>
                  <Popup>
                    <div className="font-semibold">{e.name}</div>
                    <div className="text-sm">{e.location}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="pointer-events-none absolute left-6 bottom-5 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
              <Navigation className="h-4 w-4 text-primary-600" />
              <span>Live updates every 30s</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900">Engineers On Site</div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Users className="h-4 w-4" />
              <span>{engineersOnSite.length}</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {engineersOnSite.map((e) => (
              <div key={e.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-700">
                    {e.name
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{e.name}</div>
                    <div className="text-xs text-slate-500 truncate">{e.location}</div>
                  </div>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
