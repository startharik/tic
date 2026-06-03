import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, FileUp, Loader2, Save, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { createDocument, getClients, getDocumentFolders, getEquipment } from '../../services/supabaseService';
import type { Client, DocumentFolder, Equipment } from '../../services/supabaseService';

const UploadDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [folderId, setFolderId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromFolderId = params.get('folderId') || '';
    setFolderId(fromFolderId);
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        setError(null);
        const [clientsData, equipmentData, folderList] = await Promise.all([getClients(), getEquipment(), getDocumentFolders()]);
        setClients(clientsData);
        setEquipment(equipmentData);
        setFolders(folderList);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load data');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const filteredEquipment = useMemo(() => {
    if (!clientId) return equipment;
    return equipment.filter((e) => e.client_id === clientId);
  }, [clientId, equipment]);

  useEffect(() => {
    if (!clientId) return;
    if (equipmentId && !filteredEquipment.some((e) => e.id === equipmentId)) {
      setEquipmentId('');
    }
  }, [clientId, equipmentId, filteredEquipment]);

  const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

  const onPickFile = () => fileInputRef.current?.click();

  const onFileSelected = (f: File | null) => {
    if (!f) return;
    setFile(f);
    if (!title.trim()) {
      const base = f.name.replace(/\.[^/.]+$/, '');
      setTitle(base);
    }
  };

  const save = async () => {
    if (!user) {
      setError('You must be logged in.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a document name.');
      return;
    }
    if (!category) {
      setError('Please select a type.');
      return;
    }
    if (!file) {
      setError('Please choose a file.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const safeName = sanitizeFileName(file.name);
      const path = `documents/${user.id}/${Date.now()}_${safeName}`;

      const uploadResult = await supabase.storage.from('media').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });
      if (uploadResult.error) throw uploadResult.error;

      const publicUrl = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
      if (!publicUrl) throw new Error('Failed to generate file URL');

      await createDocument({
        title: title.trim(),
        description: description.trim() || undefined,
        file_url: publicUrl,
        file_type: file.type || undefined,
        category,
        folder_id: folderId || undefined,
        client_id: clientId || undefined,
        equipment_id: equipmentId || undefined,
        uploaded_by: user.id,
        version: version.trim() || '1.0',
        expiry_date: expiryDate || undefined,
      });

      navigate('/admin/documents');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/documents')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Upload Document</h1>
            <p className="text-slate-500 text-sm">Add a new procedure, drawing, certificate, or template.</p>
          </div>
        </div>
        <button
          type="button"
          disabled={loading || fetching}
          onClick={save}
          className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Document Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Safety Procedure v2.1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Select type</option>
              <option value="procedure">Procedure</option>
              <option value="drawing">Drawing</option>
              <option value="certificate">Certificate</option>
              <option value="template">Template</option>
              <option value="client_attachment">Client Attachment</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Version</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., 2.1 / A12 / 2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Client (optional)</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Asset (optional)</label>
            <select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Select Asset</option>
              {filteredEquipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Folder (optional)</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">No Folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Description (optional)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Notes about this document..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">File</label>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
              <FileUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="mt-4 text-sm font-semibold text-slate-900">Drop file here or browse</div>
            <div className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, DOCX up to 50MB</div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onPickFile}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Browse Files
              </button>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>
            {file && <div className="mt-3 text-xs font-semibold text-slate-700">{file.name}</div>}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default UploadDocumentPage;
