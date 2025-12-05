import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import InputField from "./InputField";
import { Button } from "../../components/button";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/api/user/signin`, { email, password });
      const { accessToken, userId, parent } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('parentId', parent);

      toast.success("Login successful");

      if (parent === userId) {
        navigate(`/admin/${userId}/home`);
      } else {
        navigate(`/user/${userId}/solutions`);
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-10 rounded-2xl shadow-xl bg-white">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full blur opacity-30" />
              <div className="relative bg-gradient-to-r from-slate-500 to-gray-600 p-3 rounded-full shadow-lg">
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Login to access your dashboard</p>
        </div>

        <div className="space-y-6">
          <InputField
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            name="email"
            focusedField={focusedField}
            setFocusedField={setFocusedField}
          />

          <InputField
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            rightIcon={showPassword ? Eye : EyeOff}
            onRightIconClick={() => setShowPassword(!showPassword)}
            name="password"
            focusedField={focusedField}
            setFocusedField={setFocusedField}
          />

          <div className="text-right">
            <button
              onClick={() => navigate('/forgotPassword')}
              className="text-slate-600 hover:text-slate-800 text-sm underline underline-offset-4"
            >
              Forgot password?
            </button>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-fit px-6 py-2 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Log In
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
