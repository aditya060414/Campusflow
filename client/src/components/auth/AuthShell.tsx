import React from 'react';
import { BookOpen, Shield, Zap, Target, LayoutDashboard } from 'lucide-react';

interface AuthShellProps {
  children: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-[#0B0D10] text-[#F5F5F5] font-['Inter']">
      {/* Left Panel */}
      <div className="hidden md:flex w-[260px] bg-[#111318] border-r-2 border-[#262A33] flex-col p-6 h-screen sticky top-0">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center border border-[#2563EB]/20">
            <BookOpen className="w-5 h-5 text-[#2563EB]" />
          </div>
          <span className="font-['Space_Grotesk'] font-bold text-[18px] tracking-tight">CampusFlow</span>
          <span className="bg-[#262A33] text-[#9CA3AF] text-[10px] px-1.5 py-0.5 rounded ml-1">v2.0</span>
        </div>

        {/* Description */}
        <p className="text-[12px] text-[#9CA3AF] leading-[1.7] mb-6">
          The ultimate brutally efficient workspace for academic management.
          Designed for speed, clarity, and zero distractions.
        </p>

        {/* Divider */}
        <div className="border-t-2 border-[#262A33] my-5" />

        {/* Chips */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
            <Shield className="w-[13px] h-[13px] text-[#2563EB]" />
            <span>Bank-grade Security</span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
            <Zap className="w-[13px] h-[13px] text-[#2563EB]" />
            <span>Lightning Fast</span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
            <Target className="w-[13px] h-[13px] text-[#2563EB]" />
            <span>Laser Focused</span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#9CA3AF]">
            <LayoutDashboard className="w-[13px] h-[13px] text-[#2563EB]" />
            <span>Unified Workspace</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Footer */}
        <div className="text-[10px] text-[#9CA3AF] border-t-2 border-[#262A33] pt-4">
          &copy; {new Date().getFullYear()} CampusFlow. All rights reserved.
        </div>

      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-[#0B0D10] flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="max-w-[420px] w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
