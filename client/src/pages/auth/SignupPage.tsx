import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthTabs from '../../components/auth/AuthTabs';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { StrengthMeter } from '../../components/auth/StrengthMeter';
import { calculatePasswordScore } from '../../utils/passwordStrength';
import api from '../../services/api';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [validation, setValidation] = useState({ 
    email: null as null | boolean, 
    phone: null as null | boolean, 
    username: null as null | boolean, 
    password: null as null | boolean, 
    confirm: null as null | boolean 
  });
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation on blur
  const checkEmail = async (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      setValidation((v) => ({ ...v, email: null }));
      return;
    }
    if (!/^[^@]+@gmail\.com$/.test(trimmed)) {
      setValidation((v) => ({ ...v, email: false }));
      return;
    }
    try {
      setGlobalError('');
      const res = await api.post('/auth/check-email', { email: trimmed });
      setValidation((v) => ({ ...v, email: !res.data.taken }));
    } catch {
      setValidation((v) => ({ ...v, email: null }));
      setGlobalError('Could not verify email availability. Please try again.');
    }
  };

  // Phone validation on blur
  const checkPhone = async (value: string) => {
    const stripped = value.replace(/\D/g, '');
    if (!stripped) {
      setValidation((v) => ({ ...v, phone: null }));
      return;
    }
    if (stripped.length < 10) {
      setValidation((v) => ({ ...v, phone: false }));
      return;
    }
    try {
      setGlobalError('');
      const res = await api.post('/auth/check-phone', { phone: stripped });
      setValidation((v) => ({ ...v, phone: !res.data.taken }));
    } catch {
      setValidation((v) => ({ ...v, phone: null }));
      setGlobalError('Could not verify phone availability. Please try again.');
    }
  };

  // Username validation on blur
  const checkUsername = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setValidation((v) => ({ ...v, username: null }));
      return;
    }
    try {
      setGlobalError('');
      const res = await api.post('/auth/check-username', { username: trimmed });
      setValidation((v) => ({ ...v, username: !res.data.taken }));
    } catch {
      setValidation((v) => ({ ...v, username: null }));
      setGlobalError('Could not verify username availability. Please try again.');
    }
  };

  useEffect(() => {
    if (password) {
      const score = calculatePasswordScore(password);
      setValidation((v) => ({ ...v, password: score >= 3 }));
    } else {
      setValidation((v) => ({ ...v, password: null }));
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      setValidation((v) => ({ ...v, confirm: password === confirmPassword }));
    } else {
      setValidation((v) => ({ ...v, confirm: null }));
    }
  }, [password, confirmPassword]);

  const isFormValid = () => {
    return (
      validation.email &&
      validation.phone &&
      validation.username &&
      validation.password &&
      validation.confirm
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!isFormValid()) {
      setGlobalError('Please complete all fields with an available email, phone, and username.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ''),
        username: username.trim(),
        password,
      };
      const res = await api.post('/auth/signup', payload);
      if (res.data.success) {
        navigate('/login');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col h-full">
        <AuthTabs />

        <div className="flex-1 flex flex-col justify-center w-full max-w-full">
          <h2 className="text-[28px] font-['Space_Grotesk'] font-extrabold text-white mb-4 uppercase tracking-tight">
            Create Account
          </h2>

          {globalError && (
            <div className="mb-4 bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#EF4444] font-bold">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AuthInput
                label="Email Address"
                icon={<Mail className="w-5 h-5" />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidation((v) => ({ ...v, email: null }));
                }}
                onBlur={() => checkEmail(email)}
                placeholder="student@gmail.com"
                error={validation.email === false ? 'Enter an available @gmail.com address' : undefined}
                className={validation.email ? 'border-[#10B981] focus:border-[#10B981]' : ''}
              />
              <AuthInput
                label="Phone (WhatsApp)"
                icon={<Phone className="w-5 h-5" />}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setValidation((v) => ({ ...v, phone: null }));
                }}
                onBlur={() => checkPhone(phone)}
                placeholder="+91 98765 43210"
                error={validation.phone === false ? 'Enter an available phone number' : undefined}
                className={validation.phone ? 'border-[#10B981] focus:border-[#10B981]' : ''}
              />
            </div>

            {/* Row 2 */}
            <AuthInput
              label="Username"
              icon={<User className="w-5 h-5" />}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setValidation((v) => ({ ...v, username: null }));
              }}
              onBlur={() => checkUsername(username)}
              placeholder="student_123"
              error={validation.username === false ? 'Username is already taken' : undefined}
              className={validation.username ? 'border-[#10B981] focus:border-[#10B981]' : ''}
            />

            {/* Row 3 & 4: Password and Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <AuthInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={<Lock className="w-5 h-5" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  error={validation.password === false ? 'Password is too weak' : undefined}
                  className={validation.password ? 'border-[#10B981] focus:border-[#10B981]' : ''}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-[#6B7280] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                />
                <StrengthMeter password={password} />
              </div>

              <AuthInput
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                icon={<Lock className="w-5 h-5" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                error={validation.confirm === false ? 'Passwords do not match' : undefined}
                className={validation.confirm ? 'border-[#10B981] focus:border-[#10B981]' : ''}
              />
            </div>

            <div className="pt-2">
              <AuthButton type="submit" disabled={!isFormValid() || isSubmitting} loading={isSubmitting}>
                Create Account
              </AuthButton>
            </div>
          </form>

          <div className="mt-6 text-center text-[13px] text-[#9CA3AF] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-bold hover:text-[#3B82F6] transition-colors ml-1">
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
