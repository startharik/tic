import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  MapPin, 
  FileText, 
  Settings, 
  Bell, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Package,
  Contact,
  CalendarClock,
  FolderOpen,
  MessageSquare,
  ClipboardCheck,
  Image,
  Megaphone,
  CalendarDays,
  Crown
} from 'lucide-react';
import logo from '../assets/logo.png';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }: any) => (
  <Link
    to={path}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-primary-50 text-primary-600 shadow-sm shadow-primary-100' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-primary-600' : 'text-slate-400'}`} />
    {!collapsed && <span className="font-medium">{label}</span>}
  </Link>
);

const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: ClipboardList, label: 'Jobs', path: '/admin/jobs' },
    { icon: Package, label: 'Assets', path: '/admin/assets' },
    { icon: CalendarClock, label: 'Renewals', path: '/admin/renewals' },
    { icon: FolderOpen, label: 'Documents', path: '/admin/documents' },
    { icon: MessageSquare, label: 'Chat', path: '/admin/chat' },
    { icon: MapPin, label: 'Live Tracking', path: '/admin/tracking' },
    { icon: ClipboardCheck, label: 'Inspections', path: '/admin/inspections' },
    { icon: Image, label: 'Media', path: '/admin/media' },
    { icon: Megaphone, label: 'Notifications', path: '/admin/notifications' },
    { icon: CalendarDays, label: 'Scheduling', path: '/admin/scheduling' },
    { icon: ShieldCheck, label: 'Security', path: '/admin/security' },
    { icon: ShieldCheck, label: 'Approvals', path: '/admin/approvals' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: Contact, label: 'Clients', path: '/admin/clients' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Building2, label: 'Branches', path: '/admin/branches' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
    { icon: Crown, label: 'Super Admin', path: '/admin/super-admin' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Logo" className="h-8" />
              <span className="text-xl font-bold text-slate-900">Alliance</span>
            </div>
          )}
          {isCollapsed && <img src={logo} alt="Logo" className="h-8 mx-auto" />}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={location.pathname === item.path}
              collapsed={isCollapsed}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10">
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search jobs, engineers, reports..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">Admin User</p>
                <p className="text-xs text-slate-500 mt-1">Operations Manager</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                AD
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <img src={logo} alt="Logo" className="h-8" />
                <span className="text-xl font-bold text-slate-900">Alliance</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  {...item}
                  active={location.pathname === item.path}
                  collapsed={false}
                />
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
