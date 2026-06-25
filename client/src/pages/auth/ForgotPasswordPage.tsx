import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthTabs from '../../components/auth/AuthTabs';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import OTPInput from '../../components/auth/OTPInput';
import StrengthMeter from '../../components/auth/StrengthMeter';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [timer, setTimer] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ----- Step 1: Request OTP -----
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      if (res.data.success) {
        setMaskedPhone(res.data.maskedPhone);
        setInfo('✓ Account found. OTP sent successfully.');
        setStep(2);
        startTimer();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '✕ No account exists with this email.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Timer handling -----
  const startTimer = () => {
    setTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      setInfo('✓ OTP resent successfully.');
      startTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Step 2: Verify OTP -----
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      if (res.data.success) {
        setResetToken(res.data.resetToken);
        setInfo('✓ OTP verified successfully.');
        setStep(3);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Step 3: Reset Password -----
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        resetToken,
        newPassword,
      });
      if (res.data.success) {
        setInfo('✓ Password updated successfully.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 w-full max-w-[320px] mx-auto">
      {[
        { num: 1, label: 'Email' },
        { num: 2, label: 'OTP Verification' },
        { num: 3, label: 'New Password' }
      ].map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors duration-300 ${
                step === s.num 
                  ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : step > s.num 
                    ? 'bg-[#10B981] text-white' 
                    : 'bg-[#1A1D24] border-2 border-[#262A33] text-[#6B7280]'
              }`}
            >
              {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider absolute -bottom-5 w-[100px] text-center ${step >= s.num ? 'text-[#D1D5DB]' : 'text-[#6B7280]'}`}>
              {s.label}
            </span>
          </div>
          {i < 2 && (
            <div className={`flex-1 h-0.5 mt-[-20px] transition-colors duration-300 ${step > s.num ? 'bg-[#10B981]' : 'bg-[#262A33]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <AuthLayout>
      <div className="w-full flex flex-col h-full">
        <AuthTabs />

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-[28px] font-['Space_Grotesk'] font-extrabold text-white mb-2 uppercase tracking-tight text-center">
            Recover Account
          </h2>

          <div className="mt-8 mb-4 min-h-[70px]">
            {renderStepIndicator()}
          </div>

          <div className="min-h-[60px] flex items-center justify-center w-full mb-4">
            {error && (
              <div className="w-full bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-xl p-3 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
                <p className="text-[13px] text-[#EF4444] font-bold">{error}</p>
              </div>
            )}
            {info && (
              <div className="w-full bg-[#10B981]/10 border-2 border-[#10B981] rounded-xl p-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
                <p className="text-[13px] text-[#10B981] font-bold">{info}</p>
              </div>
            )}
          </div>

          <div className="relative min-h-[260px]">
            {/* STEP 1 */}
            {step === 1 && (
              <form
                onSubmit={handleRequestOtp}
                className="space-y-5"
              >
                <AuthInput
                  label="Email Address"
                  icon={<Mail className="w-5 h-5" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  type="email"
                  required
                />
                <div className="pt-2">
                  <AuthButton type="submit" loading={isLoading}>
                    Send OTP
                  </AuthButton>
                </div>
              </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <p className="text-[13px] text-[#D1D5DB] text-center font-medium">
                  We sent a verification code to <span className="text-white font-bold">{maskedPhone}</span>
                </p>
                
                <OTPInput value={otp} onChange={setOtp} error={!!error} />
                
                <div className="flex items-center justify-between px-1">
                  {timer > 0 ? (
                    <span className="text-[12px] font-bold text-[#6B7280]">Resend in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isLoading}
                      className="text-[12px] font-bold text-[#2563EB] hover:text-[#3B82F6] flex items-center transition-colors"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
                      RESEND OTP
                    </button>
                  )}
                </div>
                
                <AuthButton type="submit" disabled={otp.length < 6 || isLoading} loading={isLoading}>
                  Verify Code
                </AuthButton>
              </form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div>
                  <AuthInput
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    icon={<Lock className="w-5 h-5" />}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-[#6B7280] hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                    required
                  />
                  <StrengthMeter password={newPassword} />
                </div>
                
                <AuthInput
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={<Lock className="w-5 h-5" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                
                <div className="pt-2">
                  <AuthButton type="submit" disabled={newPassword.length < 8 || newPassword !== confirmPassword || isLoading} loading={isLoading}>
                    Reset Password
                  </AuthButton>
                </div>
              </form>
            )}
          </div>

          <div className="mt-2 text-center text-[13px] text-[#9CA3AF] font-medium">
            Remembered your password?{' '}
            <Link to="/login" className="text-[#2563EB] font-bold hover:text-[#3B82F6] transition-colors ml-1">
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
