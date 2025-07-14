import { Eye, EyeOff, Lock } from "lucide-react";
import Input from "../../components/input";
import { Button } from "../../components/button";

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
}) => (
  <>
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
      <p className="text-sm text-green-800">
        Resetting password for: <span className="font-medium">{email}</span>
      </p>
    </div>

    <Input
      type={showPassword ? "text" : "password"}
      placeholder="New Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      icon={Lock}
      rightIcon={showPassword ? Eye : EyeOff}
      onRightIconClick={toggleShowPassword}
    />

    <Input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm New Password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      icon={Lock}
      rightIcon={showConfirmPassword ? Eye : EyeOff}
      onRightIconClick={toggleShowConfirmPassword}
    />

    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
      <p className="text-sm text-gray-600">Password must be at least 6 characters long</p>
    </div>

    <Button onClick={onResetPassword} disabled={isLoading} className="w-full cursor-pointer">
      {isLoading ? 'Resetting Password...' : 'Reset Password'}
    </Button>

    <div className="text-center">
      <button
        onClick={onBackToOtp}
        className="text-gray-600 cursor-pointer hover:text-gray-800 underline hover:underline-offset-4"
      >
        Back to OTP Verification
      </button>
    </div>
  </>
);

export default PasswordStep;
