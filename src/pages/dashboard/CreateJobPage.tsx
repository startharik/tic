import React, { useMemo, useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Save,
  Calendar as CalendarIcon,
  MapPin,
  User as UserIcon,
  Info,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClients, getUsers, getBranches, getEquipment, getSalesUsers, createJob, createNotification, geocodeAddressNominatim } from '../../services/supabaseService';
import type { Client, User, Branch, Equipment } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import { MapContainer, Marker, TileLayer, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';

const dateOnlyToISO = (value: string): string | undefined => {
  if (!value) return undefined;
  const d = new Date(value + 'T09:00:00');
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    branch_id: '',
    equipment_id: '',
    assigned_to: '',
    assigned_sales_id: '',
    title: '',
    description: '',
    status: 'assigned',
    priority: 'medium',
    site_address: '',
    site_latitude: '',
    site_longitude: '',
    scheduled_date: '',
    due_date: '',
  });

  const coords = useMemo(() => {
    const lat = Number(formData.site_latitude);
    const lng = Number(formData.site_longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat === 0 && lng === 0) return null;
    return { lat, lng };
  }, [formData.site_latitude, formData.site_longitude]);

  const customMarkerIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 32px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: relative;
          box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
        ">
          <div style="
            width: 14px;
            height: 14px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 9px;
            left: 9px;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    });
  }, []);

  const ClickPicker: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
    useMapEvents({
      click: (e) => {
        onPick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        console.log('Fetching data for create job...');
        const [clientsData, usersData, salesUsersData, branchesData, equipmentData] = await Promise.all([
          getClients(),
          getUsers(),
          getSalesUsers(),
          getBranches(),
          getEquipment()
        ]);
        console.log('Fetched data:', { clientsData, usersData, salesUsersData, branchesData, equipmentData });
        setClients(clientsData);
        setUsers(usersData);
        setSalesUsers(salesUsersData);
        setBranches(branchesData);
        setEquipmentList(equipmentData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data: ' + (error as any)?.message);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const address = formData.site_address.trim();
      const manualLat = Number(formData.site_latitude);
      const manualLng = Number(formData.site_longitude);
      let coords: { lat: number; lng: number } | null = null;
      if (Number.isFinite(manualLat) && Number.isFinite(manualLng) && !(manualLat === 0 && manualLng === 0)) {
        coords = { lat: manualLat, lng: manualLng };
      } else if (address) {
        const selectedBranch = branches.find((b) => b.id === formData.branch_id);
        const countryHint = selectedBranch?.countries?.name;
        coords = await geocodeAddressNominatim(address, { countryHint });
      }
      const createdJob = await createJob({
        client_id: formData.client_id,
        branch_id: formData.branch_id || undefined,
        equipment_id: formData.equipment_id || undefined,
        assigned_to: formData.assigned_to || undefined,
        assigned_sales_id: formData.assigned_sales_id || undefined,
        created_by: user?.id,
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        site_address: address || undefined,
        site_latitude: coords?.lat,
        site_longitude: coords?.lng,
        scheduled_date: dateOnlyToISO(formData.scheduled_date),
        due_date: dateOnlyToISO(formData.due_date),
      });
      
      if (formData.assigned_to) {
        await createNotification({
          user_id: formData.assigned_to,
          title: "New Job Assigned",
          message: `You have been assigned to job: ${formData.title}`,
          type: formData.priority === 'urgent' ? 'warning' : 'info',
          related_job_id: createdJob.id,
          is_read: false,
        });
      }
      if (address && !coords) {
        alert('Job created, but coordinates could not be fetched. You can edit the job and try again.');
      }
      navigate('/admin/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            onClick={() => navigate('/admin/jobs')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create New Job</h1>
            <p className="text-slate-500 text-sm">Fill in the details to schedule a new inspection job.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => navigate('/admin/jobs')}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Create Job</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Info className="h-5 w-5 text-primary-500" />
              <span>General Information</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Client Name</label>
                  <select 
                    required
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Branch</label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Asset</label>
                  <select
                    value={formData.equipment_id}
                    onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Asset</option>
                    {equipmentList
                      .filter((eq) => (formData.client_id ? eq.client_id === formData.client_id : true))
                      .map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Job Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Enter job title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Provide detailed description of the job..."
                ></textarea>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-rose-500" />
              <span>Site Details</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Site Location / Address</label>
                <input 
                  type="text"
                  value={formData.site_address}
                  onChange={(e) => setFormData({ ...formData, site_address: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Enter full site address"
                />
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">Click on the map to set the exact coordinates</div>
                <div className="h-[400px] w-full overflow-hidden rounded-xl border border-slate-200">
                  <MapContainer
                    center={coords ? [coords.lat, coords.lng] : [24.7136, 46.6753]}
                    zoom={coords ? 14 : 5}
                    scrollWheelZoom
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickPicker
                      onPick={(lat, lng) => {
                        setFormData((prev) => ({
                          ...prev,
                          site_latitude: lat.toFixed(6),
                          site_longitude: lng.toFixed(6),
                        }));
                      }}
                    />
                    {coords && (
                      <Marker position={[coords.lat, coords.lng]} icon={customMarkerIcon}>
                        <Popup>
                          <div className="p-2">
                          <p className="font-bold text-slate-900 text-sm">Selected Location</p>
                          <p className="text-xs text-slate-600">Lat: {coords.lat.toFixed(6)}</p>
                          <p className="text-xs text-slate-600">Lng: {coords.lng.toFixed(6)}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-1">Latitude</div>
                    <input
                      value={formData.site_latitude}
                      onChange={(e) => setFormData({ ...formData, site_latitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-1">Longitude</div>
                    <input
                      value={formData.site_longitude}
                      onChange={(e) => setFormData({ ...formData, site_longitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      placeholder="—"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        const address = formData.site_address.trim();
                        if (!address) return;
                        const selectedBranch = branches.find((b) => b.id === formData.branch_id);
                        const countryHint = selectedBranch?.countries?.name;
                        const found = await geocodeAddressNominatim(address, { countryHint });
                        if (found) {
                          setFormData((prev) => ({
                            ...prev,
                            site_latitude: found.lat.toFixed(6),
                            site_longitude: found.lng.toFixed(6),
                          }));
                        }
                      }}
                      className="w-full px-4 py-2 bg-primary-600 text-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Fetch from address
                    </button>
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, site_latitude: '', site_longitude: '' }))}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Clear coordinates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Form */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-emerald-500" />
              <span>Scheduling</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Scheduled Date</label>
                <input 
                  type="date" 
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Priority</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <button 
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        formData.priority === p 
                          ? 'bg-primary-50 border-primary-200 text-primary-600' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-indigo-500" />
              <span>Assignment</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Engineer</label>
                <select 
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select Engineer</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Sales Person</label>
                <select 
                  value={formData.assigned_sales_id}
                  onChange={(e) => setFormData({ ...formData, assigned_sales_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select Sales Person</option>
                  {salesUsers.map((user) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-700 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>The engineer will be notified immediately upon job creation.</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};

export default CreateJobPage;
