import { useState } from 'react';
import {
  Home,
  Settings,
  LogOut,
  Monitor,
  Users,
  Menu,
  ChartColumnBig,
  ShieldAlert
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const UserWrapper = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId: string }>();

  const navItems = [
    { label: 'Home', icon: Home, path: `/user/${userId}` },
    { label: 'Machines', icon: Monitor, path: `/user/${userId}/machines` },
    { label: 'Users', icon: Users, path: `/user/${userId}/profile` },
    { label: 'Analytics', icon: ChartColumnBig, path: `/user/${userId}/analytics` },
    { label: 'Anomalies', icon: ShieldAlert, path: `/user/${userId}/anamoly` },
   
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div>
    <div className="flex h-screen overflow-hidden bg-gray-700">
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-700 text-white z-40 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          lg:translate-x-0 lg:static
        `}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between p-7   border-gray-200">
              <span className={`text-2xl font-bold transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
               User
              </span>
              <button onClick={toggleCollapse} className='cursor-pointer'>
                <Menu size={20} />
              </button>
            </div>

            <nav className="mt-4 text-sm">
              {navItems.map(({ label, icon: Icon, path }) => (
                <div
                  key={label}
                  onClick={() => {
                    navigate(path);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-all duration-300
                    ${isActive(path)
                      ? 'bg-[#242424] text-white rounded-xl m-2 font-semibold shadow-md'
                      : 'hover:bg-[#2e2e2e] m-2 rounded-xl'}
                  `}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{label}</span>}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex flex-col mb-6 text-sm">
            <div
              onClick={() => navigate(`/user/${userId}/settings`)}
              className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#2e2e2e] m-2 rounded-xl"
            >
              <Settings size={20} />
              {!isCollapsed && <span>Settings</span>}
            </div>
            <div
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#2e2e2e] m-2 rounded-xl"
            >
              <LogOut size={20} />
              {!isCollapsed && <span>Logout</span>}
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0  bg-opacity-40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

       <div className="flex-1 flex flex-col h-full">
        <header className="flex items-center justify-between px-4 py-3 bg-white shadow-md lg:hidden">
          <button onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <span className="text-lg font-medium">Dashboard</span>
        </header>
        <main className="flex-1 p-6 overflow-auto bg-white rounded-2xl m-2">{children}</main>
      </div>
    </div>
    </div>
  );
};

export default UserWrapper;
