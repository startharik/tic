import React, { useMemo, useState, useEffect } from 'react';
import {
  Building2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  LayoutGrid,
  List,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  createDocumentFolder,
  deleteDocumentFolder,
  deleteDocument,
  getDocumentFolders,
  getDocuments,
  type Document,
  type DocumentFolder,
} from '../../services/supabaseService';

const categoryLabel = (value?: string): string => {
  if (!value) return 'Uncategorized';
  const normalized = value.toLowerCase();
  if (normalized === 'procedure') return 'Procedure';
  if (normalized === 'drawing') return 'Drawing';
  if (normalized === 'certificate') return 'Certificate';
  if (normalized === 'template') return 'Template';
  if (normalized === 'client_attachment') return 'Client Attachment';
  return value;
};

const categoryBadgeClass = (value?: string): string => {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'procedure') return 'bg-blue-100 text-blue-700';
  if (normalized === 'drawing') return 'bg-amber-100 text-amber-700';
  if (normalized === 'certificate') return 'bg-emerald-100 text-emerald-700';
  if (normalized === 'template') return 'bg-indigo-100 text-indigo-700';
  if (normalized === 'client_attachment') return 'bg-slate-100 text-slate-700';
  return 'bg-slate-100 text-slate-700';
};

type FolderNode =
  | { kind: 'root'; label: string }
  | { kind: 'folder'; id: string; label: string }
  | { kind: 'group'; id: 'by_client' | 'by_asset'; label: string }
  | { kind: 'category'; id: string; label: string }
  | { kind: 'client'; id: string; label: string }
  | { kind: 'equipment'; id: string; label: string };

