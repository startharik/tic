import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit2,
  Trash2,
  Mail, 
  Phone, 
  ExternalLink,
  Briefcase,
  FileText,
  Loader2,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { getClients, getJobs, deleteClient, getCountries, bulkCreateClients } from '../../services/supabaseService';
import type { Client, Job } from '../../services/supabaseService';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsData, jobsData] = await Promise.all([
        getClients(),
        getJobs()
      ]);
      setClients(clientsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getClientStats = (clientId: string) => {
    const activeJobs = jobs.filter(j => j.client_id === clientId && j.status !== 'closed').length;
    return { activeJobs };
  };

  const handleDownloadTemplate = async () => {
    try {
      const countries = await getCountries();
      const sampleRow = {
        name: 'Client Name',
        contact_person: 'Primary Contact',
        email: 'contact@client.com',
        phone: '+966500000000',
        address: 'Street address',
        city: 'Riyadh',
        country_name: countries[0]?.name || 'Saudi Arabia',
      };

      const worksheet = XLSX.utils.json_to_sheet([sampleRow]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
      XLSX.writeFile(workbook, 'client_import_template.xlsx');
    } catch (error) {
      console.error('Error generating template:', error);
      setImportError('Unable to generate the client import template. Please try again.');
    }
  };

  const handleImportClients = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);
    setImportMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string | number | undefined>>(firstSheet, {
        defval: '',
      });

      if (!rows.length) {
        throw new Error('The uploaded file is empty.');
      }

      const countries = await getCountries();
      const countryMap = new Map(
        countries.map((country) => [country.name.trim().toLowerCase(), country.id]),
      );

      const records = rows
        .map((row) => {
          const name = String(row.name ?? row['Client Name'] ?? '').trim();
          if (!name) return null;

          const countryName = String(row.country_name ?? row.Country ?? row['Country Name'] ?? '').trim();
          const country_id = countryName ? countryMap.get(countryName.toLowerCase()) || undefined : undefined;

          return {
            name,
            contact_person: String(row.contact_person ?? row['Primary Contact'] ?? '').trim() || undefined,
            email: String(row.email ?? row.Email ?? '').trim() || undefined,
            phone: String(row.phone ?? row.Phone ?? '').trim() || undefined,
            address: String(row.address ?? row.Address ?? '').trim() || undefined,
            city: String(row.city ?? row.City ?? '').trim() || undefined,
            country_id,
          };
        })
        .filter((record): record is NonNullable<typeof record> => Boolean(record));

      if (!records.length) {
        throw new Error('No valid client rows were found. Please use the template columns exactly as shown.');
      }

      await bulkCreateClients(records);
      setImportMessage(`Successfully imported ${records.length} client${records.length > 1 ? 's' : ''}.`);
      await fetchData();
    } catch (error) {
      console.error('Error importing clients:', error);
      setImportError(error instanceof Error ? error.message : 'Failed to import clients. Please check the file and try again.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
          <p className="text-slate-500 mt-1">Manage corporate clients, contracts, and service history.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download Template</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
            <span>{importing ? 'Importing…' : 'Import Clients'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleImportClients}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => navigate('/admin/clients/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {(importMessage || importError) && (
        <div className={`rounded-xl border p-4 ${importError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          <div className="flex items-start gap-3">
            {importError ? <AlertCircle className="h-5 w-5 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 mt-0.5" />}
            <p className="text-sm font-medium">{importError || importMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by client name, industry, or contact..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No clients yet</h3>
          <p className="text-slate-500 mb-4">Add your first client to get started.</p>
          <button
            onClick={() => navigate('/admin/clients/create')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Client</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map((client) => {
            const stats = getClientStats(client.id);
            return (
              <div key={client.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{client.countries?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/admin/clients/${client.id}/edit`)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit client"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this client?')) {
                            try {
                              await deleteClient(client.id);
                              fetchData();
                            } catch (err) {
                              console.error('Error deleting client:', err);
                              alert('Failed to delete client.');
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <Briefcase className="h-4 w-4 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">{stats.activeJobs}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Active Jobs</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <FileText className="h-4 w-4 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">-</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Total Reports</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <ExternalLink className="h-4 w-4 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">-</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Contracts</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Primary Contact</span>
                    <span className="text-sm font-semibold text-slate-700">{client.contact_person || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {client.email && (
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all">
                        <Mail className="h-4 w-4" />
                      </button>
                    )}
                    {client.phone && (
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all">
                        <Phone className="h-4 w-4" />
                      </button>
                    )}
                    <button className="px-4 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      View Portal
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
