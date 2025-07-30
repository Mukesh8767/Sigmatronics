import { Eye, EyeClosed, Lock, Mail } from "lucide-react";
import { Button } from "../../components/button";
import Input from "../../components/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      localStorage.setItem('parentId', parent); // can be null or main user

      toast.success("Login successful");


      if (parent === userId) {
        navigate(`/admin/${userId}/home`);
        return;
      }

     
   
        navigate(`/user/${userId}/home`);
    }
      catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          toast.error("User not found");
        } else if (status === 401) {
          toast.error("Incorrect password");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    navigate('/forgotPassword');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-10 rounded-4xl shadow-xl bg-white">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-semibold text-black mb-8">Login</h1>
        </div>

        <div className="space-y-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
          />

          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            rightIcon={showPassword ? Eye : EyeClosed}
            onRightIconClick={() => setShowPassword(!showPassword)}
          />

          <div className="text-left">
            <button
              onClick={handleForgotPassword}
              className="text-black hover:text-gray-600 transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full cursor-pointer flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Logging in...
              </>
            ) : 'Log in'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
