import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const trainAPI = {
  getTrains: (params) => api.get('/trains', { params }),
  getTrainById: (id) => api.get(`/trains/${id}`),
  createTrain: (data) => api.post('/trains', data),
  updateTrain: (id, data) => api.put(`/trains/${id}`, data),
  deleteTrain: (id) => api.delete(`/trains/${id}`),
  getAnalytics: () => api.get('/trains/analytics'),
  getTrainBookings: (id) => api.get(`/trains/${id}/bookings`),
};

export const bookingAPI = {
  getUserBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getAllBookings: () => api.get('/bookings/all'),
  createBooking: (data) => api.post('/bookings', data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  getLiveStatus: (trainNumber) => api.get(`/bookings/live-status/${trainNumber}`),
  downloadTicketPDF: (bookingId) => api.get(`/bookings/${bookingId}/ticket-pdf`, { responseType: 'blob' }),
};

// Auto seat assignment helper
// Looks at train.bookedSeats and picks the next available seats in the chosen coach
export function autoAssignSeats(train, coach, count) {
  const bookedSeats = train.bookedSeats || [];
  const berthTypes = coach === 'General'
    ? ['W', 'Mid', 'A', 'A', 'W']
    : ['L', 'M', 'U', 'SL', 'SU'];
  const maxSeats = coach === 'General' ? 100 : 72;

  // Collect seat numbers already taken in this coach
  const takenNums = new Set();
  bookedSeats.forEach((s) => {
    if (s.startsWith(`${coach}-`)) {
      const numPart = s.replace(`${coach}-`, '').replace(/[^0-9]/g, '');
      if (numPart) takenNums.add(parseInt(numPart, 10));
    }
  });

  const assigned = [];
  let seat = 1;
  while (assigned.length < count && seat <= maxSeats) {
    if (!takenNums.has(seat)) {
      const berth = berthTypes[(seat - 1) % berthTypes.length];
      assigned.push(`${coach}-${seat}${berth}`);
    }
    seat++;
  }
  return assigned;
}

export default api;
