import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import { getClients, getJobs, deleteClient } from '../../services/supabaseService';
import type { Client, Job } from '../../services/supabaseService';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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
        <button
          type="button"
          onClick={() => navigate('/admin/clients/create')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Client</span>
        </button>
      </div>

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