const iconForDocument = (doc: Document) => {
  const ft = (doc.file_type || '').toLowerCase();
  if (ft.startsWith('image/')) return 'image';
  if (ft.startsWith('video/')) return 'video';
  if (ft.includes('pdf')) return 'pdf';
  if (ft.includes('word') || ft.includes('officedocument')) return 'doc';
  return 'file';
};

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
};

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [path, setPath] = useState<FolderNode[]>([{ kind: 'root', label: 'Documents' }]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState(false);
  const [deleteFolderError, setDeleteFolderError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docs, folderList] = await Promise.all([getDocuments(), getDocumentFolders()]);
        setDocuments(docs);
        setFolders(folderList);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pushPath = (node: FolderNode) => setPath((prev) => [...prev, node]);

  const goToIndex = (index: number) => {
    setPath((prev) => prev.slice(0, Math.max(1, index + 1)));
  };

  const active = path[path.length - 1];

  const folderChildrenByParent = useMemo(() => {
    const map: Record<string, string[]> = {};
    folders.forEach((f) => {
      const parentKey = f.parent_id || '__root__';
      map[parentKey] = map[parentKey] || [];
      map[parentKey].push(f.id);
    });
    return map;
  }, [folders]);

  const folderNameById = useMemo(() => {
    const map: Record<string, string> = {};
    folders.forEach((f) => {
      map[f.id] = f.name;
    });
    return map;
  }, [folders]);

  const scope = useMemo(() => {
    const selectedFolder = [...path].reverse().find((p) => p.kind === 'folder') as
      | Extract<FolderNode, { kind: 'folder' }>
      | undefined;
    const selectedCategory = path.find((p) => p.kind === 'category') as Extract<FolderNode, { kind: 'category' }> | undefined;
    const selectedClient = path.find((p) => p.kind === 'client') as Extract<FolderNode, { kind: 'client' }> | undefined;
    const selectedEquipment = path.find((p) => p.kind === 'equipment') as Extract<FolderNode, { kind: 'equipment' }> | undefined;

    return {
      folderId: selectedFolder?.id ?? '',
      category: selectedCategory?.id ?? '',
      clientId: selectedClient?.id ?? '',
      equipmentId: selectedEquipment?.id ?? '',
      group: path.find((p) => p.kind === 'group') as Extract<FolderNode, { kind: 'group' }> | undefined,
    };
  }, [path]);

  const documentsInScope = useMemo(() => {
    return documents
      .filter((d) => (scope.folderId ? d.folder_id === scope.folderId : true))
      .filter((d) => (scope.category ? (d.category || '').toLowerCase() === scope.category.toLowerCase() : true))
      .filter((d) => (scope.clientId ? d.client_id === scope.clientId : true))
      .filter((d) => (scope.equipmentId ? d.equipment_id === scope.equipmentId : true));
  }, [documents, scope.folderId, scope.category, scope.clientId, scope.equipmentId]);

  const filteredDocuments = useMemo(() => {
    const norm = search.trim().toLowerCase();
    if (!norm) return documentsInScope;
    return documentsInScope.filter((d) => {
      return (
        d.title.toLowerCase().includes(norm) ||
        (d.description || '').toLowerCase().includes(norm) ||
        (d.clients?.name || '').toLowerCase().includes(norm) ||
        (d.equipment?.name || '').toLowerCase().includes(norm) ||
        (d.version || '').toLowerCase().includes(norm) ||
        d.id.toLowerCase().includes(norm)
      );
    });
  }, [documentsInScope, search]);

  const folderTiles = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const clientCounts: Record<string, { id: string; name: string; count: number }> = {};
    const equipmentCounts: Record<string, { id: string; name: string; count: number }> = {};

    documents
      .filter((d) => (scope.category ? (d.category || '').toLowerCase() === scope.category.toLowerCase() : true))
      .filter((d) => (scope.clientId ? d.client_id === scope.clientId : true))
      .filter((d) => (scope.equipmentId ? d.equipment_id === scope.equipmentId : true))
      .forEach((d) => {
      const cat = (d.category || 'uncategorized').toLowerCase();
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      if (d.clients?.id && d.clients?.name) {
        const prev = clientCounts[d.clients.id];
        clientCounts[d.clients.id] = { id: d.clients.id, name: d.clients.name, count: (prev?.count || 0) + 1 };
      }
      if (d.equipment?.id && d.equipment?.name) {
        const prev = equipmentCounts[d.equipment.id];
        equipmentCounts[d.equipment.id] = { id: d.equipment.id, name: d.equipment.name, count: (prev?.count || 0) + 1 };
      }
    });

    const cats = Object.keys(categoryCounts)
      .map((id) => ({ kind: 'category' as const, id, label: categoryLabel(id), count: categoryCounts[id] }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const clients = Object.values(clientCounts).sort((a, b) => a.name.localeCompare(b.name));
    const assets = Object.values(equipmentCounts).sort((a, b) => a.name.localeCompare(b.name));

    const parentId = scope.folderId || null;
    const childFolders = folders
      .filter((f) => (f.parent_id || null) === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
    const folderCounts: Record<string, number> = {};
    documents.forEach((d) => {
      if (!d.folder_id) return;
      folderCounts[d.folder_id] = (folderCounts[d.folder_id] || 0) + 1;
    });

    if (active.kind === 'root') {
      return {
        folders: [
          ...childFolders.map((f) => ({
            node: { kind: 'folder', id: f.id, label: f.name } as FolderNode,
            count: folderCounts[f.id] || 0,
            icon: 'folder' as const,
          })),
          ...cats.map((c) => ({ node: c as FolderNode, count: c.count, icon: 'category' as const })),
          { node: { kind: 'group', id: 'by_client', label: 'By Client' } as FolderNode, count: clients.length, icon: 'client' as const },
          { node: { kind: 'group', id: 'by_asset', label: 'By Asset' } as FolderNode, count: assets.length, icon: 'asset' as const },
        ],
      };
    }

    if (active.kind === 'folder') {
      return {
        folders: [
          ...childFolders.map((f) => ({
            node: { kind: 'folder', id: f.id, label: f.name } as FolderNode,
            count: folderCounts[f.id] || 0,
            icon: 'folder' as const,
          })),
          ...(scope.category ? [] : cats.map((c) => ({ node: c as FolderNode, count: c.count, icon: 'category' as const }))),
        ],
      };
    }

    if (active.kind === 'group' && active.id === 'by_client') {
      return {
        folders: clients.map((c) => ({
          node: { kind: 'client', id: c.id, label: c.name } as FolderNode,
          count: c.count,
          icon: 'client' as const,
        })),
      };
    }

    if (active.kind === 'group' && active.id === 'by_asset') {
      return {
        folders: assets.map((a) => ({
          node: { kind: 'equipment', id: a.id, label: a.name } as FolderNode,
          count: a.count,
          icon: 'asset' as const,
        })),
      };
    }

    if (active.kind === 'client' || active.kind === 'equipment') {
      if (scope.category) return { folders: [] as any[] };
      return {
        folders: cats.map((c) => ({ node: c as FolderNode, count: c.count, icon: 'category' as const })),
      };
    }

    return { folders: [] as any[] };
  }, [active.kind, documents, folders, scope.category, scope.clientId, scope.equipmentId, scope.folderId]);

  const sidebarCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      const cat = (d.category || 'uncategorized').toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts)
      .map((id) => ({ id, label: categoryLabel(id), count: counts[id] }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [documents]);

  const sidebarFolders = useMemo(() => {
    const parentId = null;
    return folders
      .filter((f) => (f.parent_id || null) === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [folders]);

  const handleOpen = (doc: Document) => {
    window.open(doc.file_url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (doc: Document) => {
    try {
      const a = document.createElement('a');
      a.href = doc.file_url;
      a.download = doc.title || 'document';
      a.click();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    try {
      setIsDeleting(doc.id);
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document.');
    } finally {
      setIsDeleting(null);
    }
  };

  const openNewFolder = () => {
    setFolderError(null);
    setNewFolderName('');
    setShowNewFolder(true);
  };

  const openDeleteFolder = (folderId: string) => {
    const name = folderNameById[folderId] || 'Folder';
    setDeleteTarget({ id: folderId, name });
    setDeleteFolderError(null);
    setShowDeleteFolder(true);
  };

  const collectFolderTreeIds = (rootId: string) => {
    const result: string[] = [rootId];
    const stack: string[] = [rootId];
    while (stack.length > 0) {
      const current = stack.pop() as string;
      const children = folderChildrenByParent[current] || [];
      children.forEach((childId) => {
        result.push(childId);
        stack.push(childId);
      });
    }
    return result;
  };

  const deleteInfo = useMemo(() => {
    if (!deleteTarget) return null;
    const treeIds = collectFolderTreeIds(deleteTarget.id);
    const subfolders = Math.max(0, treeIds.length - 1);
    const docs = documents.filter((d) => d.folder_id && treeIds.includes(d.folder_id)).length;
    return { treeIds, subfolders, docs };
  }, [deleteTarget, documents, folderChildrenByParent]);

  const confirmDeleteFolder = async () => {
    if (!deleteTarget || !deleteInfo) return;
    try {
      setDeletingFolder(true);
      setDeleteFolderError(null);
      await deleteDocumentFolder(deleteTarget.id);
      setFolders((prev) => prev.filter((f) => !deleteInfo.treeIds.includes(f.id)));
      setDocuments((prev) =>
        prev.map((d) => (d.folder_id && deleteInfo.treeIds.includes(d.folder_id) ? { ...d, folder_id: undefined } : d))
      );
      setShowDeleteFolder(false);
      setDeleteTarget(null);
      setPath([{ kind: 'root', label: 'Documents' }]);
    } catch (e: any) {
      setDeleteFolderError(e?.message ?? 'Failed to delete folder.');
    } finally {
      setDeletingFolder(false);
    }
  };

  const createFolder = async () => {
    if (!user) {
      setFolderError('You must be logged in.');
      return;
    }
    const name = newFolderName.trim();
    if (!name) {
      setFolderError('Please enter a folder name.');
      return;
    }
    try {
      setCreatingFolder(true);
      setFolderError(null);
      const created = await createDocumentFolder({
        name,
        parent_id: scope.folderId || undefined,
        created_by: user.id,
      });
      setFolders((prev) => [...prev, created]);
      setShowNewFolder(false);
      pushPath({ kind: 'folder', id: created.id, label: created.name });
    } catch (e: any) {
      setFolderError(e?.message ?? 'Failed to create folder.');
    } finally {
      setCreatingFolder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            {path.map((p, idx) => (
              <div key={`${p.kind}-${'id' in p ? (p as any).id : idx}`} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToIndex(idx)}
                  className={`hover:text-slate-900 ${idx === path.length - 1 ? 'text-slate-900' : ''}`}
                >
                  {p.label}
                </button>
                {idx < path.length - 1 && <ChevronRight className="h-4 w-4 text-slate-400" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {scope.folderId && (
              <button
                type="button"
                onClick={() => openDeleteFolder(scope.folderId)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Folder
              </button>
            )}

            <button
              type="button"
              onClick={openNewFolder}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              New Folder
            </button>

            <button
              type="button"
              onClick={() => navigate(scope.folderId ? `/admin/documents/upload?folderId=${scope.folderId}` : '/admin/documents/upload')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 shadow shadow-primary-200"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search in this folder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">{filteredDocuments.length} items</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-slate-900">Folders</div>
          <div className="p-2">
            <button
              type="button"
              onClick={() => setPath([{ kind: 'root', label: 'Documents' }])}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 ${
                path.length === 1 ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span className="text-sm font-semibold">All Files</span>
              </div>
              <span className="text-xs font-bold text-slate-500">{documents.length}</span>
            </button>

            <div className="mt-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">My Folders</div>
            <div className="mt-1 space-y-1">
              {sidebarFolders.length === 0 ? (
                <div className="px-3 py-2 text-xs font-semibold text-slate-500">No folders yet</div>
              ) : (
                sidebarFolders.map((f) => {
                  const isActive = scope.folderId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPath([{ kind: 'root', label: 'Documents' }, { kind: 'folder', id: f.id, label: f.name }])}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 ${
                        isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Folder className="h-4 w-4" />
                        <span className="text-sm font-semibold truncate">{f.name}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Categories</div>
            <div className="mt-1 space-y-1">
              {sidebarCategories.map((c) => {
                const isActive = scope.category && scope.category.toLowerCase() === c.id.toLowerCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPath([{ kind: 'root', label: 'Documents' }, { kind: 'category', id: c.id, label: c.label }])}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span className="text-sm font-semibold truncate">{c.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{c.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Group By</div>
            <div className="mt-1 space-y-1">
              <button
                type="button"
                onClick={() => setPath([{ kind: 'root', label: 'Documents' }, { kind: 'group', id: 'by_client', label: 'By Client' }])}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 ${
                  scope.group?.id === 'by_client' ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">By Client</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPath([{ kind: 'root', label: 'Documents' }, { kind: 'group', id: 'by_asset', label: 'By Asset' }])}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 ${
                  scope.group?.id === 'by_asset' ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-semibold">By Asset</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {viewMode === 'grid' ? (
            <div className="p-4 space-y-6">
              {folderTiles.folders.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Folders</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {folderTiles.folders.map((f) => (
                      <button
                        key={`${(f.node as any).kind}-${(f.node as any).id ?? f.node.label}`}
                        type="button"
                        onClick={() => pushPath(f.node)}
                        className="group p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/40 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-white">
                            <FolderOpen className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="flex items-center gap-2">
                            {f.node.kind === 'folder' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDeleteFolder(f.node.id);
                                }}
                                className="p-2 rounded-lg bg-white/70 border border-slate-200 text-rose-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Delete folder"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <span className="text-xs font-bold text-slate-500">{f.count}</span>
                          </div>
                        </div>
                        <div className="mt-3 text-sm font-extrabold text-slate-900 truncate">{f.node.label}</div>
                        <div className="mt-1 text-xs text-slate-500 truncate">
                          {f.icon === 'folder' ? 'Folder' : f.icon === 'client' ? 'Clients' : f.icon === 'asset' ? 'Assets' : 'Category'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Files</div>
                {filteredDocuments.length === 0 ? (
                  <div className="py-12 text-center text-sm font-semibold text-slate-500">No documents found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredDocuments.map((d) => {
                      const kind = iconForDocument(d);
                      return (
                        <div
                          key={d.id}
                          className="group p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-slate-600" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-extrabold text-slate-900 truncate">{d.title}</div>
                                <div className="text-xs text-slate-500 truncate">
                                  {categoryLabel(d.category)} • v{d.version || '1.0'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleOpen(d)}
                                className="p-2 rounded-lg hover:bg-white text-slate-600"
                                aria-label="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(d)}
                                className="p-2 rounded-lg hover:bg-white text-slate-600"
                                aria-label="Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={isDeleting === d.id}
                                onClick={() => handleDelete(d)}
                                className="p-2 rounded-lg hover:bg-white text-rose-600 disabled:opacity-70"
                                aria-label="Delete"
                              >
                                {isDeleting === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-600">
                            <div className="flex items-center gap-2 min-w-0">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="truncate">{formatDate(d.updated_at || d.created_at)}</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase">{kind}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Version</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((d, index) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">{d.title}</div>
                            <div className="text-xs text-slate-500 truncate">
                              {d.clients?.name ? `${d.clients.name} • ` : ''}
                              {d.equipment?.name ? `${d.equipment.name} • ` : ''}
                              {d.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryBadgeClass(d.category)}`}>
                          {categoryLabel(d.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{d.version}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(d.updated_at || d.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpen(d)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(d)}
                            className="px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 shadow shadow-primary-200"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting === d.id}
                            onClick={() => handleDelete(d)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-70"
                          >
                            {isDeleting === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocuments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                        No documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="text-sm font-extrabold text-slate-900">New Folder</div>
              <button
                type="button"
                onClick={() => setShowNewFolder(false)}
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {folderError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {folderError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Folder Name</label>
                <input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g., Certificates 2026"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolder(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={creatingFolder}
                  onClick={createFolder}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-70"
                >
                  {creatingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteFolder && deleteTarget && deleteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="text-sm font-extrabold text-slate-900">Delete Folder</div>
              <button
                type="button"
                onClick={() => setShowDeleteFolder(false)}
                className="p-2 rounded-lg hover:bg-slate-50 text-slate-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {deleteFolderError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {deleteFolderError}
                </div>
              )}
              <div className="text-sm font-semibold text-slate-800">
                Delete “{deleteTarget.name}”?
              </div>
              <div className="text-xs font-semibold text-slate-600">
                This will delete {deleteInfo.subfolders} subfolder(s). Documents inside these folders will be kept, but removed from the folder.
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                Affected documents: {deleteInfo.docs}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteFolder(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingFolder}
                  onClick={confirmDeleteFolder}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-70"
                >
                  {deletingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
