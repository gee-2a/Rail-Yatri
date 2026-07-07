import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { bookingAPI } from '@/services/api';
import TrainAnimation from '@/components/TrainAnimation';
import LiveStatusModal from '@/components/livestatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket, Search, CheckCircle2, XCircle, MapPin, ArrowRight, Download, Eye, AlertCircle, Trash2, Calendar, User } from 'lucide-react';

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Live status states
  const [selectedTrainNum, setSelectedTrainNum] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [showLiveStatus, setShowLiveStatus] = useState(false);
  const [liveStatusLoading, setLiveStatusLoading] = useState(false);

  const fetchBookingsList = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getUserBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsList();
  }, []);

  const handleDownloadPDF = async (bookingId) => {
    try {
      const pdfRes = await bookingAPI.downloadTicketPDF(bookingId);
      const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ticket_${bookingId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Ticket PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download ticket');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookingsList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleTrackTrainStatus = async (trainNumber) => {
    setSelectedTrainNum(trainNumber);
    setLiveStatusLoading(true);
    try {
      const res = await bookingAPI.getLiveStatus(trainNumber);
      setLiveStatus(res.data);
      setShowLiveStatus(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve live running status');
    } finally {
      setLiveStatusLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const trainName = b.train ? b.train.name.toLowerCase() : '';
    const trainNum = b.train ? b.train.number.toString() : '';
    const matchesSearch = trainName.includes(searchQuery.toLowerCase()) || trainNum.includes(searchQuery) || b._id.includes(searchQuery);
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && b.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusBadge = (status, wlNum) => {
    if (status === 'Confirmed') {
      return (
        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-155 rounded-full text-xs font-bold inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
        </span>
      );
    }
    if (status === 'RAC') {
      return (
        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-155 rounded-full text-xs font-bold inline-flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> RAC
        </span>
      );
    }
    if (status === 'Waitlist') {
      return (
        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-155 rounded-full text-xs font-bold inline-flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Waitlist {wlNum ? `(WL-${wlNum})` : ''}
        </span>
      );
    }
    return (
      <span className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-155 rounded-full text-xs font-bold inline-flex items-center gap-1">
        <XCircle className="w-3.5 h-3.5" /> Cancelled
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-5xl mx-auto px-4">
        
        <h1 className="text-2xl font-black text-gray-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
          My Bookings
        </h1>

        {/* Filter controls panel */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:flex-1 relative">
            <Search className="w-4.5 h-4.5 text-[#6C757D] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by train name, number or Booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E5E5E5] pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] focus:border-[#E63946]"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] cursor-pointer"
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="rac">RAC</option>
              <option value="waitlist">Waitlist</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Display list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(n => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-[#E5E5E5] space-y-4">
                <Skeleton className="h-6 w-1/3 bg-gray-200" />
                <Skeleton className="h-20 w-full bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E5E5E5] text-center p-16 shadow-sm">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No Bookings Found</h3>
            <p className="text-sm text-[#6C757D] max-w-sm mx-auto mb-6">
              You haven't booked any trips matching these filters yet. Start exploring active routes to book now!
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-[#E63946] hover:bg-[#D62828] text-white font-bold rounded-xl transition-all shadow-md"
            >
              Search Trains
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredBookings.map((b, idx) => (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                  className="bg-white rounded-2xl border border-[#E5E5E5] hover:border-gray-300 p-6 shadow-sm relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    
                    {/* Left - Train schedule summary */}
                    <div className="flex-1 space-y-4">
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-extrabold text-[#1D3557] text-base">
                          {b.train ? b.train.name : 'Deleted Train'}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                          #{b.train ? b.train.number : 'N/A'}
                        </span>
                        {getStatusBadge(b.status, b.waitlistNumber)}
                      </div>

                      {b.train ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-[#0A0A0A]">
                          <div className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-4 h-4 text-[#E63946]" />
                            <span>{b.train.source}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                          <div className="flex items-center gap-1.5 font-medium">
                            <MapPin className="w-4 h-4 text-[#457B9D]" />
                            <span>{b.train.destination}</span>
                          </div>
                          <div className="sm:ml-auto flex items-center gap-1.5 text-xs text-[#6C757D] font-bold bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-[#6C757D]" />
                            {new Date(b.train.departureTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{' '}
                            {new Date(b.train.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg">
                          This train schedule has been modified or removed from database. Please contact support.
                        </div>
                      )}

                      {/* Passengers list */}
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {b.passengers.map((p, pIdx) => (
                          <span key={pIdx} className="inline-flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E5E5E5] text-xs px-3 py-1.5 rounded-xl text-gray-800 font-medium">
                            <User className="w-3 h-3 text-[#6C757D]" /> {p.name} <strong className="text-[#1D3557]">({p.seatNumber})</strong>
                          </span>
                        ))}
                      </div>

                      <div className="text-[10px] text-[#6C757D] font-semibold">
                        Booked On: {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>

                    </div>

                    {/* Right - Actions & fare */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                      
                      <div className="md:text-right">
                        <span className="text-[10px] text-[#6C757D] uppercase font-bold tracking-wider block">Total Fare</span>
                        <span className="text-xl font-extrabold text-[#1D3557]">₹{b.totalAmount}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Download Ticket PDF */}
                        <button
                          onClick={() => handleDownloadPDF(b._id)}
                          title="Download ticket PDF"
                          className="p-2.5 bg-white border border-[#E5E5E5] hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-xl transition-all flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" /> <span className="text-xs font-semibold sm:inline">Ticket</span>
                        </button>
                        
                        {/* Track live running status */}
                        {b.status !== 'Cancelled' && b.train && (
                          <button
                            onClick={() => handleTrackTrainStatus(b.train.number)}
                            disabled={liveStatusLoading && selectedTrainNum === b.train.number}
                            className="px-3.5 py-2.5 bg-[#1D3557] hover:bg-[#15283F] text-white font-semibold rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4" /> 
                            <span>{liveStatusLoading && selectedTrainNum === b.train.number ? 'Syncing...' : 'Track'}</span>
                          </button>
                        )}

                        {/* Cancel ticket */}
                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-xl transition-all flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> <span className="text-xs font-semibold sm:inline">Cancel</span>
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Live tracking overlay modal */}
      {showLiveStatus && liveStatus && (
        <LiveStatusModal
          liveStatus={liveStatus}
          onClose={() => setShowLiveStatus(false)}
        />
      )}

      <TrainAnimation />
    </div>
  );
}
