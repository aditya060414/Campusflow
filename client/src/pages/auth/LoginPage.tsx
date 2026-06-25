import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthTabs from '../../components/auth/AuthTabs';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    let hasError = false;
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      newErrors.username = 'Username or email is required';
      hasError = true;
    }
    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username: username.trim(), password });
      if (response.data.success) {
        const { user, token, accessToken, refreshToken } = response.data;
        login(user, {
          accessToken: token?.accessToken || accessToken,
          refreshToken: token?.refreshToken || refreshToken,
        });
        navigate('/dashboard');
        return;
      }
      throw new Error(response.data?.message || 'Login failed.');
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || err.message || 'Invalid credentials.');
      setErrors({ username: ' ', password: ' ' }); // Trigger error borders
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col h-full">
        <AuthTabs />

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-[28px] font-['Space_Grotesk'] font-extrabold text-white mb-6 uppercase tracking-tight">
            Welcome Back
          </h2>

          {globalError && (
            <div className="mb-6 bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#EF4444] font-bold">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInput
              label="Username or Email"
              icon={<Mail className="w-5 h-5" />}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="student@gmail.com"
              error={errors.username}
            />
            
            <div className="space-y-1">
              <AuthInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={<Lock className="w-5 h-5" />}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                error={errors.password}
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
              <div className="flex justify-end pt-1">
                <Link to="/forgot-password" className="text-[11px] font-bold text-[#2563EB] hover:text-[#3B82F6] uppercase tracking-widest transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <AuthButton type="submit" loading={isLoading}>
                Sign In
              </AuthButton>
            </div>
          </form>

          <div className="mt-8 text-center text-[13px] text-[#9CA3AF] font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#2563EB] font-bold hover:text-[#3B82F6] transition-colors ml-1">
              CREATE ONE
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
