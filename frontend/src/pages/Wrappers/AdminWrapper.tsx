import { useState } from 'react';
import {
  Home,
  Settings,
  LogOut,
  Monitor,
  Users,
  BarChart2,
  Menu,
  Puzzle
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const AdminWrapper = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { adminId } = useParams<{ adminId: string }>();

  const navItems = [
    { label: 'Home', icon: Home, path: `/admin/${adminId}/home` },
    { label: 'Machines', icon: Monitor, path: `/admin/${adminId}/machines` },
    { label: 'Solutions', icon: Puzzle, path: `/admin/${adminId}/solutions` },
    { label: 'Users', icon: Users, path: `/admin/${adminId}/users` },
    // { label: 'Analytics', icon: BarChart2, path: `/admin/${adminId}/analytics` },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className=''>
    <div className="flex h-screen overflow-hidden bg-black">
      <aside
        className={`
          fixed top-0 left-0 h-full bg-black text-white z-40 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          lg:translate-x-0 lg:static
        `}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <span className={`text-2xl font-bold transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
                Admin
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
              onClick={() => navigate(`/admin/${adminId}/settings`)}
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

export default AdminWrapper;
