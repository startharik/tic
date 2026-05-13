import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Mail, 
  Phone, 
  Shield, 
  MoreHorizontal,
  Search,
  Filter,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';

const usersData = [
  { id: 1, name: 'John Doe', email: 'john@alliance.com', role: 'Engineer', branch: 'Riyadh', status: 'Active', phone: '+966 50 123 4567' },
  { id: 2, name: 'Jane Smith', email: 'jane@alliance.com', role: 'Engineer', branch: 'Jeddah', status: 'Active', phone: '+966 55 987 6543' },
  { id: 3, name: 'Ahmed Khan', email: 'ahmed@alliance.com', role: 'Operations Manager', branch: 'Dammam', status: 'Active', phone: '+966 53 444 5555' },
  { id: 4, name: 'Sarah Miller', email: 'sarah@alliance.com', role: 'Super Admin', branch: 'Head Office', status: 'Active', phone: '+966 56 777 8888' },
  { id: 5, name: 'Michael Brown', email: 'michael@alliance.com', role: 'Engineer', branch: 'Yanbu', status: 'Inactive', phone: '+966 54 333 2222' },
];

const RoleBadge = ({ role }: { role: string }) => {
  const styles: any = {
    'Super Admin': 'bg-purple-100 text-purple-700',
    'Operations Manager': 'bg-blue-100 text-blue-700',
    'Engineer': 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${styles[role] || 'bg-slate-100 text-slate-700'}`}>
      {role}
    </span>
  );
};

const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system users, roles, and permissions.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/users/create')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">42</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Active Engineers</p>
            <p className="text-2xl font-bold text-slate-900">36</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <Shield className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Admin Roles</p>
            <p className="text-2xl font-bold text-slate-900">6</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm hover:bg-slate-100 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <select className="bg-slate-50 border-transparent rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none">
              <option>All Branches</option>
              <option>Riyadh</option>
              <option>Jeddah</option>
              <option>Dammam</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role & Branch</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersData.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-500">ID: USR-{1000 + user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <RoleBadge role={user.role} />
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span>{user.branch}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-600">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center space-x-1.5 text-xs font-medium ${user.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {user.status === 'Active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
