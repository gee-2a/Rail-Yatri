import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authAPI } from '@/services/api';
import { Train, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = isLogin ? await authAPI.login(formData) : await authAPI.register(formData);
      const { token, _id, name, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', _id);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      if (redirect) {
        navigate(`/${redirect}?${queryParams.toString()}`);
      } else {
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-32 bg-[#FAFAFA]" data-testid="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#E63946] flex items-center justify-center mx-auto mb-4">
            <Train className="w-6 h-6 text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-[#0A0A0A]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="auth-title"
          >
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-[#6C757D] mt-1">
            {isLogin ? 'Sign in to your RailYatri account' : 'Join RailYatri for premium travel'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 shadow-sm">
          <form onSubmit={handleSubmit} data-testid="auth-form">
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-[0.15em] font-semibold text-[#6C757D] mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-sm text-[#0A0A0A] outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10 transition-all"
                  placeholder="Enter your name"
                  data-testid="auth-name-input"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-[0.15em] font-semibold text-[#6C757D] mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-sm text-[#0A0A0A] outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10 transition-all"
                placeholder="you@example.com"
                data-testid="auth-email-input"
              />
            </div>
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-[0.15em] font-semibold text-[#6C757D] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-sm text-[#0A0A0A] outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/10 transition-all pr-12"
                  placeholder="Enter password"
                  data-testid="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#0A0A0A]"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#D62828] transition-all hover:scale-[0.99] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="auth-submit-button"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#6C757D]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#E63946] font-semibold hover:underline"
              data-testid="auth-toggle-mode"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
