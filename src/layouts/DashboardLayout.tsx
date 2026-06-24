import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  GraduationCap,
  Image,
  Megaphone,
  CalendarDays,
  CheckCircle
} from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, markNotificationRead, type Notification } from '../services/supabaseService';

type MenuItem = {
  icon: any;
  label: string;
  path: string;
  requiredRole: Array<'super_admin' | 'admin' | 'engineer' | 'trainer' | 'sales' | 'coordinator' | 'operation_manager'>;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const data = await getNotifications();
      setNotifications(data.filter(n => user?.id ? n.user_id === user.id || n.user_id == null : true));
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const isPathActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuSections: MenuSection[] = useMemo(() => {
    const inferredRole = (userProfile?.role ||
      (window.localStorage.getItem('tic_last_role') as any) ||
      'engineer') as any;

    const sections: MenuSection[] = [
      {
        title: 'Overview',
        items: [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', requiredRole: ['super_admin', 'admin', 'engineer', 'sales', 'coordinator', 'operation_manager'] },
        ],
      },
      {
        title: 'Operations',
        items: [
          { icon: ClipboardList, label: 'Jobs', path: '/admin/jobs', requiredRole: ['super_admin', 'admin', 'engineer', 'sales', 'coordinator', 'operation_manager'] },
          { icon: ClipboardCheck, label: 'Inspections', path: '/admin/inspections', requiredRole: ['super_admin', 'admin', 'engineer', 'operation_manager'] },
          { icon: GraduationCap, label: 'Trainings', path: '/admin/trainings', requiredRole: ['super_admin', 'admin', 'operation_manager'] },
          { icon: Package, label: 'Assets', path: '/admin/equipment', requiredRole: ['super_admin', 'admin', 'engineer', 'coordinator', 'operation_manager'] },
          { icon: CalendarClock, label: 'Renewals', path: '/admin/renewals', requiredRole: ['super_admin', 'admin', 'sales'] },
          { icon: CalendarDays, label: 'Scheduling', path: '/admin/scheduling', requiredRole: ['super_admin', 'admin'] },
        ],
      },
      {
        title: 'Collaboration',
        items: [
          { icon: MessageSquare, label: 'Chat', path: '/admin/chat', requiredRole: ['super_admin', 'admin', 'engineer', 'coordinator'] },
          { icon: FolderOpen, label: 'Documents', path: '/admin/documents', requiredRole: ['super_admin', 'admin', 'engineer', 'coordinator', 'operation_manager'] },
          { icon: Image, label: 'Media', path: '/admin/media', requiredRole: ['super_admin', 'admin', 'engineer', 'coordinator', 'operation_manager'] },
          { icon: Megaphone, label: 'Notifications', path: '/admin/notifications', requiredRole: ['super_admin', 'admin', 'engineer', 'sales', 'coordinator', 'operation_manager'] },
        ],
      },
      {
        title: 'Monitoring',
        items: [
          { icon: MapPin, label: 'Live Tracking', path: '/admin/tracking', requiredRole: ['super_admin'] },
        ],
      },
      {
        title: 'Management',
        items: [
          { icon: Contact, label: 'Clients', path: '/admin/clients', requiredRole: ['super_admin', 'admin', 'sales', 'coordinator'] },
          { icon: Users, label: 'Users', path: '/admin/users', requiredRole: ['super_admin', 'admin'] },
          { icon: Building2, label: 'Branches', path: '/admin/branches', requiredRole: ['super_admin', 'admin', 'coordinator'] },
        ],
      },
      {
        title: 'Analytics',
        items: [
          { icon: FileText, label: 'Reports', path: '/admin/reports', requiredRole: ['super_admin', 'admin'] },
        ],
      },
      {
        title: 'System',
        items: [
          { icon: ShieldCheck, label: 'Audit Logs', path: '/admin/security/audit-logs', requiredRole: ['super_admin', 'admin'] },
          { icon: Settings, label: 'Settings', path: '/admin/settings', requiredRole: ['super_admin', 'admin'] },
        ],
      },
    ];

    const role = inferredRole;
    if (!role) return [];
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.requiredRole.includes(role)),
      }))
      .filter((section) => section.items.length > 0);
  }, [userProfile?.role]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return menuSections
      .flatMap((section) =>
        section.items.map((item) => ({
          ...item,
          sectionTitle: section.title,
        })),
      )
      .filter((item) => {
        const label = item.label.toLowerCase();
        const path = item.path.toLowerCase();
        const sectionTitle = item.sectionTitle.toLowerCase();
        return (
          label.includes(query) ||
          path.includes(query) ||
          sectionTitle.includes(query)
        );
      })
      .slice(0, 8);
  }, [menuSections, searchQuery]);

  const handleSearchNavigate = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault();
      handleSearchNavigate(searchResults[0].path);
    }
    if (e.key === 'Escape') {
      setShowSearchResults(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-6 flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-10" />
        </div>

        <nav className="flex-1 px-3 overflow-y-auto mt-4">
          <div className="space-y-5">
            {menuSections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <div className="px-4 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.path}
                      {...item}
                      active={isPathActive(item.path)}
                      collapsed={isCollapsed}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search jobs, engineers, reports..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.trim().length > 0);
                }}
                onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
              />
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.path}
                          type="button"
                          onClick={() => handleSearchNavigate(result.path)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="text-sm font-semibold text-slate-900">{result.label}</div>
                          <div className="text-xs text-slate-500">{result.sectionTitle} · {result.path}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No matching pages found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-5 h-5 px-1.5 bg-rose-500 border-2 border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <span className="text-xs text-slate-400 font-medium">{notifications.filter(n => !n.is_read).length} unread</span>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifLoading ? (
                      <div className="p-6 flex justify-center">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-primary-600 rounded-full animate-spin"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">No notifications</div>
                    ) : (
                      notifications.slice(0, 10).map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-slate-100 hover:bg-slate-50 ${!notif.is_read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notif.type === 'error' ? 'bg-red-100 text-red-600' 
                              : notif.type === 'warning' ? 'bg-amber-100 text-amber-600' 
                              : notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' 
                              : 'bg-blue-100 text-blue-600'
                            }`}>
                              {notif.type === 'error' || notif.type === 'warning' ? (
                                <Bell className="w-5 h-5" />
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-slate-900">{notif.title}</h4>
                              <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(notif.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <button 
                                onClick={async () => {
                                  await markNotificationRead(notif.id);
                                  await fetchNotifications();
                                }} 
                                className="text-xs text-primary-600 font-medium hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-slate-100">
                    <Link 
                      to="/admin/notifications" 
                      onClick={() => setShowNotifications(false)} 
                      className="block text-center text-sm font-semibold text-primary-600 hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">
                  {userProfile?.first_name || userProfile?.last_name 
                    ? `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() 
                    : user?.email || 'User'}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{userProfile?.role || 'User'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                {userProfile?.first_name?.charAt(0) || userProfile?.last_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
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
                <img src={logo} alt="Logo" className="h-10" />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <div className="space-y-5">
                {menuSections.map((section) => (
                  <div key={section.title}>
                    <div className="px-1 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <SidebarItem
                          key={item.path}
                          {...item}
                          active={isPathActive(item.path)}
                          collapsed={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
