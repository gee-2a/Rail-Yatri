import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { trainAPI, bookingAPI, autoAssignSeats } from '@/services/api';
import TrainAnimation from '@/components/TrainAnimation';
import LiveStatusModal from '@/components/livestatus';
import {
  Search, Ticket, ArrowRight, Clock, MapPin, X, Users, Plus, Minus,
  ChevronRight, AlertCircle, CheckCircle2, XCircle, Train, Crown,
  Snowflake, Sofa, Armchair, Download
} from 'lucide-react';

const COACH_MULTIPLIERS = { General: 1, '3E': 2, '3A': 2.5, '2A': 3, '1A': 4 };
const COACH_INFO = [
  { code: 'General', label: 'General', icon: Armchair },
  { code: '3E', label: '3AC Economy', icon: Sofa },
  { code: '3A', label: '3rd AC', icon: Snowflake },
  { code: '2A', label: '2nd AC', icon: Snowflake },
  { code: '1A', label: '1st AC', icon: Crown },
];

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: 'easeOut' } };

export default function Dashboard() {
  const location = useLocation();
  const qp = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState('search');
  const [searchParams, setSearchParams] = useState({ source: qp.get('source') || '', destination: qp.get('destination') || '', date: qp.get('date') || '' });
  const [trains, setTrains] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Booking state
  const [showBooking, setShowBooking] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState('3A');
  const [passengers, setPassengers] = useState([{ name: '', age: '' }]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Live status state
  const [liveStatus, setLiveStatus] = useState(null);
  const [showLiveStatus, setShowLiveStatus] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);

  const handleTrackTrain = async (trainNumber) => {
    setTrackLoading(true);
    try {
      const res = await bookingAPI.getLiveStatus(trainNumber);
      setLiveStatus(res.data);
      setShowLiveStatus(true);
    } catch {
      toast.error('Failed to fetch live train status');
    } finally {
      setTrackLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'search') fetchTrains();
    else fetchMyBookings();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const res = await trainAPI.getTrains(searchParams);
      setTrains(res.data);
    } catch { toast.error('Failed to load trains'); }
    setLoading(false);
  };

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getUserBookings();
      setMyBookings(res.data);
    } catch { toast.error('Failed to load bookings'); }
    setLoading(false);
  };

  const handleSearch = (e) => { e.preventDefault(); fetchTrains(); };

  const startBooking = (train) => {
    setSelectedTrain(train);
    setSelectedCoach('3A');
    setPassengers([{ name: '', age: '' }]);
    setShowBooking(true);
  };

  const addPassenger = () => {
    if (passengers.length >= 6) { toast.warning('Max 6 passengers per booking'); return; }
    setPassengers([...passengers, { name: '', age: '' }]);
  };

  const removePassenger = (idx) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== idx));
  };

  const updatePassenger = (idx, field, val) => {
    const updated = [...passengers];
    updated[idx][field] = val;
    setPassengers(updated);
  };

  const calculateTotal = () => {
    if (!selectedTrain) return 0;
    return passengers.length * Math.round(selectedTrain.basePrice * (COACH_MULTIPLIERS[selectedCoach] || 1));
  };

  const confirmBooking = async () => {
    for (let p of passengers) {
      if (!p.name || !p.age) { toast.warning('Fill all passenger details'); return; }
    }
    // Auto-assign seats from the selected coach
    const seatLabels = autoAssignSeats(selectedTrain, selectedCoach, passengers.length);
    if (seatLabels.length < passengers.length) {
      toast.error(`Only ${seatLabels.length} seats available in ${selectedCoach} coach.`);
      return;
    }
    const passengersWithSeats = passengers.map((p, i) => ({
      name: p.name,
      age: parseInt(p.age),
      seatNumber: seatLabels[i],
    }));

    setBookingLoading(true);
    try {
      const res = await bookingAPI.createBooking({
        trainId: selectedTrain._id,
        passengers: passengersWithSeats,
      });
      toast.success('Booking confirmed! Seats auto-assigned.');
      setShowBooking(false);
      fetchTrains();
      // Auto-download ticket PDF from server
      try {
        const pdfRes = await bookingAPI.downloadTicketPDF(res.data._id);
        const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ticket_${res.data._id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch {
        // PDF download is best-effort; booking already succeeded
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
    setBookingLoading(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancelBooking(id);
      toast.success('Booking cancelled');
      fetchMyBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20 pb-32" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 pt-4">
          {[{ key: 'search', label: 'Search Trains', icon: Search }, { key: 'bookings', label: 'My Bookings', icon: Ticket }].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-[#1D3557] text-white'
                  : 'bg-white text-[#6C757D] border border-[#E5E5E5] hover:border-[#1D3557]/30'
              }`}
              data-testid={`tab-${t.key}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <motion.div {...fadeUp}>
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl border border-[#E5E5E5] p-6 mb-8"
              data-testid="dashboard-search-form"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input type="text" name="source" placeholder="From station" value={searchParams.source} onChange={e => setSearchParams({...searchParams, source: e.target.value})}
                  className="px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-sm outline-none focus:border-[#E63946]" data-testid="dash-search-source" />
                <input type="text" name="destination" placeholder="To station" value={searchParams.destination} onChange={e => setSearchParams({...searchParams, destination: e.target.value})}
                  className="px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-sm outline-none focus:border-[#E63946]" data-testid="dash-search-destination" />
                <input type="date" name="date" value={searchParams.date} onChange={e => setSearchParams({...searchParams, date: e.target.value})}
                  className="px-4 py-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-sm outline-none focus:border-[#E63946]" data-testid="dash-search-date" />
                <button type="submit" className="px-6 py-3 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#D62828] transition-all flex items-center justify-center gap-2"
                  data-testid="dash-search-button">
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>
            </form>

            {loading ? (
              <div className="text-center py-20 text-[#6C757D]">Loading trains...</div>
            ) : trains.length === 0 ? (
              <div className="text-center py-20">
                <Train className="w-12 h-12 text-[#E5E5E5] mx-auto mb-4" />
                <p className="text-[#6C757D]">No trains found. Try different search criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trains.map((t, idx) => (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-[#E5E5E5] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                    data-testid={`train-card-${t._id}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1D3557] flex items-center justify-center">
                            <Train className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#0A0A0A]" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.name}</div>
                            <div className="text-xs text-[#6C757D]">#{t.number}</div>
                          </div>
                          <span className={`ml-auto lg:ml-4 px-3 py-1 text-xs font-bold rounded-full ${
                            t.availableSeats > 50 ? 'bg-green-50 text-green-700' : t.availableSeats > 0 ? 'bg-amber-50 text-amber-700' : t.racBooked < (t.racCapacity || 20) ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'
                          }`} data-testid={`train-availability-${t._id}`}>
                            {t.availableSeats > 0 ? `${t.availableSeats} seats` : t.racBooked < (t.racCapacity || 20) ? 'RAC Available' : 'Waitlist'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                            <span className="font-medium text-[#0A0A0A]">{t.source}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#6C757D]" />
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#457B9D]" />
                            <span className="font-medium text-[#0A0A0A]">{t.destination}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#6C757D]">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(t.departureTime).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-[#6C757D]">Base fare</div>
                          <div className="text-xl font-bold text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>&#8377;{t.basePrice}</div>
                        </div>
                        <button
                          onClick={() => startBooking(t)}
                          className="px-6 py-3 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#D62828] transition-all hover:scale-[0.98] flex items-center gap-2"
                          data-testid={`book-train-${t._id}`}
                        >
                          {t.availableSeats > 0 ? 'Book' : t.racBooked < (t.racCapacity || 20) ? 'Book RAC' : 'Book WL'} <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div {...fadeUp}>
            {loading ? (
              <div className="text-center py-20 text-[#6C757D]">Loading bookings...</div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-20">
                <Ticket className="w-12 h-12 text-[#E5E5E5] mx-auto mb-4" />
                <p className="text-[#6C757D]">No bookings yet. Search and book a train!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b, idx) => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-[#E5E5E5] p-6"
                    data-testid={`booking-card-${b._id}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-semibold text-[#0A0A0A]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {b.train ? b.train.name : 'N/A'}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            b.status === 'Confirmed' ? 'bg-green-50 text-green-700' : b.status === 'RAC' ? 'bg-orange-50 text-orange-700' : b.status === 'Waitlist' ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700'
                          }`} data-testid={`booking-status-${b._id}`}>
                            {b.status === 'Confirmed' ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : b.status === 'Cancelled' ? <XCircle className="w-3 h-3 inline mr-1" /> : null}
                            {b.status}{b.waitlistNumber ? ` (WL/${b.waitlistNumber})` : ''}
                          </span>
                        </div>
                        {b.train && (
                          <div className="flex items-center gap-2 text-sm text-[#6C757D] mb-2">
                            <MapPin className="w-3.5 h-3.5" /> {b.train.source} <ArrowRight className="w-3 h-3" /> {b.train.destination}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {b.passengers.map((p, i) => (
                            <span key={i} className="px-3 py-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs font-medium text-[#0A0A0A]">
                              <Users className="w-3 h-3 inline mr-1" />{p.name} <span className="text-[#6C757D]">({p.seatNumber})</span>
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-[#6C757D] mt-2">
                          Booked: {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-[#6C757D]">Total</div>
                          <div className="text-xl font-bold text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>&#8377;{b.totalAmount}</div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const pdfRes = await bookingAPI.downloadTicketPDF(b._id);
                              const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `Ticket_${b._id}.pdf`;
                              link.click();
                              window.URL.revokeObjectURL(url);
                            } catch {
                              toast.error('Failed to download ticket');
                            }
                          }}
                          className="px-4 py-2 bg-[#1D3557] text-white font-semibold rounded-xl text-sm hover:bg-[#15283F] transition-all flex items-center gap-1.5"
                          data-testid={`download-ticket-${b._id}`}
                        >
                          <Download className="w-3.5 h-3.5" /> Ticket
                        </button>
                        {b.status !== 'Cancelled' && b.train && (
                          <button
                            onClick={() => handleTrackTrain(b.train.number)}
                            disabled={trackLoading}
                            className="px-4 py-2 bg-[#E63946] text-white font-semibold rounded-xl text-sm hover:bg-[#D62828] transition-all flex items-center gap-1.5 disabled:opacity-50"
                            data-testid={`track-train-${b._id}`}
                          >
                            <MapPin className="w-3.5 h-3.5" /> Track Status
                          </button>
                        )}
                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-xl text-sm hover:bg-red-100 transition-all"
                            data-testid={`cancel-booking-${b._id}`}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && selectedTrain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowBooking(false)}
            data-testid="booking-modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-[#E5E5E5] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              data-testid="booking-modal"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#E5E5E5]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'Outfit, sans-serif' }}>Book Ticket</h3>
                    <p className="text-sm text-[#6C757D] mt-0.5">{selectedTrain.name} ({selectedTrain.number})</p>
                  </div>
                  <button onClick={() => setShowBooking(false)} className="p-2 hover:bg-[#FAFAFA] rounded-lg transition-colors" data-testid="close-booking-modal">
                    <X className="w-5 h-5 text-[#6C757D]" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <span className="font-medium text-[#0A0A0A]">{selectedTrain.source}</span>
                  <ArrowRight className="w-4 h-4 text-[#6C757D]" />
                  <span className="font-medium text-[#0A0A0A]">{selectedTrain.destination}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Coach Selection */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] font-semibold text-[#6C757D] mb-3">Select Coach Class</label>
                  <div className="grid grid-cols-5 gap-2">
                    {COACH_INFO.map(c => {
                      const Icon = c.icon;
                      const price = Math.round(selectedTrain.basePrice * COACH_MULTIPLIERS[c.code]);
                      return (
                        <button
                          key={c.code}
                          onClick={() => setSelectedCoach(c.code)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            selectedCoach === c.code
                              ? 'bg-[#1D3557] border-[#1D3557] text-white'
                              : 'bg-white border-[#E5E5E5] text-[#0A0A0A] hover:border-[#1D3557]/30'
                          }`}
                          data-testid={`coach-select-${c.code}`}
                        >
                          <Icon className={`w-4 h-4 mx-auto mb-1 ${selectedCoach === c.code ? 'text-white' : 'text-[#6C757D]'}`} />
                          <div className="text-xs font-bold">{c.code}</div>
                          <div className={`text-[10px] mt-0.5 ${selectedCoach === c.code ? 'text-white/70' : 'text-[#6C757D]'}`}>&#8377;{price}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status notice */}
                {selectedTrain.availableSeats > 0 ? (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-800">Seats auto-assigned. {selectedTrain.availableSeats} confirmed seats remaining.</p>
                  </div>
                ) : selectedTrain.racBooked < (selectedTrain.racCapacity || 20) ? (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-orange-800">
                      <strong>RAC Booking</strong> — No confirmed seats left. Your booking will be RAC (Reservation Against Cancellation). You'll be promoted to Confirmed if someone cancels.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-purple-800">
                      <strong>Waitlist Booking</strong> — This train is full. Your booking will be waitlisted. You'll be promoted to RAC/Confirmed as cancellations happen.
                    </div>
                  </div>
                )}

                {/* Passengers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6C757D]">Passengers ({passengers.length})</label>
                    <button
                      onClick={addPassenger}
                      className="flex items-center gap-1 text-xs font-semibold text-[#E63946] hover:underline"
                      data-testid="add-passenger-button"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Full name"
                            value={p.name}
                            onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-sm outline-none focus:border-[#E63946]"
                            data-testid={`passenger-name-${idx}`}
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            placeholder="Age"
                            value={p.age}
                            onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
                            min="1"
                            max="120"
                            className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-sm outline-none focus:border-[#E63946]"
                            data-testid={`passenger-age-${idx}`}
                          />
                        </div>
                        {passengers.length > 1 && (
                          <button
                            onClick={() => removePassenger(idx)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                            data-testid={`remove-passenger-${idx}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#E5E5E5] bg-[#FAFAFA] rounded-b-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-[#6C757D]">Total Amount</div>
                    <div className="text-2xl font-bold text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="booking-total">&#8377;{calculateTotal()}</div>
                  </div>
                  <div className="text-right text-xs text-[#6C757D]">
                    {passengers.length} passenger(s) x &#8377;{Math.round(selectedTrain.basePrice * COACH_MULTIPLIERS[selectedCoach])}
                  </div>
                </div>
                <button
                  onClick={confirmBooking}
                  disabled={bookingLoading}
                  className="w-full py-3.5 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#D62828] transition-all hover:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="confirm-booking-button"
                >
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showLiveStatus && liveStatus && (
          <LiveStatusModal
            liveStatus={liveStatus}
            onClose={() => setShowLiveStatus(false)}
          />
        )}
      </AnimatePresence>

      <TrainAnimation />
    </div>
  );
}
