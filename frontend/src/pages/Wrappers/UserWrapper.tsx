import { useState, useEffect } from 'react';
import {
  Home,
  ChartColumnBig,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const UserWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId: string }>();

  // Persistent Dark Mode State
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Sync state with local storage events (for other tabs/components)
  useEffect(() => {
    const handleStorageChange = () => {
      const theme = localStorage.getItem('theme');
      setIsDark(theme === 'dark');
    };
    window.addEventListener('theme-change', handleStorageChange); // Custom event
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('theme-change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const navItems = [
    { label: 'Solutions', icon: ChartColumnBig, path: `/user/${userId}/solutions` },
    { label: 'Overview', icon: Home, path: `/user/${userId}/home` },
    { label: 'Anomalies', icon: ShieldAlert, path: `/user/${userId}/anamoly` },
    { label: 'Profile', icon: User, path: `/user/${userId}/profile` },
  ];

  const isActive = (path: string) => {
    if (path.includes('/solutions')) {
      return location.pathname.startsWith(path) || location.pathname.includes('/machines');
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex h-screen w-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 overflow-hidden font-sans">

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={`
            relative z-20 flex flex-col justify-between py-6 px-4
            bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-r border-gray-200 dark:border-[#2C2C2E]
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-[88px]' : 'w-[280px]'}
          `}
        >
          <div>
            {/* Logo Area */}
            <div className="flex items-center justify-between mb-10 pl-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0071E3] to-[#0077ED] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20 shrink-0">
                  S
                </div>
                <span className={`text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-white transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  Sigmatronics
                </span>
              </div>
              <button
                onClick={toggleCollapse}
                className="p-2 rounded-lg text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2C2C2E] transition-colors"
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col space-y-1">
              {navItems.map(({ label, icon: Icon, path }) => {
                const active = isActive(path);
                return (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`
                      group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200
                      ${active
                        ? 'bg-[#0071E3] text-white shadow-md shadow-blue-500/25'
                        : 'text-[#515154] dark:text-[#98989D] hover:bg-gray-100 dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white'
                      }
                    `}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
                    <span className={`font-medium text-[15px] whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                      {label}
                    </span>

                    {/* Tooltip for Collapsed State */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-black text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                        {label}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="space-y-2 border-t border-gray-200 dark:border-[#2C2C2E] pt-4">
            <button
              onClick={() => {
                const next = !isDark;
                setIsDark(next);
                localStorage.setItem('theme', next ? 'dark' : 'light');
                window.dispatchEvent(new Event('theme-change'));
              }}
              className={`
                 w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200
                 text-[#515154] dark:text-[#98989D] hover:bg-gray-100 dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white
               `}
            >
              {isDark ? <Sun size={22} className="shrink-0" /> : <Moon size={22} className="shrink-0" />}
              <span className={`font-medium text-[15px] whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className={`
                 w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200
                 text-[#FF3B30] hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600
               `}
            >
              <LogOut size={22} className="shrink-0" />
              <span className={`font-medium text-[15px] whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Sign Out
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#F5F5F7] dark:bg-black">

        {/* Mobile Header */}
        {isMobile && (
          <header className="absolute top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-gray-200 dark:border-[#2C2C2E] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
              <span className="font-bold text-lg text-[#1D1D1F] dark:text-white">Sigmatronics</span>
            </div>
            <button
              onClick={() => { setIsDark(!isDark); }}
              className="p-2 text-[#1D1D1F] dark:text-white"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>
        )}

        {/* Scrollable Content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto no-scrollbar scroll-smooth ${isMobile ? 'pt-16 pb-28' : ''}`}>
          {children}
        </main>

        {/* Mobile Floating Dock Navigation */}
        {isMobile && (
          <nav className="fixed bottom-6 left-6 right-6 z-50">
            <div className="bg-[#1C1C1E]/90 dark:bg-[#2C2C2E]/90 backdrop-blur-2xl rounded-full shadow-2xl border border-white/10 p-1.5 flex items-center justify-between">
              {navItems.map(({ icon: Icon, path, label }) => {
                const active = isActive(path);
                return (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`
                            relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
                            ${active ? 'bg-[#0071E3] text-white shadow-lg shadow-blue-500/40 translate-y-[-4px]' : 'text-gray-400 hover:text-white'}
                          `}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                    {active && <span className="absolute -bottom-8 text-[10px] font-semibold text-[#1D1D1F] dark:text-white tracking-wide opacity-0 animate-in fade-in slide-in-from-bottom-2">{label}</span>}
                  </button>
                );
              })}
              <div className="w-px h-6 bg-gray-700 mx-1"></div>
              <button
                onClick={() => { localStorage.clear(); navigate('/'); }}
                className="flex items-center justify-center w-12 h-12 rounded-full text-[#FF3B30] hover:bg-white/10 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default UserWrapper;
