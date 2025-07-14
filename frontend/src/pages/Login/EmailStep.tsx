import { Mail } from "lucide-react";
import Input from "../../components/input";
import { Button } from "../../components/button";

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  onSendOtp: () => void;
  isLoading: boolean;
}

const EmailStep: React.FC<EmailStepProps> = ({ email, setEmail, onSendOtp, isLoading }) => (
  <>
    <Input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      icon={Mail}
    />
    <Button onClick={onSendOtp} disabled={isLoading} className="w-full">
      {isLoading ? 'Sending OTP...' : 'Send OTP'}
    </Button>
  </>
);

export default EmailStep;
