import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Search, ArrowRight, Zap, Shield, Clock, Mail, BarChart3, Crown, Snowflake, Sofa, Armchair, Train } from 'lucide-react';
import TrainAnimation from '@/components/TrainAnimation';
import StationSelector from '@/components/StationSelector';

const features = [
  { icon: Zap, title: "Instant Booking", desc: "Secure seats immediately with zero wait time." },
  { icon: Shield, title: "Secure Payments", desc: "Bank-grade encryption for every transaction." },
  { icon: Clock, title: "Real-time Updates", desc: "Live seat availability and train status." },
  { icon: Mail, title: "Email Confirmations", desc: "Booking details sent straight to your inbox." },
  { icon: BarChart3, title: "Smart Dashboard", desc: "Manage all journeys from one elegant place." },
];

const coachClasses = [
  { code: 'General', label: 'General', icon: Armchair, multiplier: '1x' },
  { code: '3E', label: '3rd AC Economy', icon: Sofa, multiplier: '2x' },
  { code: '3A', label: '3rd AC', icon: Snowflake, multiplier: '2.5x' },
  { code: '2A', label: '2nd AC', icon: Snowflake, multiplier: '3x' },
  { code: '1A', label: '1st AC', icon: Crown, multiplier: '4x' },
];

const stats = [
  { num: '30+', label: 'Train Routes' },
  { num: '5', label: 'Coach Classes' },
  { num: '99%', label: 'Success Rate' },
  { num: '<2s', label: 'Booking Time' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const navigate = useNavigate();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination) {
      toast.warning('Please select source and destination stations');
      return;
    }
    if (source === destination) {
      toast.warning('Source and Destination cannot be the same');
      return;
    }
    const params = `source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`;
    navigate(`/search?${params}`);
  };

  return (
    <div className="pb-28">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
        {/* BG Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1D3557]/90 via-[#1D3557]/70 to-[#1D3557]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left - Text + Search */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 text-xs uppercase tracking-[0.2em] font-semibold text-[#E63946] bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                India's Premium Railway Booking
              </span>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6"
                style={{ fontFamily: 'Outfit, sans-serif' }}
                data-testid="hero-title"
              >
                Book Smarter.<br />
                <span className="text-[#E63946]">Travel Better.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-lg mb-8 leading-relaxed">
                Experience the future of Indian Railways. Premium booking with automatic seat assignment, real-time availability, and instant confirmations.
              </p>

              {/* Search Form */}
              <form
                onSubmit={handleSearch}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6"
                data-testid="hero-search-form"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="z-30">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/70 mb-1.5 block">From</label>
                    <StationSelector
                      value={source}
                      onChange={setSource}
                      placeholder="Source station"
                    />
                  </div>
                  <div className="z-20">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/70 mb-1.5 block">To</label>
                    <StationSelector
                      value={destination}
                      onChange={setDestination}
                      placeholder="Destination station"
                    />
                  </div>
                  <div className="z-10">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/70 mb-1.5 block">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white text-[#0A0A0A] border-[#E5E5E5] px-4 py-3 h-12 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#E63946]"
                      data-testid="search-date-input"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#E63946] text-white font-bold rounded-xl hover:bg-[#D62828] transition-all hover:scale-[0.98] active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                  data-testid="search-trains-button"
                >
                  <Search className="w-4 h-4" /> Search Trains
                </button>
              </form>
            </motion.div>

            {/* Right - Image */}
            <motion.div
              className="lg:col-span-5 hidden lg:block"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <img
                  src="/premium-train.png"
                  alt="Premium Train"
                  className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/5]"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0A0A0A]">Auto Seat Assignment</div>
                    <div className="text-xs text-[#6C757D]">Smart allocation system</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-10 max-w-5xl mx-auto px-4" data-testid="stats-section">
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-[#E5E5E5] grid grid-cols-2 md:grid-cols-4"
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`p-6 sm:p-8 text-center ${i < 3 ? 'border-r border-[#E5E5E5]' : ''}`}
            >
              <div className="text-2xl sm:text-3xl font-bold text-[#1D3557]" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.num}</div>
              <div className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6C757D] mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" data-testid="features-section">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#E63946]">Premium Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Everything you need to travel smarter
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group bg-white rounded-2xl border border-[#E5E5E5] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default"
                data-testid={`feature-card-${i}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 flex items-center justify-center mb-4 group-hover:bg-[#E63946] transition-colors">
                  <Icon className="w-5 h-5 text-[#E63946] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[#0A0A0A] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
                <p className="text-sm text-[#6C757D] leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Coach Classes */}
      <section className="bg-[#1D3557] py-24" data-testid="coach-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#E63946]">Coach Classes</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Choose your comfort level
            </h2>
            <p className="text-white/50 mt-3 max-w-md mx-auto">System automatically assigns the best available seat in your chosen coach class.</p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Locomotive */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
            >
              <Train className="w-6 h-6 text-[#E63946]" />
              <span className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>LOCO</span>
            </motion.div>
            {coachClasses.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.code}
                  variants={fadeUp}
                  className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center hover:bg-white/10 hover:border-[#E63946]/50 transition-all cursor-default min-w-[130px]"
                  data-testid={`coach-preview-${c.code}`}
                >
                  <Icon className="w-6 h-6 text-white/70 mx-auto mb-2" />
                  <div className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>{c.code}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{c.label}</div>
                  <div className="text-xs text-[#E63946] font-semibold mt-2">{c.multiplier} fare</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center" data-testid="cta-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ready to experience premium travel?
          </h2>
          <p className="text-[#6C757D] mb-8 max-w-md mx-auto">Join thousands of travelers who book smarter with RailYatri.</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-[#E63946] text-white font-semibold rounded-full text-lg hover:bg-[#D62828] transition-all hover:scale-[0.98] active:scale-95 inline-flex items-center gap-2"
            data-testid="cta-start-journey"
          >
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      <TrainAnimation />
    </div>
  );
}
