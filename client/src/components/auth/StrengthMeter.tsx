import React from 'react';
import { calculatePasswordScore } from '../../utils/passwordStrength';

interface PasswordStrengthProps {
  password?: string;
}

export const StrengthMeter: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const score = password ? calculatePasswordScore(password) : 0;
  const strengthLevels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-[#262A33]', 'bg-[#EF4444]', 'bg-[#F59E0B]', 'bg-[#3B82F6]', 'bg-[#10B981]'];

  return (
    <div className="mt-2 space-y-1.5 w-full">
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              score >= level ? colors[score] : 'bg-[#262A33]'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
        <span>Password Strength</span>
        <span className={score > 0 ? (score >= 3 ? 'text-[#10B981]' : 'text-[#EF4444]') : ''}>
          {password ? strengthLevels[score] : 'Required'}
        </span>
      </div>
    </div>
  );
};

export default StrengthMeter;
