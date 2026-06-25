import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { name: 'Login', to: '/login' },
  { name: 'Sign Up', to: '/signup' },
  { name: 'Forgot Password', to: '/forgot-password' },
];

export const AuthTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex w-full mb-8 bg-[#1A1D24] border-2 border-[#262A33] rounded-xl p-1 relative z-10">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        return (
          <button
            key={tab.to}
            onClick={() => navigate(tab.to)}
            className={`flex-1 py-3 text-[12px] font-bold uppercase tracking-widest relative z-10 transition-none rounded-lg ${
              isActive 
                ? 'text-white bg-[#2563EB] shadow-[0_2px_0_0_rgba(30,58,138,1)]' 
                : 'text-[#6B7280] hover:text-[#D1D5DB]'
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
};

export default AuthTabs;
