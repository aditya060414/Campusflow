import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ children }) => {
  return (
    <div className="bg-[#111318] border-2 border-[#262A33] rounded-md p-6 w-full max-w-md mx-auto">
      {children}
    </div>
  );
};

export default AuthCard;
