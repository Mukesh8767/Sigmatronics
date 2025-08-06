import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import clsx from "clsx";

interface InfoCardProps {
  type: "info" | "success" | "warning";
  icon: LucideIcon;
  children: ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ type, icon: Icon, children }) => {
  const colorMap = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
    },
  };

  return (
    <div
      className={clsx(
        "rounded-2xl p-4 border flex items-start gap-3",
        colorMap[type].bg,
        colorMap[type].border
      )}
    >
      <Icon className={clsx("w-5 h-5", colorMap[type].text)} />
      <p className={clsx("text-sm", colorMap[type].text)}>{children}</p>
    </div>
  );
};

export default InfoCard;
