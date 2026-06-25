import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  rightElement,
  className = '',
  ...props
}) => {
  const safePlaceholder =
    typeof props.placeholder === 'string' && props.placeholder.includes('â')
      ? '********'
      : props.placeholder;

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
        {label}
      </label>
      <div className="relative flex items-center group">
        {icon && (
          <div className={`absolute left-4 transition-colors ${error ? 'text-[#EF4444]' : 'text-[#6B7280] group-focus-within:text-[#2563EB]'}`}>
            {icon}
          </div>
        )}
        <input
          {...props}
          placeholder={safePlaceholder}
          className={`
            w-full h-[52px] bg-[#111318] border-2 rounded-xl text-[14px] text-[#F5F5F5] placeholder-[#6B7280]
            outline-none transition-all duration-200 shadow-sm
            ${icon ? 'pl-11' : 'pl-4'}
            ${rightElement ? 'pr-12' : 'pr-4'}
            ${error 
              ? 'border-[#EF4444] focus:border-[#EF4444] bg-[#EF4444]/5' 
              : 'border-[#262A33] hover:border-[#374151] focus:border-[#2563EB] focus:bg-[#1A1D24]'
            }
            ${className}
          `}
        />
        {rightElement && (
          <div className="absolute right-3">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[12px] text-[#EF4444] font-medium mt-1 pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
