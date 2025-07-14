import { useState } from "react";
import { config } from "../../config/config";
import EmailStep from "./EmailStep";
import OtpStep from "./OtpStep";
import PasswordStep from "./PasswordStep";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
type StepType = 'email' | 'otp' | 'password';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<StepType>('email');
  const [isLoading, setIsLoading] = useState(false);
  const navigate=useNavigate();

  const handleSendOtp = async () => {
    if (!email.trim()) return alert('Please enter your email address');
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`${config.BACKEND_URL}/api/user/forgotPassword`, { email });
      if (response.status === 200) setStep('otp');
      else alert('Failed to send OTP');
    } catch (error: any) {
      alert(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) return alert('Please enter the OTP');
    setStep('password');
  };

  const handleResetPassword = async () => {
    if (!password || password.length < 6) return alert('Password must be at least 6 characters');
    if (password !== confirmPassword) return alert('Passwords do not match');
    setIsLoading(true);
    try {
      await axiosInstance.post(`${config.BACKEND_URL}/api/user/reset-Password`, { email, otp, password });
      alert('Password reset successful!');
      setEmail('');
      setOtp('');
      setPassword('');
      setConfirmPassword('');
      setStep('email');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-15 rounded-2xl shadow-xl bg-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">Forgot Password?</h1>
          <p className="text-base text-gray-600">
            {step === 'email' ? "Enter your email..." : step === 'otp' ? "Enter the OTP..." : "Create a new password"}
          </p>
        </div>

        <div className="space-y-6">
          {step === 'email' && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSendOtp={handleSendOtp}
              isLoading={isLoading}
            />
          )}
          {step === 'otp' && (
            <OtpStep
              email={email}
              otp={otp}
              setOtp={setOtp}
              onVerifyOtp={handleVerifyOtp}
              onResendOtp={handleSendOtp}
              onBackToEmail={() => setStep('email')}
              isLoading={isLoading}
            />
          )}
          {step === 'password' && (
            <PasswordStep
              email={email}
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              setPassword={setPassword}
              setConfirmPassword={setConfirmPassword}
              toggleShowPassword={() => setShowPassword(!showPassword)}
              toggleShowConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
              onResetPassword={handleResetPassword}
              onBackToOtp={() => setStep('otp')}
              isLoading={isLoading}
            />
          )}

          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/')}
              className="text-black cursor-pointer hover:text-gray-600 underline hover:underline-offset-4"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
