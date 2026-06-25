import React from 'react';
import { BookOpen, Target, Clock, Bot, Lock, Bell } from 'lucide-react';

export const AuthSidebar: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* Top Branding */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-[#2563EB] flex items-center justify-center border-2 border-[#1E3A8A] shadow-[2px_2px_0px_0px_rgba(30,58,138,1)]">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-['Space_Grotesk'] font-extrabold text-[22px] tracking-tight text-white uppercase leading-none">
              CampusFlow
            </h1>
            <span className="text-[#9CA3AF] text-[10px] font-bold tracking-widest uppercase mt-1">
              Hackathon Edition
            </span>
          </div>
        </div>
        
        <div className="inline-block bg-[#111318] border-2 border-[#262A33] text-[#2563EB] text-[10px] font-bold px-2 py-1 uppercase tracking-widest mb-6">
          v2.0 Beta
        </div>

        <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-8 border-l-2 border-[#2563EB] pl-3">
          The ultimate brutally efficient workspace for academic management.
          Designed for speed, clarity, and zero distractions.
        </p>

        {/* Feature List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-[13px] text-[#D1D5DB] font-medium group">
            <div className="w-6 h-6 border-2 border-[#262A33] flex items-center justify-center group-hover:border-[#2563EB] transition-colors">
              <Bot className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <span>AI Study Buddy</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-[#D1D5DB] font-medium group">
            <div className="w-6 h-6 border-2 border-[#262A33] flex items-center justify-center group-hover:border-[#2563EB] transition-colors">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <span>Smart Deadline Manager</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-[#D1D5DB] font-medium group">
            <div className="w-6 h-6 border-2 border-[#262A33] flex items-center justify-center group-hover:border-[#2563EB] transition-colors">
              <Target className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <span>Notice Analyzer</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-[#D1D5DB] font-medium group">
            <div className="w-6 h-6 border-2 border-[#262A33] flex items-center justify-center group-hover:border-[#2563EB] transition-colors">
              <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <span>Private RAG Workspace</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-[#D1D5DB] font-medium group">
            <div className="w-6 h-6 border-2 border-[#262A33] flex items-center justify-center group-hover:border-[#2563EB] transition-colors">
              <Bell className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <span>WhatsApp Notifications</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t-2 border-[#262A33] pt-6">
        <p className="text-[11px] text-[#6B7280] uppercase tracking-widest font-semibold">
          Christ University
        </p>
        <p className="text-[10px] text-[#4B5563] mt-1">
          &copy; {new Date().getFullYear()} CampusFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthSidebar;
