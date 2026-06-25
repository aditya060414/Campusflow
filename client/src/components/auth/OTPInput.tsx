import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, length = 6, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize value to ensure we don't pass undefined to inputs
  const otpArray = value.padEnd(length, ' ').split('').slice(0, length);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, ''); // only allow digits
    if (!val) return;

    const newOtp = value.split('');
    // Take the last character typed in case they paste/type multiple
    newOtp[index] = val.slice(-1);
    const newValue = newOtp.join('');
    onChange(newValue);

    // Auto-focus next input
    if (index < length - 1 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = value.split('');
      
      if (newOtp[index]) {
        // If current box has a value, delete it
        newOtp[index] = '';
        onChange(newOtp.join(''));
      } else if (index > 0) {
        // If current box is empty, move back and delete previous
        newOtp[index - 1] = '';
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-4 w-full">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otpArray[i] === ' ' ? '' : otpArray[i]}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={`
            w-full h-[60px] text-center text-[24px] font-extrabold bg-[#111318] rounded-xl border-2
            outline-none transition-all duration-200 text-[#F5F5F5]
            ${error 
              ? 'border-[#EF4444] focus:border-[#EF4444] bg-[#EF4444]/5 text-[#EF4444]' 
              : 'border-[#262A33] hover:border-[#374151] focus:border-[#2563EB] focus:bg-[#1A1D24]'
            }
          `}
        />
      ))}
    </div>
  );
};

export default OTPInput;
