import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Plus, 
  MoreVertical,
  ChevronRight,
  Users,
  Briefcase
} from 'lucide-react';

const branchesData = [
  { id: 1, name: 'Riyadh Head Office', country: 'Saudi Arabia', city: 'Riyadh', manager: 'Ahmed Al-Saud', employees: 24, activeJobs: 12 },
  { id: 2, name: 'Jeddah Regional Office', country: 'Saudi Arabia', city: 'Jeddah', manager: 'Fatima Al-Harbi', employees: 18, activeJobs: 8 },
  { id: 3, name: 'Dammam Branch', country: 'Saudi Arabia', city: 'Dammam', manager: 'Khalid Al-Otaibi', employees: 12, activeJobs: 5 },
  { id: 4, name: 'Dubai Office', country: 'UAE', city: 'Dubai', manager: 'Sarah Miller', employees: 10, activeJobs: 4 },
  { id: 5, name: 'Abu Dhabi Branch', country: 'UAE', city: 'Abu Dhabi', manager: 'Michael Brown', employees: 8, activeJobs: 3 },
];

const BranchesPage: React.FC = () => {
  const navigate = useNavigate();

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
        {branchesData.map((branch) => (
          <div key={branch.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group p-6">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-primary-50 rounded-xl">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
              <div className="flex items-center space-x-2 mt-1 text-slate-500 text-sm">
                <Globe className="h-3 w-3" />
                <span>{branch.country}</span>
                <span className="text-slate-300">•</span>
                <MapPin className="h-3 w-3" />
                <span>{branch.city}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                  <Users className="h-3 w-3" />
                  <span>Employees</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{branch.employees}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                  <Briefcase className="h-3 w-3" />
                  <span>Active Jobs</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{branch.activeJobs}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Branch Manager</p>
                <p className="text-sm font-semibold text-slate-700">{branch.manager}</p>
              </div>
              <button className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchesPage;
