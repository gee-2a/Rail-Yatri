import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { trainAPI, bookingAPI } from '@/services/api';
import {
  LayoutDashboard, Train, Ticket, Plus, X, Pencil, Trash2,
  ChevronRight, CheckCircle2, XCircle, DollarSign, Users, BarChart3, Eye
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trains, setTrains] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [trainStats, setTrainStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [formData, setFormData] = useState({ name: '', number: '', source: '', destination: '', departureTime: '', arrivalTime: '', totalSeats: '', basePrice: '' });

  const [showTrainBookings, setShowTrainBookings] = useState(false);
  const [trainBookingsData, setTrainBookingsData] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') { fetchAnalytics(); fetchTrains().then(d => d && fetchPerTrainStats(d)); }
    else if (activeTab === 'trains') fetchTrains();
    else if (activeTab === 'bookings') fetchAllBookings();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchTrains = async () => {
    try { const res = await trainAPI.getTrains(); setTrains(res.data); return res.data; }
    catch { toast.error('Failed to load trains'); return null; }
  };

  const fetchAnalytics = async () => {
    try { const res = await trainAPI.getAnalytics(); setAnalytics(res.data); }
    catch { toast.error('Failed to load analytics'); }
  };

  const fetchPerTrainStats = async (data) => {
    try {
      const stats = await Promise.all(data.map(async t => {
        try { const res = await trainAPI.getTrainBookings(t._id); return { train: t, ...res.data }; }
        catch { return { train: t, bookings: [], stats: {} }; }
      }));
      setTrainStats(stats);
    } catch {}
  };

  const fetchAllBookings = async () => {
    try { const res = await bookingAPI.getAllBookings(); setAllBookings(res.data); }
    catch { toast.error('Failed to load bookings'); }
  };

  const viewTrainBookings = async (trainId, trainName) => {
    setSelectedTrain({ _id: trainId, name: trainName });
    setShowTrainBookings(true);
    setTrainBookingsData(null);
    try { const res = await trainAPI.getTrainBookings(trainId); setTrainBookingsData(res.data); }
    catch { toast.error('Failed to load'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this train?')) return;
    try { await trainAPI.deleteTrain(id); toast.success('Train deleted'); fetchTrains(); }
    catch { toast.error('Delete failed'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await trainAPI.updateTrain(selectedTrain._id, formData); toast.success('Updated'); }
      else { await trainAPI.createTrain(formData); toast.success('Train added'); }
      setShowForm(false); setEditMode(false); fetchTrains();
    } catch { toast.error('Save failed'); }
  };

  const openEdit = (t) => {
    setSelectedTrain(t); setEditMode(true);
    setFormData({ name: t.name, number: t.number, source: t.source, destination: t.destination,
      departureTime: t.departureTime ? t.departureTime.slice(0, 16) : '', arrivalTime: t.arrivalTime ? t.arrivalTime.slice(0, 16) : '',
      totalSeats: t.totalSeats, basePrice: t.basePrice });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditMode(false); setSelectedTrain(null);
    setFormData({ name: '', number: '', source: '', destination: '', departureTime: '', arrivalTime: '', totalSeats: '', basePrice: '' });
    setShowForm(true);
  };

  const sideItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'trains', label: 'Manage Trains', icon: Train },
    { key: 'bookings', label: 'All Bookings', icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-16 flex" data-testid="admin-page">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-white/10 bg-[#0A0A0A] sticky top-16 h-[calc(100vh-4rem)] p-6" data-testid="admin-sidebar">
        <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/30 mb-4">Admin Panel</div>
        {sideItems.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
              activeTab === s.key ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            data-testid={`admin-tab-${s.key}`}
          >
            <s.icon className="w-4 h-4" /> {s.label}
          </button>
        ))}
      </aside>

      {/* Mobile tabs */}
      <div className="lg:hidden fixed bottom-28 left-0 right-0 z-40 bg-[#0A0A0A] border-t border-white/10 flex">
        {sideItems.map(s => (
          <button key={s.key} onClick={() => setActiveTab(s.key)}
            className={`flex-1 py-3 text-center text-xs font-medium ${activeTab === s.key ? 'text-[#E63946]' : 'text-white/50'}`}>
            <s.icon className="w-4 h-4 mx-auto mb-1" />{s.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-8 text-white overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="admin-dashboard-title">Overview</h2>
            {analytics ? (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                {[
                  { icon: Ticket, val: analytics.totalBookings, label: 'Total Bookings', color: 'text-white' },
                  { icon: CheckCircle2, val: analytics.confirmedBookings, label: 'Confirmed', color: 'text-green-400' },
                  { icon: Ticket, val: analytics.racBookings || 0, label: 'RAC', color: 'text-orange-400' },
                  { icon: Ticket, val: analytics.waitlistBookings || 0, label: 'Waitlist', color: 'text-purple-400' },
                  { icon: XCircle, val: analytics.cancelledBookings, label: 'Cancelled', color: 'text-red-400' },
                  { icon: DollarSign, val: `₹${analytics.totalRevenue?.toLocaleString()}`, label: 'Revenue', color: 'text-[#E63946]' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6" data-testid={`analytics-card-${i}`}>
                    <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
                    <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{s.val}</div>
                    <div className="text-xs text-white/40 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            ) : <p className="text-white/50">Loading analytics...</p>}

            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Per-Train Performance</h3>
            <div className="space-y-3">
              {trainStats.map(d => (
                <div key={d.train._id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">{d.train.name} <span className="text-xs text-white/40">#{d.train.number}</span></div>
                      <div className="text-xs text-white/40">{d.train.source} → {d.train.destination}</div>
                    </div>
                    <button onClick={() => viewTrainBookings(d.train._id, d.train.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-400 border border-green-400/30 rounded-lg hover:bg-green-400/10 transition-colors"
                      data-testid={`view-train-bookings-${d.train._id}`}>
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { v: d.stats?.totalBookings || 0, l: 'Total', c: 'text-white' },
                      { v: d.stats?.confirmedBookings || 0, l: 'Confirmed', c: 'text-green-400' },
                      { v: d.stats?.cancelledBookings || 0, l: 'Cancelled', c: 'text-red-400' },
                      { v: `₹${(d.stats?.totalRevenue || 0).toLocaleString()}`, l: 'Revenue', c: 'text-[#E63946]' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                        <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
                        <div className="text-[10px] text-white/30">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'trains' && (
          <motion.div {...fadeUp}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="admin-trains-title">Manage Trains</h2>
              <button onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#D62828] transition-all text-sm"
                data-testid="add-train-button">
                <Plus className="w-4 h-4" /> Add Train
              </button>
            </div>
            <div className="space-y-3">
              {trains.map(t => (
                <div key={t._id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors" data-testid={`admin-train-${t._id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-white/40">#{t.number}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => viewTrainBookings(t._id, t.name)}
                        className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors" data-testid={`admin-train-bookings-${t._id}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(t)}
                        className="p-2 text-[#457B9D] hover:bg-[#457B9D]/10 rounded-lg transition-colors" data-testid={`admin-train-edit-${t._id}`}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t._id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" data-testid={`admin-train-delete-${t._id}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-white/50">
                    <span>{t.source} → {t.destination}</span>
                    <span>Base: ₹{t.basePrice}</span>
                    <span>{t.availableSeats}/{t.totalSeats} available</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="admin-bookings-title">All Bookings</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left" data-testid="all-bookings-table">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="p-4 text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40">Train / User</th>
                      <th className="p-4 text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40">Passengers</th>
                      <th className="p-4 text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40">Amount</th>
                      <th className="p-4 text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map(b => (
                      <tr key={b._id} className="border-t border-white/5 hover:bg-white/[0.02]" data-testid={`admin-booking-row-${b._id}`}>
                        <td className="p-4">
                          <div className="font-medium text-white text-sm">{b.train?.name || 'N/A'}</div>
                          <div className="text-xs text-white/40">{b.user?.name} ({b.user?.email})</div>
                        </td>
                        <td className="p-4 text-xs text-white/60">
                          {b.passengers.map(p => <div key={p.seatNumber}>{p.name} ({p.seatNumber})</div>)}
                        </td>
                        <td className="p-4 font-bold text-white">₹{b.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${b.status === 'Confirmed' ? 'bg-green-400/10 text-green-400' : b.status === 'RAC' ? 'bg-orange-400/10 text-orange-400' : b.status === 'Waitlist' ? 'bg-purple-400/10 text-purple-400' : 'bg-red-400/10 text-red-400'}`}>
                            {b.status}{b.waitlistNumber ? ` (WL/${b.waitlistNumber})` : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Train Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-testid="train-form-modal">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{editMode ? 'Edit Train' : 'Add Train'}</h3>
              <button onClick={() => { setShowForm(false); setEditMode(false); }} className="p-2 hover:bg-white/10 rounded-lg" data-testid="close-train-form">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4" data-testid="train-form">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">Train Name</label>
                  <input type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#E63946]" data-testid="form-train-name" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">Number</label>
                  <input type="text" name="number" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#E63946]" data-testid="form-train-number" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">Source</label>
                  <input type="text" name="source" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#E63946]" data-testid="form-train-source" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">Destination</label>
                  <input type="text" name="destination" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#E63946]" data-testid="form-train-destination" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">Departure</label>
                  <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#E63946] [color-scheme:dark]" data-testid="form-train-departure" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">Arrival</label>
                  <input type="datetime-local" name="arrivalTime" value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} required
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#E63946] [color-scheme:dark]" data-testid="form-train-arrival" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">Total Seats</label>
                  <input type="number" name="totalSeats" value={formData.totalSeats} onChange={e => setFormData({...formData, totalSeats: e.target.value})} required min="1"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#E63946]" data-testid="form-train-seats" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-white/40 mb-1">Base Price ₹</label>
                  <input type="number" name="basePrice" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} required min="1"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#E63946]" data-testid="form-train-price" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-[#E63946] text-white font-semibold rounded-xl hover:bg-[#D62828] transition-all" data-testid="save-train-button">Save</button>
                <button type="button" onClick={() => { setShowForm(false); setEditMode(false); }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white/70 font-semibold rounded-xl hover:bg-white/10 transition-all" data-testid="cancel-train-form">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Train Bookings Modal */}
      {showTrainBookings && selectedTrain && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" data-testid="train-bookings-modal">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{selectedTrain.name} — Bookings</h3>
              <button onClick={() => setShowTrainBookings(false)} className="p-2 hover:bg-white/10 rounded-lg" data-testid="close-train-bookings">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            {!trainBookingsData ? <p className="text-white/50">Loading...</p> : (
              <>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { v: trainBookingsData.stats.totalBookings, l: 'Total', c: 'text-white' },
                    { v: trainBookingsData.stats.confirmedBookings, l: 'Confirmed', c: 'text-green-400' },
                    { v: trainBookingsData.stats.cancelledBookings, l: 'Cancelled', c: 'text-red-400' },
                    { v: `₹${trainBookingsData.stats.totalRevenue?.toLocaleString()}`, l: 'Revenue', c: 'text-[#E63946]' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                      <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
                      <div className="text-[10px] text-white/30 mt-1">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="p-3 text-[10px] uppercase tracking-wider font-semibold text-white/40">Passengers</th>
                        <th className="p-3 text-[10px] uppercase tracking-wider font-semibold text-white/40">Status</th>
                        <th className="p-3 text-[10px] uppercase tracking-wider font-semibold text-white/40">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainBookingsData.bookings.length === 0 ? (
                        <tr><td colSpan="3" className="p-4 text-center text-white/30">No bookings</td></tr>
                      ) : trainBookingsData.bookings.map(b => (
                        <tr key={b._id} className="border-t border-white/5">
                          <td className="p-3 text-xs text-white/60">{b.passengers.map(p => p.name).join(', ')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${b.status === 'Confirmed' ? 'bg-green-400/10 text-green-400' : b.status === 'RAC' ? 'bg-orange-400/10 text-orange-400' : b.status === 'Waitlist' ? 'bg-purple-400/10 text-purple-400' : 'bg-red-400/10 text-red-400'}`}>{b.status}{b.waitlistNumber ? ` WL/${b.waitlistNumber}` : ''}</span>
                          </td>
                          <td className="p-3 text-sm font-bold text-white">₹{b.totalAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
