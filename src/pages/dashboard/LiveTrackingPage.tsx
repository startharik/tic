import React, { useMemo, useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  Search, 
  Navigation, 
  Clock, 
  HardHat,
  Minus,
  Plus,
  Loader2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { getLocationTracking, getUsers } from '../../services/supabaseService';
import type { LocationTracking, User } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';

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

const FlyTo: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
};

const MapControls: React.FC = () => {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 space-y-2 z-[500]">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="p-2 bg-white rounded-lg shadow-lg text-slate-600 hover:text-primary-600 transition-colors"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="p-2 bg-white rounded-lg shadow-lg text-slate-600 hover:text-primary-600 transition-colors"
      >
        <Minus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => map.setView([26.3927, 49.9777], 10, { animate: true })}
        className="p-2 bg-white rounded-lg shadow-lg text-slate-600 hover:text-primary-600 transition-colors"
      >
        <Navigation className="h-5 w-5" />
      </button>
    </div>
  );
};

const LiveTrackingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState<LocationTracking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const defaultCenter = useMemo<[number, number]>(() => [26.3927, 49.9777], []);

  // Process location data to get latest location per user
  const engineers = useMemo(() => {
    const userLatestLocation: Record<string, LocationTracking> = {};
    locationData.forEach(loc => {
      if (!userLatestLocation[loc.user_id] || new Date(loc.recorded_at) > new Date(userLatestLocation[loc.user_id].recorded_at)) {
        userLatestLocation[loc.user_id] = loc;
      }
    });
    const now = Date.now();
    return Object.values(userLatestLocation).filter((loc) => {
      const user = users.find(u => u.id === loc.user_id);
      if (!user || user.role !== 'engineer') return false;
      const ts = new Date(loc.recorded_at).getTime();
      return Number.isFinite(ts) && (now - ts) <= 10 * 60 * 1000;
    }).map(loc => {
      const user = users.find(u => u.id === loc.user_id);
      const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User' : 'Unknown User';
      return {
        id: loc.user_id,
        name,
        status: 'On Site',
        job: loc.jobs?.title || 'N/A',
        location: 'Site Location',
        battery: '85%',
        lastUpdate: new Date(loc.recorded_at).toLocaleString(),
        lat: loc.latitude,
        lng: loc.longitude,
      };
    });
  }, [locationData, users]);

  const selectedEngineer = useMemo(
    () => {
      if (selectedId) {
        return engineers.find((e) => e.id === selectedId) ?? engineers[0];
      }
      return engineers[0];
    },
    [selectedId, engineers],
  );

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [locations, userList] = await Promise.all([
          getLocationTracking(),
          getUsers(),
        ]);
        if (isCancelled) return;
        setLocationData(locations);
        setUsers(userList);
        if (locations.length > 0) {
          setSelectedId(locations[0].user_id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchData();

    const channel = supabase
      .channel('location_tracking:admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'location_tracking' }, () => {
        fetchData();
      })
      .subscribe();

    const interval = window.setInterval(() => {
      fetchData();
    }, 30000);

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
      window.clearInterval(interval);
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
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Engineer Tracking</h1>
          <p className="text-slate-500 text-sm">Real-time GPS tracking and field operations monitoring.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>{engineers.length} Engineer{engineers.length !== 1 ? 's' : ''} Online</span>
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar - Engineer List */}
        <div className="w-80 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search engineers..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {engineers.length === 0 && (
              <div className="p-6 text-sm text-slate-500">
                No engineers online yet. Open the mobile app and start a job to begin sending live GPS.
              </div>
            )}
            {engineers.map((eng) => (
              <div
                key={eng.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(eng.id)}
                onKeyDown={(e) => (e.key === 'Enter' ? setSelectedId(eng.id) : null)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-colors group ${
                  selectedId === eng.id ? 'bg-primary-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                      {eng.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{eng.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{eng.status}</p>
                    </div>
                  </div>
                  <Navigation className="h-4 w-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center text-xs text-slate-500">
                    <MapIcon className="h-3 w-3 mr-2" />
                    <span className="truncate">{eng.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-2" />
                    <span>Last seen: {eng.lastUpdate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Map View */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
          <MapContainer
            center={selectedEngineer ? [selectedEngineer.lat, selectedEngineer.lng] : defaultCenter}
            zoom={selectedEngineer ? 10 : 6}
            scrollWheelZoom
            className="absolute inset-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedEngineer && <FlyTo center={[selectedEngineer.lat, selectedEngineer.lng]} zoom={10} />}
            <MapControls />
            {engineers.map((e) => (
              <Marker key={e.id} position={[e.lat, e.lng]} icon={engineerMarkerIcon}>
                <Popup>
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-sm">{e.location}</div>
                  <div className="text-xs text-slate-600">Status: {e.status}</div>
                  <div className="text-xs text-slate-600">Job: {e.job}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {selectedEngineer && (
            <div className="absolute left-4 bottom-4 z-[500] bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-600 rounded-full">
                  <HardHat className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{selectedEngineer.name}</div>
                  <div className="text-xs text-slate-500 truncate">{selectedEngineer.location}</div>
                </div>
              </div>
            </div>
          )}
          {engineers.length === 0 && (
            <div className="absolute left-4 bottom-4 z-[500] bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-700">
              Waiting for live GPS…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingPage;
