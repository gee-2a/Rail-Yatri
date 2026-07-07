import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { bookingAPI } from '@/services/api';
import TrainAnimation from '@/components/TrainAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Download, ArrowRight, MapPin, Calendar, Users, Train, AlertTriangle } from 'lucide-react';

export default function BookingConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bookingAPI.getBookingById(id);
        setBooking(res.data);
      } catch (err) {
        console.error(err);
        setError('Booking records not found or failed to load.');
        toast.error('Failed to load booking confirmation');
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      const pdfRes = await bookingAPI.downloadTicketPDF(booking._id);
      const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ticket_${booking._id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Ticket PDF downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download ticket PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <Skeleton className="h-20 w-full bg-gray-200 rounded-2xl" />
          <Skeleton className="h-64 w-full bg-gray-200 rounded-2xl" />
          <Skeleton className="h-32 w-full bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#E63946] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-sm text-[#6C757D] mb-6">{error || 'Could not retrieve booking details.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="w-full py-3 bg-[#1D3557] hover:bg-[#15283F] text-white font-semibold rounded-xl"
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Success Header banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-550 bg-emerald-600 text-white p-6 sm:p-8 rounded-3xl shadow-md text-center space-y-4 mb-8"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-100" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Booking Confirmed!
            </h1>
            <p className="text-emerald-150 text-emerald-100 text-sm mt-1">
              Your ticket is successfully generated and seats are allocated. An email copy has been dispatched to your inbox.
            </p>
          </div>
          <div className="inline-block bg-white/10 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-white/20">
            Booking ID: {booking._id}
          </div>
        </motion.div>

        {/* Content details split */}
        <div className="space-y-6">
          
          {/* Train Ticket information */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-[#E5E5E5] p-6 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5E5]">
              <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center">
                <Train className="w-5.5 h-5.5 text-[#E63946]" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1D3557] text-base">
                  {booking.train ? booking.train.name : 'N/A'}
                </h3>
                <span className="text-xs text-[#6C757D] font-medium">Train Number: #{booking.train ? booking.train.number : 'N/A'}</span>
              </div>
            </div>

            {/* Path */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6C757D] block">Source</span>
                <span className="font-extrabold text-gray-900 text-sm block mt-1">{booking.train ? booking.train.source : 'N/A'}</span>
                <span className="text-xs text-[#6C757D]">
                  {booking.train ? new Date(booking.train.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>

              <div className="hidden sm:flex flex-col items-center">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#6C757D] block">Destination</span>
                <span className="font-extrabold text-gray-900 text-sm block mt-1">{booking.train ? booking.train.destination : 'N/A'}</span>
                <span className="text-xs text-[#6C757D]">
                  {booking.train ? new Date(booking.train.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6C757D] font-medium bg-gray-50 border border-gray-100 p-3.5 rounded-xl">
              <Calendar className="w-4 h-4 text-[#457B9D]" />
              Journey Date: {booking.train ? new Date(booking.train.departureTime).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
            </div>
          </motion.div>

          {/* Passenger details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-[#E5E5E5] p-6 shadow-sm space-y-4"
          >
            <h3 className="font-extrabold text-[#1D3557] text-base pb-3 border-b border-[#E5E5E5] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E63946]" /> Passengers & Seats
            </h3>
            
            <div className="space-y-3 pt-2">
              {booking.passengers.map((passenger, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">{passenger.name}</span>
                    <span className="text-xs text-[#6C757D] font-medium block">Age: {passenger.age}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-[#1D3557]/10 text-[#1D3557] px-3 py-1.5 rounded-xl font-extrabold border border-[#1D3557]/15">
                      Seat: {passenger.seatNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action links */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 pt-4 justify-between"
          >
            <button
              onClick={() => navigate('/bookings')}
              className="px-6 py-4 bg-white border border-[#E5E5E5] hover:border-gray-400 font-bold rounded-2xl text-sm transition-all text-[#1D3557]"
            >
              Go to My Bookings
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-8 py-4 bg-[#1D3557] hover:bg-[#15283F] text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4.5 h-4.5" /> 
              {downloading ? 'Generating PDF...' : 'Download E-Ticket PDF'}
            </button>
          </motion.div>

        </div>

      </div>
      <TrainAnimation />
    </div>
  );
}
