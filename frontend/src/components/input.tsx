import React from 'react';

type IconType = React.ComponentType<{ className?: string }>;

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  icon?: IconType;
  rightIcon?: IconType;
  onRightIconClick?: () => void;
  inputSize?: InputSize;
  className?: string;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-base px-4 py-3',
  lg: 'text-lg px-5 py-4',
};

const iconSizes: Record<InputSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  inputSize = 'md',
  className = '',
  ...props
}) => {
  const basePaddingLeft = Icon ? 'pl-10' : '';
  const basePaddingRight = RightIcon ? 'pr-10' : '';

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        {Icon && (
          <Icon className={`absolute left-3 text-gray-400 z-10 ${iconSizes[inputSize]}`} />
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-gray-50 border border-gray-200 rounded-2xl
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${sizeClasses[inputSize]} ${basePaddingLeft} ${basePaddingRight}
            ${className}
          `}
          {...props}
        />

        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className={`absolute right-3 text-gray-400 hover:text-gray-600 transition-colors z-10 ${iconSizes[inputSize]}`}
          >
            <RightIcon className={iconSizes[inputSize]} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;