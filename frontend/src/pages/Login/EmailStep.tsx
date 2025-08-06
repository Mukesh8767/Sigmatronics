import { Mail } from "lucide-react";
import InputField from "./InputField";
import { Button } from "../../components/button";

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  onSendOtp: () => void;
  isLoading: boolean;
  focusedField: string;
  setFocusedField: (field: string) => void;
}

const EmailStep: React.FC<EmailStepProps> = ({
  email,
  setEmail,
  onSendOtp,
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
            <Mail className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter Your Email</h2>
      <p className="text-slate-600">We'll send a verification code to reset your password</p>
    </div>

    <InputField
      type="email"
      placeholder="Enter your email address"
      value={email}
      onChange={(e:any) => setEmail(e.target.value)}
      icon={Mail}
      name="email"
      focusedField={focusedField}
      setFocusedField={setFocusedField}
    />

    <div className="flex justify-center">
  <Button
    onClick={onSendOtp}
    disabled={isLoading}
    className="w-fit px-6 py-2 flex items-center gap-2"
  >
    {isLoading ? (
      <>
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Sending OTP...
      </>
    ) : (
      <>
        <Mail className="w-5 h-5" />
        Send Verification Code
      </>
    )}
  </Button>
</div>

  </div>
);

export default EmailStep;
