import { Shield } from "lucide-react";
import Input from "../../components/input";
import { Button } from "../../components/button";

interface OtpStepProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  onBackToEmail: () => void;
  isLoading: boolean;
}

const OtpStep: React.FC<OtpStepProps> = ({
  email,
  otp,
  setOtp,
  onVerifyOtp,
  onResendOtp,
  onBackToEmail,
  isLoading,
}) => (
  <>
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <p className="text-sm text-blue-800">OTP sent to: <span className="font-medium">{email}</span></p>
    </div>

    <Input
      type="text"
      placeholder="Enter OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      icon={Shield}
      maxLength={6}
    />

    <Button onClick={onVerifyOtp} className="w-full cursor-pointer">
      Verify OTP
    </Button>

    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2">Didn't receive the OTP?</p>
      <button
        onClick={onResendOtp}
        disabled={isLoading}
        className="text-black cursor-pointer hover:text-gray-600 underline hover:underline-offset-4 font-medium"
      >
        {isLoading ? 'Sending...' : 'Resend OTP'}
      </button>
    </div>

    <div className="text-center">
      <button
        onClick={onBackToEmail}
        className="text-gray-600 cursor-pointer hover:text-gray-800 underline hover:underline-offset-4"
      >
        Change Email Address
      </button>
    </div>
  </>
);

export default OtpStep;
