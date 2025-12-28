import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { Mail, Shield, Lock, Eye, EyeOff, RotateCcw, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/api/user/forgotPassword`, { email });
      if (response.status === 200) {
        setStep('otp');
        toast.success('Verification code sent');
      } else {
        toast.error('Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }
    setStep('password');
    toast.info('Code verified. Set your new password.');
  };

  const handleResetPassword = async () => {
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await axiosInstance.post(`/api/user/reset-Password`, { email, otp, password });
      toast.success('Password reset successfully!');
      // Optional: Auto redirect
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-4 overflow-hidden relative font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="w-full max-w-[420px] relative z-10 perspective-1000">
        <div className="bg-[#1C1C1E]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl ring-1 ring-white/5 transition-all duration-500 hover:scale-[1.01]">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#2C2C2E] rounded-2xl mb-4 shadow-inner ring-1 ring-white/5">
              {step === 'email' && <Mail className="text-blue-500 w-6 h-6" />}
              {step === 'otp' && <Shield className="text-green-500 w-6 h-6" />}
              {step === 'password' && <Lock className="text-purple-500 w-6 h-6" />}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {step === 'email' ? "Password Recovery" :
                step === 'otp' ? "Verification" :
                  "Secure Your Account"}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 'email' ? "Enter your email to receive a code" :
                step === 'otp' ? `Sent to ${email}` :
                  "Create a strong new password"}
            </p>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {step === 'email' && (
              <div className="space-y-5">
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
                <button
                  onClick={handleSendOtp}
                  disabled={isLoading || !email}
                  className="w-full bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Send Code <ArrowRight size={18} /></>}
                </button>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-5">
                <div className={`group relative transition-all duration-300 ${focusedField === 'otp' ? 'scale-[1.02]' : ''}`}>
                  <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'otp' ? 'text-green-500' : 'text-gray-500'}`}>
                    <Shield size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="6-Digit Verification Code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#2C2C2E]/50 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all duration-300 focus:bg-[#2C2C2E] focus:border-green-500/50 placeholder:text-gray-600 tracking-widest font-mono"
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 6}
                  className="w-full bg-[#34C759] hover:bg-[#32D74B] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Verify & Continue
                </button>
                <div className="flex justify-between items-center text-sm pt-2">
                  <button onClick={() => setStep('email')} className="text-gray-500 hover:text-white transition-colors flex items-center gap-1"><ArrowLeft size={14} /> Wrong Email?</button>
                  <button onClick={handleSendOtp} disabled={isLoading} className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">{isLoading ? 'Sending...' : 'Resend Code'} <RotateCcw size={14} /></button>
                </div>
              </div>
            )}

            {step === 'password' && (
              <div className="space-y-5">
                {/* Password */}
                <div className={`group relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                  <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-500' : 'text-gray-500'}`}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#2C2C2E]/50 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-12 outline-none transition-all duration-300 focus:bg-[#2C2C2E] focus:border-purple-500/50 placeholder:text-gray-600"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white transition-colors">
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className={`group relative transition-all duration-300 ${focusedField === 'confirmpassword' ? 'scale-[1.02]' : ''}`}>
                  <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${focusedField === 'confirmpassword' ? 'text-purple-500' : 'text-gray-500'}`}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmpassword')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#2C2C2E]/50 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-12 outline-none transition-all duration-300 focus:bg-[#2C2C2E] focus:border-purple-500/50 placeholder:text-gray-600"
                  />
                  <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white transition-colors">
                    {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full bg-[#AF52DE] hover:bg-[#BF5AF2] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>Reset Password <CheckCircle2 size={18} /></>}
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-white/5 text-center">
              <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Back to Sign In</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
