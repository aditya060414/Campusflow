import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = "w-full h-[52px] rounded-xl text-[14px] font-bold uppercase tracking-wide flex items-center justify-center transition-none border-2";
  
  const variants = {
    primary: "bg-[#2563EB] text-white border-[#1E3A8A] hover:bg-[#3B82F6] hover:border-[#2563EB]",
    secondary: "bg-transparent text-[#E5E7EB] border-[#262A33] hover:bg-[#1A1D24] hover:border-[#374151]",
    danger: "bg-[#EF4444] text-white border-[#991B1B] hover:bg-[#F87171] hover:border-[#EF4444]",
    success: "bg-[#10B981] text-white border-[#065F46] hover:bg-[#34D399] hover:border-[#10B981]"
  };

  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.2)] active:shadow-[0_0px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-1'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export default AuthButton;
