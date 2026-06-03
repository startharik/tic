import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Trash2
} from 'lucide-react';
import { 
  getNotifications, 
  createNotification, 
  markNotificationRead, 
  deleteNotification,
  type Notification
} from '../../services/supabaseService';
import { getUsers, type User } from '../../services/supabaseService';

const NotificationManagementPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState({
    user_id: '',
    title: '',
    message: '',
    type: 'info' as const,
    related_job_id: '',
  });

  const fetchData = async () => {
    try {
      setError(null);
      const [notifsData, usersData] = await Promise.all([
        getNotifications(),
        getUsers()
      ]);
      setNotifications(notifsData);
      setUsers(usersData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendNotification = async () => {
    try {
      setError(null);
      setSending(true);
      
      // Prepare notification data
      const notificationData = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        is_read: false,
        user_id: newNotification.user_id ? newNotification.user_id : null,
        related_job_id: newNotification.related_job_id ? newNotification.related_job_id : null,
      };
      
      await createNotification(notificationData);
      await fetchData();
      setShowSendModal(false);
      setNewNotification({
        user_id: '',
        title: '',
        message: '',
        type: 'info',
        related_job_id: '',
      });
    } catch (err: any) {
      console.error('Error sending notification:', err);
      setError(err?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getIconForType = (type: string) => {
    if (type === 'success') return CheckCircle;
    if (type === 'error') return AlertCircle;
    if (type === 'warning') return Clock;
    return MessageSquare;
  };

  const getColorForType = (type: string) => {
    if (type === 'success') return 'text-emerald-600 bg-emerald-50';
    if (type === 'error') return 'text-rose-600 bg-rose-50';
    if (type === 'warning') return 'text-amber-600 bg-amber-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-bold">{error}</p>
            <button 
              className="text-sm underline"
              onClick={fetchData}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notification Center</h1>
          <p className="text-slate-500 mt-1">Manage notifications and send new alerts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
            onClick={() => setShowSendModal(true)}
          >
            <Send className="h-4 w-4" />
            <span>Send New Alert</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Notifications</p>
              <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Smartphone className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unread</p>
              <p className="text-2xl font-bold text-slate-900">
                {notifications.filter(n => !n.is_read).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Notifications</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {notifications.map((notif) => {
            const IconComponent = getIconForType(notif.type || 'info');
            return (
              <div key={notif.id} className="p-4 hover:bg-slate-50 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getColorForType(notif.type || 'info')} flex-shrink-0`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                        {notif.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{notif.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span>
                        {notif.user_id 
                          ? 'User' 
                          : 'All Users'}
                      </span>
                      <span>•</span>
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notif.is_read && (
                    <button 
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                      onClick={() => markNotificationRead(notif.id).then(fetchData)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    onClick={() => deleteNotification(notif.id).then(fetchData)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No notifications yet
            </div>
          )}
        </div>
      </div>

      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Send New Alert</h2>
              <button 
                className="p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setShowSendModal(false)}
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Recipient</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  value={newNotification.user_id}
                  onChange={(e) => setNewNotification({...newNotification, user_id: e.target.value})}
                >
                  <option value="">All Users</option>
                  {users.filter(u => u.role === 'engineer' || u.role === 'admin').map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Message</label>
                <textarea 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  rows={3}
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Type</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700"
                  onClick={() => setShowSendModal(false)}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendNotification}
                  disabled={!newNotification.title || !newNotification.message || sending}
                >
                  {sending ? 'Sending...' : 'Send Alert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagementPage;
