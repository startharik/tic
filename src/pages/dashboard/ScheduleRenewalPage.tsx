import React, { useEffect, useMemo, useState } from 'react';
import { 
  ArrowLeft,
  Save,
  Calendar as CalendarIcon,
  MapPin,
  Info,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createJob, getBranches, getEquipment, getUsers, geocodeAddressNominatim } from '../../services/supabaseService';
import type { Branch, Equipment, User } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';

const ScheduleRenewalPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [equipmentId, setEquipmentId] = useState<string>(searchParams.get('equipmentId') ?? '');
  const [branchId, setBranchId] = useState<string>('');
  const [assignedEngineerId, setAssignedEngineerId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [siteAddress, setSiteAddress] = useState<string>('');
  const [renewalDate, setRenewalDate] = useState<string>('');
  const [timeWindow, setTimeWindow] = useState<'morning' | 'afternoon' | 'full_day'>('morning');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [equipmentData, branchData, userData] = await Promise.all([
          getEquipment(),
          getBranches(),
          getUsers(),
        ]);
        setEquipment(equipmentData);
        setBranches(branchData);
        setUsers(userData);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedEquipment = useMemo(() => equipment.find((e) => e.id === equipmentId) ?? null, [equipment, equipmentId]);
  const clientName = selectedEquipment?.clients?.name || '—';

  const engineers = useMemo(() => users.filter((u) => u.role === 'engineer'), [users]);

  const buildScheduledAtISO = (dateOnly: string, window: typeof timeWindow): string => {
    const time =
      window === 'morning' ? '08:00:00' : window === 'afternoon' ? '13:00:00' : '09:00:00';
    const local = new Date(`${dateOnly}T${time}`);
    return local.toISOString();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedEquipment) {
      setError('Please select an asset.');
      return;
    }

    if (!renewalDate) {
      setError('Please select a renewal date.');
      return;
    }

    if (!branchId) {
      setError('Please select a branch.');
      return;
    }

    try {
      setIsSaving(true);

      const scheduledAt = buildScheduledAtISO(renewalDate, timeWindow);
      const address = siteAddress.trim();
      let coords: { lat: number; lng: number } | null = null;
      if (address) {
        const selectedBranch = branches.find((b) => b.id === branchId);
        const countryHint = (selectedBranch as any)?.countries?.name as string | undefined;
        coords = await geocodeAddressNominatim(address, { countryHint });
        if (!coords) {
          setError('Renewal job will be created without coordinates. You can edit the job and try again.');
        }
      }

      const job = await createJob({
        client_id: selectedEquipment.client_id,
        branch_id: branchId,
        equipment_id: selectedEquipment.id,
        assigned_to: assignedEngineerId || undefined,
        created_by: userProfile?.id || undefined,
        title: `Renewal - ${selectedEquipment.name}`,
        description: notes.trim() || undefined,
        status: 'assigned',
        priority,
        site_address: address || undefined,
        site_latitude: coords?.lat,
        site_longitude: coords?.lng,
        scheduled_date: scheduledAt,
        due_date: undefined,
        completed_date: undefined,
      });

      navigate(`/admin/jobs/${job.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create renewal job');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/renewals')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule Renewal</h1>
            <p className="text-slate-500 text-sm">Schedule a new inspection job for an expiring asset.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/admin/renewals')}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSaving || loading}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Confirm Renewal</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5" />
          <div className="text-sm text-rose-700 font-semibold">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Info className="h-5 w-5 text-primary-500" />
              <span>Asset & Client Information</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Select Expiring Asset</label>
                  <select
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select Asset</option>
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Client</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none text-slate-500" 
                    value={clientName}
                    disabled 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Renewal Notes</label>
                <textarea 
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Provide any specific instructions for this renewal inspection..."
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
                <label className="text-sm font-semibold text-slate-700">Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Site Location / Address</label>
                <input 
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Enter full site address"
                />
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
                <label className="text-sm font-semibold text-slate-700">Renewal Date</label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Time Window</label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value as any)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="morning">Morning (08:00 - 12:00)</option>
                    <option value="afternoon">Afternoon (13:00 - 17:00)</option>
                    <option value="full_day">Full Day</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Priority</label>
                <div className="flex gap-2">
                  {[
                    { key: 'low', label: 'Low' },
                    { key: 'medium', label: 'Medium' },
                    { key: 'high', label: 'High' },
                  ].map((p) => (
                    <button 
                      key={p.key}
                      type="button"
                      onClick={() => setPriority(p.key as any)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        priority === p.key
                          ? p.key === 'high'
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : p.key === 'medium'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>Assignment</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign Engineer</label>
                <select
                  value={assignedEngineerId}
                  onChange={(e) => setAssignedEngineerId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select Engineer</option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {`${eng.first_name || ''} ${eng.last_name || ''}`.trim() || 'Engineer'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
      )}
    </div>
  );
};

export default ScheduleRenewalPage;
