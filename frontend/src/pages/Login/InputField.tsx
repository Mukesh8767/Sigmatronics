import { type InputHTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";
import clsx from "clsx";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  name?: string;
  focusedField?: string;
  setFocusedField?: (name: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  className,
  focusedField,
  setFocusedField,
  name,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "relative rounded-xl border transition-all px-3 py-2 flex items-center gap-2 bg-white",
        focusedField === name
          ? "border-slate-600 ring-2 ring-slate-300"
          : "border-gray-200 hover:border-gray-400",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <input
        {...props}
        name={name}
        className="w-full focus:outline-none text-sm placeholder:text-gray-400"
        onFocus={() => setFocusedField?.(name || "")}
        onBlur={() => setFocusedField?.("")}
      />
      {RightIcon && (
        <button type="button" onClick={onRightIconClick}>
          <RightIcon className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default InputField;
