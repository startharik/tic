import React, { useEffect, useMemo, useState } from 'react';
import { 
  CheckCircle, 
  Clock,
  ExternalLink,
  Filter, 
  Loader2,
  Video, 
  Search, 
  XCircle,
} from 'lucide-react';
import { deleteMedia, getMedia, updateMedia, type Media } from '../../services/supabaseService';

const MediaManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Media[]>([]);
  const [tab, setTab] = useState<'all' | 'photos' | 'videos' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMedia();
        setItems(data);
      } catch (e) {
        console.error('Error fetching media:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const norm = search.trim().toLowerCase();
    return items
      .filter((m) => {
        if (tab === 'photos') return m.file_type === 'image';
        if (tab === 'videos') return m.file_type === 'video';
        if (tab === 'pending') return !m.is_approved;
        return true;
      })
      .filter((m) => {
        if (!norm) return true;
        const jobTitle = (m.jobs?.title || '').toLowerCase();
        const client = (m.jobs?.clients?.name || '').toLowerCase();
        const fileName = (m.file_name || '').toLowerCase();
        const id = (m.id || '').toLowerCase();
        return jobTitle.includes(norm) || client.includes(norm) || fileName.includes(norm) || id.includes(norm);
      });
  }, [items, tab, search]);

  const approve = async (m: Media) => {
    try {
      setUpdatingId(m.id);
      const updated = await updateMedia(m.id, { is_approved: true });
      setItems((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
    } catch (e) {
      console.error('Error approving media:', e);
      alert('Failed to approve media.');
    } finally {
      setUpdatingId(null);
    }
  };

  const reject = async (m: Media) => {
    try {
      setUpdatingId(m.id);
      const updated = await updateMedia(m.id, { is_approved: false });
      setItems((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
    } catch (e) {
      console.error('Error rejecting media:', e);
      alert('Failed to update media.');
    } finally {
      setUpdatingId(null);
    }
  };

  const remove = async (m: Media) => {
    if (!confirm('Delete this media item?')) return;
    try {
      setUpdatingId(m.id);
      await deleteMedia(m.id);
      setItems((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e) {
      console.error('Error deleting media:', e);
      alert('Failed to delete media.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusLabel = (m: Media) => {
    if (m.is_approved) return 'Approved';
    return 'Pending';
  };

  const statusClass = (m: Media) => {
    if (m.is_approved) return 'bg-emerald-500 text-white border-emerald-400';
    return 'bg-blue-500 text-white border-blue-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Media Management</h1>
          <p className="text-slate-500 mt-1">Review and approve inspection photos and videos with watermarks.</p>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === 'all' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          All Media
        </button>
        <button
          type="button"
          onClick={() => setTab('photos')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === 'photos' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Photos
        </button>
        <button
          type="button"
          onClick={() => setTab('videos')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === 'videos' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Videos
        </button>
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === 'pending' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Pending Approval
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job, client, file, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Date Range</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
              {item.file_type === 'image' ? (
                <button
                  type="button"
                  onClick={() => window.open(item.file_url, '_blank', 'noopener,noreferrer')}
                  className="w-full h-full block cursor-pointer"
                >
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>
              ) : item.file_type === 'video' ? (
                <button
                  type="button"
                  onClick={() => window.open(item.file_url, '_blank', 'noopener,noreferrer')}
                  className="w-full h-full bg-black flex items-center justify-center cursor-pointer"
                >
                  <Video className="h-12 w-12 text-white/70" />
                </button>
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border ${statusClass(item)}`}>
                  {statusLabel(item)}
                </span>
              </div>
              {item.file_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => window.open(item.file_url, '_blank', 'noopener,noreferrer')}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors"
                    aria-label="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => approve(item)}
                      className="p-2 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 transition-colors shadow-lg disabled:opacity-70"
                      aria-label="Approve"
                    >
                      {updatingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => reject(item)}
                      className="p-2 bg-rose-500 rounded-lg text-white hover:bg-rose-600 transition-colors shadow-lg disabled:opacity-70"
                      aria-label="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-slate-900 truncate">{item.jobs?.title || 'Job Media'}</h3>
                <button
                  type="button"
                  disabled={updatingId === item.id}
                  onClick={() => remove(item)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 disabled:opacity-70"
                >
                  Delete
                </button>
              </div>
              <p className="text-xs font-semibold text-slate-600 truncate">{item.jobs?.clients?.name || 'Unknown Client'}</p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                {item.file_type === 'image' ? 'Image' : item.file_type === 'video' ? 'Video' : item.file_type}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-10 text-center text-sm font-semibold text-slate-500">No media found.</div>
      )}
    </div>
  );
};

export default MediaManagementPage;
