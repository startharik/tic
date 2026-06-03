import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package, Upload, X, Loader2 } from 'lucide-react';
import { getClients, getBranches, getEquipmentById, updateEquipment } from '../../services/supabaseService';
import type { Branch, Client } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const EditEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    model: '',
    serial_number: '',
    client_id: '',
    branch_id: '',
    status: 'active' as const,
    installation_date: '',
    last_inspection_date: '',
    next_inspection_date: '',
    manufacturer: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setFetchingData(true);
        const [equipmentData, clientsData, branchesData] = await Promise.all([
          getEquipmentById(id),
          getClients(),
          getBranches(),
        ]);
        setClients(clientsData);
        setBranches(branchesData);
        setFormData({
          name: equipmentData.name,
          type: equipmentData.type || '',
          model: equipmentData.model || '',
          serial_number: equipmentData.serial_number || '',
          client_id: equipmentData.client_id || '',
          branch_id: equipmentData.branch_id || '',
          status: (equipmentData.status as any) || 'active',
          installation_date: equipmentData.installation_date || '',
          last_inspection_date: equipmentData.last_inspection_date || '',
          next_inspection_date: equipmentData.next_inspection_date || '',
          manufacturer: equipmentData.manufacturer || '',
        });
        setPhotoUrl(equipmentData.qr_code || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setPhotoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);
  };

  const uploadPhoto = async () => {
    if (!photoFile || !user) return null;

    try {
      setUploadingPhoto(true);
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `equipment/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, photoFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setLoading(true);
      
      let uploadedPhotoUrl = photoUrl;
      
      // If we have a new photo file, upload it first
      if (photoFile) {
        uploadedPhotoUrl = await uploadPhoto();
      }

      const dataToSubmit = {
        ...formData,
        client_id: formData.client_id,
        branch_id: formData.branch_id || undefined,
        installation_date: formData.installation_date || undefined,
        last_inspection_date: formData.last_inspection_date || undefined,
        next_inspection_date: formData.next_inspection_date || undefined,
        manufacturer: formData.manufacturer || undefined,
        qr_code: uploadedPhotoUrl || undefined,
      };
      await updateEquipment(id, dataToSubmit);
      navigate('/admin/equipment');
    } catch (error) {
      console.error('Error updating equipment:', error);
      alert('Failed to update equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/equipment')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Asset</h1>
            <p className="text-slate-500 text-sm">Update equipment details.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/equipment')}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {(loading || uploadingPhoto) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Upload */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-500" />
              Equipment Photo
            </h3>
            
            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-slate-50 aspect-[4/3] mb-4">
                <img src={photoUrl} alt="Equipment preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl(null);
                    setPhotoFile(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-primary-300 transition-all mb-4">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-12 w-12 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">Click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">General Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700 block">Equipment Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g., Pressure Vessel Unit A"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Client</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Branch</label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Type</label>
                <input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g., Static Equipment"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Model</label>
                <input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g., PX-500 High Pressure"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Serial Number</label>
                <input
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g., SN-12345"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Manufacturer</label>
                <input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g., ABC Manufacturing"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Inspection Dates</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Installation Date</label>
                <input
                  type="date"
                  value={formData.installation_date}
                  onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Last Inspection</label>
                <input
                  type="date"
                  value={formData.last_inspection_date}
                  onChange={(e) => setFormData({ ...formData, last_inspection_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">Next Inspection</label>
                <input
                  type="date"
                  value={formData.next_inspection_date}
                  onChange={(e) => setFormData({ ...formData, next_inspection_date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};

export default EditEquipmentPage;
