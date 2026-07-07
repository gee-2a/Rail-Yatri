import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { bookingAPI } from '@/services/api';
import TrainAnimation from '@/components/TrainAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Train, Clock, MapPin, Navigation, Calendar, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function LiveTrainStatus() {
  const { trainNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qp = new URLSearchParams(location.search);

  const [inputNum, setInputNum] = useState(trainNumber || qp.get('trainNumber') || '');
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchLiveStatus = async (num) => {
    if (!num) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await bookingAPI.getLiveStatus(num);
      setStatusData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load live status for this train');
      setStatusData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const num = trainNumber || qp.get('trainNumber');
    if (num) {
      setInputNum(num);
      fetchLiveStatus(num);
    }
    // eslint-disable-next-line
  }, [trainNumber, location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputNum.trim()) {
      toast.warning('Please enter a train number');
      return;
    }
    navigate(`/live-status/${inputNum.trim()}`);
  };

  // Predefined route points for mock visual tracking
  const routeStations = [
    { name: "New Delhi", code: "NDLS" },
    { name: "Agra Cantt", code: "AGC" },
    { name: "Gwalior Jn", code: "GWL" },
    { name: "Jhansi Jn", code: "VGLJ" },
    { name: "Bhopal Jn", code: "BPL" },
    { name: "Itarsi Jn", code: "ET" },
    { name: "Nagpur Jn", code: "NGP" },
    { name: "Vijayawada Jn", code: "BZA" },
    { name: "Chennai Central", code: "MAS" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-32">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header Title */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Live Train Status
          </h1>
          <p className="text-sm text-[#6C757D] max-w-sm mx-auto">
            Get instant real-time location updates, delay timings, and platform numbers for any train in India.
          </p>
        </div>

        {/* Input Form card */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-5 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Train className="w-5 h-5 text-[#6C757D] absolute left-4 top-3.5" />
              <input
                type="text"
                required
                placeholder="Enter 5-digit Train Number (e.g. 12626)..."
                value={inputNum}
                onChange={(e) => setInputNum(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-[#F8F9FA] border border-[#E5E5E5] pl-11 pr-4 py-3.5 h-12 rounded-xl text-sm font-semibold outline-none text-[#0A0A0A] focus:border-[#E63946]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#E63946] hover:bg-[#D62828] text-white font-bold h-12 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Search className="w-5 h-5" /> 
              {loading ? 'Locating...' : 'Track Train'}
            </button>
          </form>
        </div>

        {/* Tracker Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <Skeleton className="h-6 w-1/3 bg-gray-200" />
                <Skeleton className="h-5 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full bg-gray-200 rounded-xl" />
                <Skeleton className="h-16 w-full bg-gray-200 rounded-xl" />
              </div>
              <Skeleton className="h-40 w-full bg-gray-200 rounded-2xl" />
            </div>
          )}

          {!loading && searched && !statusData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-red-100 p-12 text-center shadow-sm"
            >
              <AlertTriangle className="w-12 h-12 text-[#E63946] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Status Offline</h3>
              <p className="text-sm text-[#6C757D] max-w-xs mx-auto">
                No active tracking data available for train #{inputNum}. Please confirm the train number and try again.
              </p>
            </motion.div>
          )}

          {!loading && searched && statusData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Tracker Summary Header */}
              <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 shadow-sm overflow-hidden relative">
                
                {/* Accent status pill */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] uppercase font-bold tracking-wider text-white ${
                  statusData.delayMinutes > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  {statusData.delayMinutes > 0 ? `Delayed by ${statusData.delayMinutes}m` : 'On Time'}
                </div>

                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E5E5E5]">
                  <div className="w-11 h-11 rounded-2xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946]">
                    <Navigation className="w-5.5 h-5.5 rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#1D3557] text-base">
                      Tracking: Train #{statusData.trainNumber}
                    </h3>
                    <span className="text-[10px] text-[#6C757D] font-bold uppercase block mt-0.5">
                      Last Updated: {statusData.lastUpdated || new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <span className="text-[10px] text-[#6C757D] font-bold uppercase tracking-wider block">Current Location</span>
                    <strong className="text-gray-900 text-sm block mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#E63946]" /> {statusData.currentLocation}
                    </strong>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <span className="text-[10px] text-[#6C757D] font-bold uppercase tracking-wider block">Running Status</span>
                    <strong className="text-gray-900 text-sm block mt-1 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#457B9D]" /> {statusData.statusMessage}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Graphical Route Timeline */}
              <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="font-extrabold text-[#1D3557] text-base pb-3 border-b">
                  Running Route Journey Map
                </h3>

                {/* Timeline display */}
                <div className="relative pl-8 border-l-2 border-gray-200 space-y-8 pt-3 pb-3 ml-2">
                  
                  {routeStations.map((station, index) => {
                    // Check if train has passed this station (Mock visualization)
                    const isPassed = index < 4;
                    const isCurrent = index === 4;
                    
                    return (
                      <div key={station.code} className="relative">
                        
                        {/* Circle dot icon on line */}
                        <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center ${
                          isCurrent 
                            ? 'bg-[#E63946] text-white ring-4 ring-[#E63946]/20' 
                            : isPassed 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}>
                          {isCurrent ? (
                            <Train className="w-3.5 h-3.5" />
                          ) : isPassed ? (
                            <CheckCircle2 className="w-4.5 h-4.5" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>

                        {/* Station details */}
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className={`font-bold text-sm block ${
                              isCurrent ? 'text-[#E63946]' : isPassed ? 'text-gray-700' : 'text-gray-400'
                            }`}>
                              {station.name} ({station.code})
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-[#E63946]/10 text-[#E63946] px-2 py-0.5 rounded-full mt-1 inline-block">
                                Current Location (Departed)
                              </span>
                            )}
                            {isPassed && (
                              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                                Passed on time
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-gray-500 block">Platform 2</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <TrainAnimation />
    </div>
  );
}
