import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";


const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect if already logged in - optional but good practice
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Validation logic typically happens here, but for now we skip
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/api/user/signin`, { email, password });
      const { accessToken, userId, parent } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('parentId', parent);

      // Save theme preference if provided by backend or default
      if (!localStorage.getItem('theme')) localStorage.setItem('theme', 'dark');

      toast.success("Welcome back", {
        style: { borderRadius: '12px', background: '#333', color: '#fff' }
      });

      // Small delay for smooth transition
      setTimeout(() => {
        if (parent === userId) {
          navigate(`/admin/${userId}/home`);
        } else {
          navigate(`/user/${userId}/solutions`);
        }
      }, 500);

    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) toast.error("Account not found");
      else if (status === 401) toast.error("Incorrect password");
      else toast.error("Unable to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-4 overflow-hidden relative font-sans">

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="w-full max-w-[400px] relative z-10 perspective-1000">
        <div className="bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl ring-1 ring-white/5 transition-all duration-500 hover:scale-[1.01]">

          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0071E3] to-[#0077ED] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2 transform transition-transform duration-500 hover:rotate-12">
              <div className="text-white text-2xl font-bold">S</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Sigmatronics</h1>
              <p className="text-gray-400 mt-2 text-[15px]">Control properly, Monitor seamlessly.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className={`group relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
              <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-500' : 'text-gray-500'}`}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-[#2C2C2E]/50 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all duration-300 focus:bg-[#2C2C2E] focus:border-blue-500/50 placeholder:text-gray-600"
              />
            </div>

            {/* Password Field */}
            <div className={`group relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
              <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-500' : 'text-gray-500'}`}>
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-[#2C2C2E]/50 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-12 outline-none transition-all duration-300 focus:bg-[#2C2C2E] focus:border-blue-500/50 placeholder:text-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => navigate('/forgotPassword')}
                className="text-sm font-medium text-gray-500 hover:text-blue-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group mt-4 relative overflow-hidden"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account? <span className="text-gray-400">Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
