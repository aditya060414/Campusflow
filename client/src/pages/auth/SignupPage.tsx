import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthTabs from '../../components/auth/AuthTabs';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setIsSubmitting(true);

    const payload: any = {
      username: username.trim(),
      password,
    };
    if (email.trim()) {
      payload.email = email.trim().toLowerCase();
    }

    try {
      const res = await api.post('/auth/signup', payload);
      if (res.data.success) {
        login(res.data.user, {
          accessToken: res.data.token?.accessToken || res.data.accessToken,
          refreshToken: res.data.token?.refreshToken || res.data.refreshToken,
        });
        navigate('/dashboard');
        return;
      }
      setGlobalError(res.data.message || 'Signup failed');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Signup failed';
      if (/already (?:taken|exists)/i.test(message)) {
        try {
          const loginIdentifier = username.trim() || email.trim().toLowerCase();
          const loginRes = await api.post('/auth/login', { username: loginIdentifier, password });
          if (loginRes.data.success) {
            login(loginRes.data.user, {
              accessToken: loginRes.data.token?.accessToken || loginRes.data.accessToken,
              refreshToken: loginRes.data.token?.refreshToken || loginRes.data.refreshToken,
            });
            navigate('/dashboard');
            return;
          }
        } catch (loginErr: any) {
          setGlobalError(loginErr.response?.data?.message || 'Account exists. Please try logging in.');
          return;
        }
      }
      setGlobalError(message);
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
            <AuthInput
              label="Email Address (optional)"
              icon={<Mail className="w-5 h-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <AuthInput
              label="Username"
              icon={<User className="w-5 h-5" />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="student_123"
            />

            <div>
              <AuthInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={<Lock className="w-5 h-5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              />
            </div>

            <div className="pt-2">
              <AuthButton type="submit" loading={isSubmitting}>
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
