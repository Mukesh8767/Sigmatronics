import { useState } from "react";
import EmailStep from "./EmailStep";
import OtpStep from "./OtpStep";
import PasswordStep from "./PasswordStep";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

type StepType = 'email' | 'otp' | 'password';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<StepType>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email.trim()) return alert('Please enter your email address');
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/api/user/forgotPassword`, { email });
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
      await axiosInstance.post(`/api/user/reset-Password`, { email, otp, password });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4 relative">
      {/* Background bubbles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-slate-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gray-400 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="relative">
          {/* Glow outline */}
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-400/20 to-gray-400/20 rounded-2xl blur-xl opacity-40" />

          <div className="relative bg-gradient-to-br from-white via-slate-50 to-gray-50 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-8 shadow-2xl shadow-slate-500/10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-gray-600 to-slate-700 bg-clip-text text-transparent mb-3">
                Forgot Password?
              </h1>
              <p className="text-slate-600">
                {step === 'email' ? "Don't worry, we'll help you reset it" :
                  step === 'otp' ? "Check your email for the verification code" :
                    "You're almost done!"}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 flex justify-center space-x-4">
              {['email', 'otp', 'password'].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s
                      ? 'bg-slate-600 text-white'
                      : ['email', 'otp', 'password'].indexOf(step) > i
                        ? 'bg-slate-400 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}>{i + 1}</div>
                  {i < 2 && <div className={`w-12 h-1 mx-2 rounded ${
                    ['email', 'otp', 'password'].indexOf(step) > i
                      ? 'bg-slate-400'
                      : 'bg-slate-200'
                  }`} />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="space-y-6">
              {step === 'email' && (
                <EmailStep
                  email={email}
                  setEmail={setEmail}
                  onSendOtp={handleSendOtp}
                  isLoading={isLoading}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
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
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
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
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
              )}

              <div className="text-center pt-6 border-t border-slate-200">
                <button
                  onClick={() => navigate('/')}
                  className="text-slate-600 hover:text-slate-800 transition-colors flex items-center justify-center gap-2 w-full py-2"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Pulse Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-slate-400/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
