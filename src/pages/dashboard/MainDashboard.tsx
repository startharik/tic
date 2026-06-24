import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Users, ArrowUpRight, Loader2 } from 'lucide-react';
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
import { getDashboardStats, getJobs, getBranches, getLocationTracking, getUsers } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

type KpiCardProps = {
  label: string;
  value: number;
  accent: 'blue' | 'red' | 'amber' | 'emerald' | 'slate';
};

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
  const { userProfile } = useAuth();
  const isSuperAdmin = userProfile?.role === 'super_admin';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    inProgress: 0,
    assigned: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    closed: 0,
    overdue: 0,
    totalUsers: 0,
    totalClients: 0,
    totalEquipment: 0,
  });
  const [branchData, setBranchData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [usersLive, setUsersLive] = useState<Array<{ name: string; location: string; lat: number; lng: number; role: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, jobs, branches] = await Promise.all([
          getDashboardStats(),
          getJobs(),
          getBranches(),
        ]);

        setStats(dashboardStats);

        // Calculate status data
        setStatusData([
          { name: 'Open', value: dashboardStats.openJobs, color: '#ef4444' },
          { name: 'Assigned', value: dashboardStats.assigned, color: '#8b5cf6' },
          { name: 'In Progress', value: dashboardStats.inProgress, color: '#f59e0b' },
          { name: 'Submitted', value: dashboardStats.submitted, color: '#0ea5e9' },
          { name: 'Approved', value: dashboardStats.approved, color: '#10b981' },
          { name: 'Rejected', value: dashboardStats.rejected, color: '#f43f5e' },
          { name: 'Closed', value: dashboardStats.closed, color: '#64748b' },
        ].filter(item => item.value > 0));

        // Calculate branch data
        const branchJobCounts: Record<string, number> = {};
        jobs.forEach(job => {
          if (job.branch_id) {
            branchJobCounts[job.branch_id] = (branchJobCounts[job.branch_id] || 0) + 1;
          }
        });
        const branchesWithCounts = branches.map(branch => ({
          name: branch.name,
          jobs: branchJobCounts[branch.id] || 0,
        })).sort((a, b) => b.jobs - a.jobs);

        setBranchData(branchesWithCounts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;

    let cancelled = false;

    const refreshTracking = async () => {
      try {
        const [locations, users] = await Promise.all([getLocationTracking(), getUsers()]);
        if (cancelled) return;

        const latestByUser = new Map<string, typeof locations[number]>();
        for (const loc of locations) {
          if (!latestByUser.has(loc.user_id)) {
            latestByUser.set(loc.user_id, loc);
          }
        }

        const now = Date.now();
        const usersList = Array.from(latestByUser.values())
          .filter((loc) => {
            const user = users.find((u) => u.id === loc.user_id);
            if (!user || user.role === 'super_admin') return false;
            const ts = new Date(loc.recorded_at).getTime();
            return Number.isFinite(ts) && (now - ts) <= 10 * 60 * 1000;
          })
          .map((loc) => {
            const user = users.find((u) => u.id === loc.user_id);
            const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User' : 'Unknown User';
            return {
              name,
              role: user?.role || 'unknown',
              location: loc.jobs?.title || 'On Site',
              lat: loc.latitude,
              lng: loc.longitude,
            };
          });

        setUsersLive(usersList);
      } catch (e) {
        console.error('Error fetching live tracking:', e);
      }
    };

    refreshTracking();
    const id = window.setInterval(refreshTracking, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <div className="text-sm text-slate-500">Jobs summary, status distribution, and live field activity.</div>
        </div>
        {isSuperAdmin && (
          <Link
            to="/admin/tracking"
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Open Live Tracking</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Jobs" value={stats.totalJobs} accent="blue" />
        <KpiCard label="Open Jobs" value={stats.openJobs} accent="red" />
        <KpiCard label="In Progress" value={stats.inProgress} accent="amber" />
        <KpiCard label="Submitted" value={stats.submitted} accent="blue" />
        <KpiCard label="Closed" value={stats.closed} accent="emerald" />
        <KpiCard label="Total Users" value={stats.totalUsers} accent="slate" />
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
        {isSuperAdmin && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900">Live User Tracking</div>
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
                {usersLive.map((e) => (
                  <Marker key={e.name} position={[e.lat, e.lng]} icon={engineerMarkerIcon}>
                    <Popup>
                      <div className="font-semibold">{e.name}</div>
                      <div className="text-sm">{e.role.replace('_', ' ')}</div>
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
        )}

        {isSuperAdmin && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900">Users Live</div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Users className="h-4 w-4" />
                <span>{usersLive.length}</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {usersLive.map((e) => (
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
                      <div className="text-xs text-slate-500 truncate">{e.location} • {e.role.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;
