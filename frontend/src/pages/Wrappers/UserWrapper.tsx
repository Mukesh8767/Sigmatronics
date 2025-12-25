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
    window.addEventListener('theme-change', handleStorageChange);
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
    <div className="flex h-screen w-screen bg-[#F5F5F7] dark:bg-[#000000] transition-colors duration-300 overflow-hidden font-sans antialiased">

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={`
            relative z-20 flex flex-col justify-between
            bg-gradient-to-b from-[#FCFCFD] to-[#F8F8FA] dark:from-[#1A1A1C] dark:to-[#18181A] 
            border-r border-[#E5E5E7]/60 dark:border-[#2C2C2E]/60
            transition-all duration-300 ease-in-out shadow-sm
            ${isCollapsed ? 'w-20' : 'w-72'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className="flex items-center justify-between px-5 py-6 border-b border-[#E5E5E7]/60 dark:border-[#2C2C2E]/60">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 bg-gradient-to-br from-[#4B5563] via-[#374151] to-[#1F2937] text-white rounded-[10px] flex items-center justify-center font-semibold text-base shadow-lg shadow-gray-500/20 shrink-0">
                  S
                </div>
                <span className={`text-[17px] font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  Sigmatronics
                </span>
              </div>
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-md text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#E5E5E7]/50 dark:hover:bg-[#2C2C2E]/50 transition-all"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
              {navItems.map(({ label, icon: Icon, path }) => {
                const active = isActive(path);
                return (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className={`
                      group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-gradient-to-r from-[#4B5563] to-[#374151] text-white shadow-md shadow-gray-500/25'
                        : 'text-[#3C3C43] dark:text-[#AEAEB2] hover:bg-[#F0F0F2] dark:hover:bg-[#2C2C2E]/80 hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                      }
                    `}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
                    <span className={`font-medium text-[15px] whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                      {label}
                    </span>

                    {/* Tooltip for Collapsed State */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                        {label}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="px-3 py-4 space-y-1 border-t border-[#E5E5E7]/60 dark:border-[#2C2C2E]/60">
              <button
                onClick={() => {
                  const next = !isDark;
                  setIsDark(next);
                  localStorage.setItem('theme', next ? 'dark' : 'light');
                  window.dispatchEvent(new Event('theme-change'));
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  text-[#3C3C43] dark:text-[#AEAEB2] hover:bg-[#F0F0F2] dark:hover:bg-[#2C2C2E]/80 hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]
                `}
              >
                {isDark ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
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
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  text-[#FF3B30] hover:bg-[#FF3B30]/10 dark:hover:bg-[#FF3B30]/10
                `}
              >
                <LogOut size={20} className="shrink-0" />
                <span className={`font-medium text-[15px] whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#F5F5F7] dark:bg-[#000000]">

        {/* Mobile Header */}
        {isMobile && (
          <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-[#FCFCFD]/95 to-[#F8F8FA]/95 dark:from-[#1A1A1C]/95 dark:to-[#18181A]/95 backdrop-blur-xl border-b border-[#E5E5E7]/60 dark:border-[#2C2C2E]/60 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4B5563] via-[#374151] to-[#1F2937] rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-gray-500/20">S</div>
              <span className="font-semibold text-[17px] text-[#1D1D1F] dark:text-[#F5F5F7]">Sigmatronics</span>
            </div>
            <button
              onClick={() => { setIsDark(!isDark); }}
              className="p-2 rounded-lg text-[#3C3C43] dark:text-[#AEAEB2] hover:bg-[#F0F0F2] dark:hover:bg-[#2C2C2E]/80 transition-all"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>
        )}

        {/* Scrollable Content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto no-scrollbar scroll-smooth ${isMobile ? 'pt-16 pb-24' : ''}`}>
          {children}
        </main>

        {/* Mobile Bottom Navigation - iOS Style */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#FCFCFD]/95 to-[#F8F8FA]/95 dark:from-[#1A1A1C]/95 dark:to-[#18181A]/95 backdrop-blur-xl border-t border-[#E5E5E7]/60 dark:border-[#2C2C2E]/60 px-2 pb-safe">
            <div className="flex items-center justify-around py-2">
              {navItems.map(({ icon: Icon, path, label }) => {
                const active = isActive(path);
                return (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[64px] transition-all duration-200"
                  >
                    <div className={`transition-all duration-200 ${active ? 'text-[#4B5563] dark:text-[#9CA3AF]' : 'text-[#8E8E93]'}`}>
                      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] font-medium transition-all duration-200 ${active ? 'text-[#4B5563] dark:text-[#9CA3AF]' : 'text-[#8E8E93]'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => { localStorage.clear(); navigate('/'); }}
                className="flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[64px]"
              >
                <div className="text-[#FF3B30]">
                  <LogOut size={24} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium text-[#FF3B30]">
                  Sign Out
                </span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default UserWrapper;
