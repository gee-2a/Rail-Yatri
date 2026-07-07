import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authAPI, bookingAPI } from '@/services/api';
import TrainAnimation from '@/components/TrainAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Shield, Lock, CreditCard, Ticket, CheckCircle2, XCircle, Calendar, AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      setLoading(true);
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          authAPI.getProfile(),
          bookingAPI.getUserBookings()
        ]);
        setProfile(profileRes.data);
        setName(profileRes.data.name);
        setEmail(profileRes.data.email);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile details');
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndStats();
  }, [navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.warning('Name and Email fields are required');
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdateLoading(true);
    try {
      const updateData = { name, email };
      if (password) updateData.password = password;

      const res = await authAPI.updateProfile(updateData);
      
      // Update local storage values with new response data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('userRole', res.data.role);

      setProfile(res.data);
      setPassword('');
      setConfirmPassword('');
      toast.success('Profile updated successfully!');
      
      // Force navbar to refresh by dispatching a storage event
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Profile update failed');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Travel Stats Calculations
  const statsBooked = bookings.length;
  const statsConfirmed = bookings.filter(b => b.status === 'Confirmed' || b.status === 'RAC').length;
  const statsCancelled = bookings.filter(b => b.status === 'Cancelled').length;
  const statsSpent = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 bg-gray-200" />
              <Skeleton className="h-4 w-32 bg-gray-200" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-24 bg-gray-200 rounded-2xl" />)}
          </div>
          <Skeleton className="h-96 w-full bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#1D3557] flex items-center justify-center text-white text-3xl font-black shadow-md shrink-0">
            {profile?.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {profile?.name}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 items-center text-xs text-[#6C757D] font-medium">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profile?.email}</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-[#E63946]" /> Role: <strong className="text-gray-900 capitalize">{profile?.role}</strong></span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Member since: {new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </motion.div>

        {/* Travel Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm text-center">
            <Ticket className="w-7 h-7 text-[#E63946] mx-auto mb-2" />
            <div className="text-2xl font-black text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>{statsBooked}</div>
            <div className="text-[10px] text-[#6C757D] uppercase font-bold tracking-wider mt-1">Total Booked</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm text-center">
            <CheckCircle2 className="w-7 h-7 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>{statsConfirmed}</div>
            <div className="text-[10px] text-[#6C757D] uppercase font-bold tracking-wider mt-1">Confirmed / RAC</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm text-center">
            <XCircle className="w-7 h-7 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>{statsCancelled}</div>
            <div className="text-[10px] text-[#6C757D] uppercase font-bold tracking-wider mt-1">Cancelled</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E5E5] shadow-sm text-center">
            <CreditCard className="w-7 h-7 text-[#457B9D] mx-auto mb-2" />
            <div className="text-2xl font-black text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>₹{statsSpent}</div>
            <div className="text-[10px] text-[#6C757D] uppercase font-bold tracking-wider mt-1">Total Expenses</div>
          </div>

        </div>

        {/* Profile Settings forms */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-[#E5E5E5] flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-[#E63946]" /> Account Settings
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider font-bold text-[#6C757D] block">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 h-12 rounded-xl text-sm font-semibold outline-none text-[#0A0A0A] focus:border-[#E63946]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider font-bold text-[#6C757D] block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 h-12 rounded-xl text-sm font-semibold outline-none text-[#0A0A0A] focus:border-[#E63946]"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-[#E5E5E5] space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#E63946]" /> Reset Password
                </h3>
                <p className="text-[11px] text-[#6C757D] mt-0.5">Leave blank if you do not wish to update your password credentials.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider font-bold text-[#6C757D] block">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 h-12 rounded-xl text-sm font-semibold outline-none text-[#0A0A0A] focus:border-[#E63946]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider font-bold text-[#6C757D] block">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 h-12 rounded-xl text-sm font-semibold outline-none text-[#0A0A0A] focus:border-[#E63946]"
                  />
                </div>

              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={updateLoading}
                className="px-8 py-3.5 bg-[#E63946] hover:bg-[#D62828] text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 text-sm"
              >
                {updateLoading ? 'Saving Changes...' : 'Save Profile Settings'}
              </button>
            </div>

          </form>

        </motion.div>

      </div>
      <TrainAnimation />
    </div>
  );
}
