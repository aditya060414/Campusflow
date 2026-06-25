import React from 'react';

interface AuthFooterProps {
  children: React.ReactNode;
}

const AuthFooter: React.FC<AuthFooterProps> = ({ children }) => {
  return (
    <div className="mt-4 text-center text-sm text-[#9CA3AF]">
      {children}
    </div>
  );
};

export default AuthFooter;
