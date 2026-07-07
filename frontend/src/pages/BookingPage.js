import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { trainAPI, bookingAPI, autoAssignSeats } from '@/services/api';
import TrainAnimation from '@/components/TrainAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { Train, MapPin, ArrowRight, UserPlus, Trash2, ShieldCheck, CreditCard, ChevronRight, AlertTriangle, Sofa, Snowflake, Crown, Armchair } from 'lucide-react';

const COACH_MULTIPLIERS = { General: 1, '3E': 2, '3A': 2.5, '2A': 3, '1A': 4 };
const COACH_INFO = [
  { code: 'General', label: 'General Class', icon: Armchair },
  { code: '3E', label: '3AC Economy', icon: Sofa },
  { code: '3A', label: '3rd AC Tier', icon: Snowflake },
  { code: '2A', label: '2nd AC Tier', icon: Snowflake },
  { code: '1A', label: '1st AC Tier', icon: Crown },
];

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qp = new URLSearchParams(location.search);

  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [selectedCoach, setSelectedCoach] = useState(qp.get('coach') || '3A');
  const [passengers, setPassengers] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchTrainData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await trainAPI.getTrainById(id);
        setTrain(res.data);
        
        // Populate initial passengers list
        const initialCount = parseInt(qp.get('passengers')) || 1;
        const initialPassengers = Array.from({ length: Math.min(6, Math.max(1, initialCount)) }, () => ({
          name: '',
          age: ''
        }));
        setPassengers(initialPassengers);
      } catch (err) {
        console.error(err);
        setError('Train details not found or failed to load.');
        toast.error('Failed to load train details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrainData();
    // eslint-disable-next-line
  }, [id]);

  const addPassenger = () => {
    if (passengers.length >= 6) {
      toast.warning('A maximum of 6 passengers are allowed per booking');
      return;
    }
    setPassengers([...passengers, { name: '', age: '' }]);
  };

  const removePassenger = (index) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const calculateTotal = () => {
    if (!train) return 0;
    const base = train.basePrice || 500;
    const multiplier = COACH_MULTIPLIERS[selectedCoach] || 1;
    return passengers.length * Math.round(base * multiplier);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Validations
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim()) {
        toast.warning(`Please enter name for Passenger #${i + 1}`);
        return;
      }
      if (!p.age || parseInt(p.age) <= 0 || parseInt(p.age) > 120) {
        toast.warning(`Please enter a valid age (1-120) for Passenger #${i + 1}`);
        return;
      }
    }

    // Auto-assign seats
    const seatLabels = autoAssignSeats(train, selectedCoach, passengers.length);
    const racCapacity = train.racCapacity || 20;
    const racAvailable = train.racBooked < racCapacity;
    const totalAvail = train.availableSeats;

    if (totalAvail < passengers.length && !racAvailable && selectedCoach !== 'General') {
      toast.info('No confirmed or RAC seats available. Assigning to waitlist.');
    }

    // Map passenger list with seat numbers
    const passengersWithSeats = passengers.map((p, index) => {
      // Seats could be waitlisted (so label will be 'WL' or empty, autoAssignSeats returns what is available)
      const seatNumber = seatLabels[index] || `WL-${Math.floor(Math.random() * 100) + 1}`;
      return {
        name: p.name.trim(),
        age: parseInt(p.age),
        seatNumber: seatNumber
      };
    });

    setBookingLoading(true);
    try {
      const res = await bookingAPI.createBooking({
        trainId: train._id,
        passengers: passengersWithSeats,
        // Backend maps seat prices inside bookingController.js
      });
      toast.success('Ticket booked successfully!');
      navigate(`/booking-confirmation/${res.data._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Booking checkout failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <Skeleton className="h-10 w-1/2 bg-gray-200" />
            <Skeleton className="h-64 w-full bg-gray-200 rounded-2xl" />
          </div>
          <div className="md:col-span-4">
            <Skeleton className="h-96 w-full bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32 flex items-center justify-center text-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#E63946] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Page</h2>
          <p className="text-sm text-[#6C757D] mb-6">{error || 'Could not retrieve train parameters.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="w-full py-3 bg-[#1D3557] hover:bg-[#15283F] text-white font-semibold rounded-xl"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const basePrice = train.basePrice || 500;
  const singlePrice = Math.round(basePrice * COACH_MULTIPLIERS[selectedCoach]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors mb-6 inline-flex items-center gap-1"
        >
          &larr; Back to details
        </button>

        <h1 className="text-2xl font-black text-gray-900 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Review Passenger Details
        </h1>

        <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel - Passengers form */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Train details summarizer */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#E63946] tracking-wider mb-1">Selected Train</div>
                <div className="font-extrabold text-[#1D3557] text-lg flex items-center gap-2">
                  <Train className="w-5 h-5" /> {train.name} <span className="text-xs font-bold text-[#6C757D]">#{train.number}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6C757D] mt-2 font-medium">
                  <span>{train.source}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{train.destination}</span>
                </div>
              </div>
              
              <div className="text-left sm:text-right border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                <span className="text-[10px] uppercase font-bold text-[#6C757D] tracking-wider block">Departure</span>
                <span className="text-sm font-bold text-gray-900 block mt-1">
                  {new Date(train.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs text-[#6C757D] block">
                  {new Date(train.departureTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>

            {/* Coach Class Selectors */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm space-y-4">
              <label className="text-xs uppercase tracking-wider font-bold text-[#6C757D] block">Change Coach Tier</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {COACH_INFO.map(c => {
                  const Icon = c.icon;
                  const price = Math.round(basePrice * COACH_MULTIPLIERS[c.code]);
                  const isSelected = selectedCoach === c.code;

                  return (
                    <button
                      type="button"
                      key={c.code}
                      onClick={() => setSelectedCoach(c.code)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#1D3557] border-[#1D3557] text-white shadow-sm'
                          : 'bg-white border-[#E5E5E5] text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-[#6C757D]'}`} />
                      <div className="text-xs font-bold">{c.code}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#6C757D] font-bold'}`}>₹{price}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Booking alert notice */}
            {train.availableSeats > 0 ? (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-normal">
                  <strong>Seats Confirmed:</strong> Confirmed seats are available in {selectedCoach} coach. The reservation system will allocate them side-by-side automatically.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 leading-normal">
                  <strong>RAC/Waitlist Booking:</strong> No direct confirmed seats are left in {selectedCoach}. The ticket status will be RAC or Waitlist. You will be automatically upgraded to a Confirmed seat upon any passenger cancellation.
                </p>
              </div>
            )}

            {/* Passengers entry list */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <h3 className="font-bold text-[#0A0A0A] text-base">Passenger Information</h3>
                <button
                  type="button"
                  onClick={addPassenger}
                  className="text-xs text-[#E63946] font-bold flex items-center gap-1 hover:underline bg-[#E63946]/5 px-3 py-1.5 rounded-lg border border-[#E63946]/10"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Passenger
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {passengers.map((passenger, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl relative">
                    
                    {/* Index header */}
                    <div className="absolute -top-2.5 -left-2 bg-[#1D3557] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-[#6C757D]">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter passenger name"
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        className="w-full bg-white border border-[#E5E5E5] px-3.5 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] focus:border-[#E63946]"
                      />
                    </div>

                    <div className="w-full sm:w-28 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-[#6C757D]">Age</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        placeholder="Age"
                        value={passenger.age}
                        onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                        className="w-full bg-white border border-[#E5E5E5] px-3.5 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] focus:border-[#E63946]"
                      />
                    </div>

                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="p-3 text-red-500 hover:text-red-700 bg-white hover:bg-red-50 border border-[#E5E5E5] hover:border-red-200 rounded-xl transition-all flex items-center justify-center sm:h-[42px] sm:w-[42px]"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}

                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel - Total Price checkout */}
          <div className="lg:col-span-4 bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-[#E5E5E5] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#E63946]" /> Payment Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>Fare Class</span>
                <span className="font-semibold text-gray-900">{selectedCoach}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>Ticket Price</span>
                <span className="font-semibold text-gray-900">₹{singlePrice} &times; {passengers.length}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>Dynamic Seat Surcharge</span>
                <span className="text-green-600 font-semibold">₹0 (Waived)</span>
              </div>
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>Convenience Fee</span>
                <span className="text-green-600 font-semibold">₹0 (Waived)</span>
              </div>
              
              <div className="pt-4 border-t border-[#E5E5E5] flex justify-between items-end">
                <span className="text-sm font-bold text-[#0A0A0A]">Total Fare</span>
                <span className="text-2xl font-black text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  ₹{calculateTotal()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-4 bg-[#E63946] hover:bg-[#D62828] text-white font-bold rounded-2xl transition-all shadow-lg hover:scale-[0.99] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {bookingLoading ? 'Processing Booking...' : 'Complete Payment'} <ChevronRight className="w-5 h-5" />
            </button>

            <div className="text-[10px] text-[#6C757D] text-center leading-normal">
              By clicking "Complete Payment" you agree to IRCTC rules of cancellation. Free cancellations are allowed up to 4 hours before train departure.
            </div>
          </div>

        </form>

      </div>
      <TrainAnimation />
    </div>
  );
}
