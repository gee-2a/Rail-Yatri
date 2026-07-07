import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Train, MapPin, ArrowRight, Clock, ShieldAlert, SlidersHorizontal, ArrowUpDown, ChevronRight, Zap, Snowflake, Sofa, Armchair, Crown } from 'lucide-react';
import { toast } from 'react-toastify';
import { trainAPI } from '@/services/api';
import StationSelector from '@/components/StationSelector';
import TrainAnimation from '@/components/TrainAnimation';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchTrains() {
  const location = useLocation();
  const navigate = useNavigate();
  const qp = new URLSearchParams(location.search);

  const [searchParams, setSearchParams] = useState({
    source: qp.get('source') || '',
    destination: qp.get('destination') || '',
    date: qp.get('date') || ''
  });

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [sortBy, setSortBy] = useState('price-asc'); // price-asc, price-desc, time-asc, avail-desc
  const [filterType, setFilterType] = useState('all'); // all, Rajdhani, Shatabdi, Vande, Superfast
  const [filterClass, setFilterClass] = useState('all'); // all, General, 3A, 2A, 1A

  const fetchTrainsList = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await trainAPI.getTrains(params);
      setTrains(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve trains. Please check your network connection or try again later.');
      toast.error('Failed to load trains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainsList({
      source: qp.get('source') || '',
      destination: qp.get('destination') || '',
      date: qp.get('date') || ''
    });
    // eslint-disable-next-line
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchParams.source || !searchParams.destination) {
      toast.warning('Please select source and destination stations');
      return;
    }
    if (searchParams.source === searchParams.destination) {
      toast.warning('Source and Destination cannot be the same');
      return;
    }
    const query = new URLSearchParams(searchParams).toString();
    navigate(`/search?${query}`);
  };

  const handleBookNow = (train) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please sign in to proceed with booking');
      navigate(`/auth?redirect=booking/${train._id}`);
    } else {
      navigate(`/booking/${train._id}`);
    }
  };

  const filteredAndSortedTrains = trains
    .filter(t => {
      if (filterType === 'all') return true;
      return t.name.toLowerCase().includes(filterType.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'time-asc') return new Date(a.departureTime) - new Date(b.departureTime);
      if (sortBy === 'avail-desc') return (b.availableSeats || 0) - (a.availableSeats || 0);
      return 0;
    });

  const getAvailabilityBadgeClass = (train) => {
    const avail = train.availableSeats;
    const racLeft = (train.racCapacity || 20) - (train.racBooked || 0);
    if (avail > 50) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (avail > 0) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (racLeft > 0) return 'bg-orange-50 text-orange-700 border border-orange-200';
    return 'bg-purple-50 text-purple-700 border border-purple-200';
  };

  const getAvailabilityText = (train) => {
    const avail = train.availableSeats;
    const racLeft = (train.racCapacity || 20) - (train.racBooked || 0);
    if (avail > 0) return `${avail} Seats Available`;
    if (racLeft > 0) return `RAC Available (${racLeft} slots)`;
    return 'Waitlisted';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-32">
      {/* Search Header Banner */}
      <section className="bg-[#1D3557] text-white py-10 px-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-white/70 mb-1.5 block">From</label>
                <StationSelector
                  value={searchParams.source}
                  onChange={(val) => setSearchParams({ ...searchParams, source: val })}
                  placeholder="Source station"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-white/70 mb-1.5 block">To</label>
                <StationSelector
                  value={searchParams.destination}
                  onChange={(val) => setSearchParams({ ...searchParams, destination: val })}
                  placeholder="Destination station"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-white/70 mb-1.5 block">Journey Date</label>
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white text-[#0A0A0A] border-[#E5E5E5] px-4 py-3 h-12 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#E63946]"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-[#E63946] hover:bg-[#D62828] text-white font-bold h-12 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[0.99] active:scale-95"
                >
                  <Search className="w-5 h-5" /> Modify Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel - Filters & Sorting */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-[#E5E5E5] sticky top-24 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-5">
              <span className="font-bold text-[#0A0A0A] text-lg flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#E63946]" /> Filters & Sort
              </span>
              <button 
                onClick={() => { setSortBy('price-asc'); setFilterType('all'); setFilterClass('all'); }} 
                className="text-xs text-[#E63946] font-semibold hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Sorting */}
            <div className="space-y-3 mb-6">
              <label className="text-xs uppercase tracking-wider font-bold text-[#6C757D] block">Sort By</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-2.5 rounded-xl text-sm outline-none text-[#0A0A0A] appearance-none cursor-pointer"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="time-asc">Departure Time: Early First</option>
                  <option value="avail-desc">Seat Availability: High to Low</option>
                </select>
                <ArrowUpDown className="w-4 h-4 text-[#6C757D] absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Train Type Filter */}
            <div className="space-y-2 mb-6">
              <label className="text-xs uppercase tracking-wider font-bold text-[#6C757D] block">Train Type</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'Rajdhani', 'Shatabdi', 'Vande', 'Express'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      (type === 'all' && filterType === 'all') || (type !== 'all' && filterType.includes(type))
                        ? 'bg-[#1D3557] text-white border-[#1D3557]'
                        : 'bg-white text-[#6C757D] border-[#E5E5E5] hover:border-gray-300'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Search Results */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Summary info */}
            <div className="flex justify-between items-center bg-white px-6 py-4 rounded-xl border border-[#E5E5E5] shadow-sm">
              <span className="text-sm font-medium text-[#6C757D]">
                Showing <strong className="text-[#0A0A0A]">{filteredAndSortedTrains.length}</strong> trains{' '}
                {qp.get('source') || qp.get('destination') ? (
                  <>from <strong className="text-[#0A0A0A]">{qp.get('source') || 'Source'}</strong> to <strong className="text-[#0A0A0A]">{qp.get('destination') || 'Destination'}</strong></>
                ) : (
                  <><strong className="text-[#0A0A0A]">available right now</strong></>
                )}
              </span>
              {qp.get('date') && (
                <span className="text-xs bg-gray-100 text-[#0A0A0A] font-semibold px-3 py-1.5 rounded-lg">
                  {new Date(qp.get('date')).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Skeletons Loading */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white p-6 rounded-2xl border border-[#E5E5E5] shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48 bg-gray-200" />
                        <Skeleton className="h-4 w-24 bg-gray-200" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full bg-gray-200" />
                    </div>
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-4 w-32 bg-gray-200" />
                      <Skeleton className="h-4 w-4 bg-gray-200" />
                      <Skeleton className="h-4 w-32 bg-gray-200" />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-[#E5E5E5]">
                      <Skeleton className="h-6 w-20 bg-gray-200" />
                      <Skeleton className="h-10 w-28 bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-800 p-8 rounded-2xl border border-red-200 text-center"
              >
                <ShieldAlert className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Search Failed</h3>
                <p className="text-sm max-w-md mx-auto text-red-700">{error}</p>
                <button 
                  onClick={() => fetchTrainsList(searchParams)}
                  className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors"
                >
                  Retry Search
                </button>
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredAndSortedTrains.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-16 rounded-2xl border border-[#E5E5E5] text-center shadow-sm"
              >
                <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#0A0A0A] mb-1">No Trains Found</h3>
                <p className="text-[#6C757D] text-sm max-w-sm mx-auto">
                  We couldn't find any trains matching your search criteria. Try modifying your stations, departure date, or filters.
                </p>
              </motion.div>
            )}

            {/* Results list */}
            {!loading && !error && filteredAndSortedTrains.length > 0 && (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredAndSortedTrains.map((train, idx) => (
                    <motion.div
                      key={train._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                      className="bg-white rounded-2xl border border-[#E5E5E5] hover:border-[#1D3557]/40 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                      {/* Live Badge Indicator */}
                      {train.isLive && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          Live API Data
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        
                        {/* Train details */}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-lg text-gray-900 group-hover:text-[#E63946] transition-colors">
                              {train.name}
                            </span>
                            <span className="text-xs bg-[#1D3557]/15 text-[#1D3557] px-2 py-0.5 rounded font-semibold">
                              #{train.number}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getAvailabilityBadgeClass(train)}`}>
                              {getAvailabilityText(train)}
                            </span>
                          </div>

                          {/* Station departure/arrival */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-[#0A0A0A]">
                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-4 h-4 text-[#E63946] mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-sm">{train.source}</div>
                                <div className="text-[11px] text-[#6C757D]">
                                  {new Date(train.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>

                            <div className="hidden sm:flex items-center px-2">
                              <ArrowRight className="w-5 h-5 text-[#6C757D]" />
                            </div>

                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-4 h-4 text-[#457B9D] mt-0.5 shrink-0" />
                              <div>
                                <div className="font-semibold text-sm">{train.destination}</div>
                                <div className="text-[11px] text-[#6C757D]">
                                  {new Date(train.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>

                            <div className="sm:ml-auto flex items-center gap-1.5 text-xs text-[#6C757D] font-medium bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                              <Clock className="w-3.5 h-3.5" />
                              Departure: {new Date(train.departureTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Booking Fare & Action */}
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                          <div className="md:text-right">
                            <span className="text-[11px] text-[#6C757D] uppercase font-bold block tracking-wider">Base Fare</span>
                            <span className="text-2xl font-black text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              ₹{train.basePrice}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/train/${train._id}`)}
                              className="px-4 py-2.5 text-[#1D3557] border border-[#1D3557] font-semibold rounded-xl text-xs hover:bg-[#1D3557]/5 transition-all"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleBookNow(train)}
                              className="px-5 py-2.5 bg-[#E63946] text-white font-bold rounded-xl text-xs hover:bg-[#D62828] hover:scale-[0.98] active:scale-95 transition-all shadow-md flex items-center gap-1"
                            >
                              Book Now <ChevronRight className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

          </div>

        </div>
      </div>

      <TrainAnimation />
    </div>
  );
}
