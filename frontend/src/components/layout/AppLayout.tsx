import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Activity, 
  LogOut,
  Menu,
  Bell,
  User,
  ChevronDown,
  Building2,
  Briefcase,
  UserCircle,
  Settings,
  Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useState, useRef, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Contacts', href: '/contacts', icon: UserCircle },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Deals', href: '/deals', icon: Briefcase },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Custom Modules', href: '/custom-modules', icon: Settings },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#faf8ff] flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-[#E2E8F0] shadow-xl transform transition-transform duration-200 ease-in-out md:static md:shadow-none md:translate-x-0",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <Activity className="w-6 h-6 text-white mr-2" />
          <span className="text-xl font-bold text-white">Zuna CRM</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 relative",
                  isActive 
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50/50 text-blue-700 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-full" />}
                <item.icon className={cn("w-5 h-5 mr-3 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>


      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-6 shadow-sm/50">
          <div className="flex min-w-0 items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-2 hidden sm:flex items-center md:ml-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-48 bg-slate-50 border border-slate-200 pl-9 pr-4 py-1.5 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all lg:w-64"
                />
              </div>
            </div>
          </div>
          
          <div className="flex shrink-0 items-center space-x-1 sm:space-x-2">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user?.name}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", profileOpen && "rotate-180")} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 text-slate-400" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
