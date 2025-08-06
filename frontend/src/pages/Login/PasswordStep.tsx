import { Lock, Eye, EyeOff, Shield, ArrowLeft, KeyRound } from "lucide-react";
import InputField from "./InputField";
import { Button } from "../../components/button";
import InfoCard from "./InfoCard";

interface PasswordStepProps {
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  toggleShowPassword: () => void;
  toggleShowConfirmPassword: () => void;
  onResetPassword: () => void;
  onBackToOtp: () => void;
  isLoading: boolean;
  focusedField: string;
  setFocusedField: (field: string) => void;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  setPassword,
  setConfirmPassword,
  toggleShowPassword,
  toggleShowConfirmPassword,
  onResetPassword,
  onBackToOtp,
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
            <KeyRound className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Create New Password</h2>
      <p className="text-slate-600">Choose a strong password for your account</p>
    </div>

    <InfoCard type="success" icon={Shield}>
      Resetting password for: <span className="font-semibold">{email}</span>
    </InfoCard>

    <InputField
      type={showPassword ? "text" : "password"}
      placeholder="Enter new password"
      value={password}
      onChange={(e:any) => setPassword(e.target.value)}
      icon={Lock}
      rightIcon={showPassword ? Eye : EyeOff}
      onRightIconClick={toggleShowPassword}
      name="password"
      focusedField={focusedField}
      setFocusedField={setFocusedField}
    />

    <InputField
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm new password"
      value={confirmPassword}
      onChange={(e:any) => setConfirmPassword(e.target.value)}
      icon={Lock}
      rightIcon={showConfirmPassword ? Eye : EyeOff}
      onRightIconClick={toggleShowConfirmPassword}
      name="confirmPassword"
      focusedField={focusedField}
      setFocusedField={setFocusedField}
    />

    <InfoCard type="warning" icon={Lock}>
      Password must be at least 6 characters long and contain a mix of letters and numbers
    </InfoCard>

    <div className="flex justify-center">
  <Button
    onClick={onResetPassword}
    disabled={isLoading}
    className="w-fit px-6 py-2 flex items-center gap-2"
  >
    {isLoading ? (
      <>
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Resetting Password...
      </>
    ) : (
      <>
        <KeyRound className="w-5 h-5" />
        Reset Password
      </>
    )}
  </Button>
</div>


    <div className="text-center">
      <button
        onClick={onBackToOtp}
        className="text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-2 w-full py-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Verification
      </button>
    </div>
  </div>
);

export default PasswordStep;
