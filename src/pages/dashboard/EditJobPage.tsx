import React, { useMemo, useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Save,
  Calendar as CalendarIcon,
  MapPin,
  User as UserIcon,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClients, getUsers, getBranches, getEquipment, getJob, updateJob, geocodeAddressNominatim, createNotification } from '../../services/supabaseService';
import type { Client, User, Branch, Equipment } from '../../services/supabaseService';
import { MapContainer, Marker, TileLayer, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';

const isoToDateOnly = (value: string): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dateOnlyToISO = (value: string): string | undefined => {
  if (!value) return undefined;
  const d = new Date(value + 'T09:00:00');
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

const EditJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [initialSiteAddress, setInitialSiteAddress] = useState<string>('');
  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [initialAssignedTo, setInitialAssignedTo] = useState<string>('');
  const [initialTrainerId, setInitialTrainerId] = useState<string>('');
  const [initialSalesPersonId, setInitialSalesPersonId] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ jo_number?: string; task_number?: string }>({});
  const [formData, setFormData] = useState({
    client_id: '',
    branch_id: '',
    equipment_id: '',
    assigned_to: '',
    trainer_id: '',
    sales_person_id: '',
    title: '',
    description: '',
    status: 'assigned' as string,
    priority: 'medium' as string,
    type: 'inspection' as string,
    service_type: 'accredited' as string,
    jo_number: '',
    task_number: '',
    site_address: '',
    site_latitude: '',
    site_longitude: '',
    site_person_name: '',
    site_person_phone: '',
    site_person_email: '',
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
        if (!jobId) return;
        const [jobData, clientsData, usersData, branchesData, equipmentData] = await Promise.all([
          getJob(jobId),
          getClients(),
          getUsers(),
          getBranches(),
          getEquipment()
        ]);
        setClients(clientsData);
        setUsers(usersData);
        setBranches(branchesData);
        setEquipmentList(equipmentData);
        setInitialSiteAddress(jobData.site_address || '');
        if (typeof jobData.site_latitude === 'number' && typeof jobData.site_longitude === 'number' && !(jobData.site_latitude === 0 && jobData.site_longitude === 0)) {
          setInitialCoords({ lat: jobData.site_latitude, lng: jobData.site_longitude });
        } else {
          setInitialCoords(null);
        }
        setInitialAssignedTo(jobData.assigned_to || '');
        setInitialTrainerId(jobData.trainer_id || '');
        setInitialSalesPersonId(jobData.sales_person_id || '');
        setFormData({
          client_id: jobData.client_id || '',
          branch_id: jobData.branch_id || '',
          equipment_id: jobData.equipment_id || '',
          assigned_to: jobData.assigned_to || '',
          trainer_id: jobData.trainer_id || '',
          sales_person_id: jobData.sales_person_id || '',
          title: jobData.title,
          description: jobData.description || '',
          status: jobData.status as any,
          priority: jobData.priority as any,
          type: jobData.type || 'inspection',
          service_type: jobData.service_type || 'accredited',
          jo_number: jobData.jo_number || '',
          task_number: jobData.task_number || '',
          site_address: jobData.site_address || '',
          site_latitude: jobData.site_latitude !== undefined && jobData.site_latitude !== null ? String(jobData.site_latitude) : '',
          site_longitude: jobData.site_longitude !== undefined && jobData.site_longitude !== null ? String(jobData.site_longitude) : '',
          site_person_name: jobData.site_person_name || '',
          site_person_phone: jobData.site_person_phone || '',
          site_person_email: jobData.site_person_email || '',
          scheduled_date: jobData.scheduled_date ? isoToDateOnly(jobData.scheduled_date) : '',
          due_date: jobData.due_date ? isoToDateOnly(jobData.due_date) : '',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { jo_number?: string; task_number?: string } = {};
    if (!formData.jo_number.trim()) errors.jo_number = 'JO Number is required';
    if (!formData.task_number.trim()) errors.task_number = 'Task Number is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFormErrors({});
    try {
      setLoading(true);
      if (!jobId) throw new Error('No job ID provided');
      const address = formData.site_address.trim();
      const manualLat = Number(formData.site_latitude);
      const manualLng = Number(formData.site_longitude);
      let newCoords: { lat: number; lng: number } | null = null;
      if (Number.isFinite(manualLat) && Number.isFinite(manualLng) && !(manualLat === 0 && manualLng === 0)) {
        newCoords = { lat: manualLat, lng: manualLng };
      } else if (address && address !== initialSiteAddress) {
        const selectedBranch = branches.find((b) => b.id === formData.branch_id);
        const countryHint = selectedBranch?.countries?.name;
        newCoords = await geocodeAddressNominatim(address, { countryHint });
      }
      const dataToSubmit = {
        client_id: formData.client_id,
        branch_id: formData.branch_id || undefined,
        equipment_id: formData.equipment_id || undefined,
        assigned_to: formData.assigned_to || undefined,
        trainer_id: formData.trainer_id || undefined,
        sales_person_id: formData.sales_person_id || undefined,
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        type: formData.type,
        service_type: formData.service_type,
        jo_number: formData.jo_number.trim(),
        task_number: formData.task_number.trim(),
        site_address: address || undefined,
        ...(newCoords ? { site_latitude: newCoords.lat, site_longitude: newCoords.lng } : {}),
        site_person_name: formData.site_person_name || undefined,
        site_person_phone: formData.site_person_phone || undefined,
        site_person_email: formData.site_person_email || undefined,
        scheduled_date: dateOnlyToISO(formData.scheduled_date),
        due_date: dateOnlyToISO(formData.due_date),
      };
      await updateJob(jobId, dataToSubmit);
      
      if (formData.assigned_to && formData.assigned_to !== initialAssignedTo) {
        await createNotification({
          user_id: formData.assigned_to,
          title: "Job Updated - New Assignment",
          message: `You have been assigned to job: ${formData.title}`,
          type: formData.priority === 'urgent' ? 'warning' : 'info',
          related_job_id: jobId,
          is_read: false,
        });
      }

      if (formData.trainer_id && formData.trainer_id !== initialTrainerId) {
        await createNotification({
          user_id: formData.trainer_id,
          title: "Job Updated - New Trainer Assignment",
          message: `You have been assigned as trainer to job: ${formData.title}`,
          type: formData.priority === 'urgent' ? 'warning' : 'info',
          related_job_id: jobId,
          is_read: false,
        });
      }
      
      if (formData.sales_person_id && formData.sales_person_id !== initialSalesPersonId) {
        await createNotification({
          user_id: formData.sales_person_id,
          title: "Job Updated - New Sales Assignment",
          message: `You have been assigned as sales person to job: ${formData.title}`,
          type: formData.priority === 'urgent' ? 'warning' : 'info',
          related_job_id: jobId,
          is_read: false,
        });
      }
      
      if (address && address !== initialSiteAddress && !newCoords) {
        alert('Job saved, but coordinates could not be refreshed from the updated address.');
      }
      navigate(`/admin/jobs/${jobId}`);
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
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
            onClick={() => navigate(`/admin/jobs/${jobId}`)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Job: {formData.title || 'Job Details'}</h1>
            <p className="text-slate-500 text-sm">Update job details and assignments.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => navigate(`/admin/jobs/${jobId}`)}
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
            <span>Save Changes</span>
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
                  <label className="text-sm font-semibold text-slate-700">Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="inspection">Inspection</option>
                    <option value="training">Training</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Type of Service</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="accredited">Accredited</option>
                    <option value="no_accredited">No Accredited</option>
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

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    JO Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={formData.jo_number}
                    onChange={(e) => {
                      setFormData({ ...formData, jo_number: e.target.value });
                      if (formErrors.jo_number) setFormErrors((p) => ({ ...p, jo_number: undefined }));
                    }}
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${formErrors.jo_number ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'}`}
                    placeholder="Enter JO number"
                  />
                  {formErrors.jo_number && (
                    <p className="text-xs text-rose-600">{formErrors.jo_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    Task Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={formData.task_number}
                    onChange={(e) => {
                      setFormData({ ...formData, task_number: e.target.value });
                      if (formErrors.task_number) setFormErrors((p) => ({ ...p, task_number: undefined }));
                    }}
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${formErrors.task_number ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'}`}
                    placeholder="Enter Task number"
                  />
                  {formErrors.task_number && (
                    <p className="text-xs text-rose-600">{formErrors.task_number}</p>
                  )}
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
                />
              </div>

              {(formErrors.jo_number || formErrors.task_number) && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-rose-800">Missing required coordinator fields</p>
                    <p className="text-xs text-rose-700 mt-1">Both JO Number and Task Number must be filled before the job can be saved.</p>
                  </div>
                </div>
              )}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Site Person Name</label>
                  <input
                    value={formData.site_person_name}
                    onChange={(e) => setFormData({ ...formData, site_person_name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Site Person Phone</label>
                  <input
                    value={formData.site_person_phone}
                    onChange={(e) => setFormData({ ...formData, site_person_phone: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="+966 ..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Site Person Email</label>
                  <input
                    type="email"
                    value={formData.site_person_email}
                    onChange={(e) => setFormData({ ...formData, site_person_email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="person@site.com"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">Click on the map to set the exact coordinates</div>
                <div className="h-[400px] w-full overflow-hidden rounded-xl border border-slate-200">
                  <MapContainer
                    center={coords ? [coords.lat, coords.lng] : initialCoords ? [initialCoords.lat, initialCoords.lng] : [24.7136, 46.6753]}
                    zoom={coords || initialCoords ? 14 : 5}
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
                    {(coords || initialCoords) && (
                      <Marker position={[ (coords || initialCoords)!.lat, (coords || initialCoords)!.lng ]} icon={customMarkerIcon}>
                        <Popup>
                          <div className="p-2">
                          <p className="font-bold text-slate-900 text-sm">Selected Location</p>
                          <p className="text-xs text-slate-600">Lat: {(coords || initialCoords)!.lat.toFixed(6)}</p>
                          <p className="text-xs text-slate-600">Lng: {(coords || initialCoords)!.lng.toFixed(6)}</p>
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
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Priority</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <button 
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p as any })}
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
                  {users.filter(u => u.role === 'engineer').map((user) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Trainer</label>
                <select 
                  value={formData.trainer_id}
                  onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select Trainer</option>
                  {users.filter(u => u.role === 'trainer').map((user) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Sales Person</label>
                <select 
                  value={formData.sales_person_id}
                  onChange={(e) => setFormData({ ...formData, sales_person_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select Sales Person</option>
                  {users.filter(u => u.role === 'sales').map((user) => (
                    <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};

export default EditJobPage;
