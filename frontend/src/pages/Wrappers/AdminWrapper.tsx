import { useState, useEffect } from "react";
import {
  Home,
  LogOut,
  Monitor,
  Users,
  Menu,
  Puzzle,
} from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const AdminWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { adminId } = useParams<{ adminId: string }>();

  const navItems = [
    { label: "Home", icon: Home, path: `/admin/${adminId}/home` },
    { label: "Machines", icon: Monitor, path: `/admin/${adminId}/machines` },
    { label: "Solutions", icon: Puzzle, path: `/admin/${adminId}/solutions` },
    { label: "Users", icon: Users, path: `/admin/${adminId}/users` },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex h-screen w-screen bg-black text-white">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={`transition-all duration-300 flex flex-col justify-between
            bg-white/10 backdrop-blur-md shadow-lg border-r border-white/20 py-6 px-3
            ${isCollapsed ? "w-20" : "w-64"}
          `}
        >
          <div>
            {/* Logo + Collapse */}
            <div className="flex items-center justify-between mb-8 px-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                  A
                </div>
                {!isCollapsed && (
                  <span className="text-lg font-semibold tracking-tight text-white">
                    Admin Panel
                  </span>
                )}
              </div>
              <button
                onClick={toggleCollapse}
                className="text-white/60 hover:text-white transition ml-auto"
              >
                <Menu size={20} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex flex-col space-y-2">
              {navItems.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transform transition-all duration-200 ease-out
                    hover:scale-105 hover:bg-white/10 hover:text-white
                    ${
                      isActive(path)
                        ? "bg-white/10 text-white font-medium border-l-4 border-white"
                        : "text-white/60"
                    }
                  `}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span className="text-sm">{label}</span>}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom buttons */}
          <div className="flex flex-col space-y-3">
            
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-800/20 hover:text-red-200 transform hover:scale-105 transition-all duration-200"
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
          <header className="flex justify-between items-center px-4 py-3 bg-black border-b border-white/20 shadow">
            <span className="text-lg font-semibold">Admin Panel</span>
            <LogOut
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
              className="cursor-pointer"
            />
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-white text-black">{children}</main>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-10 bg-black border-t border-white/20 shadow-inner flex justify-around py-4">
            {navItems.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center text-xs transition transform duration-200 ${
                  isActive(path) ? "text-white" : "text-white/50"
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

export default AdminWrapper;
