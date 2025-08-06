import { Mail, RotateCcw, Shield, ArrowLeft } from "lucide-react";
import InputField from "./InputField";
import { Button } from "../../components/button";
import InfoCard from "./InfoCard";

interface OtpStepProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  onBackToEmail: () => void;
  isLoading: boolean;
  focusedField: string;
  setFocusedField: (field: string) => void;
}

const OtpStep: React.FC<OtpStepProps> = ({
  email,
  otp,
  setOtp,
  onVerifyOtp,
  onResendOtp,
  onBackToEmail,
  isLoading,
  focusedField,
  setFocusedField,
}) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full blur opacity-30" />
          <div className="relative bg-gradient-to-r from-slate-500 to-gray-600 p-3 rounded-full shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify Your Email</h2>
      <p className="text-slate-600">Enter the 6-digit code sent to your email</p>
    </div>

    <InfoCard type="info" icon={Mail}>
      Verification code sent to: <span className="font-semibold">{email}</span>
    </InfoCard>

    <InputField
      type="text"
      placeholder="Enter 6-digit code"
      value={otp}
      onChange={(e:any) => setOtp(e.target.value)}
      icon={Shield}
      name="otp"
      maxLength={6}
      focusedField={focusedField}
      setFocusedField={setFocusedField}
    />

    <div className="flex justify-center">
  <Button
    onClick={onVerifyOtp}
    className="w-fit px-6 py-2 flex items-center gap-2"
  >
    <Shield className="w-5 h-5" />
    Verify Code
  </Button>
</div>


    <div className="text-center space-y-3">
      <p className="text-sm text-slate-600">Didn't receive the code?</p>
      <div className="space-y-2">
        <button
          onClick={onResendOtp}
          disabled={isLoading}
          className="text-slate-700 hover:text-slate-900 transition-colors font-medium flex items-center justify-center gap-2 w-full py-2"
        >
          <RotateCcw className="w-4 h-4" />
          {isLoading ? 'Sending...' : 'Resend Code'}
        </button>

        <button
          onClick={onBackToEmail}
          className="text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-2 w-full py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Email Address
        </button>
      </div>
    </div>
  </div>
);

export default OtpStep;
