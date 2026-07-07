import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { trainAPI } from '@/services/api';
import TrainAnimation from '@/components/TrainAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { Train, MapPin, ArrowRight, Clock, ShieldCheck, Ticket, Users, ChevronRight, Snowflake, Sofa, Armchair, Crown, AlertTriangle } from 'lucide-react';

const COACH_MULTIPLIERS = { General: 1, '3E': 2, '3A': 2.5, '2A': 3, '1A': 4 };
const COACH_INFO = [
  { code: 'General', label: 'General Second Class (GS)', icon: Armchair },
  { code: '3E', label: 'AC 3 Tier Economy (3E)', icon: Sofa },
  { code: '3A', label: 'AC 3 Tier (3A)', icon: Snowflake },
  { code: '2A', label: 'AC 2 Tier (2A)', icon: Snowflake },
  { code: '1A', label: 'AC First Class (1A)', icon: Crown },
];

export default function TrainDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fare calculator state
  const [selectedCoach, setSelectedCoach] = useState('3A');
  const [passengerCount, setPassengerCount] = useState(1);

  useEffect(() => {
    const fetchTrainDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await trainAPI.getTrainById(id);
        setTrain(res.data);
      } catch (err) {
        console.error(err);
        setError('Train details not found or failed to load.');
        toast.error('Failed to load train details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrainDetails();
  }, [id]);

  const handleBookNow = () => {
    const token = localStorage.getItem('token');
    const params = `coach=${selectedCoach}&passengers=${passengerCount}`;
    if (!token) {
      toast.info('Please sign in to proceed with booking');
      navigate(`/auth?redirect=booking/${id}&${params}`);
    } else {
      navigate(`/booking/${id}?${params}`);
    }
  };

  const getDuration = () => {
    if (!train) return '';
    const diff = new Date(train.arrivalTime) - new Date(train.departureTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <Skeleton className="h-12 w-3/4 bg-gray-200" />
          <Skeleton className="h-48 w-full bg-gray-200 rounded-2xl" />
          <Skeleton className="h-32 w-full bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[#E63946] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Train</h2>
          <p className="text-sm text-[#6C757D] mb-6">{error || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="w-full py-3 bg-[#1D3557] hover:bg-[#15283F] text-white font-semibold rounded-xl transition-all shadow-md"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const basePrice = train.basePrice || 500;
  const singlePrice = Math.round(basePrice * COACH_MULTIPLIERS[selectedCoach]);
  const totalPrice = singlePrice * passengerCount;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-[#6C757D] hover:text-[#E63946] transition-colors mb-6 inline-flex items-center gap-1"
        >
          &larr; Back
        </button>

        {/* Train Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-sm overflow-hidden relative mb-8"
        >
          {train.isLive && (
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-bl-2xl">
              Live Connection
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E63946]/10 flex items-center justify-center">
                <Train className="w-6 h-6 text-[#E63946]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 leading-tight">{train.name}</h1>
                <div className="text-xs text-[#6C757D] font-medium mt-0.5">Train Number: #{train.number}</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                train.availableSeats > 50 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : train.availableSeats > 0 
                  ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                  : 'bg-purple-50 text-purple-700 border border-purple-100'
              }`}>
                {train.availableSeats > 0 ? `${train.availableSeats} Confirmed Seats` : 'Waitlisted (RAC available)'}
              </span>
            </div>
          </div>

          {/* Journey Path */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-8">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#6C757D]">Departure</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E63946] shrink-0" />
                <span className="font-extrabold text-[#1D3557] text-lg">{train.source}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {new Date(train.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-[#6C757D]">
                {new Date(train.departureTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-xs text-[#6C757D] font-medium bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full mb-2 inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#457B9D]" /> Duration: {getDuration()}
              </span>
              <div className="w-full flex items-center justify-center gap-1">
                <div className="h-0.5 w-16 bg-gray-200" />
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className="h-0.5 w-16 bg-gray-200" />
              </div>
            </div>

            <div className="space-y-1.5 md:text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#6C757D]">Arrival</span>
              <div className="flex items-center md:justify-end gap-2">
                <MapPin className="w-5 h-5 text-[#457B9D] shrink-0" />
                <span className="font-extrabold text-[#1D3557] text-lg">{train.destination}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {new Date(train.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-[#6C757D]">
                {new Date(train.arrivalTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Premium Seat Guarantee:</strong> The intelligent booking engine automatically scans passenger lists to reserve lower berths for seniors and side-by-side seating for families.
            </p>
          </div>
        </motion.div>

        {/* Coach Classes & Calculator Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Coach List */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-[#E5E5E5] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-[#E5E5E5] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#E63946]" /> Coach Tiers & Pricing
            </h2>
            <div className="space-y-3 pt-2">
              {COACH_INFO.map((c) => {
                const Icon = c.icon;
                const price = Math.round(basePrice * COACH_MULTIPLIERS[c.code]);
                const isSelected = selectedCoach === c.code;

                return (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCoach(c.code)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#1D3557]/5 border-[#1D3557] shadow-sm'
                        : 'bg-white border-[#E5E5E5] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#1D3557] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{c.label}</div>
                        <div className="text-[10px] text-[#6C757D] font-bold uppercase mt-0.5">Multiplier: {COACH_MULTIPLIERS[c.code]}x</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#1D3557]">₹{price}</span>
                      <span className="text-[10px] text-[#6C757D] block">per seat</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="md:col-span-5 bg-white rounded-3xl border border-[#E5E5E5] p-6 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-[#E5E5E5] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E63946]" /> Fare Estimator
            </h2>

            {/* Coach class summary */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-1">
              <span className="text-xs text-[#6C757D] font-medium">Selected Tier</span>
              <div className="font-bold text-sm text-gray-900">
                {COACH_INFO.find(c => c.code === selectedCoach)?.label}
              </div>
              <div className="text-[#E63946] font-extrabold text-sm pt-1">
                ₹{singlePrice} <span className="text-xs text-gray-500 font-normal">/ passenger</span>
              </div>
            </div>

            {/* Passenger Count */}
            <div className="space-y-2.5">
              <label className="text-xs uppercase tracking-wider font-bold text-[#6C757D]">Passenger Count</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                  className="w-10 h-10 rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#1D3557] font-bold hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <div className="flex-1 text-center font-bold text-gray-900 border border-[#E5E5E5] h-10 flex items-center justify-center rounded-xl bg-white">
                  {passengerCount}
                </div>
                <button
                  type="button"
                  onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}
                  className="w-10 h-10 rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#1D3557] font-bold hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-[10px] text-[#6C757D]">You can add up to 6 passengers per transaction.</p>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>Base Ticket Fare</span>
                <span>₹{singlePrice} &times; {passengerCount}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>IRCTC Service Fee</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-sm font-bold text-[#0A0A0A]">Total Amount</span>
                <span className="text-2xl font-black text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  ₹{totalPrice}
                </span>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={handleBookNow}
              className="w-full py-4 bg-[#E63946] hover:bg-[#D62828] text-white font-bold rounded-2xl transition-all shadow-lg hover:scale-[0.99] active:scale-95 flex items-center justify-center gap-2"
            >
              Book Train Now <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
      <TrainAnimation />
    </div>
  );
}
