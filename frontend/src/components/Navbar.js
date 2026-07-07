import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, LayoutDashboard, LogOut, Shield, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({
    name: localStorage.getItem('userName'),
    role: localStorage.getItem('userRole')
  });

  useEffect(() => {
    const syncUser = () => {
      setUser({
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('userRole')
      });
    };
    window.addEventListener('storage', syncUser);
    syncUser(); // sync on mount / route changes
    return () => {
      window.removeEventListener('storage', syncUser);
    };
  }, [location]);

  const userName = user.name;
  const role = user.role;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUser({ name: null, role: null });
    navigate('/auth');
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#E5E5E5]"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group" data-testid="navbar-brand">
            <div className="w-9 h-9 rounded-lg bg-[#E63946] flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0A0A0A]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Rail<span className="text-[#E63946]">Yatri</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/search"
              className="text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors"
            >
              Search
            </Link>
            <Link
              to="/live-status"
              className="text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors"
            >
              Live Status
            </Link>
            <Link
              to="/about"
              className="text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors"
            >
              About
            </Link>
            <Link
              to="/faq"
              className="text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors"
            >
              FAQs
            </Link>
            <Link
              to="/contact"
              className="text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors mr-2"
            >
              Contact
            </Link>

            {userName ? (
              <>
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors"
                    data-testid="nav-admin-link"
                  >
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                <Link
                  to="/bookings"
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors"
                  data-testid="nav-dashboard-link"
                >
                  <LayoutDashboard className="w-4 h-4" /> Bookings
                </Link>
                <Link
                  to="/profile"
                  className="text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors"
                >
                  Profile
                </Link>
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-[#E5E5E5]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1D3557] flex items-center justify-center text-white text-xs font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-[#0A0A0A]" data-testid="navbar-username">{userName}</span>
                    {role === 'admin' && (
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-[#E63946]/10 text-[#E63946] rounded-full animate-pulse" data-testid="admin-badge">Admin</span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors"
                    data-testid="logout-button"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                data-testid="nav-signin-link"
                className="px-5 py-2.5 bg-[#E63946] text-white text-sm font-bold rounded-full hover:bg-[#D62828] transition-all hover:scale-[0.98] active:scale-95 shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-black"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-[#E5E5E5] px-4 py-4 space-y-3 shadow-lg"
        >
          <Link to="/search" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-[#6C757D] hover:text-[#E63946]">Search Trains</Link>
          <Link to="/live-status" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-[#6C757D] hover:text-[#E63946]">Live Train Status</Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-[#6C757D] hover:text-[#E63946]">About Us</Link>
          <Link to="/faq" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-[#6C757D] hover:text-[#E63946]">FAQs</Link>
          <Link to="/contact" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-[#6C757D] hover:text-[#E63946]">Contact Us</Link>
          
          {userName ? (
            <div className="border-t border-[#E5E5E5] pt-3 space-y-3">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded-full bg-[#1D3557] flex items-center justify-center text-white text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-gray-900">{userName}</span>
                {role === 'admin' && <span className="text-[9px] uppercase font-bold bg-[#E63946]/10 text-[#E63946] px-2 py-0.5 rounded-full">Admin</span>}
              </div>
              {role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-[#6C757D] hover:text-[#E63946]">Admin Panel</Link>
              )}
              <Link to="/bookings" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-[#6C757D] hover:text-[#E63946]">My Bookings</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-[#6C757D] hover:text-[#E63946]">My Profile</Link>
              <button onClick={handleLogout} className="block text-sm font-bold text-[#E63946] pt-1">Logout</button>
            </div>
          ) : (
            <div className="border-t border-[#E5E5E5] pt-3">
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="block w-full text-center px-5 py-2.5 bg-[#E63946] text-white text-sm font-bold rounded-full shadow-sm">Sign In</Link>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}
