import { useState, useEffect } from 'react';
import {
  Home,
  Monitor,
  Users,
  ChartColumnBig,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const UserWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId: string }>();

  const navItems = [
    { label: 'Home', icon: Home, path: `/user/${userId}` },
    { label: 'Machines', icon: Monitor, path: `/user/${userId}/machines` },
    { label: 'Analytics', icon: ChartColumnBig, path: `/user/${userId}/analytics` },
    { label: 'Anomalies', icon: ShieldAlert, path: `/user/${userId}/anamoly` },
    { label: 'Profile', icon: User, path: `/user/${userId}/profile` },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      {!isMobile && (
        <aside
          className={`transition-all duration-300 flex flex-col justify-between
            bg-white shadow-md border-r border-gray-200 py-6 px-3
            ${isCollapsed ? 'w-20' : 'w-64'}
          `}
        >
          {/* Top Section */}
          <div>
            {/* Logo & Toggle */}
            <div className="flex items-center justify-between mb-8 px-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                  S
                </div>
                {!isCollapsed && (
                  <span className="text-lg font-semibold tracking-tight text-black">
                    Sigmatronics
                  </span>
                )}
              </div>
              <button
                onClick={toggleCollapse}
                className="text-gray-400 hover:text-gray-700 transition ml-auto"
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex flex-col space-y-2">
              {navItems.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transform transition-all duration-200 ease-out
                    hover:scale-105 hover:shadow-md
                    ${
                      isActive(path)
                        ? 'bg-gray-100 text-black font-medium border-l-4 border-black'
                        : 'text-gray-500 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span className="text-sm">{label}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col space-y-3">
            
            <button
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-100 transform hover:scale-105 transition-all duration-200"
            >
              <LogOut size={20} />
              {!isCollapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="flex justify-between items-center px-4 py-3 shadow bg-white border-b border-gray-200">
            <span className="text-lg font-semibold">Sigmatrinics</span>
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4">{children}</main>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-inner flex justify-around py-2">
            {navItems.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center text-xs transition transform duration-200 ${
                  isActive(path) ? 'text-black' : 'text-gray-400'
                } hover:scale-110`}
              >
                <Icon size={20} />
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default UserWrapper;
