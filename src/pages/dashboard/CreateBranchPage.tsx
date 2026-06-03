import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCountries, createCountry, createBranch } from '../../services/supabaseService';
import type { Country } from '../../services/supabaseService';

const CreateBranchPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    newCountryName: '',
    newCountryCode: '',
    city: '',
    address: '',
    postal_code: '',
    phone: '',
    email: '',
    isNewCountry: false,
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
          console.error('Error fetching countries:', error);
        }
    };
    fetchCountries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let countryId = formData.country_id;

      if (formData.isNewCountry && formData.newCountryName && formData.newCountryCode) {
        const newCountry = await createCountry({
          name: formData.newCountryName,
          code: formData.newCountryCode,
        });
        countryId = newCountry.id;
      }

      await createBranch({
        name: formData.name,
        country_id: countryId || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
        postal_code: formData.postal_code || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      });

      navigate('/admin/branches');
    } catch (error) {
      console.error('Error creating branch:', error);
      alert('Failed to create branch. Please try again.');
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
            onClick={() => navigate('/admin/branches')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add Branch</h1>
            <p className="text-slate-500 text-sm">Create a new branch / country unit for operations.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>Save</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Branch Name</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Riyadh Branch"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Country</label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.isNewCountry}
                  onChange={(e) => setFormData({ ...formData, isNewCountry: e.target.checked })}
                  className="h-4 w-4"
                />
                Add new country
              </label>
            </div>

            {formData.isNewCountry ? (
              <div className="space-y-2">
                <input
                value={formData.newCountryName}
                onChange={(e) => setFormData({ ...formData, newCountryName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Country name"
              />
              <input
                value={formData.newCountryCode}
                onChange={(e) => setFormData({ ...formData, newCountryCode: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Country code (e.g., SA, AE)"
              />
            </div>
            ) : (
              <select
                value={formData.country_id}
                onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">City</label>
            <input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Riyadh"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Postal Code</label>
            <input
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., 12345"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Address</label>
            <input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Street, district, building"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Phone</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., +966 50 123 4567"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., branch@company.com"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBranchPage;
