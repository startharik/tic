import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Plus, 
  Edit2,
  Trash2,
  ChevronRight,
  Users,
  Briefcase,
  Loader2
} from 'lucide-react';
import { getBranches, getUsers, getJobs, deleteBranch } from '../../services/supabaseService';
import type { Branch, User, Job } from '../../services/supabaseService';

const BranchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchesData, usersData, jobsData] = await Promise.all([
        getBranches(),
        getUsers(),
        getJobs()
      ]);
      setBranches(branchesData);
      setUsers(usersData);
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

  const getBranchStats = (branchId: string) => {
    const employees = users.filter(u => u.branch_id === branchId).length;
    const activeJobs = jobs.filter(j => j.branch_id === branchId && j.status !== 'closed').length;
    return { employees, activeJobs };
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
          <h1 className="text-2xl font-bold text-slate-900">Branch Management</h1>
          <p className="text-slate-500 mt-1">Manage physical locations and branch operations.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/branches/create')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No branches yet. Create one to get started!</p>
          </div>
        ) : (
          branches.map((branch) => {
            const stats = getBranchStats(branch.id);
            return (
              <div key={branch.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group p-6">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary-50 rounded-xl">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin/branches/${branch.id}/edit`)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit branch"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this branch?')) {
                          try {
                            await deleteBranch(branch.id);
                            fetchData();
                          } catch (err) {
                            console.error('Error deleting branch:', err);
                            alert('Failed to delete branch.');
                          }
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete branch"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                  <div className="flex items-center space-x-2 mt-1 text-slate-500 text-sm">
                    <Globe className="h-3 w-3" />
                    <span>{branch.countries?.name || 'N/A'}</span>
                    {branch.city && (
                      <>
                        <span className="text-slate-300">•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{branch.city}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                      <Users className="h-3 w-3" />
                      <span>Employees</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{stats.employees}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                      <Briefcase className="h-3 w-3" />
                      <span>Active Jobs</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{stats.activeJobs}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Contact</p>
                    <p className="text-sm font-semibold text-slate-700">{branch.email || branch.phone || 'N/A'}</p>
                  </div>
                  <button className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BranchesPage;
