import { Eye, EyeClosed, Lock, Mail } from "lucide-react";
import { Button } from "../../components/button";
import Input from "../../components/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/api/user/signin`, {
        email,
        password
      });

      const { accessToken, userId, parent } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('parentId', parent);

      toast.success("Login successful");

      if (parent === userId) {
        navigate(`/admin/${userId}/home`);
      } else {
        navigate(`/user/${userId}/home`);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) toast.error("User not found");
      else if (status === 401) toast.error("Incorrect password");
      else toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white flex items-center justify-center px-4">
      <div className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl w-full max-w-md p-8 sm:p-10 text-white">
        {/* Glow Layer */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-white/0 opacity-10 rounded-3xl blur-3xl z-0" />

        <div className="relative z-10 text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Sigmatrinics</h1>
          <p className="text-sm text-gray-300 mt-1">Login to your dashboard</p>
        </div>

        <div className="space-y-6 relative z-10">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            className="bg-white/10 text-white placeholder-gray-400 border border-white/20"
          />

          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            rightIcon={showPassword ? Eye : EyeClosed}
            onRightIconClick={() => setShowPassword(!showPassword)}
            className="bg-white/10 text-white placeholder-gray-400 border border-white/20"
          />

          <div className="text-right text-sm">
            <button
              onClick={() => navigate('/forgotPassword')}
              className="text-gray-300 hover:text-white underline underline-offset-2"
            >
              Forgot password?
            </button>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-white/90 to-gray-300 text-black font-semibold hover:brightness-110 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="black" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="black"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Logging in...
              </div>
            ) : 'Log In'}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-white underline hover:text-gray-200 cursor-pointer"
          >
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
