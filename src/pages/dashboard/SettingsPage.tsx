import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Bell, Download, Lock, MapPinned, Save, Settings as SettingsIcon, Upload, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bulkCreateSavedLocations, geocodeAddressNominatim, getAppSettings, getSavedLocations, updateAppSettings, updateUser } from '../../services/supabaseService';
import type { SavedLocation } from '../../services/supabaseService';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.0.0';

const SettingsPage: React.FC = () => {
  const { user, userProfile, refreshUserProfile, resetPassword, signOut } = useAuth();
  const [active, setActive] = useState<'profile' | 'preferences' | 'security' | 'operations'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [timezone, setTimezone] = useState<string>(() => window.localStorage.getItem('tic_pref_timezone') || 'Asia/Riyadh');
  const [language, setLanguage] = useState<string>(() => window.localStorage.getItem('tic_pref_language') || 'en');
  const [geofenceRadius, setGeofenceRadius] = useState<number>(200);
  const [loadingOps, setLoadingOps] = useState<boolean>(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [locationImporting, setLocationImporting] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationFileInputRef = useRef<HTMLInputElement | null>(null);
  const timezones = useMemo(
    () => [
      { value: 'Asia/Riyadh', label: '(GMT+03:00) Riyadh' },
      { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai' },
      { value: 'Europe/London', label: '(GMT+00:00) London' },
    ],
    [],
  );

  useEffect(() => {
    setUsername(userProfile?.username || '');
    setFirstName(userProfile?.first_name || '');
    setLastName(userProfile?.last_name || '');
    setPhone(userProfile?.phone || '');
  }, [userProfile?.username, userProfile?.first_name, userProfile?.last_name, userProfile?.phone]);

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [active]);

  useEffect(() => {
    const run = async () => {
      if (!userProfile || userProfile.role !== 'super_admin') return;
      setLoadingOps(true);
      try {
        const s = await getAppSettings();
        setGeofenceRadius(Number.isFinite(s.geofence_radius_meters) ? s.geofence_radius_meters : 200);
      } catch (_) {
      } finally {
        setLoadingOps(false);
      }
    };
    run();
  }, [userProfile?.id, userProfile?.role]);

  useEffect(() => {
    const run = async () => {
      if (!userProfile || !['super_admin', 'admin'].includes(userProfile.role)) return;
      try {
        const data = await getSavedLocations();
        setSavedLocations(data);
      } catch (_) {
        setSavedLocations([]);
      }
    };
    run();
  }, [userProfile?.id, userProfile?.role]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUser(user.id, {
        username: username.trim() || undefined,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      await refreshUserProfile();
      setSuccess('Profile updated');
    } catch (e: any) {
      setError(e?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      window.localStorage.setItem('tic_pref_timezone', timezone);
      window.localStorage.setItem('tic_pref_language', language);
      setSuccess('Preferences saved');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReset = async () => {
    const email = user?.email;
    if (!email) return;
    setIsSendingReset(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: resetErr } = await resetPassword(email);
      if (resetErr) throw resetErr;
      setSuccess(`Password reset email sent to ${email}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to send password reset email');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSaveOperations = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const radius = Math.max(20, Math.min(5000, Math.round(geofenceRadius)));
      await updateAppSettings({ geofence_radius_meters: radius });
      setGeofenceRadius(radius);
      setSuccess('Operations settings saved');
    } catch (e: any) {
      setError(e?.message || 'Failed to save operations settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadSavedLocationsTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        name: 'Main Office',
        address: 'King Fahd Road, Riyadh, Saudi Arabia',
        city: 'Riyadh',
        country_name: 'Saudi Arabia',
        latitude: '24.7136',
        longitude: '46.6753',
      },
      {
        name: 'Branch 2',
        address: 'Jeddah Corniche, Jeddah, Saudi Arabia',
        city: 'Jeddah',
        country_name: 'Saudi Arabia',
        latitude: '21.5433',
        longitude: '39.1728',
      },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Saved Locations');
    XLSX.writeFile(workbook, 'saved_locations_template.xlsx');
  };

  const handleImportSavedLocations = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocationImporting(true);
    setLocationError(null);
    setLocationMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string | number | undefined>>(sheet, { defval: '' });

      if (!rows.length) {
        throw new Error('Uploaded file is empty.');
      }

      const validLocations = [] as Array<{ name?: string; address: string; city?: string; country_name?: string; latitude?: number; longitude?: number }>;

      for (const row of rows) {
        const address = String(row.address ?? row.Address ?? row['Site Address'] ?? '').trim();
        const name = String(row.name ?? row.Name ?? row['Location Name'] ?? '').trim();
        if (!address) continue;

        let latitude = Number(row.latitude ?? row.Latitude ?? row['Latitude']);
        let longitude = Number(row.longitude ?? row.Longitude ?? row['Longitude']);

        if ((!Number.isFinite(latitude) || !Number.isFinite(longitude)) && address) {
          const countryHint = String(row.country_name ?? row.Country ?? row['Country Name'] ?? '').trim();
          const geocoded = await geocodeAddressNominatim(address, { countryHint: countryHint || undefined });
          if (geocoded) {
            latitude = geocoded.lat;
            longitude = geocoded.lng;
          }
        }

        const record = {
          name: name || address,
          address,
          city: String(row.city ?? row.City ?? '').trim() || undefined,
          country_name: String(row.country_name ?? row.Country ?? row['Country Name'] ?? '').trim() || undefined,
          latitude: Number.isFinite(latitude) ? latitude : undefined,
          longitude: Number.isFinite(longitude) ? longitude : undefined,
        };

        if (record.address) {
          validLocations.push(record);
        }
      }

      if (!validLocations.length) {
        throw new Error('No valid addresses were found in the uploaded file.');
      }

      await bulkCreateSavedLocations(validLocations);
      const data = await getSavedLocations();
      setSavedLocations(data);
      setLocationMessage(`Successfully imported ${validLocations.length} saved location${validLocations.length > 1 ? 's' : ''}.`);
    } catch (e: any) {
      setLocationError(e?.message || 'Failed to import saved locations.');
    } finally {
      setLocationImporting(false);
      if (locationFileInputRef.current) {
        locationFileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile, preferences, and security.</p>
        <p className="text-xs text-slate-400 mt-2">System version: <span className="font-semibold text-slate-600">v{APP_VERSION}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-1">
          {[
            { id: 'profile', icon: UserIcon, label: 'Profile' },
            { id: 'preferences', icon: SettingsIcon, label: 'Preferences' },
            { id: 'security', icon: Lock, label: 'Security' },
            ...(userProfile?.role === 'super_admin' ? [{ id: 'operations', icon: SettingsIcon, label: 'Operations' }] : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.id === active 
                  ? 'bg-primary-50 text-primary-600 shadow-sm shadow-primary-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`h-4 w-4 ${item.id === active ? 'text-primary-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {!user ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Not signed in</div>
              <div className="text-sm text-slate-500 mt-1">Please log in again.</div>
            </div>
          ) : (
            <>
              {(error || success) && (
                <div
                  className={`rounded-xl px-4 py-3 border text-sm font-medium ${
                    error ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {error || success}
                </div>
              )}

              {active === 'profile' && (
                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Profile</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Email</label>
                      <input
                        type="email"
                        value={user.email || ''}
                        readOnly
                        className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </section>
              )}

              {active === 'preferences' && (
                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Preferences</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        {timezones.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Bell className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Notifications (UI only)</p>
                          <p className="text-xs text-slate-500">Saved locally for now.</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={window.localStorage.getItem('tic_pref_notifications') !== '0'}
                        onChange={(e) => window.localStorage.setItem('tic_pref_notifications', e.target.checked ? '1' : '0')}
                        className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </section>
              )}

              {active === 'security' && (
                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Security</h3>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-sm font-bold text-slate-900">Password reset</div>
                    <div className="text-sm text-slate-500 mt-1">Sends a reset link to your login email.</div>
                    <div className="mt-4">
                      <button
                        onClick={handleSendReset}
                        disabled={isSendingReset || !user.email}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        {isSendingReset ? 'Sending...' : 'Send reset email'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                    <div className="text-sm font-bold text-slate-900">Sign out</div>
                    <div className="text-sm text-slate-600 mt-1">Ends your session on this device.</div>
                    <div className="mt-4">
                      <button
                        onClick={() => void signOut()}
                        className="px-4 py-2 bg-white border border-rose-200 rounded-lg text-sm font-bold text-rose-700 hover:bg-rose-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {active === 'operations' && userProfile?.role === 'super_admin' && (
                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Operations</h3>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-sm font-bold text-slate-900">Site check-in geofence radius</div>
                    <div className="text-sm text-slate-500 mt-1">Engineers must be within this radius (meters) to check-in and start a job.</div>
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-slate-700">Radius (meters)</label>
                      <input
                        type="number"
                        min={20}
                        max={5000}
                        step={10}
                        value={geofenceRadius}
                        onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                        disabled={loadingOps}
                        className="mt-2 w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60"
                      />
                      <div className="text-xs text-slate-400 mt-2">Allowed range: 20m to 5000m</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-slate-600" />
                      <div className="text-sm font-bold text-slate-900">Bulk saved locations</div>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">Upload a list of commonly-used sites so admins can select them when creating jobs and the address + coordinates are auto-filled.</div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleDownloadSavedLocationsTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Download className="h-4 w-4" />
                        Download template
                      </button>

                      <button
                        type="button"
                        onClick={() => locationFileInputRef.current?.click()}
                        disabled={locationImporting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
                      >
                        <Upload className="h-4 w-4" />
                        {locationImporting ? 'Importing...' : 'Upload locations'}
                      </button>
                      <input
                        ref={locationFileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={handleImportSavedLocations}
                      />
                    </div>

                    {(locationError || locationMessage) && (
                      <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${locationError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {locationError || locationMessage}
                      </div>
                    )}

                    {savedLocations.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saved locations</div>
                        <div className="max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white p-2 space-y-2">
                          {savedLocations.map((item) => (
                            <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
                              <div className="text-sm font-semibold text-slate-800">{item.name || 'Unnamed location'}</div>
                              <div className="text-xs text-slate-600">{item.address}</div>
                              {(item.latitude !== undefined && item.longitude !== undefined) && (
                                <div className="text-[11px] text-slate-500 mt-1">
                                  {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveOperations}
                      disabled={isSaving || loadingOps}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
