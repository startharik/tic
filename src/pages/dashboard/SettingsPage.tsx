import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Lock, Save, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAppSettings, updateAppSettings, updateUser } from '../../services/supabaseService';

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
