import React from 'react';
import AuthSidebar from './AuthSidebar';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0D10] text-[#F5F5F5] font-['Inter'] p-3 sm:p-4">
      {/* Outer Auth Container */}
      <div className="flex w-full max-w-[1300px] min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)] lg:h-[90vh] lg:min-h-[700px] bg-[#111318] border-2 border-[#262A33] rounded-xl overflow-hidden shadow-2xl relative">
        
        {/* Left Branding Panel (30%) */}
        <div className="hidden lg:flex w-[30%] bg-[#0B0D10] border-r-2 border-[#262A33] p-10 flex-col">
          <AuthSidebar />
        </div>

        {/* Right Authentication Form (70%) */}
        <div className="w-full lg:w-[70%] flex flex-col items-center justify-center p-5 sm:p-8 lg:p-16 relative overflow-y-auto bg-[#111318]">
          <div className="w-full max-w-[440px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
