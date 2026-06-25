import React from 'react';

interface AuthPasswordInputProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error?: string;
}

const AuthPasswordInput: React.FC<AuthPasswordInputProps> = ({
  label,
  icon,
  value,
  onChange,
  placeholder = '',
  showPassword,
  setShowPassword,
  error,
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[#9CA3AF]">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-md border-2 ${error ? 'border-[#EF4444]' : 'border-[#262A33]'} bg-[#111318] py-2 pl-${icon ? '10' : '3'} pr-10 text-[#E5E7EB] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-primary`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
        {error && (
          <p className="mt-1 text-xs text-[#EF4444]">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AuthPasswordInput;
