import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Admin from '@/pages/Admin';

// New Pages
import SearchTrains from '@/pages/SearchTrains';
import TrainDetails from '@/pages/TrainDetails';
import BookingPage from '@/pages/BookingPage';
import BookingConfirmation from '@/pages/BookingConfirmation';
import MyBookings from '@/pages/MyBookings';
import LiveTrainStatus from '@/pages/LiveTrainStatus';
import ProfilePage from '@/pages/ProfilePage';
import { AboutPage, ContactPage, FAQPage, NotFoundPage } from '@/pages/StaticPages';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  if (!token) return <Navigate to="/auth" />;
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/bookings" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/search" element={<SearchTrains />} />
        <Route path="/train/:id" element={<TrainDetails />} />
        
        {/* Support & Static Info Routes */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* Live Tracking Status (Available for all) */}
        <Route path="/live-status" element={<LiveTrainStatus />} />
        <Route path="/live-status/:trainNumber" element={<LiveTrainStatus />} />

        {/* Protected Customer Routes */}
        <Route path="/booking/:id" element={
          <ProtectedRoute><BookingPage /></ProtectedRoute>
        } />
        <Route path="/booking-confirmation/:id" element={
          <ProtectedRoute><BookingConfirmation /></ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        {/* Redirect old dashboard to bookings */}
        <Route path="/dashboard" element={<Navigate to="/bookings" replace />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>
        } />

        {/* Wildcard 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
